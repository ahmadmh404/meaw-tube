"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { ResponsiveModal } from "@/components/responsive-modal";
import { useTRPC } from "@/trpc/trpc-client";
import { useQueryClient } from "@tanstack/react-query";

interface BannerUploadModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BannerUploadModal = ({
  userId,
  open,
  onOpenChange,
}: BannerUploadModalProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const onUploadComplete = () => {
    console.log("Upload Success with some merical");
    queryClient.invalidateQueries({
      queryKey: trpc.users.getOne.queryKey({ id: userId }),
    });
    onOpenChange(false);
  };

  return (
    <ResponsiveModal
      title="Upload a banner"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="bannerUploader"
        onClientUploadComplete={onUploadComplete}
        config={{ mode: "auto" }}
      />
    </ResponsiveModal>
  );
};
