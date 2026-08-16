import { DEFAULT_LIMIT } from "@/constants";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { HistoryView } from "@/modules/playlists/ui/views/history-view";
import { HydrateClient } from "@/trpc/components/hydrate-client";
import { prefetch } from "@/trpc/lib/prefetch";
import { trpc } from "@/trpc/trpc-server";

export const dynamic = "force-dynamic";

export default async function Page() {
  void prefetch(trpc.categories.getMany.queryOptions());
  void prefetch(
    trpc.playlists.getHistory.infiniteQueryOptions(
      { limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <HydrateClient>
      <HistoryView />
    </HydrateClient>
  );
}
