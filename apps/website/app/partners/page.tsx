import type { Metadata } from "next";
import { readBodyHtml } from "@/lib/static-html";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Runwae Partners — For Event Hosts & Travel Partners",
  description:
    "Join Runwae as an event host or travel partner. Earn from group travelers heading to your events. No subscription fees.",
};

export default async function PartnersPage() {
  const body = await readBodyHtml("partners.html");
  return (
    <>
      <style>{`body { background: var(--bg-dark); color: var(--white); }`}</style>
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
