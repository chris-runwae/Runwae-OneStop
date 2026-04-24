"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

export interface InputFieldProps extends Omit<
  React.ComponentProps<typeof Input>,
  "type"
> {
  icon?: React.ReactNode;
  type?: "text" | "password" | "email" | "tel";
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, icon, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="relative w-full">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <Input
          ref={ref}
          type={inputType}
          className={cn(
            icon && "pl-10",
            isPassword && "pr-10",
            "h-11 rounded-lg border-input",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        )}
      </div>
    );
  },
);
InputField.displayName = "InputField";

export { InputField };
