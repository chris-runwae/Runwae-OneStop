import Link from "next/link";
import { Button } from "@runwae/ui/components/button";
import { Container } from "./container";
import { cn } from "@/lib/cn";

export type HeroProps = {
  eyebrow?: string;
  headline: React.ReactNode;
  subhead?: React.ReactNode;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
  align?: "center" | "left";
  children?: React.ReactNode;
};

export function Hero({
  eyebrow,
  headline,
  subhead,
  primaryCta,
  secondaryCta,
  className,
  align = "center",
  children,
}: HeroProps) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-background to-muted/40 py-24 sm:py-32",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(50%_60%_at_50%_0%,_color-mix(in_srgb,var(--color-primary)_18%,transparent)_0%,_transparent_70%)]"
      />
      <Container className={cn("flex max-w-4xl flex-col gap-6", alignment)}>
        {eyebrow && (
          <span className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {headline}
        </h1>
        {subhead && (
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {subhead}
          </p>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {primaryCta && (
              <Button asChild size="lg">
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
            )}
            {secondaryCta && (
              <Button asChild variant="outline" size="lg">
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
