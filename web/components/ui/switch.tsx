"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked,
      onCheckedChange,
      onClick,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = React.useState(
      defaultChecked ?? false,
    );
    const isControlled = checked !== undefined;
    const isOn = isControlled ? checked : uncontrolled;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (!isControlled) setUncontrolled((prev) => !prev);
      onCheckedChange?.(!isOn);
      onClick?.(e);
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isOn ? "bg-success" : "bg-border-disabled",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform",
            isOn ? "translate-x-5" : "translate-x-1",
          )}
        />
      </button>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
