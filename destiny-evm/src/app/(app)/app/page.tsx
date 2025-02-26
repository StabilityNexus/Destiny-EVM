"use client";

import { useState, useEffect } from "react";
import { ChainNavigation } from "@/components/layout/ChainNavigation";
import { GameFeed } from "@/components/game/GameFeed";
import { GameNavigation } from "@/components/game/GameNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useGameStore } from "@/store/gameStore";
import { useProfileStore } from "@/store/profileStore";
import { useMetamaskStore } from "@/store/metamaskStore";

export default function AppPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { fetchGamesByPair, fetchGames } = useProfileStore();
  const { filter, setFilter } = useGameStore();
  const { account } = useMetamaskStore();

  useEffect(() => {
    const loadGames = async () => {
      if (!account) {
        return;
      }
      await fetchGames(account);
      setIsLoading(false);
    };

    loadGames();
  }, [fetchGames]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 md:px-80 w-full justify-center items-center h-screen">
        <Skeleton className="h-16 w-16 rounded-full bg-[#BAD8B6]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-64 w-full max-w-[1920px] mx-auto justify-center">
      <GameNavigation />
      <GameFeed />
    </div>
  );
}
