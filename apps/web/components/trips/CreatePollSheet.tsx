"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CreatePollSheet({
  open, onClose, tripId, seedSavedItemId,
}: {
  open: boolean;
  onClose: () => void;
  tripId: Id<"trips">;
  seedSavedItemId?: Id<"saved_items">;
}) {
  const [mode, setMode] = useState<"text" | "savedItems">(seedSavedItemId ? "savedItems" : "text");
  const [title, setTitle] = useState("");
  const [textOptions, setTextOptions] = useState<string[]>(["", ""]);
  const [pickedSavedIds, setPickedSavedIds] = useState<Id<"saved_items">[]>(
    seedSavedItemId ? [seedSavedItemId] : [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savedItems = useQuery(
    api.saved_items.getSavedItems,
    open && mode === "savedItems" ? { tripId } : "skip",
  );
  const createTextPoll = useMutation(api.polls.create);
  const createSavedPoll = useMutation(api.polls.createForSavedItem);

  // Reset state on open with new seed
  useEffect(() => {
    if (!open) return;
    setMode(seedSavedItemId ? "savedItems" : "text");
    setTitle("");
    setTextOptions(["", ""]);
    setPickedSavedIds(seedSavedItemId ? [seedSavedItemId] : []);
    setError(null);
  }, [open, seedSavedItemId]);

  function toggleSavedItem(id: Id<"saved_items">) {
    setPickedSavedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  async function submit() {
    setError(null);
    if (!title.trim()) {
      setError("Add a poll question.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "text") {
        const cleaned = textOptions.map((s) => s.trim()).filter(Boolean);
        if (cleaned.length < 2) {
          setError("Add at least 2 options.");
          setSubmitting(false);
          return;
        }
        await createTextPoll({
          tripId,
          title: title.trim(),
          type: "single_choice",
          options: cleaned,
        });
      } else {
        if (pickedSavedIds.length < 2) {
          setError("Pick at least 2 saved items.");
          setSubmitting(false);
          return;
        }
        await createSavedPoll({
          tripId,
          title: title.trim(),
          type: "single_choice",
          savedItemIds: pickedSavedIds,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create poll.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Create poll">
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["text", "savedItems"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "h-9 rounded-full px-4 text-xs font-semibold",
                mode === m ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/70",
              )}
            >
              {m === "text" ? "Free text" : "From Saved"}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Poll question"
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none"
        />

        {mode === "text" ? (
          <div className="space-y-2">
            {textOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={(e) =>
                    setTextOptions((prev) => prev.map((v, j) => (i === j ? e.target.value : v)))
                  }
                  placeholder={`Option ${i + 1}`}
                  className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                />
                {textOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setTextOptions((prev) => prev.filter((_, j) => j !== i))}
                    aria-label="Remove option"
                    className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTextOptions((prev) => [...prev, ""])}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary text-xs font-semibold text-primary"
            >
              <Plus className="h-4 w-4" /> Add option
            </button>
          </div>
        ) : savedItems === undefined ? (
          <Skeleton className="h-32" />
        ) : savedItems.length === 0 ? (
          <p className="rounded-xl bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
            No saved items yet.
          </p>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {savedItems.map((s) => {
              const picked = pickedSavedIds.includes(s._id);
              return (
                <li key={s._id}>
                  <button
                    type="button"
                    onClick={() => toggleSavedItem(s._id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                      picked ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted",
                    )}
                  >
                    {s.imageUrl && (
                      <img src={s.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
                    )}
                    <span className="flex-1 truncate text-sm font-medium">{s.title}</span>
                    <span className={cn(
                      "grid h-5 w-5 place-items-center rounded-full border text-[10px]",
                      picked ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}>
                      {picked ? "✓" : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit} isLoading={submitting} disabled={submitting}>
            Create poll
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
