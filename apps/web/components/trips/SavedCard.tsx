"use client";
import { MessageSquare, Plus } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { CategoryBadge } from "./CategoryBadge";
import { formatCurrency } from "@/lib/format";

export function SavedCard({
  item, commentCount, displayCurrency, onPromote,
}: {
  item: Doc<"saved_items">;
  commentCount: number;
  displayCurrency?: string;
  onPromote: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-sm">
      <div className="relative aspect-[4/3] bg-foreground/5">
        {item.imageUrl && <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />}
        <div className="absolute left-2 top-2"><CategoryBadge type={item.type} /></div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs text-foreground/60">{item.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] text-foreground/60">
            <MessageSquare className="h-3 w-3" /> {commentCount}
          </span>
          {item.price != null && item.currency && (
            <span className="text-xs font-semibold">
              {formatCurrency(item.price, item.currency, displayCurrency)}
            </span>
          )}
          <button onClick={onPromote} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
