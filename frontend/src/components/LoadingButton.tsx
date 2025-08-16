import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2, LucideIcon } from "lucide-react";
import { useState } from "react";

interface LoadingButtonProps extends ButtonProps {
  icon: LucideIcon;
  loadingText?: string;
  onAsyncClick?: () => Promise<void>;
}

export function LoadingButton({ 
  icon: Icon, 
  children, 
  loadingText = "Processing...", 
  onAsyncClick,
  onClick,
  ...props 
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onAsyncClick) {
      setIsLoading(true);
      try {
        await onAsyncClick();
      } finally {
        setIsLoading(false);
      }
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      className={`relative overflow-hidden ${props.className || ""}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          <Icon className="w-4 h-4 mr-2" />
          {children}
        </>
      )}
    </Button>
  );
}