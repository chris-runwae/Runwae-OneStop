"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";

export function CommentDialog({
  open, onClose, savedItemId,
}: {
  open: boolean;
  onClose: () => void;
  savedItemId: Id<"saved_items">;
}) {
  const comments = useQuery(api.saved_items.getComments, open ? { savedItemId } : "skip");
  const addComment = useMutation(api.saved_items.addComment);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const text = draft.trim();
    if (text.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await addComment({ savedItemId, content: text });
      setDraft("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Comments">
      <div className="space-y-3">
        {comments === undefined ? (
          <Skeleton className="h-20" />
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {comments.map((c) => (
              <li key={c._id} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                <Avatar src={c.author?.image ?? null} name={c.author?.name ?? undefined} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{c.author?.name ?? "Member"}</span>
                    <span className="text-[10px] text-muted-foreground">{formatRelativeTime(c.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{c.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          rows={3}
          className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          <Button type="button" onClick={submit} isLoading={submitting} disabled={!draft.trim() || submitting}>
            Post
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
