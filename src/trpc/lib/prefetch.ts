import { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { getQueryClient } from "../trpc-server";

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();

  if (queryOptions.queryKey[1]?.type === "infinite") {
    queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    queryClient.prefetchQuery(queryOptions);
  }
}
