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
  title: "Forecast Bid",
  description: "Forecast Bid - Decentralized Prediction Market Platform",
};

/**
 * Render the application's root HTML layout, set the document language and global font variables, and wrap page content with Providers including the RedirectHandler.
 *
 * @returns The root `<html>` and `<body>` elements containing `Providers`, `RedirectHandler`, and the supplied `children`
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