import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface RhinoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "default" | "sm";
}

const RhinoButton = forwardRef<HTMLButtonElement, RhinoButtonProps>(
  ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "font-black uppercase tracking-ultra flex items-center justify-center gap-2 transition-all duration-300",
          variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "ghost" && "bg-transparent border border-border text-foreground hover:bg-surface-hover",
          size === "default" && "px-8 py-4 text-[11px]",
          size === "sm" && "px-6 py-2 text-[10px]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

RhinoButton.displayName = "RhinoButton";

export { RhinoButton };
