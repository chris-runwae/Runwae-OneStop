import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Container } from "@/components/marketing/container";
import { Section } from "@/components/marketing/section";
import { Hero } from "@/components/marketing/hero";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { CtaSection } from "@/components/marketing/cta-section";
import { mdxComponents } from "@/components/mdx-components";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { getLandingPage, getLandingPages } from "@/lib/mdx";

type Params = { slug: string };

export const dynamic = "force-static";
export const revalidate = 86400;

export async function generateStaticParams(): Promise<Params[]> {
  const pages = await getLandingPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLandingPage(slug);
  if (!page) return {};
  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    alternates: { canonical: `/lp/${page.slug}` },
    openGraph: {
      title: page.frontmatter.title,
      description: page.frontmatter.description,
      url: `/lp/${page.slug}`,
      images: [page.frontmatter.ogImage ?? `/og/lp/${page.slug}.png`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LandingPagePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = await getLandingPage(slug);
  if (!page) notFound();

  const { hero, cta } = page.frontmatter;

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Hero
          eyebrow={hero.eyebrow}
          headline={hero.headline}
          subhead={hero.subhead}
          primaryCta={cta}
        />
        <Section>
          <Container className="max-w-3xl">
            <article>
              <MDXRemote
                source={page.source}
                components={mdxComponents}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            </article>
            <div className="mt-12 rounded-3xl border border-border bg-muted/30 p-8 text-center">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Want in on the next one?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Drop your email — we&apos;ll send you the next drop before it
                goes public.
              </p>
              <WaitlistForm
                className="mx-auto mt-5 max-w-md"
                source={`lp_${page.slug}`}
              />
            </div>
          </Container>
        </Section>
        <CtaSection
          heading="Bring the group along."
          subhead="Download Runwae and start planning together."
          showAppBadges
        />
      </main>
      <Footer />
    </div>
  );
}
