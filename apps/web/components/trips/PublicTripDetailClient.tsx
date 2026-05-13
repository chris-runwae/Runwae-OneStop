"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ShareView = NonNullable<
  FunctionReturnType<typeof api.trips.getPublicShareView>
>;

type Props = {
  slug: string;
  initialData: ShareView;
};

export function PublicTripDetailClient({ slug, initialData }: Props) {
  const live = useQuery(api.trips.getPublicShareView, { slug });
  const data = live ?? initialData;
  const { trip, days, itemCount, memberCount, creator } = data;

  const startMs = Date.parse(trip.startDate);
  const endMs = Date.parse(trip.endDate);
  const totalDays = Math.max(
    1,
    Math.round((endMs - startMs) / 86_400_000) + 1
  );

  const dateLabel = useMemo(() => {
    const opts: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    const s = new Date(startMs).toLocaleDateString("en-GB", opts);
    const e = new Date(endMs).toLocaleDateString("en-GB", opts);
    return s === e ? s : `${s} – ${e}`;
  }, [startMs, endMs]);

  const previewDays = days.slice(0, 3);
  const cover =
    trip.coverImageUrl ??
    `https://picsum.photos/seed/runwae-trip-${trip._id}/1600/900`;

  const ctaHref = `/sign-up?next=${encodeURIComponent(`/trips/${slug}`)}`;
  const signInHref = `/sign-in?next=${encodeURIComponent(`/trips/${slug}`)}`;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[58vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={cover}
          alt={trip.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/85" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-5 lg:px-10">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-white"
          >
            Runwae
          </Link>
          <div className="flex items-center gap-2.5">
            <Link
              href={signInHref}
              className="hidden h-9 items-center rounded-full border border-white/30 px-4 text-[12.5px] font-semibold text-white backdrop-blur-md hover:bg-white/10 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href={ctaHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[12.5px] font-semibold text-foreground shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:bg-white/90"
            >
              Get Runwae
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-8 lg:px-10 lg:pb-12">
          <div className="mx-auto max-w-3xl text-white">
            <div className="mb-3 flex flex-wrap gap-2">
              <Pill icon={<Calendar className="h-3 w-3" />}>{dateLabel}</Pill>
              {trip.destinationLabel && (
                <Pill icon={<MapPin className="h-3 w-3" />}>
                  {trip.destinationLabel}
                </Pill>
              )}
              <Pill icon={<Users className="h-3 w-3" />}>
                {memberCount} {memberCount === 1 ? "traveller" : "travellers"}
              </Pill>
            </div>
            <h1 className="font-display text-[40px] font-bold leading-[1.05] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] lg:text-[56px]">
              {trip.title}
            </h1>
            {creator?.name && (
              <div className="mt-4 flex items-center gap-2.5">
                <Avatar
                  src={creator.image ?? undefined}
                  name={creator.name}
                  size="sm"
                />
                <p className="text-[14px] font-medium text-white/90">
                  Curated by {creator.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-3xl px-5 py-10 lg:px-0 lg:py-16">
        {trip.description && (
          <p className="mb-10 text-[17px] leading-relaxed text-foreground/85">
            {trip.description}
          </p>
        )}

        <div className="mb-10 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-5">
          <Stat value={`${totalDays}`} label="days" />
          <Stat value={`${itemCount}`} label="activities planned" />
          <Stat
            value={trip.destinationLabel?.split(",")[0] ?? "—"}
            label="destination"
          />
        </div>

        <h2 className="mb-5 font-display text-2xl font-bold tracking-tight">
          Itinerary preview
        </h2>

        {previewDays.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-[14px] text-muted-foreground">
              The host hasn&apos;t added activities yet. Sign up to plan a trip
              of your own.
            </p>
          </div>
        ) : (
          <ol className="space-y-4">
            {previewDays.map((day) => (
              <li
                key={day._id}
                className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]"
              >
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-lg font-bold tracking-tight">
                    Day {day.dayNumber}
                    {day.title ? ` · ${day.title}` : ""}
                  </h3>
                  <span className="text-[12px] text-muted-foreground">
                    {new Date(`${day.date}T00:00:00Z`).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", timeZone: "UTC" }
                    )}
                  </span>
                </div>

                {day.items.length === 0 ? (
                  <p className="text-[13px] italic text-muted-foreground/80">
                    No activities planned for this day yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {day.items.slice(0, 4).map((item) => (
                      <li
                        key={item._id}
                        className="flex items-start gap-3 text-[14px]"
                      >
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">
                            {item.title}
                          </p>
                          {(item.locationName || item.startTime) && (
                            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                              {[item.startTime, item.locationName]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}

        {days.length > previewDays.length && (
          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            + {days.length - previewDays.length} more{" "}
            {days.length - previewDays.length === 1 ? "day" : "days"} in the
            full itinerary
          </p>
        )}

        {/* Signup CTA */}
        <div
          className={cn(
            "mt-12 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center",
            "lg:p-10"
          )}
        >
          <h2 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
            Plan trips like this with Runwae
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] text-muted-foreground">
            Sign up free to save itineraries, build your own day-by-day plans,
            and book flights, stays and experiences in one place.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ctaHref}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[14px] font-semibold text-primary-foreground shadow-[0_8px_20px_rgba(244,5,135,0.35)] transition-colors hover:bg-primary/90"
            >
              Create your free account
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </Link>
            <Link
              href={signInHref}
              className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-[14px] font-semibold text-foreground hover:bg-muted"
            >
              Already on Runwae? Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-5 text-[12px] text-muted-foreground">
          <span>© Runwae. Plan together. Travel further.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/explore" className="hover:text-foreground">
              Explore
            </Link>
            <Link href="/sign-up" className="hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Pill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-white/15 px-2.5 py-[5px] text-[11.5px] font-medium text-white backdrop-blur-md">
      {icon}
      {children}
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-[12px] text-muted-foreground">{label}</div>
    </div>
  );
}
