"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import {
  Copy,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Clock,
  Activity,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import copy from "copy-to-clipboard";
import {
  useGetPoolsByCreator,
  useGetPoolsByCreatorCount,
} from "@/lib/web3/factory";
import {
  usePoolMetadata,
  useGetUserShares,
  usePoolState,
} from "@/lib/web3/pool";
import { formatEther } from "viem/utils";

// Simple pool card component that loads its own data
const PoolCardSimple = ({
  poolAddress,
  index,
  router,
  userAddress,
}: {
  poolAddress: `0x${string}`;
  index: number;
  router: any;
  userAddress: `0x${string}`;
}) => {
  const { metadata } = usePoolMetadata(poolAddress);
  const { state: poolState } = usePoolState(poolAddress);
  const { bullShares, bearShares } = useGetUserShares(poolAddress, userAddress);

  const isExpired = metadata?.expiry
    ? Number(metadata.expiry) < Math.floor(Date.now() / 1000)
    : false;

  const hasBull = bullShares > BigInt(0);
  const hasBear = bearShares > BigInt(0);

  return (
    <div
      onClick={() => router.push(`/app/pool/${poolAddress}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-black truncate">
          {metadata?.tokenPair
            ? String(metadata.tokenPair)
            : `Pool #${index + 1}`}
        </h3>
        {isExpired && (
          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">
            Expired
          </span>
        )}
      </div>

      <p className="text-[10px] text-gray-500 font-mono mb-2 truncate">
        {poolAddress.slice(0, 8)}...{poolAddress.slice(-6)}
      </p>

      {/* Show user positions if any */}
      {(hasBull || hasBear) && (
        <div className="space-y-1 mb-2">
          {hasBull && (
            <div className="flex items-center justify-between p-1.5 bg-green-50 rounded-lg">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-[10px] font-semibold text-green-900">
                  BULL
                </span>
              </div>
              <span className="text-[10px] font-bold text-black">
                {Number(formatEther(bullShares)).toFixed(3)} ETH
              </span>
            </div>
          )}

          {hasBear && (
            <div className="flex items-center justify-between p-1.5 bg-red-50 rounded-lg">
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-600" />
                <span className="text-[10px] font-semibold text-red-900">
                  BEAR
                </span>
              </div>
              <span className="text-[10px] font-bold text-black">
                {Number(formatEther(bearShares)).toFixed(3)} ETH
              </span>
            </div>
          )}
        </div>
      )}

      {poolState && poolState.tvl > BigInt(0) && (
        <div className="bg-gray-50 rounded-lg p-2 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-600">TVL</span>
            <span className="text-xs font-bold text-black">
              {Number(formatEther(poolState.tvl)).toFixed(3)} ETH
            </span>
          </div>

          <div className="h-1.5 flex rounded-full overflow-hidden bg-gray-200">
            <div
              className="bg-green-500"
              style={{
                width: `${
                  Number(poolState.tvl) > 0
                    ? (Number(poolState.bullReserve) / Number(poolState.tvl)) *
                      100
                    : 50
                }%`,
              }}
            />
            <div
              className="bg-red-500"
              style={{
                width: `${
                  Number(poolState.tvl) > 0
                    ? (Number(poolState.bearReserve) / Number(poolState.tvl)) *
                      100
                    : 50
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {!isExpired &&
        metadata?.expiry &&
        typeof metadata.expiry === "bigint" && (
          <div className="flex items-center justify-between text-[10px] text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
            <div className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              <span>Expires</span>
            </div>
            <CountdownCompact expiry={metadata.expiry} />
          </div>
        )}
    </div>
  );
};

const CountdownCompact = ({ expiry }: { expiry: bigint }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(expiry) - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(diff / (60 * 60 * 24));
      const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry]);

  return <span className="font-mono">{timeLeft || "Loading..."}</span>;
};

/**
 * Render the connected user's profile page including wallet address, summary statistics, and the user's created pools.
 *
 * Renders a compact header with a truncated address badge (copy and explorer link), a four-card statistics grid, and a pools section that shows a loading state, a grid of PoolCardSimple entries when pools exist, or an empty-state prompt when no pools are found.
 *
 * @returns The React element for the profile page UI.
 */
export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const { pools: userCreatedPools, isLoading: createdPoolsLoading } =
    useGetPoolsByCreator(address as `0x${string}`, BigInt(0), BigInt(100));

  const { count: userPoolCount, isLoading: countLoading } =
    useGetPoolsByCreatorCount(address as `0x${string}`);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = () => {
    if (address) {
      copy(address);
      toast.success("Address copied!");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Activity className="h-6 w-6 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-black mb-1">
            Wallet Not Connected
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Connect your wallet to view your profile
          </p>
          <button
            onClick={() => router.push("/app")}
            className="px-4 py-2 bg-[#BAD8B6] hover:bg-[#9CC499] text-black text-sm font-semibold rounded-lg transition-all"
          >
            Back to Pools
          </button>
        </div>
      </div>
    );
  }

  const isLoading = createdPoolsLoading || countLoading;

  return (
    <div className="min-h-screen bg-[#FDFCF5] py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-black mb-2">Your Profile</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-200 font-mono text-xs">
            <span className="text-gray-700">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <button
              onClick={handleCopy}
              className="text-gray-600 hover:text-black transition-colors"
            >
              <Copy className="w-3 h-3" />
            </button>
            <a
              href={`https://basescan.org/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Compact Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {/* Total Pools Created */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-[10px] text-gray-600 mb-0.5">Pools Created</p>
            <p className="text-xl font-bold text-black">
              {userPoolCount?.toString() || "0"}
            </p>
          </div>

          {/* Active Positions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-[10px] text-gray-600 mb-0.5">Pools Active</p>
            <p className="text-xl font-bold text-black">
              {userCreatedPools?.length || "0"}
            </p>
          </div>

          {/* Win Rate - Coming Soon */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <Trophy className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-[10px] text-gray-600 mb-0.5">Win Rate</p>
            <p className="text-xl font-bold text-black">-</p>
            <p className="text-[9px] text-gray-500">Coming soon</p>
          </div>

          {/* Total Value */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-[10px] text-gray-600 mb-0.5">Total Value</p>
            <p className="text-xl font-bold text-black">-</p>
            <p className="text-[9px] text-gray-500">Coming soon</p>
          </div>
        </div>

        {/* Pools Section */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading pools...</p>
          </div>
        )}

        {!isLoading && userCreatedPools && userCreatedPools.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-black mb-3">
              Your Pools ({userCreatedPools.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {userCreatedPools.map((poolAddress, index) => (
                <PoolCardSimple
                  key={poolAddress}
                  poolAddress={poolAddress as `0x${string}`}
                  index={index}
                  router={router}
                  userAddress={address}
                />
              ))}
            </div>
          </div>
        )}

        {!isLoading && (!userCreatedPools || userCreatedPools.length === 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-black mb-1">
              No Activity Yet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              You haven't created any pools yet
            </p>
            <button
              onClick={() => router.push("/app")}
              className="px-4 py-2 bg-[#BAD8B6] hover:bg-[#9CC499] text-black text-sm font-semibold rounded-lg transition-all"
            >
              Explore Pools
            </button>
          </div>
        )}
      </div>
    </div>
  );
}