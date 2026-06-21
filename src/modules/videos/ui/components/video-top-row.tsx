import { useMemo } from "react";

import { VideoMenu } from "./video-menu";
import { VideoOwner } from "./video-owner";
import { VideoReactions } from "./video-reactions";

import { VideoGetOneOutput } from "../../types";
import { VideoDescription } from "./video-description";

import { format, formatDistanceToNow } from "date-fns";

interface VideoTopRowProps {
  video: VideoGetOneOutput;
}

export function VideoTopRow({ video }: VideoTopRowProps) {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(video.viewCount);
  }, []);

  const expandedViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "standard",
    }).format(video.viewCount);
  }, []);

  const compactDate = formatDistanceToNow(video.createdAt, { addSuffix: true });
  const expandedDate = format(video.createdAt, "d MMM yyyy");

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <VideoOwner user={video.user} videoId={video.id} />
        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0">
          <VideoReactions
            videoId={video.id}
            likes={video.likeCount}
            dislikes={video.dislikeCount}
            viewerReaction={video.viewerReaction}
          />
          <VideoMenu videoId={video.id} variant="secondary" />
        </div>
      </div>

      <VideoDescription
        compactedViews={compactViews}
        expandedViews={expandedViews}
        compactedDate={compactDate}
        expandedDate={expandedDate}
        description={video.description}
      />
    </div>
  );
}
