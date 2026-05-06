import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Runwae for Hosts", template: "%s · Runwae Hosts" },
  description: "Create events, track earnings, request payouts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} font-sans antialiased`}
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
