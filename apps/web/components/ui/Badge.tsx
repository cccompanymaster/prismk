import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium",
  {
    variants: {
      variant: {
        soft: "bg-slate-100 text-slate-700",
        accent: "bg-pattern-DI/10 text-pattern-DI",
        warn: "bg-amber-100 text-amber-900",
        info: "bg-sky-100 text-sky-900",
        outline: "border border-slate-200 bg-white text-slate-700",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "soft",
      size: "sm",
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, ...props }: BadgeProps): JSX.Element {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
