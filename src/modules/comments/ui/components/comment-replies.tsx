import { DEFAULT_LIMIT } from "@/constants";
import { useTRPC } from "@/trpc/trpc-client";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  CornerDownRightIcon,
  Loader2Icon,
} from "lucide-react";
import { CommentItem } from "./comment-item";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";

interface CommentRepliesProps {
  videoId: string;
  commentId: string;
}

export function CommentReplies({ commentId, videoId }: CommentRepliesProps) {
  const trpc = useTRPC();
  const query = useInfiniteQuery(
    trpc.comments.getMany.infiniteQueryOptions(
      {
        parentId: commentId,
        videoId,
        limit: DEFAULT_LIMIT,
      },
      { getNextPageParam: (page) => page.nextCursor },
    ),
  );

  const replies = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="pl-8">
      <div className="flex flex-col gap-4 mt-2">
        {query.isLoading && (
          <div className="flex justify-center">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!query.isLoading &&
          replies.length > 0 &&
          replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} variant="reply" />
          ))}

        {/* <InfiniteScroll
          fetchNextPage={query.fetchNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          hasNextPage={query.hasNextPage}
          isManual
        /> */}

        {query.hasNextPage && (
          <Button
            variant={"tertiary"}
            size={"sm"}
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            aria-label="Load more replies">
            {query.isFetchingNextPage ? (
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <ChevronDownIcon className="size-5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
