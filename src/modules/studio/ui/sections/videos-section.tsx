"use client";

import { Suspense } from "react";

import { DEFAULT_LIMIT } from "@/constansts";
import { useTRPC } from "@/trpc/trpc-client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InfiniteScroll } from "@/components/infinite-scroll";

import { VideoThumbnail } from "@/modules/vidoes/ui/components/video-thumbnail";
import { format } from "date-fns";
import { Globe2Icon, LockIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function VideosSection() {
  return (
    <Suspense fallback={<VideosSectionSKeleton />}>
      <ErrorBoundary errorComponent={undefined}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function VideosSectionSKeleton() {
  return (
    <div className="border-y">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6 w-127.5">Video</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Comments</TableHead>
            <TableHead className="text-right pr-6">Likes</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody></TableBody>
      </Table>
    </div>
  );
}

function VideosSectionSuspense() {
  const trpc = useTRPC();
  const query = useInfiniteQuery(
    trpc.studio.getMany.infiniteQueryOptions(
      { limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <div className="px-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-127.5">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {query.isFetching &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-20 w-36 rounded-xl" />
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-25" />
                        <Skeleton className="h-3 w-37.5" />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>

                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>

                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>

                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4  w-12" />
                  </TableCell>

                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4  w-12" />
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    <Skeleton className="ml-auto h-4  w-12" />
                  </TableCell>
                </TableRow>
              ))}

            {!query.isFetching &&
              query.data?.pages
                .flatMap((page) => page.itmes)
                .map((item) => (
                  <TableRow key={item.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/studio/videos/${item.id}`}>
                        <div className="flex items-center gap-4 ">
                          <div className="relative aspect-video w-36 shrink-0">
                            <VideoThumbnail
                              title={item.title}
                              duration={item.duration ?? 0}
                              thumbnailUrl={item.thumbnailUrl}
                              previewUrl={item.previewUrl}
                            />
                          </div>

                          <div className="flex flex-col overflow-hidden gap-y-1">
                            <span className="text-sm line-clamp-1">
                              {item.title}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {item.description ?? "No Descriptoin"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center capitalize">
                        {item.visibility === "private" ? (
                          <LockIcon className="size-4 mr-2" />
                        ) : (
                          <Globe2Icon className="size-4 mr-2" />
                        )}
                        {item.visibility}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center capitalize">
                        {item.muxStatus}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm truncate">
                      {format(item.createdAt, "d MMM yyyy")}
                    </TableCell>

                    <TableCell className="text-right">Views</TableCell>
                    <TableCell className="text-right">Comments</TableCell>
                    <TableCell className="text-right pr-6">Likes</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextpage={query.fetchNextPage}
      />
    </div>
  );
}
