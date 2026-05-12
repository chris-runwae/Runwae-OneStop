import { Bricolage_Grotesque, Inter } from "next/font/google";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/components/posthog-provider";
import { OrganizationJsonLd } from "@/components/organization-json-ld";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.runwae.io"),
  title: {
    default: "Runwae — Plan Together. Book Together. Split the Cost.",
    template: "%s | Runwae",
  },
  description:
    "Runwae is the all-in-one app for groups — discover events, build itineraries, and handle payments without the chaos.",
  openGraph: {
    type: "website",
    siteName: "Runwae",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", site: "@runwae" },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${inter.variable}`}>
        <PostHogProvider>{children}</PostHogProvider>
        <Analytics />
        <SpeedInsights />
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
