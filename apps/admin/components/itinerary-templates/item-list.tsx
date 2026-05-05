"use client";

import { useId, useRef, useState } from "react";
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
import { GripVertical, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ISO_CURRENCIES } from "@/lib/iso-data";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SingleImageUpload } from "@/components/image-upload";
import { ITEM_TYPE_OPTIONS, type ItemType, type TemplateItem } from "./types";

interface ItemListProps {
  items: TemplateItem[];
  onChange: (next: TemplateItem[]) => void;
  templateCurrency: string;
  destinationCoords: { lat: number; lng: number } | null;
}

export function ItemList({
  items,
  onChange,
  templateCurrency,
  destinationCoords,
}: ItemListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Each item gets a stable client-side key for the lifetime of this list.
  // We can't use index (drag-to-reorder breaks) or any field value (titles
  // change). The ref keeps a parallel array of UUIDs. Length always matches
  // items.length thanks to the patch helpers below.
  const keysRef = useRef<string[]>([]);
  const baseId = useId();
  while (keysRef.current.length < items.length) {
    keysRef.current.push(`${baseId}-${keysRef.current.length}-${cryptoRandom()}`);
  }
  if (keysRef.current.length > items.length) {
    keysRef.current = keysRef.current.slice(0, items.length);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = keysRef.current.indexOf(String(active.id));
    const to = keysRef.current.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    keysRef.current = arrayMove(keysRef.current, from, to);
    onChange(arrayMove(items, from, to));
  }

  function addItem() {
    const next = items.slice();
    next.push({ title: "", type: "activity" });
    keysRef.current.push(`${baseId}-${keysRef.current.length}-${cryptoRandom()}`);
    onChange(next);
  }

  function removeItem(idx: number) {
    keysRef.current.splice(idx, 1);
    onChange(items.filter((_, i) => i !== idx));
  }

  function patchItem(idx: number, patch: Partial<TemplateItem>) {
    const next = items.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-background p-4 text-center text-xs text-muted-foreground">
          No items yet. Click “Add item” below.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={keysRef.current}
            strategy={verticalListSortingStrategy}
          >
            <ol className="space-y-2">
              {items.map((item, idx) => (
                <SortableItem
                  key={keysRef.current[idx]}
                  id={keysRef.current[idx]}
                  item={item}
                  templateCurrency={templateCurrency}
                  destinationCoords={destinationCoords}
                  onChange={(patch) => patchItem(idx, patch)}
                  onRemove={() => removeItem(idx)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-full"
      >
        <Plus className="mr-1 h-3 w-3" /> Add item
      </Button>
    </div>
  );
}

function SortableItem({
  id,
  item,
  templateCurrency,
  destinationCoords,
  onChange,
  onRemove,
}: {
  id: string;
  item: TemplateItem;
  templateCurrency: string;
  destinationCoords: { lat: number; lng: number } | null;
  onChange: (patch: Partial<TemplateItem>) => void;
  onRemove: () => void;
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

  const [geocoding, setGeocoding] = useState(false);

  async function geocodeFromLocation() {
    const query = item.locationName?.trim();
    if (!query) {
      toast.error("Add a location name first.");
      return;
    }
    setGeocoding(true);
    try {
      const params = new URLSearchParams({
        format: "json",
        limit: "1",
        q: query,
      });
      // Bias toward the destination's lat/lng when we have it. bounded=0
      // means viewbox is a *preference* not a hard filter — a hotel just
      // outside the box still ranks (the spec calls this out explicitly).
      if (destinationCoords) {
        const { lat, lng } = destinationCoords;
        params.set(
          "viewbox",
          `${lng - 0.5},${lat - 0.5},${lng + 0.5},${lat + 0.5}`
        );
        params.set("bounded", "0");
      }
      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (!res.ok) throw new Error(`Nominatim error ${res.status}`);
      const json = (await res.json()) as Array<{ lat: string; lon: string }>;
      const hit = json[0];
      if (!hit) {
        toast.error("No match found.");
        return;
      }
      const lat = parseFloat(hit.lat);
      const lng = parseFloat(hit.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        toast.error("Geocoder returned invalid coordinates.");
        return;
      }
      onChange({ coords: { lat, lng } });
      toast.success("Coordinates filled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Geocoding failed");
    } finally {
      setGeocoding(false);
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-md border border-border bg-background p-3",
        isDragging && "opacity-60 ring-2 ring-primary"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label="Reorder item"
          className="mt-1.5 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
            <FieldShell label="Title">
              <Input
                value={item.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Item title"
                className="h-8"
              />
            </FieldShell>
            <FieldShell label="Type">
              <select
                value={item.type}
                onChange={(e) =>
                  onChange({ type: e.target.value as ItemType })
                }
                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {ITEM_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FieldShell>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <FieldShell label="Start time">
              <Input
                value={item.time ?? ""}
                onChange={(e) =>
                  onChange({ time: e.target.value || undefined })
                }
                placeholder="09:00"
                className="h-8"
              />
            </FieldShell>
            <FieldShell label="End time">
              <Input
                value={item.endTime ?? ""}
                onChange={(e) =>
                  onChange({ endTime: e.target.value || undefined })
                }
                placeholder="11:30"
                className="h-8"
              />
            </FieldShell>
          </div>

          <FieldShell label="Description">
            <Textarea
              value={item.description ?? ""}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Description (optional)"
              rows={2}
              className="text-sm"
            />
          </FieldShell>

          <FieldShell label="Cover image (optional, 4MB max)">
            <SingleImageUpload
              value={item.imageUrl ?? null}
              onChange={(url) => onChange({ imageUrl: url ?? undefined })}
              endpoint="templateItemImage"
            />
          </FieldShell>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <FieldShell label="Location name">
              <Input
                value={item.locationName ?? ""}
                onChange={(e) =>
                  onChange({ locationName: e.target.value || undefined })
                }
                placeholder="Mosteiro dos Jerónimos"
                className="h-8"
              />
            </FieldShell>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => void geocodeFromLocation()}
              disabled={geocoding || !item.locationName?.trim()}
            >
              {geocoding ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <MapPin className="mr-1 h-3 w-3" />
              )}
              Geocode
            </Button>
          </div>

          <FieldShell label="External booking URL (optional)">
            <Input
              value={item.externalUrl ?? ""}
              onChange={(e) =>
                onChange({ externalUrl: e.target.value || undefined })
              }
              placeholder="https://booking.com/..."
              type="url"
              className="h-8"
            />
          </FieldShell>

          <div className="grid gap-2 sm:grid-cols-3">
            <CoordsInput
              value={item.coords?.lat}
              onChange={(lat) => onChange(updateCoords(item, { lat }))}
              label="Latitude"
              placeholder="38.7223"
            />
            <CoordsInput
              value={item.coords?.lng}
              onChange={(lng) => onChange(updateCoords(item, { lng }))}
              label="Longitude"
              placeholder="-9.1393"
            />
            <FieldShell label="Estimated cost">
              <Input
                value={
                  item.estimatedCost !== undefined
                    ? String(item.estimatedCost)
                    : ""
                }
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    onChange({ estimatedCost: undefined });
                  } else {
                    const n = Number(raw);
                    if (Number.isFinite(n)) onChange({ estimatedCost: n });
                  }
                }}
                placeholder="0"
                className="h-8"
                inputMode="decimal"
              />
            </FieldShell>
          </div>

          <FieldShell label="Currency">
            <CurrencyPicker
              value={item.currency}
              templateCurrency={templateCurrency}
              onChange={(next) => onChange({ currency: next })}
            />
          </FieldShell>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
          aria-label="Remove item"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}

// Renders the template currency as the placeholder option ("EUR (default)")
// when the item has no explicit currency. Selecting that option clears
// item.currency back to undefined — the materialiser falls back through
// template.currency, so undefined is the right "inherit" sentinel.
const INHERIT_VALUE = "__inherit__";
function CurrencyPicker({
  value,
  templateCurrency,
  onChange,
}: {
  value: string | undefined;
  templateCurrency: string;
  onChange: (next: string | undefined) => void;
}) {
  return (
    <select
      value={value ?? INHERIT_VALUE}
      onChange={(e) => {
        const next = e.target.value;
        onChange(next === INHERIT_VALUE ? undefined : next);
      }}
      className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <option value={INHERIT_VALUE}>{templateCurrency} (default)</option>
      {ISO_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

function CoordsInput({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <FieldShell label={label}>
      <Input
        value={value !== undefined ? String(value) : ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(undefined);
          } else {
            const n = Number(raw);
            if (Number.isFinite(n)) onChange(n);
          }
        }}
        placeholder={placeholder}
        className="h-8"
        inputMode="decimal"
      />
    </FieldShell>
  );
}

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

// Coords get cleared on the schema side when both lat and lng are missing.
// Returns a partial patch ready to spread into the item.
function updateCoords(
  item: TemplateItem,
  partial: { lat?: number | undefined; lng?: number | undefined }
): Partial<TemplateItem> {
  const lat = "lat" in partial ? partial.lat : item.coords?.lat;
  const lng = "lng" in partial ? partial.lng : item.coords?.lng;
  if (lat === undefined && lng === undefined) {
    return { coords: undefined };
  }
  if (lat === undefined || lng === undefined) {
    // One side cleared — drop the coords until both are filled again. Avoids
    // sending half-coords to the schema (which requires both).
    return { coords: undefined };
  }
  return { coords: { lat, lng } };
}

function cryptoRandom(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}
