import type { Metadata } from "next";
import { SiteChrome } from "@/components/site-chrome";
import { readFragment } from "@/lib/static-html";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy — Runwae",
  description:
    "How Runwae collects, uses, and protects your personal data.",
};

export default async function PrivacyPage() {
  const article = await readFragment("legal-privacy.html");
  return (
    <SiteChrome>
      <header className="page-header page-header--left">
        <span className="page-header__eyebrow">Legal</span>
        <h1 className="page-header__title">Privacy Policy</h1>
      </header>
      <article className="legal" dangerouslySetInnerHTML={{ __html: article }} />
    </SiteChrome>
  );
}
