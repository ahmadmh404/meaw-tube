"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

interface ResultsSectionProps {
  query?: string;
  categoryId?: string;
}

export function ResultsSection(props: ResultsSectionProps) {
  return (
    <Suspense
      // This is for treating every new combination of these two as a new request
      key={`${props.categoryId}-${props.query}`}
      fallback={<ResultsSectionSkeleton />}>
      <ErrorBoundary errorComponent={(err) => <div>Error..</div>}>
        <ResultsSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
}

function ResultsSectionSuspense({ categoryId, query }: ResultsSectionProps) {
  const isMobile = useIsMobile();

  const trpc = useTRPC();
  const resultsQuery = useSuspenseInfiniteQuery(
    trpc.search.getMany.infiniteQueryOptions(
      { query, categoryId, limit: DEFAULT_LIMIT },
      { getNextPageParam: (page) => page.nextCursor },
    ),
  );

  const results = resultsQuery.data.pages.flatMap((page) => page.items) || [];

  return (
    <>
      {isMobile ? (
        <div className="flex flex-col gap-4 gap-y-10">
          {results.map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {results.map((video) => (
            <VideoRowCard key={video.id} data={video} />
          ))}
        </div>
      )}

      <InfiniteScroll
        hasNextPage={resultsQuery.hasNextPage}
        isFetchingNextPage={resultsQuery.isFetchingNextPage}
        fetchNextPage={resultsQuery.fetchNextPage}
      />
    </>
  );
}

function ResultsSectionSkeleton() {
  return (
    <div>
      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} />
        ))}
      </div>

      <div className="md:hidden flex flex-col gap-4 p-4 gap-y-10 pt-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
