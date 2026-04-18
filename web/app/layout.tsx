import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/context/QueryProvider";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Runwae",
  description: "Runwae Exists to Make Those Trips Actually Happen",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${bricolage.className} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster
              invert
              position="top-right"
              // PS: if design has designated icons for success and error states, you can put them here
              // icons={{
              //   success: <SvgCheckmarkBig />,
              //   error: <SvgErrorInfo />,
              // }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
