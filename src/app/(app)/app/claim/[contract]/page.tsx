"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  Activity,
  CheckCircle,
  Trophy,
  AlertCircle,
  ExternalLink,
  Shield,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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

/**
 * Renders the pool claim page that lets the pool creator finalize results and eligible users claim rewards after a pool has ended.
 *
 * The component displays final pool statistics, snapshot status, the user's positions, and action controls (take snapshot for the creator, claim rewards for winners). It manages transaction lifecycle state and shows a transaction modal while transactions are pending; it also redirects to the active pool page when the pool is not expired and shows a not-found or loading state when pool metadata is missing or loading.
 *
 * @returns The rendered Claim page UI as a JSX element.
 */
export default function ClaimPage() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [txError, setTxError] = useState<string | undefined>();
  const [txTitle, setTxTitle] = useState<string | undefined>();
  const [txDescription, setTxDescription] = useState<string | undefined>();

  const { contract } = useParams<{ contract: `0x${string}` }>();
  const { address: userAddress } = useAccount();
  const router = useRouter();

  const { metadata, refetch: refetchMetadata } = usePoolMetadata(contract);
  const {
    bullShares,
    bearShares,
    refetch: refetchShares,
  } = useGetUserShares(
    contract,
    userAddress || "0x0000000000000000000000000000000000000000"
  );
  const { state: poolState, refetch: refetchPoolState } =
    usePoolState(contract);
  const { totalBullShares, totalBearShares } = useTotalShares(contract);

  const { takeSnapshot, claimBull, claimBear } = usePoolWrites(contract);

  // Watch for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isErrored,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Update modal status based on transaction state
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

  const isExpired = metadata?.expiry
    ? Number(metadata.expiry) < Math.floor(Date.now() / 1000)
    : false;

  // Redirect if not expired
  useEffect(() => {
    if (metadata && !isExpired) {
      router.push(`/app/pool/${contract}`);
    }
  }, [metadata, isExpired, contract, router]);

  const snapshotTaken = metadata?.snapshotTaken || false;
  const isCreator =
    userAddress && metadata?.creator
      ? userAddress.toLowerCase() === metadata.creator.toLowerCase()
      : false;

  const targetPrice = metadata?.targetPrice
    ? Number(metadata.targetPrice) / 1e8
    : 0;
  const snapshotPrice = metadata?.snapshotPrice
    ? Number(metadata.snapshotPrice) / 1e8
    : 0;
  const currentPrice = metadata?.latestPrice
    ? Number(metadata.latestPrice) / 1e8
    : 0;

  const bullWins = snapshotTaken
    ? snapshotPrice > targetPrice
    : currentPrice > targetPrice;

  const userHasBullShares = bullShares > 0;
  const userHasBearShares = bearShares > 0;
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

  return (
    <div className="min-h-screen bg-[#FDFCF5] py-8 px-4">
      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        status={txStatus}
        txHash={txHash}
        errorMessage={txError}
        title={txTitle}
        description={txDescription}
      />

      {/* Loading Overlay */}
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
                {/* Target Price */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">TARGET PRICE</p>
                  <p className="text-xl font-bold text-black">
                    ${(targetPrice * 10 ** 8).toLocaleString()}
                  </p>
                </div>

                {/* Final Price */}
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
                    {(snapshotTaken
                      ? snapshotPrice
                      : currentPrice
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Snapshot Status */}
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
                        {snapshotPrice.toLocaleString()}. Claims are now enabled
                        for winners.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pool Statistics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Final Pool Statistics
              </h3>

              <div className="space-y-4">
                {/* Total Pool Value */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">
                    Total Pool Value
                  </span>
                  <span className="text-lg font-bold text-black">
                    {Number(formatEther(totalBull + totalBear)).toFixed(4)} ETH
                  </span>
                </div>

                {/* Bull/Bear Distribution */}
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

                {/* Creator Info */}
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

            {/* User Position & Claim */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-bold text-black mb-4">
                Your Position
              </h3>

              <div className="space-y-3">
                {/* Bull Shares */}
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

                {/* Bear Shares */}
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

              {/* Claim Button */}
              {snapshotTaken && userWon && (
                <button
                  onClick={handleClaim}
                  disabled={isTransactionPending}
                  className="w-full mt-4 py-3 bg-[#BAD8B6] hover:bg-[#9CC499] text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTransactionPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-5 w-5" />
                      Claim {bullWins ? "BULL" : "BEAR"} Rewards
                    </>
                  )}
                </button>
              )}

              {/* Status Messages */}
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

            {/* Back to Pools */}
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