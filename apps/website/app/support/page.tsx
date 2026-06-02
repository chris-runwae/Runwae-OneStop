import type { Metadata } from "next";
import { SiteChrome } from "@/components/site-chrome";
import { SupportForm } from "@/components/support-form";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Support — Runwae",
  description:
    "Need help with Runwae? Send our team a message and we'll get back to you.",
};

export default function SupportPage() {
  return (
    <SiteChrome>
      <header className="page-header">
        <span className="page-header__eyebrow">Support</span>
        <h1 className="page-header__title">How can we help?</h1>
        <p className="page-header__subtitle">
          Running into a problem? Send us a message and the team will get back
          to you.
        </p>
      </header>

      <SupportForm />
    </SiteChrome>
  );
}
