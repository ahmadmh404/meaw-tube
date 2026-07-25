import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/ui/components/user-info";

import { VideoMenu } from "./video-menu";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";

import { VideoGetManyOutput } from "@/modules/videos/types";
import Link from "next/link";
import { useMemo } from "react";

const videoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },

  defaultVariants: {
    size: "default",
  },
});

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[30%]",
      compact: "w-[168px]",
    },
  },

  defaultVariants: {
    size: "default",
  },
});

interface videoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export function VideoRowCardSkeleton({
  size,
}: VariantProps<typeof videoRowCardVariants>) {
  return (
    <div className={videoRowCardVariants({ size })}>
      <div className={thumbnailVariants({ size })}>
        <VideoThumbnailSkeleton />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2-2">
          <div className="flex-1 min-w-0">
            <Skeleton
              className={cn("h-5 w-[40%]", size === "compact" && "h-4 w-[40%]")}
            />

            {size === "default" && (
              <>
                <Skeleton className="h-4 w-[20%] mt-1" />
                <div className="flex items-center gap-2 my-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-25" />
                </div>
              </>
            )}

            {size === "compact" && <Skeleton className="h-4 w-[50%] mt-1" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VideoRowCard({
  data,
  onRemove,
  size = "default",
}: videoRowCardProps) {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount);
  }, []);

  const compactLikes = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.likeCount);
  }, []);

  return (
    <div className={videoRowCardVariants({ size })}>
      <Link
        href={`/videos/${data.id}`}
        className={cn("aspect-video", thumbnailVariants({ size }))}>
        <VideoThumbnail
          thumbnailUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>

      {/* Info Card */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <Link href={`/videos/${data.id}`} className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium line-clamp-2",
                size === "default" ? "text-sm" : "text-base",
              )}>
              {data.title}
            </h3>

            {size === "default" && (
              <p className="text-xs text-muted-foreground mt-1">
                {compactViews} views &#8226; {compactLikes} likes
              </p>
            )}

            {size === "default" && (
              <>
                <div className="flex items-center gap-2 my-3">
                  <UserAvatar
                    size={"sm"}
                    imageUrl={data.user.imageUrl}
                    name={data.user.name}
                  />

                  <UserInfo size={"sm"} name={data.user.name} />
                </div>

                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-xs text-muted-foreground w-fit line-clamp-2">
                      {data.description ?? "No Description"}
                    </p>
                  </TooltipTrigger>

                  <TooltipContent side="bottom" align="center">
                    <p className="bg-black/70">From the video description</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {size === "compact" && <UserInfo size="sm" name={data.user.name} />}

            {size === "compact" && (
              <p className="text-xs text-muted-foreground mt-1">
                {compactViews} views &#8226; {compactLikes} likes
              </p>
            )}
          </Link>

          <div className="flex-none">
            <VideoMenu videoId={data.id} onRemove={onRemove} variant="ghost" />
          </div>
        </div>
      </div>
    </div>
  );
}
