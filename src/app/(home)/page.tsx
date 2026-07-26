import { HomeView } from "@/modules/home/ui/views/home-view";
import { HydrateClient } from "@/trpc/components/hydrate-client";
import { prefetch } from "@/trpc/lib/prefetch";
import { trpc } from "@/trpc/trpc-server";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { categoryId } = await searchParams;

  // prefetch here leads to useSuspenseQuery in client component if nromal query and useSuspenseInfiniteQuery
  void prefetch(trpc.categories.getMany.queryOptions());

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
}
