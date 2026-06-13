import Image from "next/image";

import { formatDuration } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "../../constatns";

interface VideoThumbnailProps {
  title: string;
  duration: number;
  thumbnailUrl: string | null;
  previewUrl: string | null;
}

export function VideoThumbnail({
  title,
  duration,
  thumbnailUrl,
  previewUrl,
}: VideoThumbnailProps) {
  console.log("VIDEO DURATION: ", duration);

  return (
    <div className="relative group">
      {/* Thumbnail Wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={thumbnailUrl || THUMBNAIL_FALLBACK}
          fill
          alt={title}
          className="size-full object-cover group-hover:opacity-0"
        />

        <Image
          // Only Optimize when previewURL is not there..
          unoptimized={!!previewUrl}
          src={previewUrl || THUMBNAIL_FALLBACK}
          fill
          alt={title}
          className="opacity-0 size-full object-cover group-hover:opacity-100"
        />
      </div>

      {/* Video Duration Box */}
      {/* TODO: Add Video Duration Box */}
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
        {formatDuration(duration)}
      </div>
    </div>
  );
}
