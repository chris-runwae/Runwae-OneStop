import type { Metadata } from "next";
import {
  Calendar,
  Compass,
  CreditCard,
  Map,
  MessagesSquare,
  Users,
} from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { StatsStrip } from "@/components/marketing/stats-strip";
import { CtaSection } from "@/components/marketing/cta-section";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { variant } from "@/lib/flags";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Runwae — Plan Together. Book Together. Split the Cost.",
  description:
    "Runwae is the all-in-one app for groups — discover events, build itineraries, and handle payments without the chaos.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Runwae — Plan Together. Book Together. Split the Cost.",
    description:
      "The all-in-one app for groups — discover events, build itineraries, and handle payments without the chaos.",
    url: "/",
    images: ["/og/home.png"],
  },
};

const HERO_VARIANTS = {
  control: {
    headline: "Plan Together. Book Together. Split the Cost.",
    subhead:
      "Runwae is the all-in-one app for groups — discover events, build itineraries, and handle payments without the chaos.",
  },
  v1: {
    headline: "The group trip, finally sorted.",
    subhead:
      "One app for festivals, retreats and reunions — with shared itineraries, group bookings and a calmer way to split the bill.",
  },
} as const;

const FEATURES = [
  {
    icon: Compass,
    title: "Discover events worth the trip",
    description:
      "Curated festivals, retreats and creator meetups your group will actually fly out for.",
  },
  {
    icon: Map,
    title: "Build the itinerary together",
    description:
      "Day-by-day plans you co-edit live — flights, stays, dinners and downtime in one place.",
  },
  {
    icon: CreditCard,
    title: "Book and split the cost",
    description:
      "Reserve as a group, settle who owes who, and stop chasing Venmo screenshots.",
  },
  {
    icon: MessagesSquare,
    title: "One thread, no chaos",
    description:
      "Decisions, polls and receipts stay attached to the trip — not buried in the group chat.",
  },
  {
    icon: Users,
    title: "Built for friends, creators & communities",
    description:
      "Whether it's six friends or six hundred subscribers, Runwae scales with the group.",
  },
  {
    icon: Calendar,
    title: "Earn from the trips you organise",
    description:
      "Hosts and partners earn commission from the very plans their attendees are already making.",
  },
];

export default async function HomePage() {
  const heroVariant = await variant("home_hero");
  const hero = HERO_VARIANTS[heroVariant];

  return (
    <>
      <Hero
        eyebrow="The future of travel"
        headline={hero.headline}
        subhead={hero.subhead}
        primaryCta={{ label: "Get the app", href: "#download" }}
        secondaryCta={{ label: "Become a partner", href: "/partners" }}
      />

      <StatsStrip
        stats={[
          { value: "100+", label: "Trips planned monthly" },
          { value: "$0", label: "Platform fee" },
          { value: "180+", label: "Cities covered" },
          { value: "4.9★", label: "Average group rating" },
        ]}
      />

      <FeatureGrid
        eyebrow="Built for the way you gather"
        heading="One calm space for the trips that live in the group chat for years."
        subhead="We replace the spreadsheets, group chats and seventeen open tabs with one place where everyone can plan, decide and book together."
        features={FEATURES}
      />

      <section className="border-y border-border/60 bg-muted/30 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Be first when the next drop lands.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Get early access, partner news and the occasional drop of a curated
            festival or retreat.
          </p>
          <WaitlistForm className="mt-6" source="home_inline" />
        </div>
      </section>

      <CtaSection
        heading="Ready to plan your next trip?"
        subhead="Download Runwae and bring the group along."
        showAppBadges
      />
    </>
  );
}
