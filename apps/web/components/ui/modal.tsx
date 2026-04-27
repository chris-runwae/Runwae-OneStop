"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  // When true, the modal slides up from the bottom on mobile (sheet-like)
  // and centres on desktop. When false, it always centres.
  responsive?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  responsive = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two RAFs: ensure the element is in the DOM with `visible=false`
      // before flipping to `true`, so the transition runs from 0 to 1.
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMounted(false), 220);
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-200 ease-out",
          visible ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full max-w-lg bg-card shadow-2xl transition-all duration-[220ms] ease-out",
          responsive
            ? "rounded-t-3xl sm:rounded-3xl"
            : "rounded-3xl",
          // Animations
          "transform-gpu",
          visible
            ? "opacity-100 translate-y-0 sm:scale-100"
            : "opacity-0 translate-y-6 sm:translate-y-0 sm:scale-[0.96]",
          className
        )}
      >
        {/* Mobile drag indicator */}
        <div className={cn(
          "mx-auto h-1 w-10 rounded-full bg-border",
          responsive ? "mb-2 mt-3 sm:hidden" : "hidden"
        )} />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-5">
          {title && (
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
          <div className={cn(title || description ? "mt-4" : "")}>{children}</div>
        </div>
      </div>
    </div>
  );
}
