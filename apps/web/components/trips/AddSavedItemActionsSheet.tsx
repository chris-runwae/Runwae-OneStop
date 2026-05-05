"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { CalendarDays, MessageSquare, BarChart3 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Sheet } from "@/components/ui/sheet";
import { DayPickerSheet } from "./DayPickerSheet";
import { CommentDialog } from "./CommentDialog";
import { CreatePollSheet } from "./CreatePollSheet";

export function AddSavedItemActionsSheet({
  open, onClose, tripId, savedItemId,
}: {
  open: boolean;
  onClose: () => void;
  tripId: Id<"trips">;
  savedItemId: Id<"saved_items"> | null;
}) {
  const [pickingDay, setPickingDay] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const promote = useMutation(api.saved_items.promoteToItinerary);

  if (!savedItemId) return null;

  return (
    <>
      <Sheet open={open && !pickingDay && !commenting && !pollOpen} onClose={onClose} title="What would you like to do?">
        <div className="space-y-2">
          <Action
            icon={<CalendarDays className="h-5 w-5" />}
            label="Add to itinerary"
            sub="Pin to a specific day"
            onClick={() => setPickingDay(true)}
          />
          <Action
            icon={<MessageSquare className="h-5 w-5" />}
            label="Add comment"
            sub="Discuss with the group"
            onClick={() => setCommenting(true)}
          />
          <Action
            icon={<BarChart3 className="h-5 w-5" />}
            label="Create poll"
            sub="Vote between this and other saved items"
            onClick={() => setPollOpen(true)}
          />
        </div>
      </Sheet>

      <DayPickerSheet
        open={pickingDay}
        onClose={() => setPickingDay(false)}
        tripId={tripId}
        onPick={async (dayId) => {
          await promote({ savedItemId, dayId });
          setPickingDay(false);
          onClose();
        }}
      />

      <CommentDialog
        open={commenting}
        onClose={() => { setCommenting(false); onClose(); }}
        savedItemId={savedItemId}
      />

      <CreatePollSheet
        open={pollOpen}
        onClose={() => { setPollOpen(false); onClose(); }}
        tripId={tripId}
        seedSavedItemId={savedItemId}
      />
    </>
  );
}

function Action({
  icon, label, sub, onClick,
}: { icon: React.ReactNode; label: string; sub: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-muted"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </span>
    </button>
  );
}
