import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const containerVariants = cva("mx-auto px-4 sm:px-6", {
  variants: {
    size: {
      sm: "max-w-2xl",
      md: "max-w-3xl",
      lg: "max-w-5xl",
      xl: "max-w-6xl",
      full: "max-w-7xl",
    },
  },
  defaultVariants: { size: "lg" },
});

export type ContainerProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants>;

export function Container({ className, size, ...props }: ContainerProps): JSX.Element {
  return <div className={cn(containerVariants({ size }), className)} {...props} />;
}
