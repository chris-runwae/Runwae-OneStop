"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { ISO_CURRENCIES } from "@/lib/iso-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SingleImageUpload } from "@/components/image-upload";
import { DayList } from "@/components/itinerary-templates/day-list";
import type { TemplateDay, TemplateItem } from "./types";

type TemplateRow = Doc<"itinerary_templates">;
type TemplateRowWithJoin = TemplateRow & {
  destination: { _id: Id<"destinations">; name: string; country: string } | null;
};

interface TemplateFormProps {
  mode: "create" | "edit";
  initial?: TemplateRowWithJoin;
}

type Difficulty = "easy" | "moderate" | "challenging";

interface FormState {
  title: string;
  destinationId: Id<"destinations"> | "";
  description: string;
  durationDays: number;
  difficultyLevel: Difficulty | "";
  category: string;
  coverImageUrl: string | null;
  estimatedTotalCost: string;
  currency: string;
  isFeatured: boolean;
  days: TemplateDay[];
}

function blankDay(n: number): TemplateDay {
  return { dayNumber: n, title: `Day ${n}`, items: [] };
}

function emptyDays(count: number): TemplateDay[] {
  return Array.from({ length: count }, (_, i) => blankDay(i + 1));
}

function defaultsFromInitial(
  initial: TemplateRowWithJoin | undefined
): FormState {
  if (!initial) {
    return {
      title: "",
      destinationId: "",
      description: "",
      durationDays: 3,
      difficultyLevel: "",
      category: "",
      coverImageUrl: null,
      estimatedTotalCost: "",
      currency: "GBP",
      isFeatured: false,
      days: emptyDays(3),
    };
  }
  // Coerce schema items (type: string) into the editor's restricted set.
  const days: TemplateDay[] = initial.days.map((d) => ({
    dayNumber: d.dayNumber,
    title: d.title,
    items: d.items.map((it) => ({
      time: it.time,
      endTime: it.endTime,
      title: it.title,
      description: it.description,
      type: normaliseType(it.type),
      imageUrl: it.imageUrl,
      locationName: it.locationName,
      coords: it.coords,
      estimatedCost: it.estimatedCost,
      currency: it.currency,
      externalUrl: it.externalUrl,
    })),
  }));
  return {
    title: initial.title,
    destinationId: initial.destinationId,
    description: initial.description ?? "",
    durationDays: initial.durationDays,
    difficultyLevel: initial.difficultyLevel ?? "",
    category: initial.category ?? "",
    coverImageUrl: initial.coverImageUrl ?? null,
    estimatedTotalCost:
      initial.estimatedTotalCost !== undefined
        ? String(initial.estimatedTotalCost)
        : "",
    currency: initial.currency,
    isFeatured: initial.isFeatured,
    days,
  };
}

function normaliseType(raw: string): TemplateItem["type"] {
  switch (raw) {
    case "activity":
    case "food":
    case "transport":
    case "lodging":
    case "free":
      return raw;
    case "restaurant":
      return "food";
    case "hotel":
      return "lodging";
    case "flight":
    case "car_rental":
      return "transport";
    default:
      return "activity";
  }
}

function errorMessage(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data ?? e.message);
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 800;

export function TemplateForm({ mode, initial }: TemplateFormProps) {
  const router = useRouter();
  const create = useMutation(api.admin.itinerary_templates.create);
  const update = useMutation(api.admin.itinerary_templates.update);
  const setFeaturedMutation = useMutation(
    api.admin.itinerary_templates.setFeatured
  );
  const publishMutation = useMutation(api.admin.itinerary_templates.publish);

  const destinations = useQuery(api.admin.destinations.listAll, {});

  const [state, setState] = useState<FormState>(() =>
    defaultsFromInitial(initial)
  );
  const [docId, setDocId] = useState<Id<"itinerary_templates"> | null>(
    initial?._id ?? null
  );
  const [status, setStatus] = useState<TemplateRow["status"]>(
    initial?.status ?? "draft"
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [destSearch, setDestSearch] = useState("");
  const [publishing, setPublishing] = useState(false);

  // When `initial` first arrives in edit mode, hydrate state once. Subsequent
  // server updates from auto-saves shouldn't clobber the editor.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (initial && !hydratedRef.current) {
      setState(defaultsFromInitial(initial));
      setDocId(initial._id);
      setStatus(initial.status);
      hydratedRef.current = true;
    }
  }, [initial]);

  // Track whether we've ever saved successfully — drives the "Saved ✓" pill
  // vs "idle" (nothing to show on first paint).
  const hasSavedRef = useRef(mode === "edit");

  // Debounced auto-save. We watch `state` — every keystroke schedules a
  // save 800ms later, replaced if state changes again. The first save in
  // create mode promotes us to edit mode (we get a docId back) and updates
  // the URL so a refresh continues editing the same record.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function scheduleSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("dirty");
    saveTimer.current = setTimeout(() => {
      void runSave();
    }, AUTOSAVE_DELAY_MS);
  }

  async function runSave() {
    if (inFlightRef.current) {
      // A save is already running — re-fire once it finishes so we don't
      // drop the latest edits.
      pendingRef.current = true;
      return;
    }
    if (!state.title.trim() || !state.destinationId) {
      // Required fields not set yet — leave as dirty so the user sees the
      // pill but don't burn a server roundtrip on guaranteed-failure args.
      setSaveStatus("dirty");
      return;
    }
    inFlightRef.current = true;
    setSaveStatus("saving");
    try {
      const cost = state.estimatedTotalCost
        ? Number(state.estimatedTotalCost)
        : undefined;
      const costPayload =
        cost !== undefined && Number.isFinite(cost) ? cost : undefined;

      if (docId === null) {
        const doc = await create({
          title: state.title.trim(),
          destinationId: state.destinationId as Id<"destinations">,
          description: state.description.trim() || undefined,
          durationDays: state.durationDays,
          difficultyLevel: state.difficultyLevel || undefined,
          category: state.category.trim() || undefined,
          coverImageUrl: state.coverImageUrl ?? undefined,
          days: state.days,
          estimatedTotalCost: costPayload,
          currency: state.currency,
          isFeatured: state.isFeatured,
        });
        if (doc?._id) {
          setDocId(doc._id);
          // Swap URL in place — a refresh now resumes editing the row.
          window.history.replaceState(
            null,
            "",
            `/itinerary-templates/${doc._id}`
          );
        }
      } else {
        await update({
          id: docId,
          title: state.title.trim(),
          destinationId: state.destinationId as Id<"destinations">,
          description: state.description.trim() || undefined,
          durationDays: state.durationDays,
          difficultyLevel: state.difficultyLevel || null,
          category: state.category.trim() || undefined,
          coverImageUrl: state.coverImageUrl ?? null,
          days: state.days,
          estimatedTotalCost: costPayload ?? null,
          currency: state.currency,
        });
        // setFeatured / publish use dedicated mutations — they're driven
        // imperatively from the toggle handlers, not from this auto-save.
      }
      hasSavedRef.current = true;
      setSaveStatus("saved");
    } catch (e) {
      setSaveStatus("error");
      toast.error(errorMessage(e));
    } finally {
      inFlightRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        // Run the queued save with the latest state.
        void runSave();
      }
    }
  }

  // When the user toggles isFeatured, we need to push it via setFeatured
  // (the update mutation doesn't accept it — featured toggling is a
  // separate concern in the API surface and matches destinations).
  async function handleToggleFeatured(next: boolean) {
    setState((s) => ({ ...s, isFeatured: next }));
    if (!docId) return; // not yet created — flushed on next save
    try {
      await setFeaturedMutation({ id: docId, isFeatured: next });
    } catch (e) {
      toast.error(errorMessage(e));
      setState((s) => ({ ...s, isFeatured: !next }));
    }
  }

  async function handlePublishToggle() {
    if (!docId) {
      toast.error("Save the template first.");
      return;
    }
    // Force any pending debounced save to flush before publishing so the
    // server has the latest content.
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    setPublishing(true);
    try {
      await runSave();
      const next: TemplateRow["status"] =
        status === "published" ? "draft" : "published";
      await publishMutation({ id: docId, status: next });
      setStatus(next);
      toast.success(next === "published" ? "Published" : "Reverted to draft");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setPublishing(false);
    }
  }

  // Update one field; trigger autosave.
  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    scheduleSave();
  }

  function setDays(next: TemplateDay[]) {
    const renumbered = next.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setState((s) => ({ ...s, days: renumbered }));
    scheduleSave();
  }

  function setDuration(n: number) {
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(1, Math.min(60, Math.floor(n)));
    setState((s) => {
      const days = s.days.slice(0, clamped);
      while (days.length < clamped) days.push(blankDay(days.length + 1));
      const renumbered = days.map((d, i) => ({ ...d, dayNumber: i + 1 }));
      return { ...s, durationDays: clamped, days: renumbered };
    });
    scheduleSave();
  }

  const filteredDestinations = useMemo(() => {
    if (!destinations) return [];
    const needle = destSearch.trim().toLowerCase();
    if (!needle) return destinations.slice(0, 50);
    return destinations
      .filter(
        (d) =>
          d.name.toLowerCase().includes(needle) ||
          d.country.toLowerCase().includes(needle)
      )
      .slice(0, 50);
  }, [destinations, destSearch]);

  const selectedDestination = useMemo(() => {
    if (!destinations || !state.destinationId) return null;
    return destinations.find((d) => d._id === state.destinationId) ?? null;
  }, [destinations, state.destinationId]);

  return (
    <div className="space-y-6">
      {/* Sticky header — save indicator + status controls */}
      <div className="sticky top-0 z-10 -mx-8 flex items-center gap-3 border-b border-border bg-background/95 px-8 py-3 backdrop-blur">
        <SaveIndicator status={saveStatus} hasSaved={hasSavedRef.current} />
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Status: <strong className="font-medium">{status}</strong>
          </span>
          <Button
            type="button"
            variant={status === "published" ? "outline" : "default"}
            size="sm"
            onClick={() => void handlePublishToggle()}
            disabled={publishing || !docId}
          >
            {publishing && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {status === "published" ? "Revert to draft" : "Publish"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/itinerary-templates")}
          >
            Done
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — basics + days */}
        <div className="space-y-6 lg:col-span-2">
          <Section title="Basics">
            <Field label="Title">
              <Input
                value={state.title}
                onChange={(e) => patch("title", e.target.value)}
                placeholder="A weekend in Lisbon"
              />
            </Field>
            <Field label="Destination">
              <DestinationPicker
                value={state.destinationId}
                onChange={(id) => patch("destinationId", id)}
                options={filteredDestinations}
                search={destSearch}
                onSearchChange={setDestSearch}
                selectedLabel={
                  selectedDestination
                    ? `${selectedDestination.name}, ${selectedDestination.country}`
                    : ""
                }
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={state.description}
                onChange={(e) => patch("description", e.target.value)}
                rows={4}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Duration (days)">
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={state.durationDays}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </Field>
              <Field label="Difficulty">
                <select
                  value={state.difficultyLevel}
                  onChange={(e) =>
                    patch("difficultyLevel", e.target.value as Difficulty | "")
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">—</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </Field>
              <Field label="Category">
                <Input
                  value={state.category}
                  onChange={(e) => patch("category", e.target.value)}
                  placeholder="city break"
                />
              </Field>
            </div>
          </Section>

          <Section title="Days">
            <DayList
              days={state.days}
              onChange={setDays}
              templateCurrency={state.currency}
              destinationCoords={selectedDestination?.coords ?? null}
            />
          </Section>
        </div>

        {/* RIGHT — meta */}
        <div className="space-y-6">
          <Section title="Cover image">
            <SingleImageUpload
              value={state.coverImageUrl}
              onChange={(url) => patch("coverImageUrl", url)}
              endpoint="destinationHero"
            />
          </Section>

          <Section title="Cost">
            <Field label="Estimated total cost">
              <Input
                value={state.estimatedTotalCost}
                onChange={(e) => patch("estimatedTotalCost", e.target.value)}
                placeholder="0"
                inputMode="decimal"
              />
            </Field>
            <Field label="Currency">
              <select
                value={state.currency}
                onChange={(e) => patch("currency", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {ISO_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Featured">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="isFeatured" className="text-sm">
                Mark as featured
              </Label>
              <Switch
                id="isFeatured"
                checked={state.isFeatured}
                onCheckedChange={handleToggleFeatured}
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function SaveIndicator({
  status,
  hasSaved,
}: {
  status: SaveStatus;
  hasSaved: boolean;
}) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  }
  if (status === "dirty") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-amber-500" /> Unsaved changes
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-destructive">
        Save failed — see toast
      </span>
    );
  }
  if (status === "saved" || hasSaved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
        <Check className="h-3 w-3" /> Saved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      Edits auto-save after 800ms
    </span>
  );
}

function DestinationPicker({
  value,
  onChange,
  options,
  search,
  onSearchChange,
  selectedLabel,
}: {
  value: Id<"destinations"> | "";
  onChange: (id: Id<"destinations">) => void;
  options: Array<{ _id: Id<"destinations">; name: string; country: string }>;
  search: string;
  onSearchChange: (s: string) => void;
  selectedLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          !selectedLabel && "text-muted-foreground"
        )}
      >
        <span>{selectedLabel || "Select destination…"}</span>
        <span className="text-xs">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="rounded-md border border-border bg-background p-2">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search…"
            autoFocus
            className="mb-2"
          />
          <div className="max-h-64 overflow-y-auto">
            {options.length === 0 ? (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                No matches.
              </p>
            ) : (
              options.map((d) => (
                <button
                  key={d._id}
                  type="button"
                  onClick={() => {
                    onChange(d._id);
                    setOpen(false);
                  }}
                  className={cn(
                    "block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent",
                    value === d._id && "bg-accent"
                  )}
                >
                  <span className="font-medium">{d.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {d.country}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-background p-5">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
