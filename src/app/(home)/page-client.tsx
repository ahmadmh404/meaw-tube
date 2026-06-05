'use client'

import { useTRPC } from "@/trpc/trpc-client"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";


export function PageClient() {
    const trpc = useTRPC();
    // useSuspenseQuery will throw a promise until the data is ready, which means it's never gonna be null or undefined
    const { data } = useSuspenseQuery(trpc.hello.queryOptions({ text: "Ahmad" }))

    return <div>
        Page Client Says: {data?.greeting}
    </div>
}
