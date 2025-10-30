"use client";

import { PredictionPoolsFeed } from "@/components/game/GameFeed";

export default function AppPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 px-3 sm:px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-64 w-full max-w-[1920px] mx-auto justify-center">
      <PredictionPoolsFeed />
    </div>
  );
}
