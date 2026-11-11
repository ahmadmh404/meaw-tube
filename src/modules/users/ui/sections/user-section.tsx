"use client";

import { Suspense } from "react";

import { Separator } from "@/components/ui/separator";

import {
  UserPageInfo,
  UserPageInfoSkeleton,
} from "../components/user-page-info";
import {
  UserPageBanner,
  UserPageBannerSkeleton,
} from "../components/user-page-banner";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface UserSectionProps {
  userId: string;
}

export function UserSection(props: UserSectionProps) {
  return (
    <Suspense fallback={<UserSectionSkeleton />}>
      <ErrorBoundary errorComponent={(err) => <p>Error</p>}>
        <UserSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
}

function UserSectionSkeleton() {
  return (
    <div className="flex flex-col">
      <UserPageBannerSkeleton />
      <UserPageInfoSkeleton />
      <Separator />
    </div>
  );
}

function UserSectionSuspense({ userId }: UserSectionProps) {
  const trpc = useTRPC();
  const { data: user } = useSuspenseQuery(
    trpc.users.getOne.queryOptions({ id: userId }),
  );

  return (
    <div className="flex flex-col">
      <UserPageBanner user={user} />
      <UserPageInfo user={user} />
      <Separator />
    </div>
  );
}
