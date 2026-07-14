"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { VideoRowCard } from "../components/video-row-card";
import { VideoGridCard } from "../components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

interface SUggestionsSectionProps {
  videoId: string;
  isManual?: boolean;
}

export function SuggestionsSection({
  videoId,
  isManual,
}: SUggestionsSectionProps) {
  const trpc = useTRPC();

  const query = useSuspenseInfiniteQuery(
    trpc.suggestions.getMany.infiniteQueryOptions(
      { videoId, limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  const suggestions = query.data.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <div className="hidden md:block space-y-3">
        {suggestions.map((video) => (
          <VideoRowCard key={video.id} data={video} size={"compact"} />
        ))}
      </div>

      <div className="md:hidden block space-y-10">
        {suggestions.map((video) => (
          <VideoGridCard key={video.id} data={video} />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        isManual={isManual}
      />
    </>
  );
}
