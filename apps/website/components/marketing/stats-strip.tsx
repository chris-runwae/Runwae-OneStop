import { Container } from "./container";
import { Section } from "./section";

export type Stat = { value: string; label: string };

export function StatsStrip({ stats }: { stats: readonly Stat[] }) {
  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <dl className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
