import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_URL } from "@/constants";
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
  const fullURL = `${APP_URL}/videos/${videoId}`;
  const [isCopied, setIsCopied] = useState(false);

  async function onShare() {
    await navigator.clipboard.writeText(fullURL);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className="rounded-full" size={"icon"}>
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem disabled={isCopied}>
          <ShareIcon onClick={onShare} className="mr-2 size-4" />
          Shared
        </DropdownMenuItem>

        <DropdownMenuItem>
          <ListPlusIcon onClick={() => {}} className="mr-2 size-4" />
          Add to PlayList
        </DropdownMenuItem>

        {onRemove && (
          <DropdownMenuItem>
            <Trash2Icon onClick={() => {}} className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
