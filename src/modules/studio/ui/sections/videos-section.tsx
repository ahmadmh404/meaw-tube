'use client'

import { DEFAULT_LIMIT } from "@/constansts";
import { useTRPC } from "@/trpc/trpc-client"
import { useInfiniteQuery } from "@tanstack/react-query";

export function VideosSection() {
    const trpc = useTRPC();
    const { data } = useInfiniteQuery(trpc.studio.getMany.infiniteQueryOptions(
        { limit: DEFAULT_LIMIT },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
    ));


    return <div>
        {JSON.stringify(data?.pages.map(page => page.itmes))}
    </div>
}