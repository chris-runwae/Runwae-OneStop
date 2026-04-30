"use client";

import { eventDetail, ROUTES } from "@/app/routes";
import { GoogleMapsInput } from "@/components/shared/google-maps-input";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { InputField } from "@/components/ui/input-field";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { useDisclose } from "@/hooks/use-disclose";
import {
  createEvent,
  getEventRowForOwner,
  updateEvent,
} from "@/lib/supabase/events";
import {
  adminGetEvent,
  adminUpdateEvent,
} from "@/lib/supabase/admin/events";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  Camera,
  ChevronDown,
  Eye,
  Globe,
  NotepadText,
  Plus,
  RefreshCcw,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EVENT_CATEGORIES, VISIBILITY_OPTIONS } from "./create-event.constants";

import { EventSuccessfulModal } from "@/components/modal/event-successful-modal";
import { DateSelector, TimeSelector } from "@/components/shared/date";
import { FormSelect } from "@/components/shared/form-select";
import { uploadToCloudinary } from "@/lib/cloudinary-image-upload";
import { supabase } from "@/lib/supabase/client";
import {
  createEventDefaultValues,
  createEventSchema,
  mapEventRowToFormValues,
} from "./event-schema";

const today = new Date().toISOString().split("T")[0];

type CreateEventFormValues = z.infer<typeof createEventSchema>;

type CreateEventProps = {
  editEventId?: string;
  adminMode?: boolean;
};

export default function CreateEvent(props: CreateEventProps = {}) {
  const { editEventId, adminMode } = props;
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get("duplicate");
  const loadId = editEventId ?? duplicateId ?? null;
  const isEditMode = Boolean(editEventId);
  const isDuplicateMode = Boolean(duplicateId) && !isEditMode;
  const relaxDateMin = isEditMode || isDuplicateMode;

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: createEventDefaultValues,
    mode: "onChange",
  });
  const successModal = useDisclose();

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  const [isPending, setIsPending] = useState(false);
  const [eventSlug, setEventSlug] = useState<string | null>(null);

  const {
    data: loadedEvent,
    isPending: loadPending,
    isSuccess: loadSuccess,
  } = useQuery({
    queryKey: ["event-row", loadId, adminMode ? "admin" : user?.id],
    queryFn: () =>
      adminMode
        ? adminGetEvent(loadId!)
        : getEventRowForOwner(loadId!, user!.id),
    enabled: adminMode ? Boolean(loadId) : Boolean(user && loadId),
  });

  useEffect(() => {
    const fn = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", editEventId);

      console.log("data here", data);
    };
    fn();
  }, []);

  useEffect(() => {
    if (!loadId || !user || loadPending) return;
    if (loadSuccess && loadedEvent === null) {
      toast.error("Event not found.");
      router.replace(ROUTES.host.events);
    }
  }, [loadId, user, loadPending, loadSuccess, loadedEvent, router]);

  useEffect(() => {
    if (!loadedEvent) return;
    form.reset(
      mapEventRowToFormValues(loadedEvent, { duplicate: isDuplicateMode }),
    );
    setCoords({
      lat: loadedEvent.latitude,
      lng: loadedEvent.longitude,
    });
    setBannerPreview(loadedEvent.image?.trim() || null);
    if (loadedEvent.image) form.setValue("bannerImage", loadedEvent.image);
  }, [loadedEvent, isDuplicateMode, form]);

  const visibilityLabelMemo =
    VISIBILITY_OPTIONS.find((o) => o.value === form.watch("visibility"))
      ?.label ?? "Public";

  const onSubmit = async (values: CreateEventFormValues) => {
    if (!user) {
      toast.error("You must be logged in to continue.");
      return;
    }

    if (!values.bannerImage) {
      toast.error("Event image is required, please upload one");
      return;
    }

    const imageUrl = await uploadToCloudinary(values.bannerImage);

    try {
      setIsPending(true);

      if (isEditMode && editEventId) {
        const updatePayload = {
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
          ...(loadedEvent?.status != null && loadedEvent.status !== ""
            ? { status: loadedEvent.status }
            : {}),
        };
        if (adminMode) {
          await adminUpdateEvent(editEventId, updatePayload);
          toast.success("Event updated successfully.");
          router.push(`/admin/events/${editEventId}`);
        } else {
          await updateEvent(editEventId, user.id, updatePayload);
          toast.success("Event updated sucessfully.");
          router.push(eventDetail(editEventId));
        }
        return;
      }

      const event = await createEvent({
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
        image: imageUrl,
        status: "draft",
      });

      if (!event.slug) {
        toast.error("Event saved but no slug was returned. Please try again.");
        return;
      }
      setEventSlug(event.slug);
      successModal.onOpen();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditMode
          ? "Failed to update event. Please try again."
          : "Failed to create event. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  };

  if (!user) return null;

  if (loadId && loadPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  const startDateMin = relaxDateMin ? undefined : today;
  const endDateMin = relaxDateMin
    ? form.watch("startDate") || undefined
    : form.watch("startDate") || today;

  const pageTitle = isEditMode
    ? "Edit Event"
    : isDuplicateMode
      ? "Duplicate Event"
      : "Create Event";

  const submitLabel = isEditMode ? "Save changes" : "Create Event";

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8 p-6 sm:p-8 lg:p-10"
        >
          <div className="flex justify-between items-center">
            <p className="font-bricolage font-semibold">{pageTitle}</p>
            <div className="flex flex-wrap items-center justify-end gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-body focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <Globe
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                    {visibilityLabelMemo}
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
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="relative flex h-100 min-h-50 items-center justify-center overflow-hidden rounded-xl border border-border bg-white sm:min-h-70">
              {bannerPreview && (
                <Image
                  src={bannerPreview}
                  alt="Event banner"
                  fill
                  className="object-cover"
                  unoptimized={
                    bannerPreview.startsWith("http://") ||
                    bannerPreview.startsWith("https://")
                  }
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

            <div className="flex flex-col gap-6">
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

              <div className="flex flex-col gap-4">
                <h3 className="font-display text-base font-medium text-foreground">
                  Event Details
                </h3>

                <div className="flex gap-3">
                  <DateSelector
                    control={form.control}
                    name="startDate"
                    inputRef={startDateRef}
                    min={startDateMin}
                  />

                  <TimeSelector
                    control={form.control}
                    name="startTime"
                    inputRef={startTimeRef}
                    disabled={!form.watch("startDate")}
                  />
                </div>

                <div className="flex gap-3">
                  <DateSelector
                    control={form.control}
                    name="endDate"
                    inputRef={endDateRef}
                    min={endDateMin}
                  />

                  <TimeSelector
                    control={form.control}
                    name="endTime"
                    inputRef={endTimeRef}
                    disabled={!form.watch("endDate")}
                  />
                </div>

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

          <div className="flex justify-end">
            <Button
              type="submit"
              className={cn(
                buttonVariants({ variant: "primary", size: "lg" }),
                "min-w-45",
              )}
              isLoading={isPending}
              disabled={isPending}
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </Form>
      {!isEditMode && (
        <EventSuccessfulModal slug={eventSlug ?? ""} {...successModal} />
      )}
    </div>
  );
}
