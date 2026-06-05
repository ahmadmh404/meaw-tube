
import { useTRPC } from "@/trpc/trpc-client";
import { getQueryClient, trpc } from "@/trpc/trpc-server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PageClient } from "./page-client";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";

export default async function Home() {
  // prefetch here leads to useSuspenseQuery in client component if nromal query and useSuspenseInfiniteQuery
  await prefetch(trpc.hello.queryOptions({ text: "Ahmad" }))

  return <HydrateClient>
    <ErrorBoundary errorComponent={undefined}>
      <Suspense fallback={<div>Loading...</div>} >
        <PageClient />
      </Suspense>
    </ErrorBoundary>
  </HydrateClient>
}



export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return <HydrationBoundary state={dehydrate(queryClient)} >
    {props.children}
  </HydrationBoundary>
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
  const queryClient = getQueryClient();

  if (queryOptions.queryKey[1]?.type === 'infinite') {
    queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    queryClient.prefetchQuery(queryOptions);
  }
}


