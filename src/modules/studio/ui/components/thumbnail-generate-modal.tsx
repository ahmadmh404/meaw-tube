"use client";

import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ResponsiveModal } from "./responsive-dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2Icon, SparklesIcon } from "lucide-react";

interface ThumbnailGenerateModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  prompt: z.string().min(20),
});

export function ThumbnailGenerateModal({
  videoId,
  open,
  onOpenChange,
}: ThumbnailGenerateModalProps) {
  const form = useForm({
    defaultValues: { prompt: "" },
    resolver: zodResolver(formSchema),
  });

  const trpc = useTRPC();

  const generateThumbnail = useMutation(
    trpc.videos.generateThumbnail.mutationOptions(),
  );

  function onSubmit(data: z.infer<typeof formSchema>) {
    generateThumbnail.mutate(
      { videoId, prompt: data.prompt },
      {
        onSuccess: () => {
          toast.success("Background Job Started..", {
            description: "This may take some time",
            classNames: {
              description: "text-xs text-muted-foreground",
            },
          });
          form.reset();
          onOpenChange(false);
        },

        onError: (err) => {
          console.log("ERROR GENERATING THUMBNAIL: ", { error: err.message });
          toast.error("Error generating thumbnail...");
        },
      },
    );
  }

  return (
    <ResponsiveModal
      title="Upload Thumbnail"
      open={open}
      onOpenChange={onOpenChange}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="prompt"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Prompt</FieldLabel>
              <Textarea
                {...field}
                className="resize-none"
                cols={30}
                rows={5}
                aria-disabled={!!fieldState.invalid}
                placeholder="A description of the thumbnail you want"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

              <div className="flex justify-end">
                <Button disabled={generateThumbnail.isPending} type="submit">
                  Generate
                  {generateThumbnail.isPending ? (
                    <Loader2Icon className="animate-spin size-3.5 mr-2" />
                  ) : (
                    <SparklesIcon className="size-3.5 mr-2" />
                  )}
                </Button>
              </div>
            </Field>
          )}
        />
      </form>
    </ResponsiveModal>
  );
}
