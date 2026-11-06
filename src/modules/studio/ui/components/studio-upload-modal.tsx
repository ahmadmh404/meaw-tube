"use client";

<<<<<<< HEAD
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/trpc-client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveModal } from "./responsive-dialog";
import { StudioUploader } from "./studio-uploader";

export function StudioUploadModal() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const create = useMutation(
    trpc.videos.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.studio.getMany.pathFilter());
        toast.success("Video Uploaded Successfully!");
      },
      onError: (err) => {
        toast.error(err.message ?? "Something Went Wrong");
      },
    }),
  );
=======
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2Icon, PlusIcon } from "lucide-react"

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button"
import { ResponsiveModal } from "@/components/responsive-modal";

import { StudioUploader } from "./studio-uploader";

export const StudioUploadModal = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video created");
      utils.studio.getMany.invalidate();
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const onSuccess = () => {
    if (!create.data?.video.id) return;

    create.reset();
    router.push(`/studio/videos/${create.data.video.id}`);
  };
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f

  return (
    <>
      <ResponsiveModal
<<<<<<< HEAD
        title="Upload Video"
        open={!!create.data?.url}
        onOpenChange={() => create.reset()}>
        {create.data?.url ? (
          <StudioUploader endpoint={create.data?.url} onSuccess={() => {}} />
        ) : (
          <Loader2Icon className="animate-spin" />
        )}
      </ResponsiveModal>

      <Button onClick={() => create.mutate()} variant={"secondary"}>
        {create.isPending ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <PlusIcon />
        )}
=======
        title="Upload a video"
        open={!!create.data?.url}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url 
          ? <StudioUploader endpoint={create.data.url} onSuccess={onSuccess} /> 
          : <Loader2Icon />
        }
      </ResponsiveModal>
      <Button variant="secondary" onClick={() => create.mutate()} disabled={create.isPending}>
        {create.isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
        Create
      </Button>
    </>
  );
<<<<<<< HEAD
}
=======
};
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
