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
import { MessageSquareIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface CommentItemProps {
  comment: CommentGetManyOutput;
}

export function CommentItem({ comment }: CommentItemProps) {
  const trpc = useTRPC();
  const clerk = useClerk();
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const remove = useMutation(trpc.comments.remove.mutationOptions());

  function onDelete() {
    remove.mutate(
      { videoId: comment.videoId },
      {
        onSuccess() {
          toast.success("Comment Removed");
          queryClient.invalidateQueries(
            trpc.comments.getMany.queryFilter({ videoId: comment.videoId }),
          );
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
          {/* TODO: Reactions */}
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
