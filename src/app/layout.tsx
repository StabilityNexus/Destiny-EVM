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
  title: "Forecast Bid: Decentralized Prediction Pools",
  description: "Predict the future with decentralized prediction pools",
  openGraph: {
    title: "Forecast Bid: Decentralized Prediction Pools",
    description: "Bet on prediction markets with real-time odds",
    url: "https://destiny.stability.nexus/",
    siteName: "Forecast Bid: Decentralized Prediction Pools",
    images: [
      {
        url: "/forecast_bid.png",
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
    title: "Forecast Bid: Decentralized Prediction Pools",
    description: "Predict the future with decentralized prediction pools",
    images: ["/forecast_bid.png"],
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
