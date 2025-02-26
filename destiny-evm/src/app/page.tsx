"use client";

import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { useMetamaskStore } from "@/store/metamaskStore";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useMetamaskStore();

  return (
    <div>
      <header className=" p-4 fixed w-full top-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
        <Navigation />
      </header>
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-24">
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <h1 className="text-6xl font-bold mb-4 animate-fade-in">
          Predict your way up!
        </h1>
        <h2 className="text-xl font-bold mb-8 animate-fade-in">
          Create prediction games and earn rewards!
        </h2>
        <Button
          onClick={() => router.push("/app")}
          variant="destiny"
          className=""
        >
          Access dApp
        </Button>
      </div>
    </div>
  );
}
