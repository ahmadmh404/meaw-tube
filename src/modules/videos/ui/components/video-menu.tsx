import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_URL } from "@/constants";
import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal";

import {
  ListPlusIcon,
  MoreVerticalIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

interface VideoMenuProps {
  variant?: "ghost" | "secondary";
  videoId: string;
  onRemove?: () => void;
}

export function VideoMenu({
  videoId,
  onRemove,
  variant = "ghost",
}: VideoMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const fullURL = `${APP_URL}/videos/${videoId}`;
  const [isCopied, setIsCopied] = useState(false);

  async function onShare() {
    await navigator.clipboard.writeText(fullURL);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  function handleOpenAddPlaylist() {}

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} className="rounded-full" size={"icon"}>
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-fit"
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem disabled={isCopied}>
            <ShareIcon onClick={onShare} className="mr-2 size-4" />
            Shared
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsOpen(true)}>
            <ListPlusIcon className="mr-2 size-4" />
            Add to PlayList
          </DropdownMenuItem>

          {onRemove && (
            <DropdownMenuItem>
              <Trash2Icon onClick={onRemove} className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <PlaylistAddModal
        videoId={videoId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
