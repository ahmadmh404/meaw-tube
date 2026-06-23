"use client";

import { toast } from "sonner";

import { useClerk } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseSubscriptionProps {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

export function useSubscription({
  userId,
  isSubscribed,
  fromVideoId,
}: UseSubscriptionProps) {
  const clerk = useClerk();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // mutations
  const subscribe = useMutation(trpc.subscriptions.create.mutationOptions());
  const unSubscribe = useMutation(trpc.subscriptions.remove.mutationOptions());

  // pending
  const isPending = subscribe.isPending || unSubscribe.isPending;

  // handler
  function onClick() {
    if (isSubscribed) {
      subscribe.mutate(
        { creatorId: userId },
        {
          // TODO: revalidate subscriptions.getMany and users.getOne
          onSuccess() {
            toast.success("Subscribed");
            if (fromVideoId) {
              queryClient.invalidateQueries(
                trpc.videos.getOne.queryFilter({ id: fromVideoId }),
              );
            }
          },

          onError(error) {
            toast.error("Something went wrong");
            if (error.data?.code === "UNAUTHORIZED") {
              clerk.openSignIn();
            }
          },
        },
      );
    } else {
      unSubscribe.mutate(
        { creatorId: userId },
        {
          onSuccess: () => {
            toast.success("UnSubscribed");
            if (fromVideoId) {
              queryClient.invalidateQueries(
                trpc.videos.getOne.queryFilter({ id: fromVideoId }),
              );
            }
          },

          onError(error) {
            toast.error("Something went wrong");
            if (error.data?.code === "UNAUTHORIZED") {
              clerk.openSignIn();
            }
          },
        },
      );
    }
  }

  return {
    isPending,
    onClick,
  };
}
