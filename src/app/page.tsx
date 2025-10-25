"use client";

import { Navigation } from "@/components/layout/Navigation";
import { useWalletStore } from "@/store/walletStore";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useWalletStore();

  return (
    <div className="relative min-h-screen bg-[#FDFCF5] text-black flex flex-col">
      {/* Navigation Bar */}
      <Navigation />

      {/* Hero Section */}
      <div className="flex flex-1 flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-24 pt-20 pb-16 gap-8">
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
            {/* <button className="flex items-center gap-2 border border-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" />
                <polygon points="10,8 16,12 10,16" fill="black" />
              </svg>
              Watch Video
            </button> */}
          </div>
        </div>

        {/* Right: Custom Illustration */}
        <div className="hidden md:block">
          <DotLottieReact
            src="https://lottie.host/6285668e-be28-4bcb-8354-049c37d602be/j6QJ2wZi3Z.lottie"
            loop
            autoplay
            className="w-80 h-80 lg:w-96 lg:h-96"
          />
        </div>
      </div>

      {/* Partner/Trust Bar */}
      <div className="w-full bg-black py-6 flex justify-center gap-12 items-center">
        <img
          src="/logos/coinbase.svg"
          alt="Coinbase"
          className="h-6 opacity-70 hover:opacity-100 transition-opacity"
        />
        <img
          src="/logos/binance.svg"
          alt="Binance"
          className="h-6 opacity-70 hover:opacity-100 transition-opacity"
        />
        <img
          src="/logos/uniswap.svg"
          alt="Uniswap"
          className="h-6 opacity-70 hover:opacity-100 transition-opacity"
        />
        <img
          src="/logos/chainlink.svg"
          alt="Chainlink"
          className="h-6 opacity-70 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
}
