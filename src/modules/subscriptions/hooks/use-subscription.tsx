"use client";

import { toast } from "sonner";

import { useClerk } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_LIMIT } from "@/constants";

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
  const subscribe = useMutation(trpc.subscriptions.create.mutationOptions({
    onSuccess() {
        toast.success("Subscribed");
      },

      onError(error) {
        toast.error("Something went wrong");
        if (error.data?.code === "UNAUTHORIZED") {
          clerk.openSignIn();
        }
      },
  }));

  const unSubscribe = useMutation(trpc.subscriptions.remove.mutationOptions({
    onSuccess: () => {
        toast.success("UnSubscribed");
      },

      onError(error) {
        toast.error("Something went wrong");
        if (error.data?.code === "UNAUTHORIZED") {
          clerk.openSignIn();
        }
      },
  }));

  // pending
  const isPending = subscribe.isPending || unSubscribe.isPending;

  // handler
  function onClick() {
    if (!isSubscribed) {
      subscribe.mutate(
        { creatorId: userId },
      );
    } else {
      unSubscribe.mutate(
        { creatorId: userId },
      );
    }

    if (fromVideoId) {
      queryClient.invalidateQueries({
        queryKey: [
          trpc.videos.getOne.queryKey({ id: fromVideoId }),
        ],
      });
    }

    queryClient.invalidateQueries({
      queryKey: trpc.users.getOne.queryKey({id: userId})
    })
  }

  return {
    isPending,
    onClick,
  };
}
