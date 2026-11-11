import { DEFAULT_LIMIT } from "@/constants";

import { trpc } from "@/trpc/trpc-server";

import { prefetch } from "@/trpc/lib/prefetch";

import { HydrateClient } from "@/trpc/components/hydrate-client";
import { SubscriptionsView } from "@/modules/subscriptions/ui/views/subscriptions-view";

const Page = async () => {
  void prefetch(trpc.playlists.getMany.infiniteQueryOptions(
      { limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
  ));


  return ( 
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
   );
};
 
export default Page;
