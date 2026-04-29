"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertTriangle,
  GripVertical,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SingleImageUpload } from "@/components/image-upload";

type EntityType = Doc<"collections">["entityType"];

interface HydratedEntity {
  id: string;
  kind: EntityType;
  doc: {
    _id: string;
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
  } | null;
}

type Collection = Doc<"collections"> & { entities: HydratedEntity[] };

const AUTOSAVE_DELAY_MS = 800;

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

function errorMessage(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data ?? e.message);
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

export function CollectionEditor({ collection }: { collection: Collection }) {
  const update = useMutation(api.admin.collections.update);
  const reorder = useMutation(api.admin.collections.reorderEntities);

  // Metadata fields are locally controlled and debounced-saved.
  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    collection.coverImageUrl ?? ""
  );
  const [rank, setRank] = useState<string>(collection.rank.toString());
  const [isActive, setIsActive] = useState(collection.isActive);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Entities are an ordered list driven by the live query. Local state
  // tracks optimistic ordering during a drag so the UI doesn't snap back
  // before the mutation lands.
  const [entities, setEntities] = useState<HydratedEntity[]>(
    collection.entities
  );

  // Re-sync local state when the underlying record changes (parent query
  // refetched after our own mutations). Keep mid-edit text fields stable.
  const lastIdRef = useRef<Id<"collections"> | null>(collection._id);
  useEffect(() => {
    if (lastIdRef.current !== collection._id) {
      lastIdRef.current = collection._id;
      setTitle(collection.title);
      setDescription(collection.description ?? "");
      setCoverImageUrl(collection.coverImageUrl ?? "");
      setRank(collection.rank.toString());
      setIsActive(collection.isActive);
      setSaveStatus("idle");
    }
    // Always reflect server-provided entity list — drags commit
    // immediately and update the server, so the next query tick is the
    // source of truth.
    setEntities(collection.entities);
  }, [
    collection._id,
    collection.title,
    collection.description,
    collection.coverImageUrl,
    collection.rank,
    collection.isActive,
    collection.entities,
  ]);

  // Debounced metadata save.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function scheduleMetadataSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("dirty");
    saveTimer.current = setTimeout(() => {
      void runMetadataSave();
    }, AUTOSAVE_DELAY_MS);
  }

  async function runMetadataSave() {
    if (inFlightRef.current) {
      pendingRef.current = true;
      return;
    }
    if (!title.trim()) {
      setSaveStatus("dirty");
      return;
    }
    const rankNum = rank ? Number(rank) : 0;
    if (!Number.isFinite(rankNum)) {
      toast.error("Rank must be a number");
      setSaveStatus("error");
      return;
    }
    inFlightRef.current = true;
    setSaveStatus("saving");
    try {
      await update({
        id: collection._id,
        title: title.trim(),
        description: description,
        coverImageUrl: coverImageUrl.trim() ? coverImageUrl : null,
        rank: rankNum,
        isActive,
      });
      setSaveStatus("saved");
    } catch (e) {
      setSaveStatus("error");
      toast.error(errorMessage(e));
    } finally {
      inFlightRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        await runMetadataSave();
      }
    }
  }

  // dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = entities.findIndex((e) => e.id === active.id);
    const newIndex = entities.findIndex((e) => e.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    // Optimistic local update so the card doesn't snap back during the
    // mutation roundtrip. The next query tick reconciles.
    const next = arrayMove(entities, oldIndex, newIndex);
    setEntities(next);
    try {
      await reorder({
        id: collection._id,
        entityIds: next.map((e) => e.id),
      });
    } catch (e) {
      // Rollback on failure — server rejected the new order.
      setEntities(entities);
      toast.error(errorMessage(e));
    }
  }

  async function handleRemoveEntity(entityId: string) {
    const nextIds = entities.filter((e) => e.id !== entityId).map((e) => e.id);
    try {
      await update({ id: collection._id, entityIds: nextIds });
      toast.success("Removed from collection");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function handleAddEntity(entityId: string) {
    if (entities.some((e) => e.id === entityId)) return;
    const nextIds = [...entities.map((e) => e.id), entityId];
    try {
      await update({ id: collection._id, entityIds: nextIds });
      toast.success("Added to collection");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* LEFT — entity list with drag-to-reorder */}
      <div className="space-y-6 lg:col-span-2">
        <Section
          title="Items"
          subtitle={`${entities.length} item${entities.length === 1 ? "" : "s"} · drag to reorder · changes save on drop`}
        >
          {entities.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              No items yet. Use the picker on the right to add some.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => void handleDragEnd(e)}
            >
              <SortableContext
                items={entities.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {entities.map((e) => (
                    <SortableEntityCard
                      key={e.id}
                      entity={e}
                      onRemove={() => void handleRemoveEntity(e.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </Section>

        <Section title="Description">
          <Textarea
            rows={5}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              scheduleMetadataSave();
            }}
            placeholder="Optional context shown alongside the rail."
          />
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            <SaveStatusPill status={saveStatus} />
          </div>
        </Section>
      </div>

      {/* RIGHT — metadata + picker */}
      <div className="space-y-6">
        <Section title="Basics">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                scheduleMetadataSave();
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Entity type (locked)</Label>
            <Input
              value={collection.entityType}
              disabled
              className="font-mono text-xs"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Rank</Label>
              <Input
                value={rank}
                onChange={(e) => {
                  setRank(e.target.value);
                  scheduleMetadataSave();
                }}
                inputMode="numeric"
              />
            </div>
            <div className="flex items-end justify-between gap-2 pb-1">
              <Label htmlFor="active" className="text-xs">
                Active
              </Label>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={(c) => {
                  setIsActive(c);
                  scheduleMetadataSave();
                }}
              />
            </div>
          </div>
        </Section>

        <Section title="Cover image">
          <SingleImageUpload
            value={coverImageUrl || null}
            onChange={(url) => {
              setCoverImageUrl(url ?? "");
              scheduleMetadataSave();
            }}
            endpoint="destinationHero"
          />
        </Section>

        <Section
          title="Add items"
          subtitle={`Search ${collection.entityType}s to add to this collection.`}
        >
          <EntityPicker
            entityType={collection.entityType}
            excludeIds={entities.map((e) => e.id)}
            onPick={(id) => void handleAddEntity(id)}
          />
        </Section>
      </div>
    </div>
  );
}

function SortableEntityCard({
  entity,
  onRemove,
}: {
  entity: HydratedEntity;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entity.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isMissing = entity.doc === null;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={
        "flex items-center gap-3 rounded-md border bg-background p-2.5 " +
        (isMissing
          ? "border-destructive/30 bg-destructive/5"
          : "border-border")
      }
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-muted">
        {entity.doc?.imageUrl ? (
          <Image
            src={entity.doc.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {isMissing ? "?" : "—"}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {isMissing ? (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Missing
              </Badge>
              <span className="text-xs text-muted-foreground">
                Underlying {entity.kind} no longer exists
              </span>
            </div>
            <span className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
              {entity.id}
            </span>
          </>
        ) : (
          <>
            <span className="truncate text-sm font-medium">
              {entity.doc!.title}
            </span>
            {entity.doc!.subtitle && (
              <span className="truncate text-xs text-muted-foreground">
                {entity.doc!.subtitle}
              </span>
            )}
          </>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onRemove}
        aria-label="Remove from collection"
      >
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
}

function EntityPicker({
  entityType,
  excludeIds,
  onPick,
}: {
  entityType: EntityType;
  excludeIds: string[];
  onPick: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  // Memoise the excludeIds reference so the query doesn't re-run on every
  // parent re-render when the array's contents are stable.
  const excludeKey = excludeIds.join(",");
  const stableExclude = useMemo(() => excludeIds, [excludeKey]);

  const results = useQuery(api.admin.collections.searchEntities, {
    entityType,
    search: search.trim() || undefined,
    excludeIds: stableExclude,
    limit: 12,
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${entityType}s…`}
          className="pl-8"
        />
      </div>

      <div className="max-h-80 space-y-1.5 overflow-y-auto">
        {results === undefined ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            Loading…
          </div>
        ) : results.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            {search.trim()
              ? "No matches."
              : `No more ${entityType}s available.`}
          </div>
        ) : (
          results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r.id)}
              className="flex w-full items-center gap-2 rounded-md border border-border bg-background p-2 text-left transition-colors hover:border-foreground/20 hover:bg-accent"
            >
              <div className="relative h-8 w-10 shrink-0 overflow-hidden rounded bg-muted">
                {r.doc?.imageUrl ? (
                  <Image
                    src={r.doc.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">
                  {r.doc?.title ?? r.id}
                </div>
                {r.doc?.subtitle && (
                  <div className="truncate text-[10px] text-muted-foreground">
                    {r.doc.subtitle}
                  </div>
                )}
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-background p-5">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SaveStatusPill({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  if (status === "dirty") return <span>Pending…</span>;
  if (status === "saving")
    return (
      <span className="inline-flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  if (status === "saved") return <span>Saved ✓</span>;
  return <span className="text-destructive">Save failed</span>;
}
