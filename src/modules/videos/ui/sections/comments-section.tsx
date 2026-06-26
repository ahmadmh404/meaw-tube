"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { CommentItem } from "@/modules/comments/ui/components/comment-item";

interface CommentsSectionProps {
  videoId: string;
}

export function CommentsSection({ videoId }: CommentsSectionProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary errorComponent={undefined}>
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
}

export function CommentsSectionSuspense({ videoId }: CommentsSectionProps) {
  const trpc = useTRPC();
  const { data: comments } = useSuspenseQuery(
    trpc.comments.getMany.queryOptions({
      videoId,
    }),
  );

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h1>{0} Comments</h1>

        <CommentForm videoId={videoId} />
        <div className="flex flex-col gap-4 mt-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
}
