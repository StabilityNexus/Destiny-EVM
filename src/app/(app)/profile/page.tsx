"use client";

import { useEffect, useState } from "react";
import { useMetamaskStore } from "@/store/walletStore";
import { useProfileStore } from "@/store/profileStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Timer, Rocket } from "lucide-react";

export default function ProfilePage() {
  const { isConnected, account } = useMetamaskStore();
  const { games, isLoading, fetchGames } = useProfileStore();
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  const formatDetailedCountdown = (deadline: Date) => {
    const now = new Date().getTime();
    const timeLeft = deadline.getTime() - now;

    if (timeLeft <= 0) return "Closed";

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    if (!isConnected || !account) return;
    fetchGames(account);
  }, [isConnected, account, fetchGames]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: Record<string, string> = {};
      games.forEach((game) => {
        const deadline = new Date(parseInt(game.deadline));
        newCountdowns[game.id] = formatDetailedCountdown(deadline);
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [games]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F6E6]">
        <Card className="w-[90%] max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Wallet Not Connected
            </CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to view your profile
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6E6] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Profile</h1>
          <div className="inline-block px-4 py-2 bg-white rounded-lg shadow-md">
            <p className="text-sm font-mono">{account}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card
              key={game.id}
              className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all"
            >
              <CardHeader>
                <CardTitle className="text-xl text-center">
                  Prediction Game #{game.id}
                </CardTitle>
                <CardDescription>
                  Target Price: ${parseFloat(game.isAbove).toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress
                    value={parseFloat(game.bullCirculatingSupply)}
                    className="h-2 bg-[#BAD8B6]"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      Bulls: {game.bullCirculatingSupply}%
                    </span>
                    <span className="text-red-600">
                      Bears: {game.bearCirculatingSupply}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 text-sm">
                    <Timer className="h-4 w-4" />
                    <span>{countdowns[game.id] || "Loading..."}</span>
                  </div>

                  {game.isInitialized ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button className="bg-green-500 hover:bg-green-600">
                        Bulls
                      </Button>
                      <Button className="bg-red-500 hover:bg-red-600">
                        Bears
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full bg-[#BAD8B6] hover:bg-[#9DC88E]">
                      <Rocket className="mr-2 h-4 w-4" />
                      Initialize
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading && (
          <div className="text-center mt-8">
            <p className="text-lg">Loading your games...</p>
          </div>
        )}

        {!isLoading && games.length === 0 && (
          <Card className="mt-8 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center">No Games Found</CardTitle>
              <CardDescription className="text-center">
                You haven't created any prediction games yet.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
