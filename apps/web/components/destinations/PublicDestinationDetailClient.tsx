"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { formatCurrency } from "@/lib/utils";

type ShareData = NonNullable<
  FunctionReturnType<typeof api.destinations.getBySlug>
>;

type Props = {
  slug: string;
  initialData: ShareData;
};

export function PublicDestinationDetailClient({ slug, initialData }: Props) {
  const live = useQuery(api.destinations.getBySlug, { slug });
  const data = live ?? initialData;
  const { destination, experiences, templates } = data;

  const ctaHref = `/sign-up?next=${encodeURIComponent(`/destinations/${slug}`)}`;
  const signInHref = `/sign-in?next=${encodeURIComponent(`/destinations/${slug}`)}`;

  const galleryImages = (destination.imageUrls ?? [])
    .filter((u) => u && u !== destination.heroImageUrl)
    .slice(0, 6);

  const topExperiences = experiences
    .slice()
    .sort((a, b) => (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0))
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={destination.heroImageUrl}
          alt={destination.name}
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
          <div className="mx-auto max-w-5xl text-white">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-[5px] text-[11.5px] font-medium text-white backdrop-blur-md">
                <MapPin className="h-3 w-3" />
                {destination.country}
              </span>
              {destination.ratingAverage > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-[5px] text-[11.5px] font-medium text-white backdrop-blur-md">
                  <Star
                    className="h-3 w-3 fill-current"
                    strokeWidth={0}
                  />
                  {destination.ratingAverage.toFixed(1)} ·{" "}
                  {destination.ratingCount} reviews
                </span>
              )}
            </div>
            <h1 className="font-display text-[42px] font-bold leading-[1.05] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] lg:text-[64px]">
              {destination.name}
            </h1>
            {destination.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {destination.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/12 px-3 py-1 text-[11.5px] font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-5xl px-5 py-10 lg:px-0 lg:py-16">
        {destination.description && (
          <p className="mb-10 max-w-2xl text-[17px] leading-relaxed text-foreground/85">
            {destination.description}
          </p>
        )}

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 font-display text-2xl font-bold tracking-tight">
              Gallery
            </h2>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-3">
              {galleryImages.map((url, i) => (
                <div
                  key={url}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
                >
                  <Image
                    src={url}
                    alt={`${destination.name} photo ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 320px, 50vw"
                    className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured itineraries */}
        {templates.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 font-display text-2xl font-bold tracking-tight">
              Featured itineraries
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.slice(0, 6).map((t) => (
                <article
                  key={t._id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]"
                >
                  {t.coverImageUrl ? (
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src={t.coverImageUrl}
                        alt={t.title}
                        fill
                        sizes="(min-width: 1024px) 320px, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-foreground/5" />
                  )}
                  <div className="p-4">
                    <h3 className="font-display text-[16px] font-bold tracking-tight">
                      {t.title}
                    </h3>
                    <p className="mt-1 text-[12.5px] text-muted-foreground">
                      {t.durationDays} days
                      {t.difficultyLevel ? ` · ${t.difficultyLevel}` : ""}
                    </p>
                    {t.description && (
                      <p className="mt-2 line-clamp-2 text-[13px] text-foreground/80">
                        {t.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Featured experiences */}
        {topExperiences.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 font-display text-2xl font-bold tracking-tight">
              Things to do in {destination.name}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topExperiences.map((exp) => (
                <article
                  key={exp._id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]"
                >
                  {exp.imageUrl ? (
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src={exp.imageUrl}
                        alt={exp.title}
                        fill
                        sizes="(min-width: 1024px) 320px, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-primary/15 to-foreground/5" />
                  )}
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-display text-[16px] font-bold tracking-tight">
                      {exp.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-[12px] text-muted-foreground">
                      {exp.ratingAverage > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Star
                            className="h-3 w-3 fill-current text-primary"
                            strokeWidth={0}
                          />
                          {exp.ratingAverage.toFixed(1)}
                        </span>
                      )}
                      {exp.durationMinutes ? (
                        <span>
                          {Math.round(exp.durationMinutes / 60)}h
                        </span>
                      ) : null}
                    </div>
                    {exp.price !== undefined && (
                      <p className="mt-2 text-[13px] font-semibold text-foreground">
                        From {formatCurrency(exp.price, exp.currency)}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Signup CTA */}
        <div className="mt-4 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center lg:p-10">
          <h2 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
            Build your {destination.name} trip
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] text-muted-foreground">
            Sign up free to start a trip, save activities to your itinerary,
            and book stays, flights and experiences in one place.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ctaHref}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[14px] font-semibold text-primary-foreground shadow-[0_8px_20px_rgba(244,5,135,0.35)] transition-colors hover:bg-primary/90"
            >
              Plan your trip
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
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 text-[12px] text-muted-foreground">
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
