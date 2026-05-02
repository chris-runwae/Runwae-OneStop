import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/HomePageClient";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return <HomePageClient />;
}
