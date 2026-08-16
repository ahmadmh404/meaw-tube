"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";

export function TrendingVideosSection() {
  return (
    <Suspense fallback={<TrendingVideosSectionSkeleton />}>
      <ErrorBoundary errorComponent={(err) => <div>Error...</div>}>
        <TrendingVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function TrendingVideosSectionSuspense() {
  const trpc = useTRPC();
  const query = useSuspenseInfiniteQuery(
    trpc.videos.getTrending.infiniteQueryOptions(
      { limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  const videos = query.data.pages.flatMap((page) => page.items) || [];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1928px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6 gap-4 gap-y-10 ">
        {videos.map((video) => (
          <VideoGridCard key={video.id} data={video} />
        ))}
      </div>

      <InfiniteScroll
        isFetchingNextPage={query.isFetchingNextPage}
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
}

function TrendingVideosSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1928px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6 gap-4 gap-y-10 ">
      {Array.from({ length: 12 }).map((_, index) => (
        <VideoGridCardSkeleton key={index} />
      ))}
    </div>
  );
}
