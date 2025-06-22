"use client";

import { Navigation } from "@/components/layout/Navigation";
import { useWalletStore } from "@/store/walletStore";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react"; /**
 * Renders the landing page for the dApp, featuring a hero section with a slogan, description, call-to-action button, and trust badges.
 *
 * The page includes decorative backgrounds and responsive styling, and allows users to navigate to the main application via the "Access dApp" button.
 */

export default function Home() {
  const router = useRouter();
  const { isConnected } = useWalletStore();

  return (
    <div className="relative min-h-screen bg-[#FDFCF5] text-black">
      <Navigation />

      {/* Decorative Background */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_1px_1px,#EAEAEA_1px,transparent_0)] [background-size:20px_20px] opacity-40" />

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-4 pt-32 sm:pt-36 space-y-6 animate-fade-in">
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight">
          <span className="bg-[#BAD8B6] px-4 py-2 rounded-xl shadow-sm inline-block animate-pop">
            Predict your way up!
          </span>
        </h1>

        <h2 className="text-lg sm:text-xl font-medium text-gray-700">
          Create prediction games. Compete. Earn rewards.
        </h2>

        {/* Access dApp Button */}
        <button
          onClick={() => router.push("/app")}
          className="mt-6 bg-[#9DC88E] text-black px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-[#7BB56A] hover:shadow-lg transition-all duration-300 flex items-center gap-2 group"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Access dApp
        </button>

        {/* Optional Trust Badges */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center opacity-80 text-sm">
          <span className="px-3 py-1 bg-white rounded-full border shadow-sm">
            Powered by Chainlink
          </span>
          <span className="px-3 py-1 bg-white rounded-full border shadow-sm">
            On Sepolia Testnet
          </span>
          <span className="px-3 py-1 bg-white rounded-full border shadow-sm">
            Gas-free ⚡
          </span>
        </div>
      </div>
    </div>
  );
}
