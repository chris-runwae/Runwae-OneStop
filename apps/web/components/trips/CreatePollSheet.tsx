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

type Mode = "text" | "savedItems";

export function CreatePollSheet({
  open, onClose, tripId, seedSavedItemId,
}: {
  open: boolean;
  onClose: () => void;
  tripId: Id<"trips">;
  seedSavedItemId?: Id<"saved_items">;
}) {
  // When seeded with a saved item, default to "text" — the user is attaching a
  // question to that item. They can switch to "savedItems" to compare instead.
  const [mode, setMode] = useState<Mode>("text");
  const [title, setTitle] = useState("");
  const [textOptions, setTextOptions] = useState<string[]>(["", ""]);
  const [pickedSavedIds, setPickedSavedIds] = useState<Id<"saved_items">[]>(
    seedSavedItemId ? [seedSavedItemId] : [],
  );
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiry, setExpiry] = useState<string>(""); // datetime-local string
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savedItems = useQuery(
    api.saved_items.getSavedItems,
    open && mode === "savedItems" ? { tripId } : "skip",
  );
  const createTextPoll = useMutation(api.polls.create);
  const createSavedPoll = useMutation(api.polls.createForSavedItem);

  useEffect(() => {
    if (!open) return;
    setMode("text");
    setTitle("");
    setTextOptions(["", ""]);
    setPickedSavedIds(seedSavedItemId ? [seedSavedItemId] : []);
    setAllowMultiple(false);
    setIsAnonymous(false);
    setHasExpiry(false);
    setExpiry("");
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
    let closesAt: number | undefined;
    if (hasExpiry) {
      if (!expiry) {
        setError("Pick an expiry date and time.");
        return;
      }
      const ts = new Date(expiry).getTime();
      if (!Number.isFinite(ts) || ts <= Date.now()) {
        setError("Expiry must be in the future.");
        return;
      }
      closesAt = ts;
    }
    const pollType = allowMultiple ? "multi_choice" : "single_choice";

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
          type: pollType,
          options: cleaned,
          closesAt,
          isAnonymous,
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
          type: pollType,
          savedItemIds: pickedSavedIds,
          closesAt,
          isAnonymous,
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
              {m === "text" ? "Attach a question" : "Compare saved items"}
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

        <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
          <Toggle
            label="Allow multiple selections"
            sub="Voters can pick more than one option"
            checked={allowMultiple}
            onChange={setAllowMultiple}
          />
          <Toggle
            label="Anonymous voting"
            sub="Hide who voted for what"
            checked={isAnonymous}
            onChange={setIsAnonymous}
          />
          <Toggle
            label="Set expiry"
            sub="Auto-close at a chosen time"
            checked={hasExpiry}
            onChange={setHasExpiry}
          />
          {hasExpiry && (
            <input
              type="datetime-local"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            />
          )}
        </div>

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

function Toggle({
  label, sub, checked, onChange,
}: { label: string; sub: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span className="flex-1">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </span>
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); onChange(!checked); } }}
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-foreground/15",
        )}
      >
        <span className={cn(
          "inline-block h-5 w-5 translate-x-0.5 transform rounded-full bg-white shadow transition-transform",
          checked && "translate-x-[18px]",
        )} />
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
