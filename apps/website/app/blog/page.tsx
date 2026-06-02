import type { Metadata } from "next";
import { SiteChrome } from "@/components/site-chrome";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Blog — Runwae",
  description:
    "Stories, guides, and updates from the Runwae team. New posts coming soon.",
};

export default function BlogPage() {
  return (
    <SiteChrome>
      <header className="page-header">
        <span className="page-header__eyebrow">Blog</span>
        <h1 className="page-header__title">The Runwae Blog</h1>
        <p className="page-header__subtitle">
          Travel guides, group-trip tips, and product updates.
        </p>
      </header>

      <div className="empty-state">
        <div className="empty-state__icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <h2 className="empty-state__title">No posts yet</h2>
        <p className="empty-state__text">
          We&rsquo;re busy writing our first stories. Check back soon &mdash;
          there&rsquo;s plenty on the way.
        </p>
      </div>
    </SiteChrome>
  );
}
