"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  User,
  Activity,
  CheckCircle,
  Trophy,
  AlertCircle,
  Shield,
  Sparkles,
  Coins,
  XCircle,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import {
  usePoolMetadata,
  useGetUserShares,
  usePoolWrites,
  usePoolState,
  useTotalShares,
} from "@/lib/web3/pool";
import NotFoundPool from "@/components/game/NotFoundPool";
import { TransactionModal } from "@/components/modals";
import { formatEther } from "viem/utils";

export default function ClaimPage() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [txError, setTxError] = useState<string | undefined>();
  const [txTitle, setTxTitle] = useState<string | undefined>();
  const [txDescription, setTxDescription] = useState<string | undefined>();

  const searchParams = useSearchParams();
  const contract = searchParams.get("contract") as `0x${string}` | null;
  const { address: userAddress } = useAccount();
  const router = useRouter();

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

  const { state: poolState, refetch: refetchPoolState } = usePoolState(
    contract || "0x0000000000000000000000000000000000000000"
  );

  const { totalBullShares, totalBearShares } = useTotalShares(
    contract || "0x0000000000000000000000000000000000000000"
  );

  const { takeSnapshot, claimBull, claimBear } = usePoolWrites(
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
    if (metadata && !isExpired && contract) {
      router.push(`/app/pool?contract=${contract}`);
    }
  }, [metadata, isExpired, contract, router]);

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
    } catch (error) {
      console.error("Error refetching data:", error);
    }
  };

  const snapshotTaken = metadata?.snapshotTaken || false;
  const isCreator =
    userAddress && metadata?.creator
      ? userAddress.toLowerCase() === metadata.creator.toLowerCase()
      : false;

  const targetPriceUSD = metadata?.targetPrice
    ? Number(metadata.targetPrice)
    : 0;
  const snapshotPriceRaw = metadata?.snapshotPrice
    ? Number(metadata.snapshotPrice)
    : 0;
  const currentPriceRaw = metadata?.latestPrice
    ? Number(metadata.latestPrice)
    : 0;

  const snapshotPriceUSD = snapshotPriceRaw / 1e8;
  const currentPriceUSD = currentPriceRaw / 1e8;

  const bullWins = snapshotTaken
    ? snapshotPriceUSD > targetPriceUSD
    : currentPriceUSD > targetPriceUSD;

  const formatChainlinkPrice = (priceRaw: number) => {
    if (!priceRaw || priceRaw === 0) return "0.00";
    return (priceRaw / 1e8).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatUSDPrice = (priceUSD: number) => {
    if (!priceUSD || priceUSD === 0) return "0.00";
    return priceUSD.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const userHasBullShares = bullShares > BigInt(0);
  const userHasBearShares = bearShares > BigInt(0);
  const userWon = bullWins ? userHasBullShares : userHasBearShares;
  const userLost = bullWins
    ? userHasBearShares && !userHasBullShares
    : userHasBullShares && !userHasBearShares;

  const totalBull = poolState?.bullReserve || BigInt(0);
  const totalBear = poolState?.bearReserve || BigInt(0);

  const userBullReward =
    snapshotTaken && userHasBullShares && totalBullShares > 0
      ? (totalBull * bullShares) / totalBullShares
      : BigInt(0);

  const userBearReward =
    snapshotTaken && userHasBearShares && totalBearShares > 0
      ? (totalBear * bearShares) / totalBearShares
      : BigInt(0);

  const totalClaimableReward = userWon
    ? bullWins
      ? userBullReward
      : userBearReward
    : BigInt(0);

  const handleTakeSnapshot = async () => {
    setTxTitle("Taking Snapshot");
    setTxDescription("Recording final oracle price and calculating results");
    setTxStatus("pending");
    setModalOpen(true);

    try {
      const hash = await takeSnapshot();
      setTxHash(hash);
    } catch (error: any) {
      console.error("Snapshot failed:", error);
      setTxStatus("error");
      setTxError(
        error?.shortMessage ||
          error?.message ||
          "Transaction was rejected or failed"
      );
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
      setTxError(
        error?.shortMessage ||
          error?.message ||
          "Transaction was rejected or failed"
      );
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

  const isTransactionPending = txStatus === "pending";
  const tokenPairDisplay = metadata?.tokenPair
    ? String(metadata.tokenPair)
    : "Loading...";

  const hasClaimableRewards = totalClaimableReward > BigInt(0);

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

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-2">
            {tokenPairDisplay}
          </h1>
          <p className="text-lg text-gray-600">
            Pool Ended - Claim Your Rewards
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left Column - Pool Results */}
          <div className="lg:col-span-2 space-y-5">
            {/* Results Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    bullWins ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Trophy
                    className={`h-6 w-6 ${
                      bullWins ? "text-green-600" : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">
                    {bullWins ? "🐂 BULL" : "🐻 BEAR"} WINS!
                  </h2>
                  <p className="text-sm text-gray-600">Pool has concluded</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">TARGET PRICE</p>
                  <p className="text-xl font-bold text-black">
                    ${formatUSDPrice(targetPriceUSD)}
                  </p>
                </div>

                <div
                  className={`rounded-xl p-4 ${
                    bullWins ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <p className="text-xs text-gray-600 mb-1">
                    {snapshotTaken ? "SNAPSHOT PRICE" : "CURRENT PRICE"}
                  </p>
                  <p className="text-xl font-bold text-black">
                    $
                    {snapshotTaken
                      ? formatChainlinkPrice(snapshotPriceRaw)
                      : formatChainlinkPrice(currentPriceRaw)}
                  </p>
                </div>
              </div>

              {!snapshotTaken && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-900 mb-1">
                        Snapshot Not Taken
                      </p>
                      <p className="text-xs text-yellow-800">
                        {isCreator
                          ? "As the pool creator, you need to take a snapshot to finalize results and enable claims."
                          : "Waiting for pool creator to take snapshot. Claims will be enabled once snapshot is taken."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {snapshotTaken && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 mb-1">
                        Snapshot Taken
                      </p>
                      <p className="text-xs text-green-800">
                        Final price recorded at $
                        {formatChainlinkPrice(snapshotPriceRaw)}. Claims are now
                        enabled for winners.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Debug Info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                <p className="font-bold text-blue-900 mb-2">
                  🔍 Price Comparison Explanation
                </p>
                <p className="font-mono">
                  Target: {targetPriceUSD} (${formatUSDPrice(targetPriceUSD)})
                </p>
                <p className="font-mono">
                  Snapshot: {snapshotPriceRaw.toLocaleString()} ($
                  {formatChainlinkPrice(snapshotPriceRaw)})
                </p>
                <p className="font-mono">
                  Current: {currentPriceRaw.toLocaleString()} ($
                  {formatChainlinkPrice(currentPriceRaw)})
                </p>
                <p className="font-mono mt-2 text-blue-700">
                  Comparing: ${snapshotPriceUSD.toFixed(2)} &gt; $
                  {targetPriceUSD.toFixed(2)} ={" "}
                  {snapshotPriceUSD > targetPriceUSD ? "true" : "false"}
                </p>
                <p className="font-mono font-bold text-blue-900">
                  Winner: {bullWins ? "BULL 🐂" : "BEAR 🐻"}
                </p>
              </div>
            </div>

            {/* Pool Statistics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Final Pool Statistics
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">
                    Total Pool Value
                  </span>
                  <span className="text-lg font-bold text-black">
                    {Number(formatEther(totalBull + totalBear)).toFixed(4)} ETH
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      bullWins
                        ? "bg-green-50 border-2 border-green-500"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp
                        className={`h-4 w-4 ${
                          bullWins ? "text-green-600" : "text-gray-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold ${
                          bullWins ? "text-green-900" : "text-gray-700"
                        }`}
                      >
                        BULL {bullWins && "👑"}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-black">
                      {Number(formatEther(totalBull)).toFixed(4)} ETH
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-xl ${
                      !bullWins
                        ? "bg-red-50 border-2 border-red-500"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown
                        className={`h-4 w-4 ${
                          !bullWins ? "text-red-600" : "text-gray-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold ${
                          !bullWins ? "text-red-900" : "text-gray-700"
                        }`}
                      >
                        BEAR {!bullWins && "👑"}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-black">
                      {Number(formatEther(totalBear)).toFixed(4)} ETH
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-900 font-semibold">
                      Pool Creator
                    </span>
                  </div>
                  <span className="text-xs font-mono text-blue-700">
                    {metadata.creator?.slice(0, 6)}...
                    {metadata.creator?.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-5">
            {/* ✨ BEAUTIFUL CLAIMABLE VALUE CARD - Always Shows */}
            <div
              className={`rounded-2xl shadow-lg border-2 p-6 relative overflow-hidden ${
                hasClaimableRewards
                  ? "bg-gradient-to-br from-[#BAD8B6] to-[#9CC499] border-[#8AB88A]"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300"
              }`}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      hasClaimableRewards ? "bg-white" : "bg-gray-300"
                    }`}
                  >
                    {hasClaimableRewards ? (
                      <Sparkles className="h-5 w-5 text-[#8AB88A]" />
                    ) : (
                      <Coins className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <h3
                    className={`text-lg font-bold ${
                      hasClaimableRewards ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    Claimable Rewards
                  </h3>
                </div>

                <div
                  className={`backdrop-blur-sm rounded-xl p-4 mb-4 ${
                    hasClaimableRewards ? "bg-white/90" : "bg-white/70"
                  }`}
                >
                  <p
                    className={`text-sm mb-1 ${
                      hasClaimableRewards ? "text-gray-600" : "text-gray-500"
                    }`}
                  >
                    Your {bullWins ? "BULL" : "BEAR"}{" "}
                    {hasClaimableRewards ? "Winnings" : "Position"}
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      hasClaimableRewards ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {Number(formatEther(totalClaimableReward)).toFixed(6)} ETH
                  </p>
                  {currentPriceUSD > 0 && (
                    <p
                      className={`text-xs mt-1 ${
                        hasClaimableRewards ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      ≈ $
                      {(
                        Number(formatEther(totalClaimableReward)) *
                        currentPriceUSD
                      ).toFixed(2)}{" "}
                      USD
                    </p>
                  )}
                </div>

                {hasClaimableRewards && snapshotTaken ? (
                  <>
                    <button
                      onClick={handleClaim}
                      disabled={isTransactionPending}
                      className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isTransactionPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Trophy className="h-5 w-5" />
                          Claim Now
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-700 text-center mt-2">
                      🎉 Congratulations on your winning prediction!
                    </p>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                      <XCircle className="h-5 w-5" />
                      <p className="text-sm font-semibold">
                        {!snapshotTaken
                          ? "Awaiting Snapshot"
                          : userLost
                          ? "No Winnings"
                          : "No Position"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {!snapshotTaken
                        ? "Rewards will be available after snapshot"
                        : userLost
                        ? "Better luck next time!"
                        : "You didn't participate in this pool"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Snapshot Action (Creator Only) */}
            {!snapshotTaken && isCreator && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black">
                      Creator Action
                    </h3>
                    <p className="text-xs text-gray-600">
                      Required to enable claims
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTakeSnapshot}
                  disabled={isTransactionPending}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTransactionPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Take Snapshot
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-600 mt-3 text-center">
                  This will record the final price and distribute fees
                </p>
              </div>
            )}

            {/* User Position */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-bold text-black mb-4">
                Your Position
              </h3>

              <div className="space-y-3">
                <div
                  className={`p-3 rounded-xl ${
                    userHasBullShares && bullWins
                      ? "bg-green-50 border-2 border-green-500"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        className={`h-4 w-4 ${
                          userHasBullShares && bullWins
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      />
                      <span className="text-sm font-semibold text-black">
                        BULL
                      </span>
                    </div>
                    <span className="text-sm font-bold text-black">
                      {Number(formatEther(bullShares)).toFixed(6)}
                    </span>
                  </div>
                  {snapshotTaken && userHasBullShares && bullWins && (
                    <div className="text-xs text-green-700 font-semibold">
                      Reward: {Number(formatEther(userBullReward)).toFixed(4)}{" "}
                      ETH
                    </div>
                  )}
                </div>

                <div
                  className={`p-3 rounded-xl ${
                    userHasBearShares && !bullWins
                      ? "bg-red-50 border-2 border-red-500"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingDown
                        className={`h-4 w-4 ${
                          userHasBearShares && !bullWins
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      />
                      <span className="text-sm font-semibold text-black">
                        BEAR
                      </span>
                    </div>
                    <span className="text-sm font-bold text-black">
                      {Number(formatEther(bearShares)).toFixed(6)}
                    </span>
                  </div>
                  {snapshotTaken && userHasBearShares && !bullWins && (
                    <div className="text-xs text-red-700 font-semibold">
                      Reward: {Number(formatEther(userBearReward)).toFixed(4)}{" "}
                      ETH
                    </div>
                  )}
                </div>
              </div>

              {!snapshotTaken && (
                <div className="mt-4 p-3 bg-gray-100 rounded-xl text-center">
                  <p className="text-sm text-gray-600">
                    Waiting for snapshot to be taken
                  </p>
                </div>
              )}

              {snapshotTaken && userLost && (
                <div className="mt-4 p-3 bg-gray-100 rounded-xl text-center">
                  <p className="text-sm text-gray-600">
                    {bullWins ? "BULL" : "BEAR"} side won this round
                  </p>
                </div>
              )}

              {snapshotTaken && !userHasBullShares && !userHasBearShares && (
                <div className="mt-4 p-3 bg-gray-100 rounded-xl text-center">
                  <p className="text-sm text-gray-600">
                    You had no position in this pool
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/app")}
              className="w-full py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              Back to All Pools
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
