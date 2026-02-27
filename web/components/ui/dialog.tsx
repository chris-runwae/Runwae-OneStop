"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  useEffect,
  useRef,
} from "react";

interface DialogProps extends ComponentPropsWithoutRef<"dialog"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  ...props
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={() => onOpenChange(false)}
      onClick={(e) => e.target === ref.current && onOpenChange(false)}
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 outline-none backdrop:bg-black/50"
      aria-modal
      {...props}
    >
      <div
        role="document"
        className={cn(
          "relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-lg",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded p-1 text-muted-foreground hover:bg-muted hover:text-body"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
        <h2 className="font-display text-xl font-bold text-black pr-8">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </dialog>
  );
}
