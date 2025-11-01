"use client";

import { useState, useEffect } from "react";
import {
  useSetPriceFeed,
  useGetPriceFeed,
  useCreatePredictionPool,
  useAllPools,
} from "@/lib/web3/factory";
import {
  useAccount,
  useChainId,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { TransactionModal } from "@/components/modals";
import { PRICE_FEEDS } from "@/lib/contracts/feeds";
import { FACTORY_ADDRESSES } from "@/lib/contracts/addresses";
import PriceFeedSelector from "@/components/game/PriceFeedSelector";
import FACTORY_ABI from "@/lib/contracts/abi/PredictionFactory.json";

// Supported chains
const SUPPORTED_CHAINS = [11155111, 80002];
const CHAIN_NAMES: Record<number, string> = {
  11155111: "Sepolia",
  80002: "Polygon Mumbai",
};

export default function FactoryTryPage() {
  const { address } = useAccount();
  const chainId = useChainId();

  const [tokenPair, setTokenPair] = useState("ETH/USD");
  const [feedAddress, setFeedAddress] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [expiry, setExpiry] = useState("");
  const [expiryDateTime, setExpiryDateTime] = useState<string>("");
  const [rampStart, setRampStart] = useState("");
  const [rampStartDateTime, setRampStartDateTime] = useState<string>("");
  const [creatorFee, setCreatorFee] = useState("0");
  const [initialLiquidity, setInitialLiquidity] = useState("0.001");
  const [mounted, setMounted] = useState(false);

  // Transaction modal state
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [txError, setTxError] = useState<string | undefined>();
  const [txTitle, setTxTitle] = useState<string | undefined>();
  const [txDescription, setTxDescription] = useState<string | undefined>();
  const [poolAddress, setPoolAddress] = useState<string | undefined>();

  const { setPriceFeed } = useSetPriceFeed();
  const createPredictionPool = useCreatePredictionPool();
  const { feedAddress: currentFeed, refetch: refetchPriceFeed } =
    useGetPriceFeed(tokenPair);
  const { allPools, refetch: refetchAllPools } = useAllPools();

  // Get factory address based on chainId
  const factoryAddress = FACTORY_ADDRESSES[
    chainId as keyof typeof FACTORY_ADDRESSES
  ] as `0x${string}` | undefined;

  // Check if current user is owner
  const { data: contractOwner, isLoading: isLoadingOwner } = useReadContract({
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: "owner",
    query: {
      enabled: !!factoryAddress,
    },
  }) as { data: `0x${string}` | undefined; isLoading: boolean };

  const isOwner =
    address &&
    contractOwner &&
    address.toLowerCase() === String(contractOwner).toLowerCase();

  const feedsForChain = PRICE_FEEDS[chainId] || {};

  // Watch for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isErrored,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Function to refetch all factory data
  const refetchAllData = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await refetchPriceFeed();
      await refetchAllPools();
    } catch (error) {
      console.error("Error refetching data:", error);
    }
  };

  const handleTransaction = async (
    callback: () => Promise<`0x${string}`>,
    title: string,
    description: string
  ) => {
    setTxTitle(title);
    setTxDescription(description);
    setTxStatus("pending");
    setModalOpen(true);

    try {
      const hash = await callback();
      setTxHash(hash);
    } catch (error: any) {
      console.error("Transaction failed:", error);
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
    setPoolAddress(undefined);
  };

  // Format date in ISO format
  const formatExpiryDate = (timestamp: string) => {
    if (!timestamp || !mounted) return "";
    const date = new Date(Number(timestamp) * 1000);
    return date.toISOString().slice(0, 16).replace("T", " ");
  };

  // Handle expiry datetime change
  const handleExpiryDateTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const dateTimeValue = e.target.value;
    if (!dateTimeValue) {
      setExpiryDateTime("");
      setExpiry("");
      return;
    }

    const timestamp = new Date(dateTimeValue).getTime() / 1000;
    const now = Math.floor(Date.now() / 1000);

    if (timestamp > now) {
      setExpiryDateTime(dateTimeValue);
      setExpiry(Math.floor(timestamp).toString());
    }
  };

  const handlePairChange = (pair: string) => {
    setTokenPair(pair);
    const selectedAddress = feedsForChain[pair];
    if (selectedAddress) setFeedAddress(selectedAddress);
  };

  const isLiquidityValid = initialLiquidity && Number(initialLiquidity) > 0;
  const isFormValid =
    tokenPair && targetPrice && expiry && creatorFee !== "" && isLiquidityValid;
  const isFeedFormValid = tokenPair && feedAddress;
  const isTransactionPending = txStatus === "pending";
  const isChainSupported = SUPPORTED_CHAINS.includes(chainId);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDFCF5] text-black py-8 px-4">
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_1px_1px,#EAEAEA_1px,transparent_0)] [background-size:20px_20px] opacity-30" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Factory Playground
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Create and manage prediction pools with custom price feeds and
              parameters
            </p>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-full w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF5] text-black py-8 px-4">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_1px_1px,#EAEAEA_1px,transparent_0)] [background-size:20px_20px] opacity-30" />

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

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Factory Playground
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Create and manage prediction pools with custom price feeds and
            parameters
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {address ? (
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-mono border shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-mono border shadow-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Not connected
              </div>
            )}

            {isLoadingOwner && factoryAddress && (
              <div className="inline-flex items-center gap-2 bg-blue-50 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold border border-blue-200 shadow-sm">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-600">Loading admin access...</span>
              </div>
            )}

            {isOwner && (
              <div className="inline-flex items-center gap-2 bg-blue-50/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold border-2 border-blue-500 shadow-sm">
                <span className="text-lg">👑</span>
                <span className="text-blue-700 font-bold">Admin Access</span>
              </div>
            )}
          </div>

          {/* Chain warning */}
          {!isChainSupported && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center max-w-2xl mx-auto">
              <p className="text-sm text-red-900 font-medium">
                🔗 This app is not available on chain {chainId}
              </p>
              <p className="text-xs text-red-700 mt-1">
                Please switch to{" "}
                {SUPPORTED_CHAINS.map((id) => CHAIN_NAMES[id]).join(" or ")}
              </p>
            </div>
          )}
        </div>

        {isChainSupported ? (
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Set Price Feed Section - Admin Only */}
            {isOwner && (
              <section className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-blue-400 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Exclusive Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg flex items-center gap-1.5">
                  <span>👑</span>
                  <span>ADMIN ONLY</span>
                </div>

                {/* Decorative Element */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-blue-400/20 rounded-full blur-3xl"></div>

                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-xl">📊</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-blue-900">
                        Set Price Feed
                      </h2>
                      <p className="text-sm text-blue-700">
                        Configure oracle feeds for token pairs
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <PriceFeedSelector
                      tokenPair={tokenPair}
                      setTokenPair={setTokenPair}
                      feedAddress={feedAddress}
                      setFeedAddress={setFeedAddress}
                    />

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-blue-900">
                        Feed Address
                      </label>
                      <input
                        className="w-full px-3.5 py-2.5 text-sm bg-blue-50 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-blue-400 font-mono disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        placeholder="0x..."
                        value={feedAddress}
                        onChange={(e) => setFeedAddress(e.target.value)}
                        disabled={isTransactionPending}
                      />
                    </div>

                    <button
                      className={`w-full py-2.5 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isFeedFormValid && !isTransactionPending
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 shadow-md"
                          : "bg-blue-200 text-blue-400 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        handleTransaction(
                          () =>
                            setPriceFeed(
                              tokenPair,
                              feedAddress as `0x${string}`
                            ),
                          "Setting Price Feed",
                          `Configuring ${tokenPair} oracle feed`
                        )
                      }
                      disabled={!isFeedFormValid || isTransactionPending}
                    >
                      {isTransactionPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        "Set Price Feed"
                      )}
                    </button>

                    {currentFeed && (
                      <div className="bg-green-50 border border-green-300 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-2 text-green-800">
                          <span className="text-sm">✅ Current feed:</span>
                          <span className="font-mono text-xs break-all">
                            {currentFeed}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Create Prediction Pool Section */}
            <section
              className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 ${
                isOwner ? "" : "lg:col-span-2"
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Create Prediction Pool</h2>
                  <p className="text-sm text-gray-600">
                    Set up a new prediction market
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {/* Token Pair Selector - Available to All Users */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Select Token Pair *
                  </label>
                  <PriceFeedSelector
                    tokenPair={tokenPair}
                    setTokenPair={handlePairChange}
                    feedAddress={feedAddress}
                    setFeedAddress={setFeedAddress}
                  />
                  {currentFeed && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Price Feed:</span>{" "}
                        <span className="font-mono">{currentFeed}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Initial Liquidity Input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Initial Liquidity (ETH) *
                  </label>
                  <input
                    className={`w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isLiquidityValid
                        ? "border-gray-200 focus:ring-green-500 focus:border-transparent"
                        : "border-red-300 focus:ring-red-500"
                    }`}
                    placeholder="e.g. 0.001 ETH"
                    value={initialLiquidity}
                    onChange={(e) => setInitialLiquidity(e.target.value)}
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    disabled={isTransactionPending}
                  />
                  <p className="text-xs text-gray-500">
                    💧 Any amount &gt; 0 ETH (split 50/50 between BULL/BEAR)
                  </p>
                  {!isLiquidityValid && initialLiquidity && (
                    <p className="text-xs text-red-500">
                      ⚠️ Must be greater than 0 ETH
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Target Price
                    </label>
                    <input
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="e.g. 3000"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      disabled={isTransactionPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Creator Fee (%)
                      </label>
                      <div className="group relative">
                        <span className="text-gray-400 cursor-help">ℹ️</span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal">
                          Percentage fee taken from each trade. Enter as decimal
                          (e.g., 0.5 = 0.5%)
                        </div>
                      </div>
                    </div>
                    <input
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="e.g. 0.5"
                      value={creatorFee}
                      onChange={(e) => setCreatorFee(e.target.value)}
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={isTransactionPending}
                    />
                    {creatorFee && (
                      <p className="text-xs text-gray-500">
                        💰 {creatorFee} = {creatorFee}%
                      </p>
                    )}
                  </div>
                </div>

                {/* Expiry Time - DateTime Picker */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Expiry Time *
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    value={expiryDateTime}
                    onChange={handleExpiryDateTimeChange}
                    min={new Date().toISOString().slice(0, 16)}
                    disabled={isTransactionPending}
                  />
                  {expiry && mounted && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">
                        📅 {formatExpiryDate(expiry)}
                      </p>
                      <p className="text-xs font-mono text-gray-400">
                        ⏰ Timestamp: {expiry}
                      </p>
                    </div>
                  )}
                </div>

                {/* Ramp Start Section */}
                {expiry && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Ramp Start (optional)
                    </label>

                    <input
                      type="datetime-local"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                      value={rampStartDateTime}
                      onChange={(e) => {
                        const timestamp =
                          new Date(e.target.value).getTime() / 1000;
                        const now = Math.floor(Date.now() / 1000);
                        const expiryTime = Number(expiry);
                        if (timestamp >= now && timestamp < expiryTime) {
                          setRampStart(Math.floor(timestamp).toString());
                          setRampStartDateTime(e.target.value);
                        }
                      }}
                      min={new Date().toISOString().slice(0, 16)}
                      max={new Date(Number(expiry) * 1000)
                        .toISOString()
                        .slice(0, 16)}
                      disabled={isTransactionPending}
                    />

                    {rampStart && mounted && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                          ⏱️ {formatExpiryDate(rampStart)}
                        </p>
                        <p className="text-xs font-mono text-gray-400">
                          ⏰ Timestamp: {rampStart}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  className={`w-full py-2.5 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isFormValid && !isTransactionPending
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg transform hover:-translate-y-0.5"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={() =>
                    handleTransaction(
                      () =>
                        createPredictionPool(
                          tokenPair,
                          BigInt(targetPrice),
                          BigInt(expiry),
                          BigInt(rampStart || expiry),
                          BigInt(Math.floor(Number(creatorFee) * 100)),
                          initialLiquidity
                        ),
                      "Creating Prediction Pool",
                      `Creating ${tokenPair} pool with ${initialLiquidity} ETH initial liquidity`
                    )
                  }
                  disabled={!isFormValid || isTransactionPending}
                >
                  {isTransactionPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Pool...
                    </span>
                  ) : (
                    `Create Pool (${initialLiquidity} ETH)`
                  )}
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/50">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              Network not supported
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Please switch to{" "}
              {SUPPORTED_CHAINS.map((id) => CHAIN_NAMES[id]).join(" or ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
