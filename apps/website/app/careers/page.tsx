import type { Metadata } from "next";
import { SiteChrome } from "@/components/site-chrome";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Careers — Runwae",
  description:
    "Join the Runwae team. We have no open roles right now, but we're always glad to hear from great people.",
};

export default function CareersPage() {
  return (
    <SiteChrome>
      <header className="page-header">
        <span className="page-header__eyebrow">Careers</span>
        <h1 className="page-header__title">Build the future of group travel</h1>
        <p className="page-header__subtitle">
          We&rsquo;re a small team with big ambitions for how people travel
          together.
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
            <circle cx="7" cy="4.5" r="2.5" />
            <path d="M7 7v8" />
            <path d="M7 15l-2.5 5M7 15l2.5 5" />
            <path d="M7 9l5 2" />
            <circle cx="15" cy="11" r="3" />
            <path d="M17.2 13.2 20 16" />
          </svg>
        </div>
        <h2 className="empty-state__title">No open roles right now</h2>
        <p className="empty-state__text">
          There aren&rsquo;t any positions open at the moment. We&rsquo;re still
          growing, so check back soon &mdash; or say hello at{" "}
          <a href="mailto:tech@runwae.io">tech@runwae.io</a>.
        </p>
      </div>
    </SiteChrome>
  );
}
