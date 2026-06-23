import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "h-9 w-9",
      xs: "h-3 w-4",
      sm: "h-6 w-6",
      lg: "h-10 w-10",
      xl: "h-[160px] w-[160px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserAVatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string;
  name: string;
  className?: string;
  onClick?: () => void;
}

export function UserAvatar({
  imageUrl,
  name,
  size,
  className,
  onClick,
}: UserAVatarProps) {
  return (
    <Avatar
      className={cn(avatarVariants({ size, className }))}
      onClick={onClick}>
      <AvatarImage src={imageUrl} alt={name}></AvatarImage>
    </Avatar>
  );
}
