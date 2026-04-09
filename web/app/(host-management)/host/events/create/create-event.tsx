"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { GoogleMapsInput } from "@/components/shared/google-maps-input";
import { InputField } from "@/components/ui/input-field";
import { useAuth } from "@/context/AuthContext";
import { createEvent } from "@/lib/supabase/events";
import { ROUTES } from "@/app/routes";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Camera,
  ChevronDown,
  Clock,
  Eye,
  Globe,
  NotepadText,
  Plus,
  RefreshCcw,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormSelect } from "./create-event.components";
import { EVENT_CATEGORIES, VISIBILITY_OPTIONS } from "./create-event.constants";
import { EVENT_VISIBILITY } from "@/lib/enums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TimeSelector, DateSelector } from "@/components/shared/date";

const today = new Date().toISOString().split("T")[0];

const createEventSchema = z.object({
  eventName: z.string().min(1, "Event name is required."),
  startDate: z.string().min(1, "Start date is required."),
  startTime: z.string().min(1, "Start time is required."),
  endDate: z.string().min(1, "End date is required."),
  endTime: z.string().min(1, "End time is required."),
  location: z.string().min(2, "Location is required."),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters.")
    .max(500, "Description cannot exceed 500 characters."),
  category: z.string().min(1, "Please select a category."),
  ticketLink: z.string().optional(),
  eventSlug: z.string().optional(),
  bookings: z.boolean().default(false),
  visibility: z.nativeEnum(EVENT_VISIBILITY),
  bannerImage: z.instanceof(File).nullable(),
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

export default function CreateEvent() {
  const { user } = useAuth();
  const router = useRouter();
  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      eventName: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      location: "",
      description: "",
      category: "",
      ticketLink: "",
      eventSlug: "",
      bookings: false,
      visibility: EVENT_VISIBILITY.PUBLIC,
      bannerImage: null,
    },
    mode: "onChange",
  });
  // const queryClient = useQueryClient();

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  const startDate = form.watch("startDate");

  const visibilityLabel =
    VISIBILITY_OPTIONS.find((o) => o.value === form.watch("visibility"))
      ?.label ?? "Public";

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (values: CreateEventFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create an event.");
      return;
    }

    console.log(values);

    try {
      setIsPending(true);
      await createEvent({
        user_id: user.id,
        name: values.eventName,
        start_date: values.startDate,
        start_time: values.startTime,
        end_date: values.endDate,
        end_time: values.endTime,
        location: values.location,
        description: values.description,
        category: values.category,
        ticket_link: values.ticketLink ?? null,
        bookings: values.bookings,
        latitude: coords.lat,
        longitude: coords.lng,
        image:
          "https://gratisography.com/wp-content/uploads/2025/05/gratisography-moon-robot-800x525.jpg",
        status: "PUBLISHED",
      });
      toast.success("Event created!");
      router.push(ROUTES.host.earnings);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 p-6 sm:p-8 lg:p-10"
      >
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-body focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Globe className="size-4 text-muted-foreground" aria-hidden />
                {visibilityLabel}
                <ChevronDown
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-35">
              {VISIBILITY_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => form.setValue("visibility", opt.value)}
                  className="cursor-pointer"
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "inline-flex items-center gap-2",
            )}
          >
            <Eye className="size-4" aria-hidden />
            Preview
          </button>
        </div>

        {/* Banner + Form grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Event Banner */}
          <div className="relative flex h-100 min-h-50 items-center justify-center overflow-hidden rounded-xl border border-border bg-white sm:min-h-70">
            {bannerPreview && (
              <Image
                src={bannerPreview}
                alt="Event banner"
                fill
                className="object-cover"
              />
            )}
            <div className="absolute bottom-14 right-14">
              <label
                className="relative flex size-14 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Upload event banner"
              >
                {bannerPreview ? (
                  <RefreshCcw className="size-6" aria-hidden />
                ) : (
                  <span className="relative">
                    <Camera className="size-7" aria-hidden />
                    <Plus
                      className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-white text-primary"
                      aria-hidden
                      strokeWidth={3}
                    />
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      form.setValue("bannerImage", file);
                      setBannerPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Form column */}
          <div className="flex flex-col gap-6">
            {/* Event Name */}
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Event Name"
                      rows={1}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = "auto";
                        el.style.height = `${el.scrollHeight}px`;
                      }}
                      className="font-bricolage w-full resize-none overflow-hidden border-none bg-transparent text-5xl font-bold leading-tight text-foreground outline-none placeholder:text-muted-foreground/40 focus:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Details */}
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-base font-medium text-foreground">
                Event Details
              </h3>

              {/* Start Date + Start Time */}
              <div className="flex gap-3">
                <DateSelector
                  control={form.control}
                  name="startDate"
                  inputRef={startDateRef}
                  min={today}
                />

                <TimeSelector
                  control={form.control}
                  name="startTime"
                  inputRef={startTimeRef}
                  disabled={!form.watch("startDate")}
                />
              </div>

              {/* End Date + End Time */}
              <div className="flex gap-3">
                <DateSelector
                  control={form.control}
                  name="endDate"
                  inputRef={endDateRef}
                  min={form.watch("startDate") || today}
                />

                <TimeSelector
                  control={form.control}
                  name="endTime"
                  inputRef={endTimeRef}
                  disabled={!form.watch("endDate")}
                />
              </div>

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <GoogleMapsInput
                      value={field.value}
                      placeholder="Event Location"
                      onLocationChange={({ address, lat, lng }) => {
                        field.onChange(address);
                        setCoords({ lat, lng });
                      }}
                      onClear={() => {
                        field.onChange("");
                        setCoords({ lat: null, lng: null });
                      }}
                      onBlur={field.onBlur}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <NotepadText
                          className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
                          aria-hidden
                        />
                        <textarea
                          {...field}
                          placeholder="Add Description"
                          rows={4}
                          maxLength={500}
                          className={cn(
                            "w-full resize-none rounded-lg border bg-surface pb-7 pl-10 pr-3 pt-2.5 text-sm text-body placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                            fieldState.error
                              ? "border-destructive focus:ring-destructive/50"
                              : "border-input focus:border-ring focus:ring-ring/50",
                          )}
                        />
                        <span
                          className={cn(
                            "absolute bottom-3 right-3 text-xs",
                            field.value.length > 500 ||
                              (field.value.length > 0 &&
                                field.value.length < 50)
                              ? "text-destructive"
                              : "text-muted-foreground",
                          )}
                        >
                          {field.value.length}/500
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Event Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <h3 className="font-display text-base font-medium text-foreground">
                    Event Category
                  </h3>
                  <FormSelect
                    options={EVENT_CATEGORIES}
                    value={field.value}
                    onSelect={(v) =>
                      form.setValue("category", v, { shouldValidate: true })
                    }
                    placeholder="Select Category"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ticketing (optional) */}
            <FormField
              control={form.control}
              name="ticketLink"
              render={({ field }) => (
                <FormItem>
                  <h3 className="font-display text-base font-medium text-foreground">
                    Ticketing{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </h3>
                  <FormControl>
                    <InputField
                      icon={<Ticket className="size-4" aria-hidden />}
                      placeholder="Ticket Link"
                      className="bg-surface"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Event Link */}
            {/* <FormField
              control={form.control}
              name="eventSlug"
              render={({ field }) => (
                <FormItem>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Event Link
                  </h3>
                  <div className="flex h-11 overflow-hidden rounded-lg border border-input bg-surface text-sm">
                    <span className="flex shrink-0 items-center border-r border-input bg-muted/40 px-3 text-muted-foreground select-none">
                      {EVENT_LINK_BASE}/
                    </span>
                    <FormControl>
                      <input
                        {...field}
                        placeholder="your-event-name"
                        onChange={(e) => {
                          // Sanitize as the user types: lowercase, hyphens, alphanumeric only
                          const sanitized = e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, "");
                          field.onChange(sanitized);
                        }}
                        className="min-w-0 flex-1 bg-transparent px-3 text-body outline-none placeholder:text-muted-foreground"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* Bookings */}
            <FormField
              control={form.control}
              name="bookings"
              render={({ field }) => (
                <FormItem>
                  <label className="flex cursor-pointer items-center gap-3">
                    <span className="font-display text-base font-medium text-foreground">
                      Enable Bookings
                    </span>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="size-4 rounded border-input accent-primary cursor-pointer"
                    />
                  </label>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Create Event Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            // disabled={isPending}
            className={cn(
              buttonVariants({ variant: "primary", size: "lg" }),
              "min-w-45",
            )}
          >
            Create Event
          </button>
        </div>
      </form>
    </Form>
  );
}
