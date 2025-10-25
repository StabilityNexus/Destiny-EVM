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
  Info,
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
import { useAccount } from "wagmi";
import {
  usePoolMetadata,
  useGetUserShares,
  usePoolWrites,
  useTokenPrices, // NEW
  usePoolState, // NEW
  useUserPosition, // NEW
} from "@/lib/web3/pool";
import NotFoundPool from "@/components/game/NotFoundPool";
import { formatEther } from "viem/utils";

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
  const [selectedSide, setSelectedSide] = useState<"bull" | "bear">("bull");
  const [betAmount, setBetAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { contract } = useParams<{ contract: `0x${string}` }>();
  const { address: userAddress } = useAccount();

  const { metadata } = usePoolMetadata(contract);
  const { bullShares, bearShares } = useGetUserShares(
    contract,
    userAddress || "0x0000000000000000000000000000000000000000"
  );

  const { priceBuyBull, priceBuyBear, priceSellBull, priceSellBear } =
    useTokenPrices(contract);
  const { state: poolState } = usePoolState(contract);
  const bullPosition = useUserPosition(contract, userAddress, "BULL");
  const bearPosition = useUserPosition(contract, userAddress, "BEAR");

  const { mint, burn, claimBull, claimBear } = usePoolWrites(contract);

  // Use pool state data if available, fallback to individual queries
  // Keep as bigint throughout
  const totalBull = poolState?.bullReserve || bullShares || BigInt(0);
  const totalBear = poolState?.bearReserve || bearShares || BigInt(0);
  const currentTVL = poolState?.tvl || totalBull + totalBear;

  console.log("Pool State:", poolState);

  const isExpired = metadata?.expiry
    ? Number(metadata.expiry) < Math.floor(Date.now() / 1000)
    : false;

  // Keep totalPool as bigint, convert to Number only for calculations
  const totalPool = totalBull + totalBear;
  const totalPoolNumber = Number(totalPool); // Convert once for calculations

  const bullPercentage =
    totalPoolNumber > 0 ? (Number(totalBull) * 100) / totalPoolNumber : 50;
  const bearPercentage =
    totalPoolNumber > 0 ? (Number(totalBear) * 100) / totalPoolNumber : 50;

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

  // NEW: Calculate expected shares using current token price (Fate model)
  const getCurrentPrice = () => {
    if (selectedSide === "bull") {
      return priceBuyBull ? Number(priceBuyBull) / 10000 : 1; // Price is scaled by DENOMINATOR (10000)
    } else {
      return priceBuyBear ? Number(priceBuyBear) / 10000 : 1;
    }
  };

  const currentPrice = getCurrentPrice();
  const expectedShares = betAmount
    ? (parseFloat(betAmount) * (1 - currentFee / 100)) / currentPrice
    : 0;

  // Convert tokenPair to string safely
  const tokenPairDisplay = metadata?.tokenPair
    ? String(metadata.tokenPair)
    : "Loading...";

  // NEW: Determine winning side and if user won
  const bullWins =
    metadata?.snapshotPrice && metadata?.targetPrice
      ? Number(metadata.snapshotPrice) > Number(metadata.targetPrice)
      : current > targetPrice;

  const userWon = bullWins ? bullShares > 0 : bearShares > 0;

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

  // UPDATED: Burn now leaves dust behind to satisfy MIN_SUPPLY check
  const handleBurn = async () => {
    const shareAmount = selectedSide === "bull" ? bullShares : bearShares;
    if (!shareAmount || shareAmount <= 0) return;

    setIsLoading(true);
    try {
      const side = selectedSide === "bull" ? "BULL" : "BEAR";

      // Calculate how much we can actually burn
      // Leave behind MIN_SUPPLY (1e6 wei = 0.000001 shares) as dust
      const MIN_SUPPLY = BigInt(1000000); // 1e6
      const DUST_BUFFER = MIN_SUPPLY * BigInt(2); // Leave 2x MIN_SUPPLY to be safe

      // Get total supply for this side
      const totalSupply =
        selectedSide === "bull"
          ? poolState?.bullReserve || bullShares
          : poolState?.bearReserve || bearShares;

      // Calculate burnable amount
      let burnableShares = shareAmount;

      // If burning would leave less than DUST_BUFFER, reduce the burn amount
      if (totalSupply - shareAmount < DUST_BUFFER) {
        burnableShares = totalSupply - DUST_BUFFER;
      }

      // Make sure we're actually burning something
      if (burnableShares <= 0) {
        console.error("Cannot burn: would leave supply too low");
        // toast.error("Amount too large. Leave some dust behind!");
        return;
      }

      console.log({
        totalSupply: totalSupply.toString(),
        requestedBurn: shareAmount.toString(),
        actualBurn: burnableShares.toString(),
        remaining: (totalSupply - burnableShares).toString(),
      });

      await burn(side, burnableShares);
    } catch (error) {
      console.error("Burn failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // UPDATED: Use specific claim functions based on winning side
  const handleClaim = async () => {
    setIsLoading(true);
    try {
      if (bullWins) {
        await claimBull(); // NEW: Specific function for BULL winners
      } else {
        await claimBear(); // NEW: Specific function for BEAR winners
      }
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

  // Add this before the return statement, after your other calculations
  const calculatePotentialReturn = () => {
    if (!betAmount || expectedShares === 0) return "0.0000";

    if (selectedSide === "bull" && totalBull > 0) {
      const multiplier = Number(
        formatEther(((totalBull + totalBear) * BigInt(1e18)) / totalBull)
      );
      return (expectedShares * multiplier).toFixed(4);
    } else if (selectedSide === "bear" && totalBear > 0) {
      const multiplier = Number(
        formatEther(((totalBull + totalBear) * BigInt(1e18)) / totalBear)
      );
      return (expectedShares * multiplier).toFixed(4);
    }

    return "0.0000";
  };

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
                    {tokenPairDisplay}
                  </h1>
                  <p className="text-sm text-gray-600">Prediction Pool</p>
                </div>
                <div className="text-3xl">Ξ</div>
              </div>

              {/* Target Price */}
              <div className="bg-gray-50 rounded-xl p-3.5 mb-3">
                <p className="text-xs text-gray-600 mb-1">TARGET PRICE</p>
                <p className="text-2xl font-bold text-black">
                  ${(targetPrice * 10 ** 8).toLocaleString()}
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
                <Countdown expiry={metadata.expiry as bigint | undefined} />
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
                      {Number(formatEther(currentTVL)).toFixed(4)} ETH
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
                      {Number(formatEther(totalBull)).toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-red-600 flex items-center gap-1">
                      <TrendingDown className="h-4 w-4" />
                      BEAR
                    </span>
                    <span className="text-base font-bold text-black">
                      {Number(formatEther(totalBear)).toFixed(4)} ETH
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

                {/* NEW: Token Prices */}
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-blue-900 font-semibold">
                      Token Prices
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        BULL Buy Price
                      </span>
                      <span className="text-sm font-bold text-black">
                        {(Number(priceBuyBull) / 10000).toFixed(4)} ETH
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        BEAR Buy Price
                      </span>
                      <span className="text-sm font-bold text-black">
                        {(Number(priceBuyBear) / 10000).toFixed(4)} ETH
                      </span>
                    </div>
                  </div>
                </div>

                {/* Odds */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600 mb-2">
                    Potential Returns
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-green-600">
                        BULL
                      </p>
                      <p className="text-base font-bold text-black">
                        {totalBull > 0
                          ? Number(
                              formatEther(
                                ((totalBull + totalBear) * BigInt(1e18)) /
                                  totalBull
                              )
                            ).toFixed(2)
                          : "0.00"}
                        x
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-red-600">BEAR</p>
                      <p className="text-base font-bold text-black">
                        {totalBear > 0
                          ? Number(
                              formatEther(
                                ((totalBull + totalBear) * BigInt(1e18)) /
                                  totalBear
                              )
                            ).toFixed(2)
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

              {betAmount && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">You&apos;ll receive</span>
                    <span className="font-bold text-black">
                      {expectedShares.toFixed(6)} shares
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Current price</span>
                    <span className="font-semibold">
                      {currentPrice.toFixed(6)} ETH/share
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                    <span>Potential return</span>
                    <span className="font-semibold text-green-600">
                      {calculatePotentialReturn()} ETH
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
                  <div className="text-right">
                    <p className="font-bold text-sm text-black">
                      {Number(formatEther(bullShares))?.toFixed(6)} shares
                    </p>
                    <p className="text-xs text-gray-600">
                      ≈ {Number(formatEther(bullPosition.value))?.toFixed(4)}{" "}
                      ETH
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-sm text-red-900">
                      BEAR
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-black">
                      {Number(formatEther(bearShares))?.toFixed(6)} shares
                    </p>
                    <p className="text-xs text-gray-600">
                      ≈ {Number(formatEther(bearPosition.value))?.toFixed(4)}{" "}
                      ETH
                    </p>
                  </div>
                </div>
              </div>

              {/* UPDATED: Only show claim if user won */}
              {isExpired && userWon && (
                <button
                  onClick={handleClaim}
                  disabled={isLoading}
                  className="w-full mt-3.5 py-2.5 bg-[#BAD8B6] hover:bg-[#9CC499] text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  {isLoading
                    ? "Processing..."
                    : `Claim ${bullWins ? "BULL" : "BEAR"} Rewards`}
                </button>
              )}

              {/* Show loss message */}
              {isExpired && !userWon && (bullShares > 0 || bearShares > 0) && (
                <div className="mt-3.5 p-3 bg-gray-100 rounded-xl text-center">
                  <p className="text-sm text-gray-600">
                    {bullWins ? "BULL" : "BEAR"} side won this round
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
