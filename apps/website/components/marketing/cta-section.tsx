import Link from "next/link";
import { Button } from "@runwae/ui/components/button";
import { Container } from "./container";
import { Section } from "./section";
import { AppStoreBadges } from "./app-store-badges";

export function CtaSection({
  heading,
  subhead,
  primaryCta,
  secondaryCta,
  showAppBadges = false,
}: {
  heading: React.ReactNode;
  subhead?: React.ReactNode;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  showAppBadges?: boolean;
}) {
  return (
    <Section>
      <Container>
        <div className="overflow-hidden rounded-3xl bg-foreground px-8 py-16 text-background sm:px-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            {subhead && (
              <p className="text-lg text-background/70">{subhead}</p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {primaryCta && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href={primaryCta.href}>{primaryCta.label}</Link>
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
                  >
                    <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                  </Button>
                )}
              </div>
            )}
            {showAppBadges && (
              <div className="pt-4">
                <AppStoreBadges />
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
