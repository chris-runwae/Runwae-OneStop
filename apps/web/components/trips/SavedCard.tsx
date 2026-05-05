"use client";
import Link from "next/link";
import { BarChart3, MessageSquare, Plus } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { CategoryBadge } from "./CategoryBadge";
import { categoryFromType } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

export type SavedCardPoll = {
  pollId: string;
  pollTitle: string;
  voteCount: number;
  totalVotes: number;
};

export function SavedCard({
  item, commentCount, displayCurrency, poll, onPromote, onOpenComments,
}: {
  item: Doc<"saved_items">;
  commentCount: number;
  displayCurrency?: string;
  poll?: SavedCardPoll | null;
  onPromote: () => void;
  onOpenComments: () => void;
}) {
  const detailHref =
    item.apiSource && item.apiRef
      ? `/discover/${item.apiSource}/${encodeURIComponent(item.apiRef)}?category=${categoryFromType(item.type).id}&tripId=${item.tripId}`
      : null;
  const pct = poll && poll.totalVotes > 0
    ? Math.round((poll.voteCount / poll.totalVotes) * 100)
    : 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-sm">
      <DetailWrap href={detailHref}>
        <div className="relative aspect-[4/3] bg-foreground/5">
          {item.imageUrl && <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />}
          <div className="absolute left-2 top-2"><CategoryBadge type={item.type} /></div>
        </div>
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-xs text-foreground/60">{item.description}</p>
          )}
        </div>
      </DetailWrap>
      <div className="px-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpenComments}
            aria-label="Open comments"
            className="inline-flex items-center gap-1 rounded-full px-1 py-0.5 text-[11px] text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
          >
            <MessageSquare className="h-3 w-3" /> {commentCount}
          </button>
          {item.price != null && item.currency && (
            <span className="text-xs font-semibold">
              {formatCurrency(item.price, item.currency, displayCurrency)}
            </span>
          )}
          <button onClick={onPromote} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {poll && (
          <div className="mt-3 rounded-full border border-primary/30 bg-foreground/5">
            <div className="relative flex h-7 items-center overflow-hidden rounded-full">
              <div
                className="absolute inset-y-0 left-0 bg-primary/20 transition-[width]"
                style={{ width: `${pct}%` }}
              />
              <span className="relative flex flex-1 items-center gap-1 truncate px-3 text-[11px] font-semibold text-foreground">
                <BarChart3 className="h-3 w-3 text-primary" />
                <span className="truncate">In poll: {poll.pollTitle}</span>
              </span>
              <span className="relative pr-3 text-[11px] font-bold text-foreground">{pct}%</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function DetailWrap({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return <Link href={href} className="block">{children}</Link>;
}
