import { DEFAULT_LIMIT } from "@/constants";

import { trpc } from "@/trpc/trpc-server";
import { prefetch } from "@/trpc/lib/prefetch";
import { HydrateClient } from "@/trpc/components/hydrate-client";
import { UserView } from "@/modules/users/ui/views/user-view";

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}
export default async function Page({ params }: PageProps) {
  const { userId } = await params;

  void prefetch(trpc.users.getOne.queryOptions({ id: userId }));
  void prefetch(
    trpc.videos.getMany.infiniteQueryOptions(
      { userId: userId, limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <HydrateClient>
      <UserView userId={userId} />
    </HydrateClient>
  );
}
