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
import Link from "next/link";
import { VideoThumbnail } from "@/modules/vidoes/ui/components/video-thumbnail";
import { format } from "date-fns";
import { Globe2Icon, LockIcon } from "lucide-react";

export function VideosSection() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary errorComponent={(_) => <div>Error...</div>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
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
            {query.data?.pages
              .flatMap((page) => page.itmes)
              .map((item) => (
                <TableRow key={item.id} className="cursor-pointer">
                  <TableCell>
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

                  <TableCell>Views</TableCell>
                  <TableCell>Comments</TableCell>
                  <TableCell>Likes</TableCell>
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
