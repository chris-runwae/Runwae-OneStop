"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import ReactMarkdown from "react-markdown";
import { Loader2, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { ISO_COUNTRIES, ISO_CURRENCIES } from "@/lib/iso-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { GalleryUpload, SingleImageUpload } from "@/components/image-upload";

const destinationSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  slug: z.string().trim().optional(),
  country: z.string().min(1, "Required"),
  region: z.string().optional(),
  description: z.string().optional(),
  heroImageUrl: z.string().min(1, "Hero image is required"),
  imageUrls: z.array(z.string()),
  tags: z.array(z.string()),
  lat: z.string().optional(),
  lng: z.string().optional(),
  timezone: z.string().min(1, "Required"),
  currency: z.string().min(1, "Required"),
  isFeatured: z.boolean(),
  featuredRank: z.string().optional(),
});

type DestinationFormValues = z.infer<typeof destinationSchema>;

interface DestinationFormProps {
  mode: "create" | "edit";
  initial?: Doc<"destinations">;
}

const TIMEZONES = (() => {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC", "Europe/London", "America/New_York", "Asia/Tokyo"];
  }
})();

function errorMessage(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data ?? e.message);
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

export function DestinationForm({ mode, initial }: DestinationFormProps) {
  const router = useRouter();
  const create = useMutation(api.admin.destinations.create);
  const update = useMutation(api.admin.destinations.update);
  const setFeatured = useMutation(api.admin.destinations.setFeatured);

  const [tagInput, setTagInput] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [previewMd, setPreviewMd] = useState(false);

  const defaultValues: DestinationFormValues = useMemo(
    () => ({
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      country: initial?.country ?? "",
      region: initial?.region ?? "",
      description: initial?.description ?? "",
      heroImageUrl: initial?.heroImageUrl ?? "",
      imageUrls: initial?.imageUrls ?? [],
      tags: initial?.tags ?? [],
      lat: initial?.coords?.lat?.toString() ?? "",
      lng: initial?.coords?.lng?.toString() ?? "",
      timezone: initial?.timezone ?? "",
      currency: initial?.currency ?? "GBP",
      isFeatured: initial?.isFeatured ?? false,
      featuredRank: initial?.featuredRank?.toString() ?? "",
    }),
    [initial]
  );

  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues,
  });

  // Re-seed defaults when the underlying record finishes loading (edit mode).
  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const tags = form.watch("tags");
  const heroImageUrl = form.watch("heroImageUrl");
  const imageUrls = form.watch("imageUrls");
  const description = form.watch("description") ?? "";
  const isFeatured = form.watch("isFeatured");
  const name = form.watch("name");

  function addTag(raw: string) {
    const cleaned = raw.trim().toLowerCase();
    if (!cleaned) return;
    if (tags.includes(cleaned)) return;
    form.setValue("tags", [...tags, cleaned], { shouldDirty: true });
  }

  function removeTag(t: string) {
    form.setValue(
      "tags",
      tags.filter((x) => x !== t),
      { shouldDirty: true }
    );
  }

  async function geocodeFromName() {
    const query = name?.trim();
    if (!query) {
      toast.error("Enter a name first.");
      return;
    }
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          // Nominatim's usage policy asks for a UA identifying the app.
          "Accept-Language": "en",
        },
      });
      if (!res.ok) throw new Error(`Nominatim error ${res.status}`);
      const json = (await res.json()) as Array<{ lat: string; lon: string }>;
      const hit = json[0];
      if (!hit) {
        toast.error("No match found.");
        return;
      }
      form.setValue("lat", parseFloat(hit.lat).toFixed(6), {
        shouldDirty: true,
      });
      form.setValue("lng", parseFloat(hit.lon).toFixed(6), {
        shouldDirty: true,
      });
      toast.success("Coordinates filled");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setGeocoding(false);
    }
  }

  async function onSubmit(values: DestinationFormValues) {
    const coords =
      values.lat && values.lng
        ? { lat: Number(values.lat), lng: Number(values.lng) }
        : undefined;

    if (
      coords &&
      (Number.isNaN(coords.lat) ||
        Number.isNaN(coords.lng) ||
        Math.abs(coords.lat) > 90 ||
        Math.abs(coords.lng) > 180)
    ) {
      toast.error("Coordinates out of range.");
      return;
    }

    const featuredRankNum = values.featuredRank
      ? Number(values.featuredRank)
      : undefined;
    if (
      featuredRankNum !== undefined &&
      (!Number.isFinite(featuredRankNum) || featuredRankNum < 0)
    ) {
      toast.error("Featured rank must be a non-negative number.");
      return;
    }

    try {
      if (mode === "create") {
        const doc = await create({
          name: values.name,
          slug: values.slug?.trim() || undefined,
          country: values.country,
          region: values.region?.trim() || undefined,
          description: values.description?.trim() || undefined,
          heroImageUrl: values.heroImageUrl,
          imageUrls: values.imageUrls,
          tags: values.tags,
          coords,
          timezone: values.timezone,
          currency: values.currency,
          isFeatured: values.isFeatured,
          featuredRank: values.isFeatured ? featuredRankNum : undefined,
        });
        toast.success(`Created “${values.name}”`);
        if (doc?._id) router.push(`/destinations/${doc._id}`);
        else router.push("/destinations");
      } else if (initial) {
        await update({
          id: initial._id,
          name: values.name,
          country: values.country,
          region: values.region,
          description: values.description,
          heroImageUrl: values.heroImageUrl,
          imageUrls: values.imageUrls,
          tags: values.tags,
          coords: coords ?? null,
          timezone: values.timezone,
          currency: values.currency,
        });
        const featuredChanged =
          values.isFeatured !== initial.isFeatured ||
          (values.isFeatured && featuredRankNum !== initial.featuredRank);
        if (featuredChanged) {
          await setFeatured({
            id: initial._id,
            isFeatured: values.isFeatured,
            featuredRank: values.isFeatured ? featuredRankNum : undefined,
          });
        }
        toast.success("Saved");
        form.reset(form.getValues());
      }
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-6 lg:grid-cols-3"
    >
      {/* LEFT — text fields */}
      <div className="space-y-6 lg:col-span-2">
        <Section title="Basics">
          <Field label="Name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} placeholder="Lisbon" />
          </Field>
          <Field
            label={`Slug ${mode === "edit" ? "(immutable)" : "(optional — auto-generated from name)"}`}
            error={form.formState.errors.slug?.message}
          >
            <Input
              {...form.register("slug")}
              disabled={mode === "edit"}
              placeholder="lisbon"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Country"
              error={form.formState.errors.country?.message}
            >
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...form.register("country")}
              >
                <option value="">Select country…</option>
                {ISO_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Region (optional)">
              <Input
                {...form.register("region")}
                placeholder="Europe / Asia / etc."
              />
            </Field>
          </div>
        </Section>

        <Section title="Description (markdown supported)">
          <div className="mb-2 flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPreviewMd(false)}
              className={cn(
                "rounded-sm px-2 py-1",
                !previewMd
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPreviewMd(true)}
              className={cn(
                "rounded-sm px-2 py-1",
                previewMd
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              Preview
            </button>
          </div>
          {previewMd ? (
            <div className="prose prose-sm max-w-none rounded-md border border-input bg-muted/30 p-4 text-sm">
              {description.trim() ? (
                <ReactMarkdown>{description}</ReactMarkdown>
              ) : (
                <span className="text-muted-foreground">
                  Nothing to preview yet.
                </span>
              )}
            </div>
          ) : (
            <Textarea rows={8} {...form.register("description")} />
          )}
        </Section>

        <Section title="Tags">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="gap-1 pl-2.5 pr-1.5"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="rounded-sm hover:bg-foreground/10"
                  aria-label={`Remove tag ${t}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                  setTagInput("");
                }
              }}
              placeholder="Add tag and press Enter…"
              className="max-w-xs"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                addTag(tagInput);
                setTagInput("");
              }}
            >
              Add
            </Button>
          </div>
        </Section>

        <Section title="Coordinates">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Latitude">
              <Input
                {...form.register("lat")}
                placeholder="38.7223"
                inputMode="decimal"
              />
            </Field>
            <Field label="Longitude">
              <Input
                {...form.register("lng")}
                placeholder="-9.1393"
                inputMode="decimal"
              />
            </Field>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => void geocodeFromName()}
                disabled={geocoding || !name?.trim()}
                className="w-full"
              >
                {geocoding ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="mr-1 h-4 w-4" />
                )}
                Geocode from name
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by OpenStreetMap Nominatim. No API key needed; respect the
            1 req/sec usage policy.
          </p>
        </Section>

        <Section title="Locale">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Timezone"
              error={form.formState.errors.timezone?.message}
            >
              <Input
                list="tz-list"
                {...form.register("timezone")}
                placeholder="Europe/Lisbon"
              />
              <datalist id="tz-list">
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} />
                ))}
              </datalist>
            </Field>
            <Field
              label="Currency"
              error={form.formState.errors.currency?.message}
            >
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...form.register("currency")}
              >
                {ISO_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>
      </div>

      {/* RIGHT — images, featured, save */}
      <div className="space-y-6">
        <Section title="Hero image">
          <Controller
            control={form.control}
            name="heroImageUrl"
            render={({ field }) => (
              <SingleImageUpload
                value={field.value || null}
                onChange={(url) => field.onChange(url ?? "")}
                endpoint="destinationHero"
              />
            )}
          />
          {form.formState.errors.heroImageUrl?.message && (
            <p className="text-xs text-destructive">
              {form.formState.errors.heroImageUrl.message}
            </p>
          )}
        </Section>

        <Section title="Gallery">
          <Controller
            control={form.control}
            name="imageUrls"
            render={({ field }) => (
              <GalleryUpload
                value={field.value ?? []}
                onChange={field.onChange}
                endpoint="destinationGallery"
              />
            )}
          />
        </Section>

        <Section title="Featured">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="isFeatured" className="text-sm">
              Mark as featured
            </Label>
            <Controller
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <Switch
                  id="isFeatured"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          {isFeatured && (
            <Field label="Featured rank (lower = earlier)">
              <Input
                {...form.register("featuredRank")}
                placeholder="auto-assign"
                inputMode="numeric"
              />
            </Field>
          )}
        </Section>

        <div className="space-y-2">
          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !heroImageUrl}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create destination" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/destinations")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
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
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
