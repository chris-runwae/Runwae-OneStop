import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { StatsStrip } from "@/components/marketing/stats-strip";
import { Container } from "@/components/marketing/container";
import { Section } from "@/components/marketing/section";
import { Faq } from "@/components/marketing/faq";
import { CtaSection } from "@/components/marketing/cta-section";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About Runwae",
  description:
    "Runwae is built for the way you gather — closing the gap between the trips you dream up and the trips you actually take.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Runwae",
    description:
      "Runwae is built for the way you gather — closing the gap between the trips you dream up and the trips you actually take.",
    url: "/about",
    images: ["/og/about.png"],
  },
};

const STATS = [
  { value: "100+", label: "Trips planned monthly" },
  { value: "$0", label: "Platform fee" },
  { value: "180+", label: "Cities covered" },
  { value: "4.9★", label: "Average group rating" },
];

const FAQ_ITEMS = [
  {
    question: "What is Runwae?",
    answer:
      "Runwae is an all-in-one app for planning, booking and coordinating group trips. We bring discovery, itinerary, group chat, bookings and expense splitting into a single calm space.",
  },
  {
    question: "How does group planning work?",
    answer:
      "Create a trip, invite your group, and build the itinerary together. Polls, suggestions and locked-in bookings live alongside the chat so nothing gets lost.",
  },
  {
    question: "What can I book through Runwae?",
    answer:
      "Flights, hotels, short-term stays, restaurants, activities and event passes. Everything is bookable as a group, with the option to split costs automatically.",
  },
  {
    question: "What kinds of events does Runwae cover?",
    answer:
      "Festivals, retreats, creator meetups, weddings, milestone birthdays and anything else worth a trip. Any organiser can list and host on Runwae.",
  },
  {
    question: "Can I use Runwae solo?",
    answer:
      "Yes. Solo travellers use Runwae to discover events and join existing trip groups attending the same destination or festival.",
  },
  {
    question: "How much does it cost partners?",
    answer:
      "Travel partners and event hosts pay nothing to list. We earn a small commission only on confirmed bookings — you keep more than with traditional booking platforms.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Hero
        eyebrow="About"
        headline="Built for the way you gather."
        subhead='You know the trips — the ones that live in the group chat for years: girls’ trips, birthday trips, even that Renaissance World Tour. Runwae is the home for the trips and experiences worth remembering.'
      />

      <StatsStrip stats={STATS} />

      <Section id="features">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Travel should feel like a dream — not a logistics problem.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Runwae exists to close the gap between intention and experience.
              We connect event organisers and their communities with the tools
              to plan, book and coordinate travel — simply, all in one place.
            </p>
          </div>
          <div className="space-y-6 rounded-3xl border border-border bg-card p-8">
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Who we are
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A small team of travellers, engineers and event organisers who
                got tired of running every group trip out of seventeen open
                browser tabs and a spreadsheet someone always forgot to update.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Why we started
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                People deserve to be in the moments they dream of — easily.
                Travel is one of the few things money buys that money can&rsquo;t
                give back if you miss it. We&rsquo;re here to make sure fewer
                people miss it.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="how-it-works" className="bg-muted/30">
        <Container className="space-y-10">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Partner with us.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you bring travellers a place to stay or a reason to fly
              out, Runwae is the easiest way to reach groups already on their
              way.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <a
              href="/partners"
              className="group rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary"
            >
              <h3 className="font-display text-xl font-semibold text-foreground">
                I&rsquo;m a travel partner →
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Hotels, short-term stays, restaurants and experiences — get in
                front of event crowds the moment they land in your city.
              </p>
            </a>
            <a
              href="/hosts"
              className="group rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary"
            >
              <h3 className="font-display text-xl font-semibold text-foreground">
                I&rsquo;m an event host →
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Festivals, retreats, conferences and meetups — give your
                attendees a travel hub and earn from the trips they were already
                planning.
              </p>
            </a>
          </div>
        </Container>
      </Section>

      <Faq items={FAQ_ITEMS} />

      <CtaSection
        heading="Ready to plan your next trip?"
        subhead="Download Runwae and bring the group along."
        showAppBadges
      />
    </>
  );
}
