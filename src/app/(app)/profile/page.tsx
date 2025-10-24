"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Timer, Rocket, Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import copy from "copy-to-clipboard";
import {
  useAllPools,
  useGetPoolsByCreator,
  useGetPoolsByCreatorCount,
} from "@/lib/web3/factory";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  // Fetch pools created by this user
  const { pools: userPools, isLoading: userPoolsLoading } =
    useGetPoolsByCreator(address as `0x${string}`, BigInt(0), BigInt(50));

  const { count: userPoolCount, isLoading: countLoading } =
    useGetPoolsByCreatorCount(address as `0x${string}`);

  // Optionally, fetch all pools for reference
  const { allPools, isLoading: allPoolsLoading } = useAllPools(
    BigInt(0),
    BigInt(50)
  );

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
    if (!userPools || userPools.length === 0) return;

    const interval = setInterval(() => {
      const newCountdowns: Record<string, string> = {};
      userPools.forEach((pool, idx) => {
        // Replace with actual deadline from pool data when available
        const deadline = new Date(Date.now() + 1000000000);
        newCountdowns[pool] = formatDetailedCountdown(deadline);
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [userPools]);

  const handleCopy = () => {
    if (address) {
      copy(address);
      toast.success("Address copied!");
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
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

  const isLoading = userPoolsLoading || countLoading;

  return (
    <div className="min-h-screen bg-[#F9F6E6] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4">Your Profile</h1>
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-md font-mono text-sm transition-all hover:scale-105">
            <span>{address}</span>
            <button onClick={handleCopy}>
              <Copy className="w-4 h-4" />
            </button>
            <a
              href={`https://sepolia.etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="mt-4 text-lg font-medium">
            Total Pools Created: {userPoolCount?.toString() || "0"}
          </p>
        </div>

        {isLoading && (
          <div className="text-center mt-8 text-lg font-medium">
            Loading your pools...
          </div>
        )}

        {!isLoading && userPools && userPools.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPools.map((pool, index) => (
              <Card
                key={pool}
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-center">
                    Pool #{index + 1}
                  </CardTitle>
                  <CardDescription className="break-all text-center text-xs">
                    {pool}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress
                      value={(index * 15) % 100}
                      className="h-2 bg-[#BAD8B6]"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        Bulls: {60 + (index % 10)}%
                      </span>
                      <span className="text-red-600">
                        Bears: {40 - (index % 10)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4 text-sm">
                      <Timer className="h-4 w-4" />
                      <span>{countdowns[pool] || "Loading..."}</span>
                    </div>

                    <Button className="w-full bg-[#BAD8B6] hover:bg-[#9DC88E]">
                      <Rocket className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!userPools || userPools.length === 0) && (
          <Card className="mt-8 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center">No Pools Found</CardTitle>
              <CardDescription className="text-center">
                You haven't created any prediction pools yet.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
