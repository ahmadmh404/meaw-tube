"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTRPC } from "@/trpc/trpc-client";
import {
  useInfiniteQuery,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";

import { VideoRowCard } from "@/modules/videos/ui/components/video-row-card";
import { VideoGridCard } from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

interface ResultsSectionProps {
  query?: string;
  categoryId?: string;
}

export function ResultsSection({ categoryId, query }: ResultsSectionProps) {
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
