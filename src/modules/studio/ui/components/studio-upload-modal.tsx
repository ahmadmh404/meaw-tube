"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/trpc-client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

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

  return (
    <Button onClick={() => create.mutate()} variant={"secondary"}>
      {create.isPending ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <PlusIcon />
      )}
      Create
    </Button>
  );
}
