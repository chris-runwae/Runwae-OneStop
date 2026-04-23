"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Camera, Plus, RefreshCcw, NotepadText } from "lucide-react";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { Spinner } from "@/components/ui/spinner";
import { DateSelector, TimeSelector } from "@/components/shared/date";
import { FormSelect } from "@/components/shared/form-select";
import { GoogleMapsInput } from "@/components/shared/google-maps-input";
import { uploadToCloudinary } from "@/lib/cloudinary-image-upload";
import { adminCreateEvent } from "@/lib/supabase/admin/events";
import { adminGetAllHosts } from "@/lib/supabase/admin/users";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { EVENT_VISIBILITY } from "@/lib/enums";

const EVENT_CATEGORIES = [
  "Music", "Sports", "Arts", "Food & Drink", "Technology",
  "Business", "Health", "Education", "Travel", "Fashion", "Other",
];

const schema = z.object({
  eventName: z.string().min(1, "Event name is required."),
  startDate: z.string().min(1, "Start date is required."),
  startTime: z.string().min(1, "Start time is required."),
  endDate: z.string().min(1, "End date is required."),
  endTime: z.string().min(1, "End time is required."),
  location: z.string().min(2, "Location is required."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500),
  category: z.string().min(1, "Please select a category."),
  ticketLink: z.string().optional(),
  bookings: z.boolean().default(false),
  hostId: z.string().optional(),
  bannerImage: z.union([z.instanceof(File).nullable(), z.string()]).optional(),
});

type FormValues = z.infer<typeof schema>;

const today = new Date().toISOString().split("T")[0];

export default function AdminCreateEventPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventName: "", startDate: "", startTime: "", endDate: "", endTime: "",
      location: "", description: "", category: "", ticketLink: "", bookings: false, hostId: "",
    },
    mode: "onChange",
  });

  const { data: hosts = [] } = useQuery({
    queryKey: ["admin-hosts"],
    queryFn: adminGetAllHosts,
  });

  const hostOptions = [
    { value: "", label: "No host (admin-owned)" },
    ...hosts.map((h) => ({ value: h.id, label: h.full_name ?? h.email })),
  ];

  const onSubmit = async (values: FormValues) => {
    if (!values.bannerImage) {
      toast.error("Please upload an event banner image.");
      return;
    }
    try {
      setIsPending(true);
      const imageUrl = await uploadToCloudinary(values.bannerImage as File | string);
      await adminCreateEvent({
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
        image: imageUrl,
        status: "PUBLISHED",
        user_id: values.hostId || null,
      });
      toast.success("Event created successfully.");
      router.push("/admin/events");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      {/* Back */}
      <Link
        href="/admin/events"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-black transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to Events
      </Link>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-black">Create Event</h1>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {isPending ? <Spinner className="size-4" /> : "Publish Event"}
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Banner upload */}
            <div className="relative flex h-80 min-h-60 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
              {bannerPreview && (
                <Image src={bannerPreview} alt="Event banner" fill className="object-cover" unoptimized />
              )}
              <label
                className="absolute bottom-5 right-5 flex size-14 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                aria-label="Upload event banner"
              >
                {bannerPreview ? (
                  <RefreshCcw className="size-6" />
                ) : (
                  <span className="relative">
                    <Camera className="size-7" />
                    <Plus className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-white text-primary" strokeWidth={3} />
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

            {/* Right column fields */}
            <div className="flex flex-col gap-5">
              {/* Event name */}
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
                        className="w-full resize-none overflow-hidden border-none bg-transparent text-4xl font-bold leading-tight text-black outline-none placeholder:text-muted-foreground/40 focus:ring-0 font-display"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates */}
              <div className="flex gap-3">
                <DateSelector control={form.control} name="startDate" inputRef={startDateRef} min={today} />
                <TimeSelector control={form.control} name="startTime" inputRef={startTimeRef} disabled={!form.watch("startDate")} />
              </div>
              <div className="flex gap-3">
                <DateSelector control={form.control} name="endDate" inputRef={endDateRef} min={form.watch("startDate") || today} />
                <TimeSelector control={form.control} name="endTime" inputRef={endTimeRef} disabled={!form.watch("endDate")} />
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
                      onClear={() => { field.onChange(""); setCoords({ lat: null, lng: null }); }}
                      onBlur={field.onBlur}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Category"
                      options={EVENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <NotepadText className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                    <textarea
                      {...field}
                      placeholder="Add Description"
                      rows={4}
                      maxLength={500}
                      className={cn(
                        "w-full resize-none rounded-xl border bg-surface pb-3 pl-10 pr-3 pt-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50",
                        fieldState.error ? "border-destructive" : "border-border",
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ticket link + Host selector */}
          <div className="grid gap-5 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="ticketLink"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputField {...field} placeholder="Ticket Link (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hostId"
              render={({ field }) => (
                <FormItem>
                  <FormSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Assign to Host (optional)"
                    options={hostOptions}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Enable bookings toggle */}
          <FormField
            control={form.control}
            name="bookings"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                  <div>
                    <p className="text-sm font-medium text-black">Enable Bookings</p>
                    <p className="text-xs text-muted-foreground">Allow attendees to book this event</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.value}
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      field.value ? "bg-primary" : "bg-muted",
                    )}
                  >
                    <span className={cn("pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", field.value ? "translate-x-5" : "translate-x-0")} />
                  </button>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
