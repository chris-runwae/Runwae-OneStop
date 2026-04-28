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
  // Optional sticky footer (e.g. Continue button on a multi-step form).
  // When supplied, the body scrolls within max-h-[90vh] while the footer
  // stays pinned — keeps the primary action reachable even when the
  // body is long (e.g. an Unsplash photo grid).
  footer?: ReactNode;
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
  footer,
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
          "relative flex w-full max-w-lg flex-col overflow-hidden bg-card shadow-2xl transition-all duration-[220ms] ease-out",
          // Cap height so long bodies (Unsplash grid, calendar + form) can
          // scroll internally instead of pushing the footer off-screen.
          "max-h-[92vh]",
          responsive
            ? "rounded-t-3xl sm:rounded-3xl"
            : "rounded-3xl",
          "transform-gpu",
          visible
            ? "opacity-100 translate-y-0 sm:scale-100"
            : "opacity-0 translate-y-6 sm:translate-y-0 sm:scale-[0.96]",
          className
        )}
      >
        {/* Mobile drag indicator */}
        <div className={cn(
          "mx-auto h-1 w-10 shrink-0 rounded-full bg-border",
          responsive ? "mb-2 mt-3 sm:hidden" : "hidden"
        )} />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-card/80 text-muted-foreground backdrop-blur transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Scrollable body — flex-1 means it fills the modal up to the cap
            and overflows internally instead of growing the dialog. */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
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

        {/* Pinned footer — stays visible while the body scrolls. */}
        {footer && (
          <div className="shrink-0 border-t border-border bg-card px-6 pb-5 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
