"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { DEFAULT_LIMIT } from "@/constants";
import { UserAvatar } from "@/components/user-avatar";
import { ListIcon } from "lucide-react";
import { useTRPC } from "@/trpc/trpc-client";
import { useInfiniteQuery } from "@tanstack/react-query";

export const LoadingSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <SidebarMenuItem key={i}>
          <SidebarMenuButton disabled>
            <Skeleton className="size-6 rounded-full shrink-0" />
            <Skeleton className="h-4 w-full" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      )) }
    </>
  );
};

export function SubscriptionsSection () {
const trpc = useTRPC();
  const pathname = usePathname();
  const { data, isLoading } = useInfiniteQuery(trpc.subscriptions.getMany.infiniteQueryOptions(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  ));


  const subscriptions = data 
    ? data.pages.flatMap(page => page.items)
    : [];


  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading && <LoadingSkeleton />}
          {!isLoading && subscriptions.length === 0 && (
            <p className="mt-2  text-center text-xs font-normal text-muted-foreground">
                No Subscriptions Yet!
            </p>
          )}
          {!isLoading && subscriptions.map((subscription) => (
            <SidebarMenuItem key={`${subscription.creatorId}-${subscription.viewerId}`}>
              <SidebarMenuButton
                tooltip={subscription.user.name}
                asChild
                isActive={pathname === `/users/${subscription.user.id}`}
              >
                <Link prefetch href={`/users/${subscription.user.id}`} className="flex items-center gap-4">
                  <UserAvatar
                    size="xs"
                    imageUrl={subscription.user.imageUrl}
                    name={subscription.user.name}
                  />
                  <span className="text-sm">{subscription.user.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {!isLoading && subscriptions.length > 0 && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/subscriptions"}
              >
                <Link prefetch href="/subscriptions" className="flex items-center gap-4">
                  <ListIcon className="size-4" />
                  <span className="text-sm">All subscriptions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
