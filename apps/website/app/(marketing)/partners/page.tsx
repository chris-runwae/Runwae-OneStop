import type { Metadata } from "next";
import {
  Briefcase,
  Calendar,
  HandCoins,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { ProcessSteps } from "@/components/marketing/process-steps";
import { CtaSection } from "@/components/marketing/cta-section";
import { Container } from "@/components/marketing/container";
import { Section } from "@/components/marketing/section";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "For Travel Partners",
  description:
    "Get booked by event crowds. Connect with travelers when they're already in your city for events.",
  alternates: { canonical: "/partners" },
  openGraph: {
    title: "Runwae for Travel Partners",
    description:
      "Get booked by event crowds. Connect with travelers when they're already in your city.",
    url: "/partners",
    images: ["/og/partners.png"],
  },
};

const FEATURES = [
  {
    icon: Search,
    title: "Get found by event groups",
    description:
      "Travellers see you the moment they land for an event in your city — no fighting search rankings.",
  },
  {
    icon: Briefcase,
    title: "Work directly with event hosts",
    description:
      "Skip the OTAs. Cut deals with hosts who actually bring you committed groups.",
  },
  {
    icon: Users,
    title: "Group bookings made easy",
    description:
      "Reservations, custom event pricing and deposits handled in-app. No more spreadsheets.",
  },
  {
    icon: Calendar,
    title: "Fill your slow nights",
    description:
      "Surface availability for off-peak dates — Runwae sends groups your way when you need them.",
  },
  {
    icon: HandCoins,
    title: "Keep more of your revenue",
    description:
      "Pay only when you get bookings. Lower take-rate than traditional booking platforms.",
  },
  {
    icon: TrendingUp,
    title: "Grow with the events you serve",
    description:
      "Build a year-on-year relationship with hosts whose attendee numbers compound.",
  },
];

const STEPS = [
  {
    title: "Create your profile",
    description:
      "Tell us about your space, capacity and the kind of groups you welcome.",
  },
  {
    title: "Get matched to events",
    description:
      "We surface your listing to event hosts and attendees travelling to your city.",
  },
  {
    title: "Accept bookings",
    description:
      "Approve or auto-confirm group bookings, set custom event pricing and collect deposits.",
  },
  {
    title: "Host your guests",
    description:
      "Welcome the group, deliver a great stay, and get paid out automatically afterwards.",
  },
];

export default function PartnersPage() {
  return (
    <>
      <Hero
        eyebrow="For travel partners"
        headline="Get Booked by Event Crowds."
        subhead="Connect with travelers when they’re already in your city for events."
        primaryCta={{ label: "I'm a Travel Partner", href: "#join" }}
        secondaryCta={{ label: "I'm an Event Host", href: "/hosts" }}
      />

      <FeatureGrid
        eyebrow="Why partners choose Runwae"
        heading="Bookings from people who are already on the way."
        features={FEATURES}
      />

      <Section className="bg-muted/30">
        <Container>
          <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-3xl border border-border bg-card p-10 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sample partner — last 30 days
              </p>
              <p className="font-display text-5xl font-semibold tracking-tight text-foreground">
                $34,056
              </p>
              <p className="text-sm text-muted-foreground">
                Earned across 321 group bookings · +10.23% MoM
              </p>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p className="text-foreground font-medium">
                You only pay when you get bookings.
              </p>
              <p>
                Keep more of your revenue than you would with traditional
                booking platforms. We charge a transparent commission on
                confirmed stays — nothing else.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <ProcessSteps
        heading="Getting started"
        subhead="From signup to your first group booking in days."
        steps={STEPS}
      />

      <CtaSection
        heading="Ready to fill your nights with the right kind of groups?"
        subhead="It takes minutes to list. We do the matching."
        primaryCta={{ label: "Join as a Travel Partner", href: "#join" }}
      />
    </>
  );
}
