import { Container } from "./container";
import { Section } from "./section";

export type FaqItem = { question: string; answer: string };

export function Faq({
  items,
  heading = "Frequently asked questions",
}: {
  items: FaqItem[];
  heading?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return (
    <Section id="faq" className="bg-muted/30">
      <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {heading}
        </h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {items.map((item) => (
            <details key={item.question} className="group p-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <span className="font-display text-base font-semibold text-foreground">
                  {item.question}
                </span>
                <span className="mt-1 text-foreground/60 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Section>
  );
}
