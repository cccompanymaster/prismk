import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
  {
    variants: {
      variant: {
        primary:
          "bg-slate-900 text-white shadow-soft hover:bg-slate-800 active:translate-y-px focus-visible:ring-slate-900",
        accent:
          "bg-gradient-to-br from-pattern-DI via-pattern-DI to-pattern-SS text-white shadow-soft hover:opacity-95 active:translate-y-px focus-visible:ring-pattern-DI",
        outline:
          "border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:translate-y-px focus-visible:ring-slate-400",
        ghost:
          "text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-300",
        kakao:
          "bg-yellow-300 text-yellow-950 shadow-soft hover:bg-yellow-400 active:translate-y-px focus-visible:ring-yellow-500",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base py-3",
        xl: "h-14 px-8 text-base",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      block: false,
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
