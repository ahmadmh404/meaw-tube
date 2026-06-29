"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { DEFAULT_LIMIT } from "@/constants";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { CommentItem } from "@/modules/comments/ui/components/comment-item";
import { CommentForm } from "@/modules/comments/ui/components/comment-form";

import { Loader2Icon } from "lucide-react";

interface CommentsSectionProps {
  videoId: string;
}

export function CommentsSection({ videoId }: CommentsSectionProps) {
  return (
    <Suspense fallback={<CommentsSectionSkeleton />}>
      <ErrorBoundary errorComponent={undefined}>
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
}

export function CommentsSectionSuspense({ videoId }: CommentsSectionProps) {
  const trpc = useTRPC();
  const query = useSuspenseInfiniteQuery(
    trpc.comments.getMany.infiniteQueryOptions(
      { videoId, limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  const comments = query.data.pages.flatMap((page) => page.items) ?? [];
  const commentsCount = query.data.pages.at(0)?.count ?? 0;

  console.log({
    comments,
  });

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">{commentsCount} Comments</h1>

        <CommentForm videoId={videoId} />
        <div className="flex flex-col gap-4 mt-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          <InfiniteScroll
            hasNextPage={query.hasNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
            fetchNextPage={query.fetchNextPage}
          />
        </div>
      </div>
    </div>
  );
}

function CommentsSectionSkeleton() {
  return (
    <div className="w-full mt-6 flex justify-center items-center">
      <Loader2Icon className="text-muted-foreground size-7 animate-spin" />
    </div>
  );
}
