import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { RedirectHandler } from "@/components/RedirectHandler"; // NEW

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forecast Bid × Stability Nexus — Decentralized Prediction Pools",
  description:
    "Predict the future with decentralized prediction pools powered by Stability Nexus.",
  keywords: [
    "prediction markets",
    "decentralized betting",
    "blockchain",
    "Stability Nexus",
    "Forecast Bid",
    "Web3",
    "smart contracts",
    "DeFi",
  ],
  authors: [
    {
      name: "Stability Nexus",
      url: "https://stability.nexus/",
    },
    {
      name: "Forecast Bid",
      url: "https://destiny.stability.nexus/",
    },
  ],
  creator: "Stability Nexus",
  publisher: "Stability Nexus",
  metadataBase: new URL("https://destiny.stability.nexus/"),

  openGraph: {
    title: "Forecast Bid × Stability Nexus — Decentralized Prediction Pools",
    description:
      "Bet on blockchain-powered prediction markets with real-time odds and decentralized verification.",
    url: "https://destiny.stability.nexus/",
    siteName: "Forecast Bid",
    images: [
      {
        url: "https://destiny.stability.nexus/forecast_bid.jpg",
        width: 1200,
        height: 630,
        alt: "Forecast Bid Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Forecast Bid × Stability Nexus — Decentralized Prediction Pools",
    description:
      "Predict the future with decentralized prediction pools built on Stability Nexus.",
    images: ["https://destiny.stability.nexus/forecast_bid.jpg"],
    creator: "@StabilityNexus",
    site: "@StabilityNexus",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  alternates: {
    canonical: "https://destiny.stability.nexus/",
  },
};

/**
 * Defines the root layout for the Next.js application, applying global fonts and wrapping content with application providers.
 *
 * @param children - The content to be rendered within the layout
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>
          <RedirectHandler />
          {children}
        </Providers>{" "}
        {/* CLIENT PROVIDER */}
      </body>
    </html>
  );
}
