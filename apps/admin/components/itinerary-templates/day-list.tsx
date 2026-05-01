"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ItemList } from "./item-list";
import type { TemplateDay } from "./types";

interface DayListProps {
  days: TemplateDay[];
  onChange: (next: TemplateDay[]) => void;
  templateCurrency: string;
  destinationCoords: { lat: number; lng: number } | null;
}

export function DayList({
  days,
  onChange,
  templateCurrency,
  destinationCoords,
}: DayListProps) {
  const [openIdx, setOpenIdx] = useState<Set<number>>(new Set([0]));
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function toggle(idx: number) {
    setOpenIdx((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = days.findIndex((d) => keyFor(d) === active.id);
    const to = days.findIndex((d) => keyFor(d) === over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(days, from, to));
  }

  function patchDay(idx: number, next: TemplateDay) {
    const copy = days.slice();
    copy[idx] = next;
    onChange(copy);
  }

  // Sortable IDs are stable per position. We can't use dayNumber because
  // the auto-renumbering fires after the drop, and we can't use object
  // identity because state updates clone. dayNumber as a string works
  // because the parent re-renders with new numbers after the drop too.
  const dayKeys = days.map(keyFor);

  if (days.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        No days yet. Increase the duration above to add days.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={dayKeys} strategy={verticalListSortingStrategy}>
        <ol className="space-y-2">
          {days.map((day, idx) => (
            <SortableDay
              key={dayKeys[idx]}
              id={dayKeys[idx]}
              day={day}
              isOpen={openIdx.has(idx)}
              onToggle={() => toggle(idx)}
              onChange={(next) => patchDay(idx, next)}
              templateCurrency={templateCurrency}
              destinationCoords={destinationCoords}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function keyFor(day: TemplateDay): string {
  return `day-${day.dayNumber}`;
}

function SortableDay({
  id,
  day,
  isOpen,
  onToggle,
  onChange,
  templateCurrency,
  destinationCoords,
}: {
  id: string;
  day: TemplateDay;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (next: TemplateDay) => void;
  templateCurrency: string;
  destinationCoords: { lat: number; lng: number } | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-md border border-border bg-background",
        isDragging && "opacity-60 ring-2 ring-primary"
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          aria-label={`Reorder day ${day.dayNumber}`}
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="font-mono text-xs text-muted-foreground">
          Day {day.dayNumber}
        </span>
        <Input
          value={day.title}
          onChange={(e) => onChange({ ...day, title: e.target.value })}
          className="h-8 max-w-md"
          placeholder="Day title"
        />
        <span className="ml-auto text-xs text-muted-foreground">
          {day.items.length} item{day.items.length === 1 ? "" : "s"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggle}
          aria-label={isOpen ? "Collapse" : "Expand"}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </div>
      {isOpen && (
        <div className="border-t border-border bg-muted/20 p-3">
          <ItemList
            items={day.items}
            onChange={(items) => onChange({ ...day, items })}
            templateCurrency={templateCurrency}
            destinationCoords={destinationCoords}
          />
        </div>
      )}
    </li>
  );
}
