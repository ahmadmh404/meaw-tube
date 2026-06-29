import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient } from "@/trpc/components/hydrate-client";
import { prefetch } from "@/trpc/lib/prefetch";
import { trpc } from "@/trpc/trpc-server";

interface PageProps {
  params: Promise<{ videoId: string }>;
}

async function Page({ params }: PageProps) {
  const { videoId } = await params;
  void prefetch(trpc.videos.getOne.queryOptions({ id: videoId }));

  // TODO: Don't forget to change to infiniteQueryOptions and  prefetch infinite.
  void prefetch(
    trpc.comments.getMany.queryOptions({ videoId, cursor: null, limit: 5 }),
  );

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
}

export default Page;
