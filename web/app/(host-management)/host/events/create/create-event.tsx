"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/ui/input-field";
import { cn } from "@/lib/utils";
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
import { Formik } from "formik";
import {
  BOOKINGS_OPTIONS,
  EVENT_CATEGORIES,
  EVENT_LINK_BASE,
  EVENT_THEMES,
  eventSlugFromName,
  VISIBILITY_OPTIONS,
} from "./create-event.constants";
import { FormSelect, ThemeSelector } from "./create-event.components";

export interface CreateEventFormValues {
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  category: string;
  ticketLink: string;
  bookings: string;
  visibility: string;
  themeId: string;
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
  visibility: "public",
  themeId: EVENT_THEMES[0].id,
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
                    <Globe className="size-4 text-muted-foreground" aria-hidden />
                    {visibilityLabel}
                    <ChevronDown
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
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
            <div className="grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1.2fr_420px]">
              {/* Event Banner */}
              <div className="relative flex min-h-[200px] items-center justify-center rounded-xl border border-border bg-muted/50 sm:min-h-[280px]">
                <button
                  type="button"
                  className="flex size-14 items-center justify-center gap-1 rounded-full bg-primary text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Upload event banner"
                >
                  <Camera className="size-6" aria-hidden />
                  <Plus className="size-5" aria-hidden strokeWidth={2.5} />
                </button>
              </div>

              {/* Form column */}
              <div className="flex flex-col gap-6">
                <Input
                  name="eventName"
                  placeholder="Event Name"
                  value={values.eventName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="h-12 rounded-lg bg-surface text-lg font-medium placeholder:text-muted-foreground"
                />

                {/* Event Details */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-display text-base font-semibold text-black">
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
                  <h3 className="font-display text-base font-semibold text-black">
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
                  <h3 className="font-display text-base font-semibold text-black">
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
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-base font-semibold text-black">
                Select Theme
              </h3>
              <ThemeSelector
                themes={EVENT_THEMES}
                value={values.themeId}
                onChange={(id) => setFieldValue("themeId", id)}
              />
            </div>

            {/* Create Event Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  buttonVariants({ variant: "primary", size: "lg" }),
                  "min-w-[180px]",
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
