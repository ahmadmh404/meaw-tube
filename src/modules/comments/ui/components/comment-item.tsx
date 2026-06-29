import Link from "next/link";

import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { formatDistanceToNow } from "date-fns";
import { CommentGetManyOutput } from "../../types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import {
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface CommentItemProps {
  comment: CommentGetManyOutput;
}

export function CommentItem({ comment }: CommentItemProps) {
  const trpc = useTRPC();
  const clerk = useClerk();
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const remove = useMutation(trpc.comments.remove.mutationOptions());

  const likeCount = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(comment.likeCount);
  }, []);

  const dislikeCount = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(comment.dislikeCount);
  }, []);

  const like = useMutation(
    trpc.commentReactions.like.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(
          trpc.comments.getMany.queryFilter({ videoId: comment.videoId }),
        );
      },
      onError(error) {
        toast.error("Something went wrong");
        if (error.data && error.data.code === "UNAUTHORIZED") {
          clerk.openSignIn();
        }
      },
    }),
  );

  const dislike = useMutation(
    trpc.commentReactions.dislike.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: trpc.comments.getMany.queryKey({
            videoId: comment.videoId,
          }),
        });
      },
      onError(error) {
        toast.error("Something went wrong");
        if (error.data && error.data.code === "UNAUTHORIZED") {
          clerk.openSignIn();
        }
      },
    }),
  );

  function onDelete() {
    remove.mutate(
      { commentId: comment.id },
      {
        onSuccess() {
          toast.success("Comment Removed");
          queryClient.invalidateQueries({
            queryKey: trpc.comments.getMany.queryKey({
              videoId: comment.videoId,
            }),
          });
        },

        onError(e) {
          toast.error("Something went wrong..");
          if (e.data?.code === "UNAUTHORIZED") {
            clerk.openSignIn();
          }
        },
      },
    );
  }

  const isPending = like.isPending || dislike.isPending;

  console.log({
    reaction: comment.user.userReactions,
  });

  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            name={comment.user.name}
            imageUrl={comment.user.imageUrl}
            size={"lg"}
          />
        </Link>
        <div className="flex-1 min-w--0">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm mb-0.5">
                {comment.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.updatedAt, { addSuffix: true })}
              </span>
            </div>
          </Link>

          <p className="text-sm">{comment.value}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Button
                className="size-8"
                size={"icon"}
                variant={"ghost"}
                disabled={isPending}
                onClick={() =>
                  like.mutate({
                    commentId: comment.id,
                  })
                }>
                <ThumbsUpIcon
                  className={cn(
                    comment.user.userReactions === "like" && "fill-black",
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">{likeCount}</span>

              <Button
                className="size-8"
                size={"icon"}
                variant={"ghost"}
                disabled={isPending}
                onClick={() =>
                  dislike.mutate({
                    commentId: comment.id,
                  })
                }>
                <ThumbsDownIcon
                  className={cn(
                    comment.user.userReactions === "dislike" && "fill-black",
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {dislikeCount}
              </span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="size-9">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <MessageSquareIcon className="size-4" />
              Reply
            </DropdownMenuItem>

            {comment.user.clerkId === userId && (
              <DropdownMenuItem onClick={onDelete}>
                <Trash2Icon className="size-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
