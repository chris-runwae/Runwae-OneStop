import { Container } from "./container";
import { Section } from "./section";

export type ProcessStep = { title: string; description: string };

export function ProcessSteps({
  heading,
  subhead,
  steps,
}: {
  heading: React.ReactNode;
  subhead?: React.ReactNode;
  steps: ProcessStep[];
}) {
  return (
    <Section>
      <Container className="space-y-12">
        <div className="max-w-2xl space-y-4">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {heading}
          </h2>
          {subhead && (
            <p className="text-lg text-muted-foreground">{subhead}</p>
          )}
        </div>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
