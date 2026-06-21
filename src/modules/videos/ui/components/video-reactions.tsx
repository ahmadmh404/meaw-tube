import { useClerk } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { VideoGetOneOutput } from "../../types";

import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { toast } from "sonner";

interface VideoReactionProps {
  videoId: string;
  likes: number;
  dislikes: number;
  viewerReaction: VideoGetOneOutput["viewerReaction"];
}

export function VideoReactions({
  videoId,
  likes,
  dislikes,
  viewerReaction,
}: VideoReactionProps) {
  const clerk = useClerk();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const like = useMutation(trpc.videoReactions.like.mutationOptions());
  const dislike = useMutation(trpc.videoReactions.dislike.mutationOptions());

  function onLike() {
    like.mutate(
      { videoId },
      {
        onSuccess: () => {
          // TODO: invalidate liked playlist when we have playlists
          queryClient.invalidateQueries({
            queryKey: trpc.videos.getOne.queryKey({ id: videoId }),
          });
        },

        onError: (err) => {
          toast.error("Something went wrong....");
          if (err.data?.code === "UNAUTHORIZED") {
            clerk.openSignIn();
          }
        },
      },
    );
  }

  function onDislike() {
    dislike.mutate(
      { videoId },
      {
        onSuccess: () => {
          // TODO: invalidate liked playlist when we have playlists
          queryClient.invalidateQueries({
            queryKey: trpc.videos.getOne.queryKey({ id: videoId }),
          });
        },

        onError: (err) => {
          toast.error("Something went wrong....");
          if (err.data?.code === "UNAUTHORIZED") {
            clerk.openSignIn();
          }
        },
      },
    );
  }

  return (
    <div className="flex items-center flex-none">
      <Button
        className="rounded-l-full rounded-r-none gap-2 pr-4 cursor-pointer"
        variant={"secondary"}
        onClick={onLike}
        disabled={like.isPending || dislike.isPending}>
        <ThumbsUpIcon
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        {likes || 0}
      </Button>
      <Separator className="h-7" orientation="vertical" />

      <Button
        className="rounded-l-none rounded-r-full pl-3 cursor-pointer"
        variant={"secondary"}
        onClick={onDislike}
        disabled={like.isPending || dislike.isPending}>
        <ThumbsDownIcon
          className={cn("size-5", viewerReaction === "dislike" && "fill-black")}
        />
        {dislikes || 0}
      </Button>
    </div>
  );
}
