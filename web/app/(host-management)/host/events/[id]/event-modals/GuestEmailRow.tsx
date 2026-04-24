"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Trash2 } from "lucide-react";

interface GuestEmailRowProps {
  email: string;
  onRemove?: () => void;
  showCheck?: boolean;
}

export function GuestEmailRow({
  email,
  onRemove,
  showCheck = false,
}: GuestEmailRowProps) {
  const initial = email[0]?.toUpperCase() ?? "?";
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-sm text-body">{email}</span>
        {showCheck && <Check className="size-4 shrink-0 text-green-600" />}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-body"
          aria-label="Remove"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
