import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/trpc-server";

import { PlaylistsView } from "@/modules/playlists/ui/views/playlists-view";
import { prefetch } from "@/trpc/lib/prefetch";
import { HydrateClient } from "@/trpc/components/hydrate-client"  ;

export const dynamic = "force-dynamic";

const Page = async () => {
  void prefetch(trpc.playlists.getMany.infiniteQueryOptions(
      { limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ));

  return (   
    <HydrateClient>
      <PlaylistsView />
    </HydrateClient>
  );
};
export default Page;
