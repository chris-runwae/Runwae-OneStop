import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/marketing/container";
import { Section } from "@/components/marketing/section";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { getBlogPosts } from "@/lib/mdx";

export const dynamic = "force-static";
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Stories, playbooks and ideas for groups who travel together — from the Runwae team.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Section className="py-20">
          <Container className="space-y-12">
            <header className="max-w-2xl space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Blog
              </p>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Group travel, sorted.
              </h1>
              <p className="text-lg text-muted-foreground">
                Field notes, playbooks and ideas for the people planning the
                trips that live in the group chat.
              </p>
            </header>
            {posts.length === 0 ? (
              <p className="text-muted-foreground">
                No posts yet — check back soon.
              </p>
            ) : (
              <ul className="grid gap-8 md:grid-cols-2">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group block space-y-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {new Date(post.frontmatter.date).toLocaleDateString(
                          "en-GB",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      </p>
                      <h2 className="font-display text-2xl font-semibold text-foreground group-hover:text-primary">
                        {post.frontmatter.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {post.frontmatter.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
