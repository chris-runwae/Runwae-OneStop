"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Button } from "@runwae/ui/components/button";
import { Input } from "@runwae/ui/components/input";
import { Label } from "@runwae/ui/components/label";
import { Textarea } from "@runwae/ui/components/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@runwae/ui/components/select";
import { CoverImagePicker } from "@/components/events/cover-image-picker";
import { LocationPicker } from "@/components/ui/location-picker";

export const TICKETING_MODES: {
  value: "runwae" | "external" | "free" | "none";
  label: string;
}[] = [
  { value: "runwae", label: "Runwae ticketing" },
  { value: "external", label: "External ticket URL" },
  { value: "free", label: "Free / RSVP only" },
  { value: "none", label: "No ticketing" },
];

const CATEGORIES = [
  { value: "festival", label: "Festival" },
  { value: "conference", label: "Conference" },
  { value: "concert", label: "Concert" },
  { value: "retreat", label: "Retreat" },
  { value: "sports", label: "Sports" },
  { value: "cultural", label: "Cultural" },
  { value: "food", label: "Food & Drink" },
  { value: "music", label: "Music" },
  { value: "other", label: "Other" },
];

const eventFormSchema = z
  .object({
    name: z.string().trim().min(2, "Event name is required").max(120),
    description: z
      .string()
      .trim()
      .max(2000, "Description is too long")
      .optional()
      .or(z.literal("")),
    locationName: z.string().trim().min(2, "Location is required"),
    locationCoords: z
      .object({ lat: z.number(), lng: z.number() })
      .optional()
      .nullable(),
    timezone: z.string().trim().min(1, "Timezone is required"),
    startLocal: z.string().min(1, "Pick a start date and time"),
    endLocal: z.string().optional(),
    category: z.string().optional(),
    imageUrl: z.string().optional().or(z.literal("")),
    ticketingMode: z.enum(["runwae", "external", "free", "none"]),
    externalTicketUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
    visibility: z.enum(["public", "private"]).default("public"),
  })
  .refine(
    (v) => {
      if (!v.endLocal) return true;
      return new Date(v.endLocal).getTime() >= new Date(v.startLocal).getTime();
    },
    { path: ["endLocal"], message: "End must be after start" }
  )
  .refine(
    (v) => v.ticketingMode !== "external" || (v.externalTicketUrl && v.externalTicketUrl.length > 0),
    {
      path: ["externalTicketUrl"],
      message: "External URL is required when using external ticketing",
    }
  );

export type EventFormValues = z.infer<typeof eventFormSchema>;

export type EventFormSubmitPayload = {
  name: string;
  description?: string;
  locationName: string;
  locationCoords?: { lat: number; lng: number };
  timezone: string;
  startDateUtc: number;
  endDateUtc?: number;
  category?: string;
  imageUrl?: string;
  ticketingMode: "runwae" | "external" | "free" | "none";
  externalTicketUrl?: string;
};

interface EventFormProps {
  mode: "create" | "edit";
  initial?: Partial<EventFormValues>;
  onSubmit: (data: EventFormSubmitPayload) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
}

function toLocalInput(ms?: number) {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DEFAULT_TZ = (() => {
  if (typeof Intl !== "undefined") {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London";
    } catch {
      return "Europe/London";
    }
  }
  return "Europe/London";
})();

export function EventForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
}: EventFormProps) {
  const defaults: EventFormValues = useMemo(
    () => ({
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      locationName: initial?.locationName ?? "",
      locationCoords: initial?.locationCoords ?? null,
      timezone: initial?.timezone ?? DEFAULT_TZ,
      startLocal: initial?.startLocal ?? "",
      endLocal: initial?.endLocal ?? "",
      category: initial?.category ?? "",
      imageUrl: initial?.imageUrl ?? "",
      ticketingMode: initial?.ticketingMode ?? "free",
      externalTicketUrl: initial?.externalTicketUrl ?? "",
      visibility: initial?.visibility ?? "public",
    }),
    [initial]
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const ticketingMode = watch("ticketingMode");
  const imageUrl = watch("imageUrl") ?? "";
  const locationLabel = watch("locationName") ?? "";
  const locationCoords = watch("locationCoords");

  function submit(values: EventFormValues) {
    const startMs = new Date(values.startLocal).getTime();
    const endMs = values.endLocal ? new Date(values.endLocal).getTime() : undefined;
    return onSubmit({
      name: values.name,
      description: values.description?.trim() || undefined,
      locationName: values.locationName,
      locationCoords: values.locationCoords ?? undefined,
      timezone: values.timezone,
      startDateUtc: startMs,
      endDateUtc: endMs,
      category: values.category || undefined,
      imageUrl: values.imageUrl?.trim() || undefined,
      ticketingMode: values.ticketingMode,
      externalTicketUrl:
        values.ticketingMode === "external"
          ? values.externalTicketUrl || undefined
          : undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]"
    >
      {/* Left column — banner + cover */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cover image</CardTitle>
          </CardHeader>
          <CardContent>
            <CoverImagePicker
              value={imageUrl}
              onChange={(url) => setValue("imageUrl", url, { shouldDirty: true })}
              seedQuery={watch("name") || watch("locationName") || ""}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right column — details + settings */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Event details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Event name</Label>
              <Input id="name" placeholder="Summer rooftop sessions" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-error">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell guests what to expect…"
                className="min-h-[140px]"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-error">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Location
              </Label>
              <Controller
                control={control}
                name="locationName"
                render={() => (
                  <LocationPicker
                    value={{
                      destinationLabel: locationLabel,
                      coords: locationCoords ?? undefined,
                    }}
                    onChange={(v) => {
                      setValue("locationName", v.destinationLabel, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("locationCoords", v.coords ?? null, {
                        shouldDirty: true,
                      });
                    }}
                  />
                )}
              />
              {errors.locationName && (
                <p className="text-xs text-error">
                  {errors.locationName.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="start" className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" /> Starts
                </Label>
                <Input
                  id="start"
                  type="datetime-local"
                  {...register("startLocal")}
                />
                {errors.startLocal && (
                  <p className="text-xs text-error">{errors.startLocal.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end" className="flex items-center gap-1.5">
                  <Clock className="size-3.5" /> Ends (optional)
                </Label>
                <Input
                  id="end"
                  type="datetime-local"
                  {...register("endLocal")}
                />
                {errors.endLocal && (
                  <p className="text-xs text-error">{errors.endLocal.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timezone">Timezone (IANA)</Label>
              <Input
                id="timezone"
                placeholder="Europe/London"
                {...register("timezone")}
              />
              {errors.timezone && (
                <p className="text-xs text-error">{errors.timezone.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Controller
                control={control}
                name="visibility"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Ticketing</Label>
              <Controller
                control={control}
                name="ticketingMode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKETING_MODES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {ticketingMode === "external" && (
              <div className="space-y-1.5">
                <Label htmlFor="externalUrl">External ticket URL</Label>
                <Input
                  id="externalUrl"
                  type="url"
                  placeholder="https://…"
                  {...register("externalTicketUrl")}
                />
                {errors.externalTicketUrl && (
                  <p className="text-xs text-error">
                    {errors.externalTicketUrl.message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting
                ? mode === "create"
                  ? "Creating…"
                  : "Saving…"
                : mode === "create"
                ? "Create as draft"
                : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
