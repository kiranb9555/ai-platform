import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export type EdgeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "md" | "lg" | "icon";
};

export const EdgeButton = forwardRef<HTMLButtonElement, EdgeButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fda47b]";

    const variants: Record<NonNullable<EdgeButtonProps["variant"]>, string> = {
      primary:
        "bg-[#1f1f1f] text-white shadow-[0_15px_40px_rgba(0,0,0,.16)] hover:-translate-y-0.5 hover:bg-black focus-visible:outline-[#fda47b]",
      ghost:
        "bg-transparent text-[#1f1f1f] hover:bg-black/5 dark:text-white dark:hover:bg-white/10 border border-transparent",
      outline:
        "border border-black/10 text-[#1f1f1f] hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10",
    };

    const sizes: Record<NonNullable<EdgeButtonProps["size"]>, string> = {
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
      icon: "size-11",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);

EdgeButton.displayName = "EdgeButton";
