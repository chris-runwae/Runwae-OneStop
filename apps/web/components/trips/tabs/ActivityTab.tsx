"use client";
import { useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { PollsView } from "./activity/PollsView";
import { MembersView } from "./activity/MembersView";
import { PostsView } from "./activity/PostsView";
import { ExpensesView } from "./activity/ExpensesView";
import { ChecklistsView } from "./activity/ChecklistsView";

type Sub = "polls" | "expenses" | "posts" | "members" | "checklists";
const SUBS: { id: Sub; label: string }[] = [
  { id: "polls",      label: "Polls" },
  { id: "expenses",   label: "Expenses" },
  { id: "posts",      label: "Posts" },
  { id: "members",    label: "Members" },
  { id: "checklists", label: "Checklists" },
];

export function ActivityTab({ trip, viewer }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  const [sub, setSub] = useState<Sub>("polls");
  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {SUBS.map(s => (
          <button key={s.id} onClick={() => setSub(s.id)}
            className={cn(
              "h-8 flex-shrink-0 rounded-full px-3 text-xs font-semibold",
              sub === s.id ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/70",
            )}
          >{s.label}</button>
        ))}
      </div>
      {sub === "polls"      && <PollsView      trip={trip} viewer={viewer} />}
      {sub === "expenses"   && <ExpensesView   trip={trip} viewer={viewer} />}
      {sub === "posts"      && <PostsView      trip={trip} viewer={viewer} />}
      {sub === "members"    && <MembersView    trip={trip} viewer={viewer} />}
      {sub === "checklists" && <ChecklistsView trip={trip} viewer={viewer} />}
    </>
  );
}
