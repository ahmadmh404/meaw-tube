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
  ImagePlusIcon,
  Loader2Icon,
  LockIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  Sparkles,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";
import { ThumbnailGenerateModal } from "../components/thumbnail-generate-modal";
import { Skeleton } from "@/components/ui/skeleton";

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
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>

        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="space-y-6 lg:col-span-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-55 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-[84px] w-[153px]" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="flex flex-col gap-y-8 lg:col-span-2">
          <div className="flex flex-col gap-8 bg-[#f9f9f9] rounded-xl overflow-hidden h-fit">
            <Skeleton className="aspect-video" />

            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormSectionSuspense({ videoId }: FormSectionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] =
    useState(false);

  const update = useMutation(trpc.videos.update.mutationOptions());
  const remove = useMutation(trpc.videos.delete.mutationOptions());
  const restoreThumbnail = useMutation(
    trpc.videos.restoreThumbnail.mutationOptions(),
  );
  const generateThumbnail = useMutation(
    trpc.videos.generateThumbnail.mutationOptions(),
  );

  const generateTitle = useMutation(
    trpc.videos.generateTitle.mutationOptions(),
  );

  const generateDescription = useMutation(
    trpc.videos.generateDescription.mutationOptions(),
  );

  const { data: video } = useSuspenseQuery(
    trpc.studio.getOne.queryOptions({ id: videoId }),
  );
  const { data: categories } = useSuspenseQuery(
    trpc.categories.getMany.queryOptions(),
  );

  const fullURL = `${process.env.VERCEL_URL || "http://localhost:3000"}/videos/${video.video.id}`;
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
    const { success, data: validData } = videoUpdateSchema.safeParse(data);
    if (!success) {
      toast.error("Invalid Fields..");
      return;
    }

    update.mutate(validData, {
      onSuccess: () => {
        toast.success("Video Updated");
        queryClient.invalidateQueries(trpc.studio.getMany.pathFilter());
        queryClient.invalidateQueries({
          queryKey: trpc.studio.getOne.queryKey({ id: videoId }),
        });

        router.push(`/studio`);
      },
      onError: (err) => {
        console.log("ERROR UPDATING VIDEO DETAILS: ", { error: err });
        toast.error(`Error updating video details..`);
      },
    });
  }

  async function onDelete() {
    remove.mutate(
      { id: videoId },
      {
        onSuccess: () => {
          router.push("/studio");
          toast.success("Video Deleted");
          queryClient.invalidateQueries(trpc.studio.getMany.pathFilter());
          queryClient.invalidateQueries({
            queryKey: trpc.studio.getOne.queryKey({ id: videoId }),
          });
        },
        onError: (err) => {
          console.log("ERROR DELETING VIDEO", { error: err.message });
          toast.error("Error deleting video...");
        },
      },
    );
  }

  async function onGenerateTitle() {
    generateTitle.mutate(
      { videoId },
      {
        onSuccess: () => {
          toast.success("Background Job Started..", {
            description: "This may take some time",
            classNames: {
              description: "text-xs text-gray-400",
            },
          });
          queryClient.invalidateQueries(trpc.studio.getMany.pathFilter());
          queryClient.invalidateQueries({
            queryKey: trpc.studio.getOne.queryKey({ id: videoId }),
          });
        },
        onError: (err) => {
          console.log("ERROR GENERATING TITLE: ", { error: err.message });
          toast.error("Error generating title...");
        },
      },
    );
  }

  async function onGenerateDescription() {
    generateDescription.mutate(
      { videoId },
      {
        onSuccess: () => {
          toast.success("Background Job Started..", {
            description: "This may take some time",
            classNames: {
              description: "text-xs text-gray-400",
            },
          });
          queryClient.invalidateQueries(trpc.studio.getMany.pathFilter());
          queryClient.invalidateQueries({
            queryKey: trpc.studio.getOne.queryKey({ id: videoId }),
          });
        },
        onError: (err) => {
          console.log("ERROR GENERATING DESCRIPTION: ", { error: err.message });
          toast.error("Error generating description...");
        },
      },
    );
  }

  async function onRestore() {
    await restoreThumbnail.mutateAsync(
      { id: videoId },
      {
        onSuccess: () => {
          toast.success("Thumbnail Restored");
          queryClient.invalidateQueries(trpc.studio.getMany.pathFilter());
          queryClient.invalidateQueries({
            queryKey: trpc.studio.getOne.queryKey({ id: videoId }),
          });
        },
        onError: (err) => {
          console.log("ERROR DELETING THUMBNAIL", { error: err.message });
          toast.error("Error replacing video thumbnail...");
        },
      },
    );
  }

  return (
    <>
      <ThumbnailUploadModal
        videoId={videoId}
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
      />

      <ThumbnailGenerateModal
        videoId={videoId}
        open={thumbnailGenerateModalOpen}
        onOpenChange={setThumbnailGenerateModalOpen}
      />

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
              disabled={!form.formState.isDirty || update.isPending}>
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"icon"}>
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Add proper disabling for buttons and dorpdown action items */}
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
                  <FieldLabel>
                    <div className="flex items-center gap-x-2">
                      Title
                      <Button
                        type="button"
                        variant={"outline"}
                        size={"icon"}
                        aria-label="Generate with AI"
                        onClick={onGenerateTitle}
                        className="rounded-full size-6 [&_svg]:size-3!">
                        {generateTitle.isPending ? (
                          <Loader2Icon className="animate-spin" />
                        ) : (
                          <SparklesIcon />
                        )}
                      </Button>
                    </div>
                  </FieldLabel>
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
                  <FieldLabel>
                    <div className="flex items-center gap-x-2">
                      Description
                      <Button
                        type="button"
                        variant={"outline"}
                        size={"icon"}
                        aria-label="Generate with AI"
                        onClick={onGenerateDescription}
                        className="rounded-full size-6 [&_svg]:size-3!">
                        {generateDescription.isPending ? (
                          <Loader2Icon className="animate-spin" />
                        ) : (
                          <SparklesIcon />
                        )}
                      </Button>
                    </div>
                  </FieldLabel>

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

            <Controller
              name="thumbnailUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Thumbnail</FieldLabel>

                  <div className="p-0.5 border border-dashed border-neutral-400 relative h-21 w-38.25! group">
                    <Image
                      fill
                      alt="thumbnail"
                      src={video.video.thumbnailUrl || THUMBNAIL_FALLBACK}
                      className="object-cover rounded-lg"
                    />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          size={"icon"}
                          className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7">
                          <MoreVerticalIcon className="text-white" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        className="w-fit"
                        align="start"
                        side="right">
                        <DropdownMenuItem
                          onClick={() => setThumbnailModalOpen(true)}>
                          <ImagePlusIcon className="mr-1 size-4" />
                          Change on{" "}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setThumbnailGenerateModalOpen(true)}>
                          <SparklesIcon className="mr-1 size-4" />
                          AI Generated
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onRestore}>
                          <RotateCcwIcon className="mr-1 size-4" />
                          Restored
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Field>
              )}
            />

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
                      <Link href={`/videos/${video.video.id}`}>
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
                    <p className="text-muted-foreground text-xs">
                      Video Status
                    </p>
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
    </>
  );
}
