import type { Metadata } from "next";
import { SiteChrome } from "@/components/site-chrome";
import { readFragment } from "@/lib/static-html";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms and Conditions — Runwae",
  description:
    "The Terms of Service governing your use of the Runwae platform.",
};

export default async function TermsPage() {
  const article = await readFragment("legal-terms.html");
  return (
    <SiteChrome>
      <header className="page-header page-header--left">
        <span className="page-header__eyebrow">Legal</span>
        <h1 className="page-header__title">Terms and Conditions</h1>
      </header>
      <article className="legal" dangerouslySetInnerHTML={{ __html: article }} />
    </SiteChrome>
  );
}
