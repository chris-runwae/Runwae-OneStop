import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-[#e91e8c] text-white shadow-sm hover:bg-[#d1187a]",
        outline:
          "border border-input/50 bg-white text-foreground hover:bg-muted/50",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-6 py-2 text-base",
        full: "h-11 w-full px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

const spinnerVariants = cva("", {
  variants: {
    spinner: {
      default: "text-background",
      foreground: "text-foreground",
    },
  },
  defaultVariants: {
    spinner: "default",
  },
});

type ButtonVariants = VariantProps<typeof buttonVariants>;
export type ButtonVariant = ButtonVariants["variant"];

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants,
    VariantProps<typeof spinnerVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  btnBgColor?: string;
  btnBorder?: string;
  borderRadius?: string;
  icon?: React.ReactNode;
  fontSize?: string;
  minHeight?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      spinner,
      asChild = false,
      children,
      isLoading,
      icon,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp: React.ElementType = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isLoading && "opacity-50 pointer-events-none",
        )}
        ref={ref}
        {...(asChild ? {} : { disabled: isLoading || disabled })}
        {...props}
      >
        {isLoading ? (
          <Spinner className={cn(spinnerVariants({ spinner }))} />
        ) : (
          <>
            {children}
            {icon && <span>{icon}</span>}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
