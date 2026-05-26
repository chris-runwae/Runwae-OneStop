"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Sheet({ open, onClose, title, children, className }: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMounted(false), 260);
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
    // Mobile: bottom sheet. Desktop (sm+): centered modal.
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-[260ms] ease-out",
          visible ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full bg-card shadow-xl",
          // Mobile: slide up from bottom, full-width, rounded top
          "rounded-t-3xl px-6 pb-8 pt-4",
          // Desktop: centered, max-width, fully rounded, scale in
          "sm:max-w-sm sm:rounded-3xl",
          "transition-all duration-[260ms] ease-out",
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 sm:translate-y-6",
          className
        )}
      >
        {/* Drag handle — mobile only */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
