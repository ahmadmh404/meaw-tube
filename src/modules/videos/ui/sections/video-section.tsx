"use client";

import { Suspense } from "react";
import { useTRPC } from "@/trpc/trpc-client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import {
  VideoPlayer,
  VideoPlayerSkeleton,
} from "@/modules/studio/ui/components/video-player";
import { VideBanner } from "../components/video-banner";
import { VideoTopRow, VideoTopRowSkeleton } from "../components/video-top-row";

interface VideoViewProps {
  videoId: string;
}

export function VideoSection({ videoId }: VideoViewProps) {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary errorComponent={undefined}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
}

export function VideoSectionSuspense({ videoId }: VideoViewProps) {
  const { isSignedIn } = useAuth();

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: video } = useSuspenseQuery(
    trpc.videos.getOne.queryOptions({
      id: videoId,
    }),
  );

  const create = useMutation(trpc.videoViews.create.mutationOptions());

  function handlePlay() {
    if (!isSignedIn) {
      return;
    }

    create.mutate(
      { videoId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: trpc.videos.getOne.queryKey({ id: videoId }),
          });
        },
      },
    );
  }

  return (
    <>
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative",
          video.muxStatus !== "ready" && "rounded-b-none",
        )}>
        <VideoPlayer
          autoPlay={false}
          onPlay={handlePlay}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
        />
      </div>

      <VideBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
}

function VideoSectionSkeleton() {
  return (
    <>
      <VideoPlayerSkeleton />
      <VideoTopRowSkeleton />
    </>
  );
}
