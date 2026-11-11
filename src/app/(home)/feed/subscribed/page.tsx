import { trpc } from "@/trpc/trpc-server";

import { SubscribedView } from "@/modules/home/ui/views/subscribed-view";
import { prefetch } from "@/trpc/lib/prefetch";
import { HydrateClient } from "@/trpc/components/hydrate-client";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

const Page = async () => {
  void prefetch(trpc.videos.getManySubscribed.infiniteQueryOptions({ limit: DEFAULT_LIMIT },
         { getNextPageParam: (lastPage) => lastPage.nextCursor },
  ));

  return (
    <HydrateClient>
      <SubscribedView />
    </HydrateClient>
  );
};

export default Page;
