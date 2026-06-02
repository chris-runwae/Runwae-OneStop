import type { Metadata } from "next";
import { readBodyHtml } from "@/lib/static-html";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Runwae — Plan Group Trips. Book Together. Split Costs.",
  description:
    "The app for traveling to events with friends—without the chaos. Plan group trips, book together, and split costs instantly.",
};

export default async function HomePage() {
  const body = await readBodyHtml("index.html");
  return <div dangerouslySetInnerHTML={{ __html: body }} />;
}
