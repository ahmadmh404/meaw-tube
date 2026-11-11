import { DEFAULT_LIMIT } from "@/constants";

import { VideosView } from "@/modules/playlists/ui/views/videos-view";

import { trpc } from "@/trpc/trpc-server";

import { prefetch } from "@/trpc/lib/prefetch";

import { HydrateClient } from "@/trpc/components/hydrate-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ playlistId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { playlistId } = await params;

  void prefetch(trpc.playlists.getOne.queryOptions({ id: playlistId }));
  void prefetch(
    trpc.playlists.getVideos.infiniteQueryOptions(
      { playlistId, limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <HydrateClient>
      <VideosView playlistId={playlistId} />
    </HydrateClient>
  );
};

export default Page;
