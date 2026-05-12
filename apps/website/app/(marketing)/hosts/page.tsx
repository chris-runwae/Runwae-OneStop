import type { Metadata } from "next";
import {
  BarChart3,
  Globe,
  HandCoins,
  PiggyBank,
  Sparkles,
  Users,
} from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { ProcessSteps } from "@/components/marketing/process-steps";
import { CtaSection } from "@/components/marketing/cta-section";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "For Event Hosts",
  description:
    "Your attendees are already spending. Now you can earn from it. Runwae gives event hosts a travel hub, new revenue, and one place to coordinate everything.",
  alternates: { canonical: "/hosts" },
  openGraph: {
    title: "Runwae for Event Hosts",
    description:
      "Your attendees are already spending. Now you can earn from it.",
    url: "/hosts",
    images: ["/og/hosts.png"],
  },
};

const FEATURES = [
  {
    icon: Globe,
    title: "Your own travel hub",
    description:
      "A branded portal where attendees discover travel, accommodation and dining around your event — without leaving your world.",
  },
  {
    icon: HandCoins,
    title: "A new revenue stream",
    description:
      "Earn commission on every flight, hotel, activity and dinner booked through your portal. Money you weren’t making before.",
  },
  {
    icon: Sparkles,
    title: "Attendee perks you control",
    description:
      "Cut deals with local vendors and pass them through to your community as exclusive offers, discounts and early access.",
  },
  {
    icon: Users,
    title: "Better coordination",
    description:
      "Shared itineraries, group chat and expense splitting — built in. Less DMs to your team, more value for your attendees.",
  },
  {
    icon: BarChart3,
    title: "See what’s happening",
    description:
      "Live analytics on bookings, revenue and attendee engagement. Make next year’s edition smarter than this year’s.",
  },
  {
    icon: PiggyBank,
    title: "Keep more of your revenue",
    description:
      "No platform fee. We earn a small share only when you do — and you keep more than with traditional booking platforms.",
  },
];

const STEPS = [
  {
    title: "Set up your portal",
    description:
      "Add your branding, dates and partner preferences. Live in under an hour.",
  },
  {
    title: "Invite your guests",
    description:
      "Drop the link in your event email or embed it on your site. No app required.",
  },
  {
    title: "Attendees book their travel",
    description:
      "They book flights, stays and activities through your portal — with group tools built in.",
  },
  {
    title: "Track commissions and insights",
    description:
      "Watch revenue and engagement land in your dashboard. Get paid out automatically.",
  },
];

export default function HostsPage() {
  return (
    <>
      <Hero
        eyebrow="For event hosts"
        headline="Your attendees are already spending. Now you can earn from it."
        subhead="One place to manage attendee travel, secure exclusive partnerships and turn your event into a real revenue line."
        primaryCta={{ label: "I'm an Event Host", href: "#start" }}
        secondaryCta={{ label: "I'm a Travel Partner", href: "/partners" }}
      />

      <FeatureGrid
        eyebrow="What you get"
        heading="Everything your attendees need — and a meaningful new revenue stream for you."
        features={FEATURES}
      />

      <ProcessSteps
        heading="How it works"
        subhead="Four steps from signup to your first commission cheque."
        steps={STEPS}
      />

      <CtaSection
        heading="Ready to turn your event into a travel hub?"
        subhead="Set up your portal in under an hour and earn from the very next trip."
        primaryCta={{ label: "Start as an Event Host", href: "#start" }}
        showAppBadges
      />
    </>
  );
}
