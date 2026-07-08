import { useClerk, useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { USER_FALLBACK } from "@/modules/videos/constants";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { commentInsertSchema } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Field, FieldError } from "@/components/ui/field";

interface CommentFormProps {
  videoId: string;
  variant?: "reply" | "comment";
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CommentFormSchema = commentInsertSchema.pick({
  value: true,
  videoId: true,
  parentId: true,
});

type CommentFormSchemaType = z.infer<typeof CommentFormSchema>;

export function CommentForm({
  videoId,
  variant,
  parentId,
  onCancel,
  onSuccess,
}: CommentFormProps) {
  const clerk = useClerk();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { user } = useUser();
  const form = useForm<CommentFormSchemaType>({
    resolver: zodResolver(CommentFormSchema),
    defaultValues: {
      parentId,
      videoId,
      value: "",
    },
  });

  const create = useMutation(
    trpc.comments.create.mutationOptions({
      onSuccess() {
        form.reset();

        // revalidate the comments
        queryClient.invalidateQueries({
          queryKey: trpc.comments.getMany.queryKey({ videoId }),
        });

        // revalidate replies
        queryClient.invalidateQueries({
          queryKey: trpc.comments.getMany.queryKey({ videoId, parentId }),
        });

        // Outside Work
        if (onSuccess) {
          onSuccess();
        }
      },

      onError(error) {
        if (error.data && error.data.code === "UNAUTHORIZED") {
          clerk.openSignIn();
        }

        console.log("comment_form_error: ", error.message);
        toast.error("Something went wrong");
      },
    }),
  );

  function handleCancel() {
    form.reset();
    if (onCancel) onCancel();
  }

  function onSubmit(data: CommentFormSchemaType) {
    const validation = CommentFormSchema.safeParse({
      ...data,
      videoId,
      parentId,
    });

    // TODO: figure out a way to add this length protector.
    if (!validation.success || validation.data.value.length < 3) {
      toast.error("Invalid Input");
      return;
    }

    create.mutate({
      videoId: data.videoId,
      value: data.value,
      parentId: data.parentId,
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 group">
      <UserAvatar
        imageUrl={user?.imageUrl || USER_FALLBACK}
        name={user?.fullName ?? "User"}
      />

      <div className="w-full">
        <div>
          <Controller
            control={form.control}
            name="value"
            render={({ field, fieldState }) => (
              <Field>
                <Textarea
                  {...field}
                  aria-disabled={fieldState.invalid}
                  className="resize-none bg-transparent overflow-hidden min-h-0"
                  placeholder={
                    variant ? "Reply to this comment" : "Add a comment"
                  }
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="justify-end gap-2 mt-2 flex">
          {variant === "reply" && (
            <Button variant={"ghost"} type="button" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" size={"sm"} disabled={create.isPending}>
            {variant === "comment" ? "Comment" : "Reply"}
          </Button>
        </div>
      </div>
    </form>
  );
}
