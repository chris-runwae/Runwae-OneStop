"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Sheet } from "@/components/ui/sheet";
import { ALL_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Mode = "search" | "manual";
type Target =
  | { kind: "saved";     tripId: Id<"trips"> }
  | { kind: "itinerary"; tripId: Id<"trips">; dayId: Id<"itinerary_days"> };

export function AddItemSheet({
  open, onClose, target,
}: {
  open: boolean;
  onClose: () => void;
  target: Target;
}) {
  const [mode, setMode] = useState<Mode>("manual");

  return (
    <Sheet open={open} onClose={onClose} title="Add to trip">
      <div className="mb-4 flex gap-2">
        {(["search", "manual"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "h-9 rounded-full px-4 text-xs font-semibold",
              mode === m ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/70",
            )}
          >
            {m === "search" ? "Search" : "Manual"}
          </button>
        ))}
      </div>
      {mode === "search" ? <SearchTab target={target} onDone={onClose} /> : <ManualTab target={target} onDone={onClose} />}
    </Sheet>
  );
}

function SearchTab({ target, onDone }: { target: Target; onDone: () => void }) {
  const [term, setTerm] = useState("");
  const results = useQuery(
    api.search.searchAll,
    term.trim().length >= 2 ? { term, limit: 10 } : "skip",
  );
  const addSaved = useMutation(api.saved_items.addSavedItem);

  return (
    <>
      <input
        value={term}
        onChange={e => setTerm(e.target.value)}
        placeholder="Search destinations, experiences, events…"
        className="h-10 w-full rounded-full bg-foreground/5 px-4 text-sm focus:bg-foreground/10 focus:outline-none"
      />
      <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto">
        {(results?.experiences ?? []).map(exp => (
          <li key={exp._id} className="flex items-center justify-between rounded-xl border border-foreground/10 p-3">
            <span className="text-sm">{exp.title}</span>
            <button
              onClick={async () => {
                await addSaved({
                  tripId: target.tripId,
                  type: "activity",
                  title: exp.title,
                  isManual: false,
                  imageUrl: exp.imageUrl,
                });
                onDone();
              }}
              className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            >
              Add
            </button>
          </li>
        ))}
        {term.trim().length >= 2 && results !== undefined && results.experiences.length === 0 && (
          <li className="px-3 py-4 text-center text-xs text-foreground/60">No results</li>
        )}
      </ul>
    </>
  );
}

function ManualTab({ target, onDone }: { target: Target; onDone: () => void }) {
  const addSaved = useMutation(api.saved_items.addSavedItem);
  const addItem  = useMutation(api.itinerary.addItem);
  const [type, setType] = useState<Doc<"saved_items">["type"]>("activity");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const priceNum = price ? Number(price) : undefined;
        if (target.kind === "itinerary") {
          await addItem({
            tripId: target.tripId,
            dayId: target.dayId,
            type,
            title,
            startTime: time || undefined,
            price: priceNum,
          });
        } else {
          await addSaved({
            tripId: target.tripId,
            type,
            title,
            date: date || undefined,
            price: priceNum,
            isManual: true,
          });
        }
        onDone();
      }}
      className="space-y-3"
    >
      <select value={type} onChange={e => setType(e.target.value as typeof type)}
              className="h-10 w-full rounded-xl bg-foreground/5 px-3 text-sm">
        {ALL_CATEGORIES.filter(c => c.id !== "shop").map(c => (
          <option key={c.id} value={uiCategoryToType(c.id)}>{c.emoji} {c.label}</option>
        ))}
      </select>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required
             className="h-10 w-full rounded-xl bg-foreground/5 px-3 text-sm" />
      {target.kind === "saved" && (
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
               className="h-10 w-full rounded-xl bg-foreground/5 px-3 text-sm" />
      )}
      {target.kind === "itinerary" && (
        <input type="time" value={time} onChange={e => setTime(e.target.value)}
               className="h-10 w-full rounded-xl bg-foreground/5 px-3 text-sm" />
      )}
      <input type="number" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price"
             className="h-10 w-full rounded-xl bg-foreground/5 px-3 text-sm" />
      <button type="submit" className="h-10 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        Add
      </button>
    </form>
  );
}

function uiCategoryToType(id: string): Doc<"saved_items">["type"] {
  switch (id) {
    case "fly":       return "flight";
    case "stay":      return "hotel";
    case "eat":       return "restaurant";
    case "tour":      return "tour";
    case "ride":      return "transport";
    case "event":     return "event";
    case "adventure": return "activity";
    default:          return "other";
  }
}
