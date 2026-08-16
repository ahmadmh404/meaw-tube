"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";

export function LikedVideosSection() {
  return (
    <Suspense fallback={<LikedVideosSectionSkeleton />}>
      <ErrorBoundary errorComponent={(err) => <div>Error...</div>}>
        <LikedVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function LikedVideosSectionSuspense() {
  const trpc = useTRPC();
  const query = useSuspenseInfiniteQuery(
    trpc.playlists.getLiked.infiniteQueryOptions(
      { limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  const videos = query.data.pages.flatMap((page) => page.items) || [];

  return (
    <div>
      <div className="flex md:hidden flex-col gap-4 gap-y-10 ">
        {videos.map((video) => (
          <VideoGridCard key={video.id} data={video} />
        ))}
      </div>

      <div className="hidden md:flex flex-col gap-4">
        {videos.map((video) => (
          <VideoRowCard key={video.id} data={video} size={"default"} />
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

function LikedVideosSectionSkeleton() {
  return (
    <div>
      <div className="flex md:hidden flex-col gap-4 gap-y-10 ">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>

      <div className="hidden md:flex flex-col gap-4">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size={"default"} />
        ))}
      </div>
    </div>
  );
}
