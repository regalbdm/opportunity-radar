import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Xeveza — Opportunity Radar",
    template: "%s | Xeveza",
  },
  description:
    "Discover remote jobs, freelance gigs, internships, grants, competitions, and digital opportunities — discovered, filtered, and summarized automatically.",
  applicationName: "Xeveza",
  metadataBase: new URL("https://www.xeveza.com"),
  openGraph: {
    title: "Xeveza — Opportunity Radar",
    description:
      "Find opportunities before everyone else.",
    url: "https://www.xeveza.com",
    siteName: "Xeveza",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xeveza — Opportunity Radar",
    description: "Find opportunities before everyone else.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
