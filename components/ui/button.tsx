import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary: "bg-[#151515] text-white shadow-[0_12px_30px_rgb(21_21_21/0.16)] hover:bg-black",
  accent: "bg-[var(--accent)] text-white shadow-[0_12px_30px_rgb(53_114_184/0.22)] hover:bg-[var(--accent-strong)]",
  secondary: "border border-[#d8d1c5] bg-white text-[#151515] hover:border-[#151515]",
  ghost: "bg-transparent text-[#62615d] hover:bg-[#efebe3] hover:text-[#151515]",
};

const sizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "premium-focus inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold transition duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
