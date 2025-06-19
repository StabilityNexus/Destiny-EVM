"use client";

import { Navigation } from "@/components/layout/Navigation";
import { useMetamaskStore } from "@/store/walletStore";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useMetamaskStore();

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-24">
        <Navigation />
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <h1 className="text-6xl font-bold mb-4 animate-fade-in">
          Predict your way up!
        </h1>
        <h2 className="text-xl font-bold mb-8 animate-fade-in">
          Create prediction games and earn rewards!
        </h2>
        <button
          onClick={() => router.push("/app")}
          className="bg-blue-500 text-white px-8 py-3 rounded-md hover:bg-blue-600 transition-all transform hover:scale-105 animate-fade-in"
        >
          Access dApp
        </button>
      </div>
    </div>
  );
}
