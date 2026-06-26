import Link from "next/link";

import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";

import { VideoGetOneOutput } from "../../types";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  videoId: string;
}

export function VideoOwner({ user, videoId }: VideoOwnerProps) {
  const { userId, isLoaded } = useAuth();
  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: user.isUserSubscribed,
    fromVideoId: videoId,
  });

  return (
    <div className="flex items-center sm:items-center justify-between sm:justify-start gap-5 min-w-0">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar size={"lg"} imageUrl={user.imageUrl} name={user.name} />

          <div className="flex flex-col gap-1 min-w-0">
            <UserInfo size={"lg"} name={user.name} />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {/* TODO: Properly build subscribers count */}
              {user.subscribersCount} Subscribers
            </span>
          </div>
        </div>
      </Link>

      {user.id === userId ? (
        <Button className="rounded-full" variant={"secondary"} asChild>
          <Link href={`/studio/videos/${videoId}`}>Edit Video</Link>
        </Button>
      ) : (
        <Button className="rounded-full" variant={"default"} asChild>
          <SubscriptionButton
            onClick={onClick}
            disabled={isPending || !isLoaded}
            isSubscribed={false}
            className="flex"
          />
        </Button>
      )}
    </div>
  );
}
