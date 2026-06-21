import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ListPlusIcon,
  MoreVerticalIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}

export function VideoMenu({ videoId, variant, onRemove }: VideoMenuProps) {
  // TODO: Implement What's left

  const fullURL = `${process.env.VERCEL_URL || "http://localhost:3000"}/videos/${videoId}`;
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
        <DropdownMenuItem>
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
