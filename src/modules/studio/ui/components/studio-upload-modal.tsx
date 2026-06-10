'use client'

import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constansts";
import { useTRPC } from "@/trpc/trpc-client";


import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveModal } from "./responsive-dialog";
import { StudioUploader } from "./studio-uploader";

export function StudioUploadModal() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const create = useMutation(trpc.videos.create.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.studio.getMany.pathFilter());
            toast.success("Video Uploaded Successfully!");
        },
        onError: (err) => {
            toast.error(err.message ?? "Something Went Wrong");
        }
    }));


    return <>
        <ResponsiveModal
            title="Upload Video"
            open={!!create.data?.url}
            onOpenChange={() => create.reset()}
        >
            {create.data?.url ? (
                <StudioUploader endpoint={create.data?.url} onSuccess={() => { }} />
            ) : (
                <Loader2Icon className="animate-spin" />
            )}
        </ResponsiveModal>

        <Button onClick={() => create.mutate()} variant={'secondary'}>
            {create.isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
            Create
        </Button>
    </>
};