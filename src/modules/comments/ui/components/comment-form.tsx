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
  onSuccess?: () => void;
}

const CommentFormSchema = commentInsertSchema.pick({
  value: true,
  videoId: true,
});

type CommentFormSchemaType = z.infer<typeof CommentFormSchema>;

export function CommentForm({ videoId, onSuccess }: CommentFormProps) {
  const clerk = useClerk();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { user } = useUser();
  const form = useForm<CommentFormSchemaType>({
    resolver: zodResolver(CommentFormSchema),
    defaultValues: {
      videoId: videoId,
      value: "",
    },
  });

  const create = useMutation(trpc.comments.create.mutationOptions());

  function onSubmit(data: CommentFormSchemaType) {
    const validation = CommentFormSchema.safeParse(data);

    // TODO: figure out a way to add this length protector.
    if (!validation.success || validation.data.value.length < 3) {
      toast.error("Invalid Input");
      return;
    }

    create.mutate(
      { videoId: data.videoId, value: data.value },
      {
        onSuccess() {
          form.reset();

          // revalidate the comments
          queryClient.invalidateQueries(
            trpc.comments.getMany.queryFilter({ videoId }),
          );

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
      },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 group">
      <UserAvatar
        imageUrl={user?.imageUrl || USER_FALLBACK}
        name={user?.fullName ?? "User"}
      />

      <div className="flex-1">
        <div>
          <Controller
            control={form.control}
            name="value"
            render={({ field, fieldState }) => (
              <Field>
                <Textarea
                  {...field}
                  placeholder="Add a comment"
                  aria-disabled={fieldState.invalid}
                  className="resize-none bg-transparent overflow-hidden min-h-0"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="justify-end gap-2 mt-2 flex">
          <Button type="submit" size={"sm"} disabled={create.isPending}>
            Comment
          </Button>
        </div>
      </div>
    </form>
  );
}
