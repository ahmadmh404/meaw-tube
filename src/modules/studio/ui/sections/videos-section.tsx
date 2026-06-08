'use client'

import { Suspense } from "react";

import { DEFAULT_LIMIT } from "@/constansts";
import { useTRPC } from "@/trpc/trpc-client"
import { useInfiniteQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { InfiniteScroll } from "@/components/infinite-scroll";
import Link from "next/link";


export function VideosSection() {
    return <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary errorComponent={(_) => <div>Error...</div>}>
            <VideosSectionSuspense />
        </ErrorBoundary>
    </Suspense>
}

function VideosSectionSuspense() {
    const trpc = useTRPC();
    const query = useInfiniteQuery(trpc.studio.getMany.infiniteQueryOptions(
        { limit: DEFAULT_LIMIT },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
    ));


    return <div className="px-4">
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-6 w-127.5">
                            Video
                        </TableHead>
                        <TableHead >
                            Visibility
                        </TableHead>
                        <TableHead >
                            Status
                        </TableHead>
                        <TableHead >
                            Date
                        </TableHead>
                        <TableHead className="text-right">
                            Views
                        </TableHead>
                        <TableHead className="text-right">
                            Comments
                        </TableHead>
                        <TableHead className="text-right pr-6">
                            Likes
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {query.data?.pages.flatMap(page => page.itmes).map(item => (
                        <TableRow
                            key={item.id}
                            className="cursor-pointer"
                        >
                            <TableCell>
                                <Link href={`/studio/video/${item.id}`} >
                                    {item.title}
                                </Link>
                            </TableCell>

                            <TableCell >
                                Visibility
                            </TableCell>

                            <TableCell >
                                Status
                            </TableCell>

                            <TableCell >
                                Date
                            </TableCell>

                            <TableCell >
                                Views
                            </TableCell>

                            <TableCell >
                                Comments
                            </TableCell>

                            <TableCell >
                                Likes
                            </TableCell>
                        </TableRow>
                    ))};
                </TableBody>
            </Table>
        </div>

        <InfiniteScroll
            hasNextPage={query.hasNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
            fetchNextpage={query.fetchNextPage}
        />
    </div>
}