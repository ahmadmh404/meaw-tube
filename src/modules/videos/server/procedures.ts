import z from "zod";
import { db } from "@/db";
import { mux } from "@/lib/mux";
import { UTApi } from "uploadthing/server";
import {
  subscriptions,
  users,
  videoReactions,
  videos,
  videoUpdateSchema,
  videoViews,
} from "@/db/schema";

import { TRPCError } from "@trpc/server";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";

import { and, eq, getColumns, inArray, isNotNull } from "drizzle-orm";
import { workflow } from "@/lib/workflow";
import {
  FullCleanupDataType,
  ThumbnailCleanupDataType,
} from "@/app/api/videos/workflows/cleanup/route";

export const videosRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const { clerkUserId } = ctx;

      let userId: string;

      // get the real user from the database
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      // Building the sub query (CTE).
      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, user.id ? [user.id] : [])),
      );

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, user ? [user.id] : [])),
      );

      const [existingVideo] = await db
        .with(viewerReactions, viewerSubscriptions)
        // redefine the output
        .select({
          ...getColumns(videos),
          user: {
            ...getColumns(users),
            subscriptionsCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id),
            ),
            isUserSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
              Boolean,
            ),
          },
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like"),
            ),
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike"),
            ),
          ),
          viewerReaction: viewerReactions.type,
        })
        .from(videos)
        .where(eq(videos.id, id))
        // This inner join is for retrieving the creator information
        .innerJoin(users, eq(videos.userId, users.id))
        // This is for retrieving the viewer's reaction
        .leftJoin(viewerReactions, eq(videos.id, viewerReactions.videoId))
        // This is for retrieving the the current user (viewer) subscription status (and filter it more with the creator userId).
        .leftJoin(viewerSubscriptions, eq(subscriptions.creatorId, users.id));

      // .groupBy(videos.id, videos.userId, viewerReactions.type);

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return existingVideo;
    }),

  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policies: ["public"],
        inputs: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
      },
      cors_origin: "*",
    });

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "Untitled_00",
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning();

    return { video, url: upload.url };
  }),

  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const validatedData = videoUpdateSchema.safeParse(input);

      if (!validatedData.success || !input.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [updated] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning({ id: videos.id });

      if (!updated.id) {
        return new TRPCError({ code: "NOT_FOUND" });
      }

      return { updated };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id: videoId } = input;

      const [deleted] = await db
        .delete(videos)
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)))
        .returning({
          assetId: videos.muxAssetId,
          thumbnailKey: videos.thumbnailKey,
          previewKey: videos.previewKey,
        });

      if (!deleted.assetId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // clean up assets
      if (deleted.thumbnailKey && deleted.previewKey) {
        workflow.trigger({
          url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/cleanup`,
          body: {
            mode: "full_cleanup",
            data: { ...deleted },
          } as FullCleanupDataType,
        });
      }

      return { deleted };
    }),

  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id: videoId } = input;

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const utApi = new UTApi();

      const tempThumbnailURL = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
      const uploadedThumbnail =
        await utApi.uploadFilesFromUrl(tempThumbnailURL);

      if (!uploadedThumbnail.data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;

      const [updatedVideo] = await db
        .update(videos)
        .set({
          thumbnailUrl,
          thumbnailKey,
          updatedAt: new Date(),
        })
        .returning();

      if (existingVideo.thumbnailKey) {
        workflow.trigger({
          url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/cleanup`,
          body: {
            mode: "thumbnail_cleanup",
            data: {
              thumbnailKey: existingVideo.thumbnailKey,
            },
          } as ThumbnailCleanupDataType,
        });

        // ============= Unnecessary Work! =============

        // await db
        //   .update(videos)
        //   .set({
        //     thumbnailKey: null,
        //     thumbnailUrl: null,
        //   })
        //   .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

        // ============= Unnecessary Work ! =============
      }

      return updatedVideo;
    }),

  generateThumbnail: protectedProcedure
    .input(z.object({ videoId: z.string(), prompt: z.string().min(20) }))
    .mutation(async ({ ctx, input }) => {
      console.log("Starting The Background Job");
      const { id: userId } = ctx.user;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
        body: { userId, videoId: input.videoId, prompt: input.prompt },
      });

      return workflowRunId;
    }),

  generateTitle: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log("Starting The Background Job");
      const { id: userId } = ctx.user;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: { userId, videoId: input.videoId },
      });

      return workflowRunId;
    }),

  generateDescription: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log("Starting The Background Job");
      const { id: userId } = ctx.user;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
        body: { userId, videoId: input.videoId },
      });

      return workflowRunId;
    }),
});
