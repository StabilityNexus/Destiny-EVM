"use client";

import { Navigation } from "@/components/layout/Navigation";
import { useWalletStore } from "@/store/walletStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Twitter,
  Github,
  Linkedin,
  Youtube,
  MessageCircle,
  Newspaper,
  Text,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useWalletStore();

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCF5] text-black">
      {/* Navigation Bar */}
      <Navigation />

      {/* Hero Section (flex-grow ensures footer sticks to bottom) */}
      <main className="flex-grow flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-24 pt-20 pb-16 gap-8">
        {/* Left: Headline and Actions */}
        <div className="max-w-xl space-y-5">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            The first{" "}
            <span className="bg-[#BAD8B6] px-2 pb-1 rounded-xl inline-block">
              decentralized
            </span>
            <br />
            prediction pool protocol
          </h1>
          <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
            Empowering users to create and participate in on-chain
            <br className="hidden sm:block" />
            prediction pools. Hedge against risks. Insure yourself from
            <br className="hidden sm:block" />
            volatility. Profit from correct predictions.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push("/app")}
              className="bg-black text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-900 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Right: Custom Illustration */}
        <div className="hidden md:block">
          <Image
            src="/forecast_bid.jpg"
            alt="Hero Illustration"
            width={500}
            height={500}
          />
        </div>
      </main>

      {/* Footer (sticks to bottom, no scroll) */}
      <footer className="bg-[#FAF8EF] border-t border-gray-200 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo-animated.gif" // Replace with your actual logo path
              alt="Logo"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-lg font-semibold tracking-tight">
              Destiny Protocol
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-5 text-gray-700">
            {/* Telegram */}
            <Link
              href="https://t.me/StabilityNexus"
              target="_blank"
              className="hover:text-[#24A1DE] transition-colors duration-200"
            >
              <MessageCircle className="w-5 h-5" />
            </Link>

            {/* Twitter / X */}
            <Link
              href="https://x.com/StabilityNexus"
              target="_blank"
              className="hover:text-[#1DA1F2] transition-colors duration-200"
            >
              <Twitter className="w-5 h-5" />
            </Link>

            {/* Discord */}
            <Link
              href="https://discord.gg/YzDKeEfWtS"
              target="_blank"
              className="hover:text-[#5865F2] transition-colors duration-200"
            >
              <Text className="w-5 h-5" />{" "}
              {/* You can swap for a Discord icon if added */}
            </Link>

            {/* Medium */}
            <Link
              href="https://news.stability.nexus/"
              target="_blank"
              className="hover:text-black transition-colors duration-200"
            >
              <Newspaper className="w-5 h-5" />
            </Link>

            {/* LinkedIn */}
            <Link
              href="https://linkedin.com/company/stability-nexus"
              target="_blank"
              className="hover:text-[#0A66C2] transition-colors duration-200"
            >
              <Linkedin className="w-5 h-5" />
            </Link>

            {/* YouTube */}
            <Link
              href="https://www.youtube.com/@StabilityNexus"
              target="_blank"
              className="hover:text-[#FF0000] transition-colors duration-200"
            >
              <Youtube className="w-5 h-5" />
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-600 text-center md:text-right">
            © {new Date().getFullYear()} Destiny Protocol × Stability Nexus. All
            rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
