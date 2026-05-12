import type { LucideIcon } from "lucide-react";
import { Container } from "./container";
import { Section } from "./section";
import { cn } from "@/lib/cn";

export type Feature = {
  icon?: LucideIcon;
  title: string;
  description: string;
};

export function FeatureGrid({
  eyebrow,
  heading,
  subhead,
  features,
  columns = 3,
  className,
}: {
  eyebrow?: string;
  heading: React.ReactNode;
  subhead?: React.ReactNode;
  features: Feature[];
  columns?: 2 | 3;
  className?: string;
}) {
  const cols =
    columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <Section className={className}>
      <Container className="space-y-12">
        <div className="max-w-3xl space-y-4">
          {eyebrow && (
            <span className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
          )}
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {heading}
          </h2>
          {subhead && (
            <p className="text-lg text-muted-foreground">{subhead}</p>
          )}
        </div>
        <div className={cn("grid gap-6", cols)}>
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
            >
              {feature.icon && (
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
              )}
              <h3 className="font-display text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
