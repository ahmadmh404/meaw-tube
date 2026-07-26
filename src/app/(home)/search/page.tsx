import { DEFAULT_LIMIT } from "@/constants";
import { SearchView } from "@/modules/search/ui/views/search-view";
import { HydrateClient } from "@/trpc/components/hydrate-client";
import { prefetch } from "@/trpc/lib/prefetch";
import { trpc } from "@/trpc/trpc-server";

interface SearchPageProps {
  searchParams: Promise<{
    query: string | undefined;
    categoryId: string | undefined;
  }>;
}

export default async function SearchPageSuspense({
  searchParams,
}: SearchPageProps) {
  const { query, categoryId } = await searchParams;

  void prefetch(trpc.categories.getMany.queryOptions());
  void prefetch(
    trpc.search.getMany.infiniteQueryOptions(
      { limit: DEFAULT_LIMIT, categoryId, query },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <HydrateClient>
      <SearchView query={query} categoryId={categoryId} />
    </HydrateClient>
  );
}
