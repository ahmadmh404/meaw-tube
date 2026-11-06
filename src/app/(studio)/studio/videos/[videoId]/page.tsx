import { trpc } from "@/trpc/trpc-server";
import { prefetch } from "@/trpc/lib/prefetch";
import { HydrateClient } from "@/trpc/components/hydrate-client";
import { VideoView } from "@/modules/studio/ui/views/video-view";

interface PageProps {
  params: Promise<{ videoId: string }>;
}

async function Page({ params }: PageProps) {
  const { videoId } = await params;

  void prefetch(trpc.studio.getOne.queryOptions({ id: videoId }));
  void prefetch(trpc.categories.getMany.queryOptions());

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
}

export default Page;
