"use client";

import { Modal } from "./modal";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  busy?: boolean;
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  busy = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} description={description}>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="h-10 flex-1 rounded-full bg-foreground/5 text-sm font-semibold text-foreground disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => void onConfirm()}
          disabled={busy}
          className={cn(
            "h-10 flex-1 rounded-full text-sm font-semibold disabled:opacity-60",
            variant === "destructive"
              ? "bg-error text-white hover:bg-error/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
