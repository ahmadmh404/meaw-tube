"use client";

import { useQueryClient } from "@tanstack/react-query";

import { UploadDropzone } from "@/lib/uploadthing";
import { ResponsiveModal } from "./responsive-dialog";
import { useTRPC } from "@/trpc/trpc-client";
import { toast } from "sonner";

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThumbnailUploadModal({
  videoId,
  open,
  onOpenChange,
}: ThumbnailUploadModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  function onUploadComplete() {
    onOpenChange(false);
    queryClient.invalidateQueries({
      queryKey: trpc.studio.getOne.queryKey({ id: videoId }),
    });
  }

  return (
    <ResponsiveModal
      title="Upload Thumbnail"
      open={open}
      onOpenChange={onOpenChange}>
      <UploadDropzone
        endpoint={"thumbnailUploader"}
        input={{ videoId }}
        config={{ appendOnPaste: true, mode: "auto" }}
        onClientUploadComplete={onUploadComplete}
        onUploadError={(err) => {
          console.log("error occured: ", err.message);
          toast.error(`Error Uploading Thumbnail... ${err.message}`);
        }}
      />
    </ResponsiveModal>
  );
}
