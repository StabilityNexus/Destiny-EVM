"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  DollarSign,
  Activity,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { formatEther, parseEther } from "viem/utils";
import abi from "@/lib/contracts/abi/PredictionPool.json";
import {
  usePoolMetadata,
  useGetUserShares,
  usePoolWrites,
} from "@/lib/web3/pool";
import NotFoundPool from "@/components/game/NotFoundPool";

// Mock data for charts
const MOCK_PRICE_HISTORY = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}h`,
  price: 3400 + Math.random() * 100 - 50,
}));

const MOCK_VOLUME_HISTORY = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}h`,
  bull: Math.random() * 5,
  bear: Math.random() * 5,
}));

const Countdown = ({ expiry }: { expiry: bigint | undefined }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(expiry) - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (60 * 60 * 24));
      const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);
      const seconds = Math.floor(diff % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry]);

  return (
    <div className="flex gap-2 text-sm font-mono">
      {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
      <span>{timeLeft.hours}h</span>
      <span>{timeLeft.minutes}m</span>
      <span>{timeLeft.seconds}s</span>
    </div>
  );
};

export default function PoolDetailPage() {
  const [selectedSide, setSelectedSide] = useState("bull");
  const [betAmount, setBetAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { contract } = useParams<{ contract: `0x${string}` }>();
  const { address: userAddress } = useAccount();

  const { metadata } = usePoolMetadata(contract);

  console.log("Pool Metadata:", metadata);

  const { bullShares, bearShares } = useGetUserShares(
    contract,
    userAddress || "0x0000000000000000000000000000000000000000"
  );

  console.log("User Shares - Bull:", bullShares, "Bear:", bearShares);

  const { mint, burn, claim } = usePoolWrites(contract);

  const totalBull = bullShares;
  const totalBear = bearShares;

  console.log("Total Bull Shares:", totalBull);

  const isExpired = metadata?.expiry
    ? Number(metadata.expiry) < Math.floor(Date.now() / 1000)
    : false;

  const totalPool = totalBull + totalBear;
  const bullPercentage =
    totalPool > 0 ? Number((totalBull * BigInt(100)) / totalPool) : 50;
  const bearPercentage =
    totalPool > 0 ? Number((totalBear * BigInt(100)) / totalPool) : 50;

  const targetPrice = metadata?.targetPrice
    ? Number(metadata.targetPrice) / 1e8
    : 0;
  const current = metadata?.latestPrice
    ? Number(metadata?.latestPrice) / 1e8
    : 0;
  const priceChange = current - targetPrice;
  const priceChangePercent =
    targetPrice > 0 ? ((priceChange / targetPrice) * 100).toFixed(2) : "0.00";

  const currentFee = Number(metadata?.currentFee) / 100;
  const creatorFeePercent = metadata?.creatorFee
    ? Number(metadata.creatorFee) / 100
    : 0;

  const expectedShares = betAmount
    ? parseFloat(betAmount) * (1 - currentFee / 100)
    : 0;

  const handleMint = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) return;

    setIsLoading(true);
    try {
      const side = selectedSide === "bull" ? "BULL" : "BEAR";
      await mint(side, betAmount);
      setBetAmount("");
    } catch (error) {
      console.error("Mint failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBurn = async () => {
    const shareAmount = selectedSide === "bull" ? bullShares : bearShares;
    if (!shareAmount || shareAmount <= 0) return;

    setIsLoading(true);
    try {
      const side = selectedSide === "bull" ? "BULL" : "BEAR";
      await burn(side, shareAmount.toString());
    } catch (error) {
      console.error("Burn failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      await claim();
    } catch (error) {
      console.error("Claim failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (metadata === null) {
    return <NotFoundPool />;
  }

  if (!metadata) {
    return (
      <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pool data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF5] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Panel - Pool Info */}
          <div className="lg:col-span-4 space-y-5">
            {/* Pool Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-black mb-1">
                    {metadata.tokenPair}
                  </h1>
                  <p className="text-sm text-gray-600">Prediction Pool</p>
                </div>
                <div className="text-3xl">Ξ</div>
              </div>

              {/* Target Price */}
              <div className="bg-gray-50 rounded-xl p-3.5 mb-3">
                <p className="text-xs text-gray-600 mb-1">TARGET PRICE</p>
                <p className="text-2xl font-bold text-black">
                  ${targetPrice * 10 ** 8}
                </p>
              </div>

              {/* Current Price */}
              <div className="bg-blue-50 rounded-xl p-3.5 mb-3">
                <p className="text-xs text-gray-600 mb-1">CURRENT PRICE</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-black">
                    ${current.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      priceChange > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {priceChange > 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {priceChangePercent}%
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl mb-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-semibold">Time Remaining</span>
                </div>
                <Countdown expiry={metadata.expiry} />
              </div>

              {/* Creator Info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Creator</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Creator Fee</span>
                <span className="font-semibold text-black">
                  {creatorFeePercent}%
                </span>
              </div>
            </div>

            {/* Pool Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold text-black mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Pool Statistics
              </h2>

              <div className="space-y-3.5">
                {/* Total Pool */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Total Pool Value
                    </span>
                    <span className="text-lg font-bold text-black">
                      {Number(totalPool).toFixed(2)} ETH
                    </span>
                  </div>
                </div>

                {/* Bull/Bear Amounts */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      BULL
                    </span>
                    <span className="text-base font-bold text-black">
                      {Number(totalBull).toFixed(2)} ETH
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-red-600 flex items-center gap-1">
                      <TrendingDown className="h-4 w-4" />
                      BEAR
                    </span>
                    <span className="text-base font-bold text-black">
                      {Number(totalBear).toFixed(2)} ETH
                    </span>
                  </div>
                </div>

                {/* Ratio Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Bull: {bullPercentage.toFixed(1)}%</span>
                    <span>Bear: {bearPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 flex rounded-full overflow-hidden">
                    <div
                      className="bg-green-500"
                      style={{ width: `${bullPercentage}%` }}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${bearPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Odds */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600 mb-2">Current Odds</p>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-green-600">
                        BULL
                      </p>
                      <p className="text-base font-bold text-black">
                        {totalBull > 0
                          ? Number(totalPool / totalBull).toFixed(2)
                          : "0.00"}
                        x
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-red-600">BEAR</p>
                      <p className="text-base font-bold text-black">
                        {totalBear > 0
                          ? Number(totalPool / totalBear).toFixed(2)
                          : "0.00"}
                        x
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Charts */}
          <div className="lg:col-span-5 space-y-5">
            {/* Price Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold text-black mb-4">
                Price Movement
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={MOCK_PRICE_HISTORY}>
                  <XAxis
                    dataKey="time"
                    stroke="#6B7280"
                    style={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#6B7280" style={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={() => targetPrice}
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">Current Price</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-red-500 border-dashed" />
                  <span className="text-gray-600">Target Price</span>
                </div>
              </div>
            </div>

            {/* Volume Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold text-black mb-4">
                Bull/Bear Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={MOCK_VOLUME_HISTORY}>
                  <XAxis
                    dataKey="time"
                    stroke="#6B7280"
                    style={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#6B7280" style={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bull"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="bear"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-gray-600">Bull Volume</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span className="text-gray-600">Bear Volume</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Trading */}
          <div className="lg:col-span-3 space-y-5">
            {/* Trading Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sticky top-8">
              <h2 className="text-base font-bold text-black mb-4">
                Place Your Bet
              </h2>

              {/* Side Toggle */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setSelectedSide("bull")}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                    selectedSide === "bull"
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  BULL
                </button>
                <button
                  onClick={() => setSelectedSide("bear")}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                    selectedSide === "bear"
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <TrendingDown className="h-4 w-4" />
                  BEAR
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-black mb-2">
                  Amount (ETH)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BAD8B6] focus:border-[#BAD8B6] outline-none text-base font-mono"
                  />
                </div>
              </div>

              {/* Fee Display */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">Current Fee</span>
                  <span className="font-semibold text-black">
                    {currentFee.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${Math.min(currentFee, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Fee increases as expiry approaches
                </p>
              </div>

              {/* Expected Shares */}
              {betAmount && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">You'll receive</span>
                    <span className="font-bold text-black">
                      {expectedShares.toFixed(4)} ETH shares
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                    <span>Potential return</span>
                    <span className="font-semibold">
                      {selectedSide === "bull"
                        ? totalBull > 0
                          ? (
                              expectedShares * Number(totalPool / totalBull)
                            ).toFixed(4)
                          : "0.0000"
                        : totalBear > 0
                        ? (
                            expectedShares * Number(totalPool / totalBear)
                          ).toFixed(4)
                        : "0.0000"}{" "}
                      ETH
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <button
                onClick={handleMint}
                disabled={!betAmount || parseFloat(betAmount) <= 0 || isLoading}
                className={`w-full py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 mb-2.5 text-sm ${
                  selectedSide === "bull"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <CheckCircle className="h-5 w-5" />
                {isLoading
                  ? "Processing..."
                  : `Mint ${selectedSide.toUpperCase()} Position`}
              </button>

              {((selectedSide === "bull" && bullShares > 0) ||
                (selectedSide === "bear" && bearShares > 0)) && (
                <button
                  onClick={handleBurn}
                  disabled={isLoading}
                  className="w-full py-2 border-2 border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : "Burn Position"}
                </button>
              )}
            </div>

            {/* Your Positions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-base font-bold text-black mb-4">
                Your Positions
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-sm text-green-900">
                      BULL
                    </span>
                  </div>
                  <span className="font-bold text-sm text-black">
                    {Number(bullShares)?.toFixed(4)} ETH
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-sm text-red-900">
                      BEAR
                    </span>
                  </div>
                  <span className="font-bold text-sm text-black">
                    {Number(bearShares)?.toFixed(4)} ETH
                  </span>
                </div>
              </div>

              {isExpired && (bullShares > 0 || bearShares > 0) && (
                <button
                  onClick={handleClaim}
                  disabled={isLoading}
                  className="w-full mt-3.5 py-2.5 bg-[#BAD8B6] hover:bg-[#9CC499] text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  {isLoading ? "Processing..." : "Claim Rewards"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
