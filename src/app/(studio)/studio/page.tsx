import { getQueryClient, trpc } from '@/trpc/trpc-server'
import { prefetch } from '@/trpc/lib/prefetch'
import { HydrateClient } from '@/trpc/components/hydrate-client';
import { StudioView } from '@/modules/studio/ui/views/studio-view';
import { DEFAULT_LIMIT } from '@/constansts';


async function StudioPage() {
    const queryClient = getQueryClient();
    void prefetch(trpc.studio.getMany.infiniteQueryOptions(
        { limit: DEFAULT_LIMIT },
        { getNextPageParam: (lastPage) => lastPage.nextCursor })
    );

    return (
        <HydrateClient>
            <StudioView />
        </HydrateClient>
    )
}

export default StudioPage
