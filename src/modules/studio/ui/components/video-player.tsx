"use client";

import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId: string | null;
  thumbnailUrl: string | null;
  autoPlay: boolean;
  onPlay?: () => void;
}

export function VideoPlayer({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
}: VideoPlayerProps) {
  // if (!playbackId) return null;

  return (
    <MuxPlayer
      playbackId={playbackId ?? ""}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      autoPlay={autoPlay}
      playerInitTime={0}
      thumbnailTime={0}
      className="w-full h-full object-contain"
      accentColor="#FF2056"
      onPlay={onPlay}
    />
  );
}
