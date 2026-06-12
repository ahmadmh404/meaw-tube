"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

import { useTRPC } from "@/trpc/trpc-client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { videoUpdateSchema } from "@/db/schema";

import * as z from "zod";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "../components/video-player";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  LockIcon,
  MoreVerticalIcon,
  TrashIcon,
} from "lucide-react";

interface FormSectionProps {
  videoId: string;
}

export function FormSection({ videoId }: FormSectionProps) {
  return (
    <Suspense fallback={<FormSectionFallback />}>
      <ErrorBoundary
        errorComponent={(err) => <div>Error: {err.error.message}...</div>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
}

function FormSectionFallback() {
  return <p>Loading....</p>;
}

export function FormSectionSuspense({ videoId }: FormSectionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const update = useMutation(trpc.videos.update.mutationOptions());
  const remove = useMutation(trpc.videos.delete.mutationOptions());
  const { data: video } = useSuspenseQuery(
    trpc.studio.getOne.queryOptions({ id: videoId }),
  );
  const { data: categories } = useSuspenseQuery(
    trpc.categories.getMany.queryOptions(),
  );

  console.log({ status: video.video.muxStatus });

  const fullURL = `${process.env.VERCEL_URL || "http://localhost:3000"}/vidoes/${video.video.id}`;
  const [isCopied, setIsCopied] = useState(false);
  async function onCopy() {
    await navigator.clipboard.writeText(fullURL);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video.video,
  });

  async function onSubmit(data: z.infer<typeof videoUpdateSchema>) {
    const { success, data: vlaidData } = videoUpdateSchema.safeParse(data);
    if (!success) {
      toast.error("Invalid Fields..");
      return;
    }

    await update.mutateAsync(vlaidData, {
      onSuccess: () => {
        toast.success("Video Updated Successfully");
        queryClient.invalidateQueries(trpc.studio.getMany.pathFilter());
        queryClient.invalidateQueries({
          queryKey: trpc.studio.getOne.queryKey({ id: videoId }),
        });

        // redirecting the user to the studio page
        router.push(`/studio`);
      },
      onError: (err) => {
        console.log("ERROR UPDATING VIDEO DETAILS: ", { error: err });
        toast.error(`Error udpating vidoe details..`);
      },
    });
  }

  async function onDelete() {
    await remove.mutateAsync(
      { id: videoId },
      {
        onSuccess: () => {
          router.push("/studio");
          toast.success("Vidoe Deleted Successfully");
          queryClient.invalidateQueries(trpc.studio.getMany.pathFilter());
          queryClient.invalidateQueries({
            queryKey: trpc.studio.getOne.queryKey({ id: videoId }),
          });
        },
        onError: (err) => {
          console.log("ERROR DELETING VIDOE", { error: err.message });
          toast.error("Error deleting video...");
        },
      },
    );
  }

  return (
    <form id="update-video-form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="w-full flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Video Details</h1>
          <p className="text-xs text-muted-foreground">
            Manage your video details
          </p>
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || update.isPending}>
            Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} size={"icon"}>
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={remove.isPending || update.isPending}
                onClick={onDelete}>
                <TrashIcon className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <FieldGroup className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="space-y-8 lg:col-span-3">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Titles</FieldLabel>
                {/* TODO: Add AI generate button */}

                <Input
                  {...field}
                  placeholder="Add a title to you video"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Description</FieldLabel>
                {/* TODO: Add AI generate button */}

                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  rows={10}
                  className="resize-none pr-10"
                  placeholder="Add a Description to you video"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {/* TODO: Add thumbnail field here */}

          <Controller
            name="categoryId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Category</FieldLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="capitalize">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="flex flex-col gap-y-8 lg:col-span-2">
          <div className="flex flex-col gap-4 bg-[#f9f9f9] rounded-xl overflow-hidden h-fit">
            <div className="aspect-video relative overflow-hidden">
              <VideoPlayer
                playbackId={video.video.muxPlaybackId}
                thumbnailUrl={video.video.thumbnailUrl}
                autoPlay={false}
              />
            </div>
            <div className="p-4 flex flex-col gap-y-6">
              <div className="flex justify-between items-center gap-x-2">
                <div className="flex flex-col gap-y-1">
                  <p className="text-xs text-muted-foreground">Video Link</p>
                  <div className="flex items-center gap-x-2">
                    <Link href={`/vidoes/${video.video.id}`}>
                      <p className="line-clamp-1 text-sm text-blue-500">
                        {fullURL}
                      </p>
                    </Link>

                    <Button
                      type="button"
                      variant={"ghost"}
                      size={"icon"}
                      className="shrink-0"
                      onClick={onCopy}
                      disabled={isCopied}>
                      {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-y-1">
                  <p className="text-muted-foreground text-xs">Video Status</p>
                  <p className="text-sm capitalize">
                    {video.video.muxStatus || "preparing"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-y-1">
                  <p className="text-muted-foreground text-xs">
                    Subtitles Status
                  </p>
                  <p className="text-sm capitalize">
                    {video.video.muxTrackStatus || "No Subtitles"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Controller
            name="visibility"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Visibility</FieldLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={"public"} className="capitalize">
                      <div className="flex items-center">
                        <Globe2Icon className="mr-2 size-4" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value={"private"} className="capitalize">
                      <div className="flex items-center">
                        <LockIcon className="mr-2 size-4" />
                        Private
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </FieldGroup>
    </form>
  );
}
