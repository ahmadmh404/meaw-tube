import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface SubscriptionButtonProps {
  onClick: ButtonProps["onClick"];
  disabled: boolean;
  isSubscribed: boolean;
  className?: string;
  size?: ButtonProps["size"];
}

export function SubscriptionButton({
  onClick,
  disabled,
  isSubscribed,
  className,
  size,
}: SubscriptionButtonProps) {
  return (
    <Button
      className={cn("rounded-full", className)}
      size={size}
      onClick={onClick}
      disabled={disabled}
      variant={isSubscribed ? "outline" : "default"}>
      {isSubscribed ? "UnSubscribe" : "Subscribe"}
    </Button>
  );
}
