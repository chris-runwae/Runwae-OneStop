"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputField } from "@/components/ui/input-field";
import { cn } from "@/lib/utils";
import { Formik } from "formik";
import {
  Calendar,
  Camera,
  ChevronDown,
  Eye,
  FileText,
  Globe,
  MapPin,
  Plus,
  Ticket,
} from "lucide-react";
import { FormSelect } from "./create-event.components";
import {
  BOOKINGS_OPTIONS,
  EVENT_CATEGORIES,
  EVENT_LINK_BASE,
  eventSlugFromName,
  VISIBILITY_OPTIONS,
} from "./create-event.constants";
import Image from "next/image";
import { EVENT_VISIBILITY } from "@/lib/enums";

export interface CreateEventFormValues {
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  category: string;
  ticketLink: string;
  bookings: string;
  visibility: EVENT_VISIBILITY;
  bannerImage: File | null;
}

const initialValues: CreateEventFormValues = {
  eventName: "",
  startDate: "",
  endDate: "",
  location: "",
  description: "",
  category: "",
  ticketLink: "",
  bookings: "",
  visibility: EVENT_VISIBILITY.PUBLIC,
  bannerImage: null,
};

function handleCreateEvent(values: CreateEventFormValues) {
  // TODO: wire to API
  console.log("Create event", values);
}

export default function CreateEvent() {
  return (
    <Formik<CreateEventFormValues>
      initialValues={initialValues}
      onSubmit={handleCreateEvent}
    >
      {({
        values,
        setFieldValue,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }) => {
        const eventSlug = eventSlugFromName(values.eventName);
        const visibilityLabel =
          VISIBILITY_OPTIONS.find((o) => o.value === values.visibility)
            ?.label ?? "Public";

        return (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-8 p-6 sm:p-8 lg:p-10"
          >
            {/* Top bar: Visibility dropdown + Preview */}
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
                      onSelect={() => setFieldValue("visibility", opt.value)}
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
              {/* this is meant to upload an image */}
              <div className="relative flex h-100 min-h-50 items-center justify-center rounded-xl border border-border bg-white sm:min-h-70 overflow-hidden">
                {values.bannerImage && (
                  <Image
                    src={URL.createObjectURL(values.bannerImage)}
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
                    <span className="absolute">
                      <Camera className="size-9" aria-hidden />
                      <Plus
                        className="size-4 absolute bottom-0 right-0 bg-white text-primary rounded-full"
                        aria-hidden
                        strokeWidth={2.5}
                      />
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFieldValue("bannerImage", file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Form column */}
              <div className="flex flex-col gap-6">
                <textarea
                  name="eventName"
                  placeholder="Event Name"
                  value={values.eventName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={1}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                  }}
                  className="font-bricolage w-full resize-none overflow-hidden bg-transparent text-5xl font-bold leading-tight text-black placeholder:text-muted-foreground/40 outline-none border-none focus:ring-0"
                />

                {/* Event Details */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-display text-base font-medium text-black">
                    Event Details
                  </h3>
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
                    <InputField
                      icon={<Calendar className="size-4" aria-hidden />}
                      placeholder="Start Date"
                      type="text"
                      name="startDate"
                      value={values.startDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="min-w-0 flex-1 bg-surface"
                    />
                    <InputField
                      icon={<Calendar className="size-4" aria-hidden />}
                      placeholder="End Date"
                      type="text"
                      name="endDate"
                      value={values.endDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="min-w-0 flex-1 bg-surface"
                    />
                  </div>
                  <InputField
                    icon={<MapPin className="size-4" aria-hidden />}
                    placeholder="Event Location"
                    name="location"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="bg-surface"
                  />
                  <InputField
                    icon={<FileText className="size-4" aria-hidden />}
                    placeholder="Add Description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="bg-surface"
                  />
                </div>

                {/* Event Category */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-base font-medium text-black">
                    Event Category
                  </h3>
                  <FormSelect
                    options={EVENT_CATEGORIES}
                    value={values.category}
                    onSelect={(v) => setFieldValue("category", v)}
                    placeholder="Select Category"
                  />
                </div>

                {/* Ticketing (optional) */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-base font-medium text-black">
                    Ticketing{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </h3>
                  <InputField
                    icon={<Ticket className="size-4" aria-hidden />}
                    placeholder="Ticket Link"
                    name="ticketLink"
                    value={values.ticketLink}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="bg-surface"
                  />
                </div>

                {/* Event Link (read-only) */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-base font-semibold text-black">
                    Event Link
                  </h3>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
                    {EVENT_LINK_BASE}/{eventSlug}
                  </div>
                </div>

                {/* Bookings */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-base font-semibold text-black">
                    Bookings
                  </h3>
                  <FormSelect
                    options={BOOKINGS_OPTIONS}
                    value={values.bookings}
                    onSelect={(v) => setFieldValue("bookings", v)}
                    placeholder="Select Bookings"
                  />
                </div>
              </div>
            </div>

            {/* Select Theme */}

            {/* Create Event Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  buttonVariants({ variant: "primary", size: "lg" }),
                  "min-w-45",
                )}
              >
                Create Event
              </button>
            </div>
          </form>
        );
      }}
    </Formik>
  );
}

// <div className="flex flex-col gap-4">
//   <h3 className="font-display text-base font-semibold text-black">
//     Select Theme
//   </h3>
//   <ThemeSelector
//     themes={EVENT_THEMES}
//     value={values.themeId}
//     onChange={(id) => setFieldValue("themeId", id)}
//   />
// </div>;
