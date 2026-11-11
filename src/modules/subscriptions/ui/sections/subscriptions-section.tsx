"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Suspense } from "react";

import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";

import {
  SubscriptionItem,
  SubscriptionItemSkeleton,
} from "../components/subscription-item";
import { useTRPC } from "@/trpc/trpc-client";
import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

export const SubscriptionsSection = () => {
  return (
    <Suspense fallback={<SubscriptionsSectionSkeleton />}>
      <ErrorBoundary errorComponent={(err) => <p>Error</p>}>
        <SubscriptionsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const SubscriptionsSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <SubscriptionItemSkeleton key={index} />
      ))}
    </div>
  );
};

const SubscriptionsSectionSuspense = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: subscriptions, ...query } = useSuspenseInfiniteQuery(
    trpc.subscriptions.getMany.infiniteQueryOptions(
      { limit: DEFAULT_LIMIT },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  const unsubscribe = useMutation(
    trpc.subscriptions.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success("Unsubscribed");
        queryClient.invalidateQueries({
          queryKey: trpc.subscriptions.getMany.infiniteQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.videos.getManySubscribed.infiniteQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.users.getOne.queryKey({ id: data.creatorId }),
        });
      },
      onError: () => {
        toast.error("Something went wrong");
      },
    }),
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        {subscriptions.pages
          .flatMap((page) => page.items)
          .map((subscription) => (
            <Link
              prefetch
              key={subscription.creatorId}
              href={`/users/${subscription.user.id}`}
            >
              <SubscriptionItem
                name={subscription.user.name}
                imageUrl={subscription.user.imageUrl}
                subscriberCount={subscription.user.subscriberCount}
                onUnsubscribe={() => {
                  unsubscribe.mutate({ creatorId: subscription.creatorId });
                }}
                disabled={unsubscribe.isPending}
              />
            </Link>
          ))}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};
