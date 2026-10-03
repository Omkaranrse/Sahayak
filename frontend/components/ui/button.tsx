import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "tonal" | "outline" | "text" | "ghost";
  size?: "sm" | "md" | "lg";
}

const base =
  "inline-flex items-center justify-center gap-2 font-sans font-semibold transition-all duration-200 rounded-md disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  filled:
    "bg-primary-800 text-white hover:bg-primary-700 shadow-tonal-2 hover:shadow-tonal-3 dark:bg-primary-500 dark:text-primary-900 dark:hover:bg-primary-400",
  tonal:
    "bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-100 dark:text-primary-800",
  outline:
    "border-[1.5px] border-outline text-ink hover:bg-surface-sunken bg-transparent",
  text: "text-primary-700 hover:bg-primary-50 dark:text-primary-500 dark:hover:bg-primary-100",
  ghost: "text-ink hover:bg-surface-sunken bg-transparent",
};

const sizes = {
  sm: "h-9 px-3.5 text-body-sm text-xs min-w-[36px]",
  md: "h-11 px-5 text-body-md min-w-[44px]",
  lg: "h-[52px] px-7 text-body-lg min-w-[48px]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "filled", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
