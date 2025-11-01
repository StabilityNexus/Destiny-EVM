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
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import {
  usePoolMetadata,
  useGetUserShares,
  usePoolWrites,
  useTokenPrices,
  usePoolState,
  useUserPosition,
} from "@/lib/web3/pool";
import NotFoundPool from "@/components/game/NotFoundPool";
import { TransactionModal } from "@/components/modals";
import { formatEther } from "viem/utils";
import Link from "next/link";

// Info Tooltip Component
const InfoTooltip = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {show && (
        <div className="absolute z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-gray-900"></div>
          </div>
          {text}
        </div>
      )}
    </div>
  );
};

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
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [txError, setTxError] = useState<string | undefined>();
  const [txTitle, setTxTitle] = useState<string | undefined>();
  const [txDescription, setTxDescription] = useState<string | undefined>();
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const searchParams = useSearchParams();
  const contract = searchParams.get("contract") as `0x${string}` | null;
  const { address: userAddress } = useAccount();
  const router = useRouter();

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const { metadata, refetch: refetchMetadata } = usePoolMetadata(
    contract || "0x0000000000000000000000000000000000000000"
  );

  const {
    bullShares,
    bearShares,
    refetch: refetchShares,
  } = useGetUserShares(
    contract || "0x0000000000000000000000000000000000000000",
    userAddress || "0x0000000000000000000000000000000000000000"
  );

  const {
    priceBuyBull,
    priceBuyBear,
    priceSellBull,
    priceSellBear,
    refetch: refetchPrices,
  } = useTokenPrices(contract || "0x0000000000000000000000000000000000000000");

  const { state: poolState, refetch: refetchPoolState } = usePoolState(
    contract || "0x0000000000000000000000000000000000000000"
  );

  const bullPosition = useUserPosition(
    contract || "0x0000000000000000000000000000000000000000",
    userAddress,
    "BULL"
  );

  const bearPosition = useUserPosition(
    contract || "0x0000000000000000000000000000000000000000",
    userAddress,
    "BEAR"
  );

  const { mint, burn, claimBull, claimBear } = usePoolWrites(
    contract || "0x0000000000000000000000000000000000000000"
  );

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isErrored,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // ALL useEffect HOOKS
  useEffect(() => {
    if (isConfirming) {
      setTxStatus("pending");
      setModalOpen(true);
    } else if (isConfirmed) {
      setTxStatus("success");
      refetchAllData();
    } else if (isErrored) {
      setTxStatus("error");
      setTxError(receiptError?.message || "Transaction failed");
    }
  }, [isConfirming, isConfirmed, isErrored, receiptError]);

  useEffect(() => {
    if (!contract) {
      router.push("/app");
    }
  }, [contract, router]);

  const isExpired = metadata?.expiry
    ? Number(metadata.expiry) < Math.floor(Date.now() / 1000)
    : false;

  useEffect(() => {
    if (isExpired && metadata && contract) {
      const timer = setTimeout(() => {
        router.push(`/app/claim?contract=${contract}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isExpired, metadata, contract, router]);

  // NOW SAFE TO DO EARLY RETURNS
  if (!contract) {
    return (
      <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No contract specified</p>
        </div>
      </div>
    );
  }

  const refetchAllData = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await refetchMetadata();
      await refetchShares();
      await refetchPoolState();
      await refetchPrices();
    } catch (error) {
      console.error("Error refetching data:", error);
    }
  };

  const totalBull = poolState?.bullReserve || BigInt(0);
  const totalBear = poolState?.bearReserve || BigInt(0);
  const currentTVL = poolState?.tvl || totalBull + totalBear;

  const totalPool = totalBull + totalBear;
  const totalPoolNumber = Number(totalPool);

  const bullPercentage =
    totalPoolNumber > 0 ? (Number(totalBull) * 100) / totalPoolNumber : 50;
  const bearPercentage =
    totalPoolNumber > 0 ? (Number(totalBear) * 100) / totalPoolNumber : 50;

  const targetPrice = metadata?.targetPrice
    ? Number(metadata.targetPrice)
    : 0;
  const current = metadata?.latestPrice
    ? Number(metadata?.latestPrice) / 1e8
    : 0;
  const priceChange = current - targetPrice;
  const priceChangePercent =
    targetPrice > 0 ? ((priceChange / targetPrice) * 100).toFixed(2) : "0.00";

  const currentFee = Number(metadata?.currentFee) / 100;

  const getCurrentPrice = () => {
    if (selectedSide === "bull") {
      return priceBuyBull ? Number(priceBuyBull) / 10000 : 1;
    } else {
      return priceBuyBear ? Number(priceBuyBear) / 10000 : 1;
    }
  };

  const currentPrice = getCurrentPrice();
  const expectedShares = betAmount
    ? (parseFloat(betAmount) * (1 - currentFee / 100)) / currentPrice
    : 0;

  const tokenPairDisplay = metadata?.tokenPair
    ? String(metadata.tokenPair)
    : "Loading...";

  const bullWins =
    metadata?.snapshotPrice && metadata?.targetPrice
      ? Number(metadata.snapshotPrice) > Number(metadata.targetPrice)
      : current > targetPrice;

  const userWon = bullWins ? bullShares > 0 : bearShares > 0;

  const handleMint = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) return;

    setTxTitle(`Minting ${selectedSide.toUpperCase()} Position`);
    setTxDescription(
      `Placing ${betAmount} ETH bet on ${selectedSide.toUpperCase()}`
    );
    setTxStatus("pending");
    setModalOpen(true);

    try {
      const side = selectedSide === "bull" ? "BULL" : "BEAR";
      const hash = await mint(side, betAmount);
      setTxHash(hash);
      setBetAmount("");
    } catch (error: any) {
      console.error("Mint failed:", error);
      setTxStatus("error");
      setTxError(error?.message || "Transaction was rejected or failed");
    }
  };

  const handleBurn = async () => {
    const shareAmount = selectedSide === "bull" ? bullShares : bearShares;
    if (!shareAmount || shareAmount <= 0) return;

    setTxTitle(`Burning ${selectedSide.toUpperCase()} Position`);
    setTxDescription("Withdrawing your position from the pool");
    setTxStatus("pending");
    setModalOpen(true);

    try {
      const side = selectedSide === "bull" ? "BULL" : "BEAR";
      const MIN_SUPPLY = BigInt(1000000);
      const DUST_BUFFER = MIN_SUPPLY * BigInt(2);

      const totalSupply =
        selectedSide === "bull"
          ? poolState?.bullReserve || bullShares
          : poolState?.bearReserve || bearShares;

      let burnableShares = shareAmount;

      if (totalSupply - shareAmount < DUST_BUFFER) {
        burnableShares = totalSupply - DUST_BUFFER;
      }

      if (burnableShares <= 0) {
        throw new Error("Cannot burn: would leave supply too low");
      }

      const hash = await burn(side, burnableShares);
      setTxHash(hash);
    } catch (error: any) {
      console.error("Burn failed:", error);
      setTxStatus("error");
      setTxError(error?.message || "Transaction was rejected or failed");
    }
  };

  const handleClaim = async () => {
    setTxTitle("Claiming Rewards");
    setTxDescription(`Claiming your ${bullWins ? "BULL" : "BEAR"} winnings`);
    setTxStatus("pending");
    setModalOpen(true);

    try {
      const hash = bullWins ? await claimBull() : await claimBear();
      setTxHash(hash);
    } catch (error: any) {
      console.error("Claim failed:", error);
      setTxStatus("error");
      setTxError(error?.message || "Transaction was rejected or failed");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setTxHash(undefined);
    setTxStatus("idle");
    setTxError(undefined);
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

  // Expired pool redirect screen
  if (isExpired && metadata) {
    return (
      <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Pool Has Ended</h2>
          <p className="text-gray-600 mb-6">
            This prediction pool has concluded. Redirecting you to the claim
            page...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            Redirecting in a moment
          </div>
          <button
            onClick={() => router.push(`/app/claim?contract=${contract}`)}
            className="mt-6 w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Go to Claim Page Now
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

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

  const isTransactionPending = txStatus === "pending";

  return (
    <div className="min-h-screen bg-[#FDFCF5] py-8 px-4">
      <TransactionModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        status={txStatus}
        txHash={txHash}
        errorMessage={txError}
        title={txTitle}
        description={txDescription}
      />

      {isTransactionPending && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Info Banner for First-Time Users */}
        {showInfoBanner && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-blue-900 mb-1">
                    How This Works
                  </h3>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Predict whether {tokenPairDisplay} will be above or below
                    the target price by expiry. Choose <strong>BULL</strong> if
                    you think it will go up, or <strong>BEAR</strong> if you
                    think it will go down. Winners share the entire pool after
                    fees!{" "}
                    <Link
                      href="/app"
                      className="underline font-semibold hover:text-blue-600"
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoBanner(false)}
                className="text-blue-400 hover:text-blue-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Panel - Pool Info */}
          <div className="lg:col-span-1 space-y-5">
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
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">TARGET PRICE</p>
                  <InfoTooltip text="The benchmark price set when the pool was created. If the final price is above this, BULL wins. If below or equal, BEAR wins." />
                </div>
                <p className="text-2xl font-bold text-black">
                  ${targetPrice.toLocaleString()}
                </p>
              </div>

              {/* Current Price */}
              <div className="bg-blue-50 rounded-xl p-3.5 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">CURRENT PRICE</p>
                  <InfoTooltip text="Live price from Chainlink oracle. This updates in real-time and will determine the winner at expiry." />
                </div>
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
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-semibold">Time Remaining</span>
                  <InfoTooltip text="When this countdown reaches zero, the pool closes. No more trading allowed, and the final oracle price determines the winner." />
                </div>
                <Countdown expiry={metadata.expiry as bigint | undefined} />
              </div>
            </div>

            {/* Pool Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold text-black mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Pool Statistics
              </h2>

              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">
                        Total Pool Value
                      </span>
                      <InfoTooltip text="Total ETH deposited by all participants. Winners will split this amount (minus fees) proportionally." />
                    </div>
                    <span className="text-lg font-bold text-black">
                      {Number(formatEther(currentTVL)).toFixed(4)} ETH
                    </span>
                  </div>
                </div>

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

                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-blue-900 font-semibold">
                      Token Prices
                    </p>
                    <InfoTooltip text="Dynamic prices based on the current pool ratio. Prices adjust automatically as more people buy one side." />
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

                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-2">
                    <p className="text-xs text-gray-600">Potential Returns</p>
                    <InfoTooltip text="If you win, your payout is multiplied by this amount. Higher imbalance = higher rewards for the minority side!" />
                  </div>
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

          {/* Right Panel - Trading & Positions */}
          <div className="lg:col-span-2 space-y-5">
            {/* Trading Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-black">
                  Place Your Bet
                </h2>
                <InfoTooltip text="Choose your prediction side and deposit ETH. You'll receive shares that can be claimed for rewards if you're correct!" />
              </div>

              {/* Side Toggle */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setSelectedSide("bull")}
                  disabled={isTransactionPending}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                    selectedSide === "bull"
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <TrendingUp className="h-4 w-4" />
                  BULL
                </button>
                <button
                  onClick={() => setSelectedSide("bear")}
                  disabled={isTransactionPending}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                    selectedSide === "bear"
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <TrendingDown className="h-4 w-4" />
                  BEAR
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
                💡 <strong>BULL</strong> wins if price above the target |{" "}
                <strong>BEAR</strong> wins if price below the target
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
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
                        disabled={isTransactionPending}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BAD8B6] focus:border-[#BAD8B6] outline-none text-base font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Fee Display */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-700">Current Fee</span>
                        <InfoTooltip text="Dynamic trading fee that increases as the pool approaches expiry. Fee goes to the opposite side's pool." />
                      </div>
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
                      ⏰ Fee increases as expiry approaches
                    </p>
                  </div>
                </div>

                <div>
                  {betAmount && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          You&apos;ll receive
                        </span>
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

                  {/* Mint Button */}
                  <button
                    onClick={handleMint}
                    disabled={
                      !betAmount ||
                      parseFloat(betAmount) <= 0 ||
                      isTransactionPending
                    }
                    className={`w-full py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 mb-2.5 text-sm ${
                      selectedSide === "bull"
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <CheckCircle className="h-5 w-5" />
                    {isTransactionPending
                      ? "Processing..."
                      : `Buy ${selectedSide.toUpperCase()} Shares`}
                  </button>
                  <p className="text-xs text-gray-500 text-center mb-3">
                    🔒 Funds locked until pool ends or you burn position
                  </p>

                  {/* Burn Button */}
                  {((selectedSide === "bull" && bullShares > 0) ||
                    (selectedSide === "bear" && bearShares > 0)) && (
                    <>
                      <button
                        onClick={handleBurn}
                        disabled={isTransactionPending}
                        className="w-full py-2 border-2 border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                      >
                        {isTransactionPending
                          ? "Processing..."
                          : "Sell Your Shares"}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        💸 Exit early (fees apply)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Your Positions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-black">
                  Your Positions
                </h3>
                <InfoTooltip text="Your current holdings in this pool. Win rewards based on your share percentage!" />
              </div>

              <div className="grid md:grid-cols-2 gap-2.5">
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

              {isExpired && userWon && (
                <button
                  onClick={handleClaim}
                  disabled={isTransactionPending}
                  className="w-full mt-3.5 py-2.5 bg-[#BAD8B6] hover:bg-[#9CC499] text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  {isTransactionPending
                    ? "Processing..."
                    : `Claim ${bullWins ? "BULL" : "BEAR"} Rewards`}
                </button>
              )}

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
