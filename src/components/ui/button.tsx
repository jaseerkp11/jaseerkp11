import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-9 px-3.5 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        variant === "primary" && "bg-primary text-[#f6f1ea] hover:bg-[#173028]",
        variant === "secondary" && "bg-[#161513] text-[#f6f1ea] hover:bg-black",
        variant === "ghost" && "border border-line bg-card hover:bg-[#f3ece3]",
        variant === "danger" && "bg-[#9b2c2c] text-white hover:bg-[#7a1f1f]",
        className,
      )}
      {...props}
    />
  );
}
