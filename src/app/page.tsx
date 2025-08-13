"use client";

import { Navigation } from "@/components/layout/Navigation";
import { useWalletStore } from "@/store/walletStore";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function Home() {
  const router = useRouter();
  const { isConnected } = useWalletStore();

  return (
    <div className="relative min-h-screen bg-[#FDFCF5] text-black flex flex-col">
      {/* Navigation Bar */}
      <Navigation />

      {/* Hero Section */}
      <div className="flex flex-1 flex-col md:flex-row items-center justify-between px-8 md:px-24  pt-24 pb-12">
        {/* Left: Headline and Actions */}
        <div className="max-w-xl space-y-6">
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight">
            The first{" "}
            <span className="bg-[#BAD8B6] px-2 pb-1 rounded-md">
              decentralized
            </span>
            <br />
            prediction protocol
          </h1>
          <p className="text-lg text-gray-700">
            Empowering users to create and participate in on-chain prediction
            pools.
            <br />
            Hedge risks, earn rewards, and join a transparent, unstoppable
            ecosystem.
          </p>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => router.push("/app")}
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-900 transition"
            >
              Get Started
            </button>
            <button className="flex items-center gap-2 border border-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" />
                <polygon points="10,8 16,12 10,16" fill="black" />
              </svg>
              Watch Video
            </button>
          </div>
        </div>

        {/* Right: Custom Illustration */}
        <div className="hidden md:block">
          {/* Replace with your SVG or animated illustration */}
          {/* <img src="/your-illustration.svg" alt="Prediction Pool Illustration" className="w-96 h-96" /> */}
          <DotLottieReact
            src="https://lottie.host/6285668e-be28-4bcb-8354-049c37d602be/j6QJ2wZi3Z.lottie"
            loop
            autoplay
            className="w-96 h-96"
          />
        </div>
      </div>

      {/* Partner/Trust Bar */}
      <div className="w-full bg-black py-4 flex justify-center gap-8 items-center">
        <img src="/logos/coinbase.svg" alt="Coinbase" className="h-6" />
        <img src="/logos/binance.svg" alt="Binance" className="h-6" />
        <img src="/logos/uniswap.svg" alt="Uniswap" className="h-6" />
        <img src="/logos/chainlink.svg" alt="Chainlink" className="h-6" />
        {/* Add more logos as needed */}
      </div>
    </div>
  );
} 