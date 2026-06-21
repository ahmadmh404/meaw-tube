"use client";

import { Suspense } from "react";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "@/modules/studio/ui/components/video-player";
import { VideBanner } from "../components/video-banner";
import { VideoTopRow } from "../components/video-top-row";

interface VideoViewProps {
  videoId: string;
}

export function VideoSection({ videoId }: VideoViewProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary errorComponent={undefined}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
}

export function VideoSectionSuspense({ videoId }: VideoViewProps) {
  const trpc = useTRPC();
  const { data: video } = useSuspenseQuery(
    trpc.videos.getOne.queryOptions({
      id: videoId,
    }),
  );

  return (
    <>
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative",
          video.muxStatus !== "ready" && "rounded-b-none",
        )}>
        <VideoPlayer
          autoPlay={false}
          onPlay={() => {}}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
        />
      </div>

      <VideBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
}
