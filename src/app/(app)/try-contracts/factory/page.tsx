"use client";

import { useState, useEffect } from "react";
import {
  useSetPriceFeed,
  useGetPriceFeed,
  useCreatePredictionPool,
  useAllPools,
} from "@/lib/web3/factory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccount, useChainId, useWaitForTransactionReceipt } from "wagmi";
import toast from "react-hot-toast";
import { Settings2Icon } from "lucide-react";
import { PRICE_FEEDS } from "@/lib/contracts/feeds";
import PriceFeedSelector from "@/components/game/PriceFeedSelector";

export default function FactoryTryPage() {
  const { address } = useAccount();

  const [tokenPair, setTokenPair] = useState("ETH/USD");
  const [feedAddress, setFeedAddress] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [expiry, setExpiry] = useState("");
  const [rampStart, setRampStart] = useState("");
  const [rampStartDateTime, setRampStartDateTime] = useState<string>("");
  const [creatorFee, setCreatorFee] = useState("50");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [mounted, setMounted] = useState(false);

  const { setPriceFeed } = useSetPriceFeed();
  const createPredictionPool = useCreatePredictionPool();
  const { feedAddress: currentFeed } = useGetPriceFeed(tokenPair);
  const { allPools } = useAllPools();

  const chainId = useChainId();
  const feedsForChain = PRICE_FEEDS[chainId] || {};

  const { isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt(
    {
      hash: txHash ?? undefined,
      chainId: chainId,
      confirmations: 1,
    }
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction confirmed ✅");
      setTxHash(null);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError && error) {
      toast.error(`Tx failed: ${error.message}`);
      setTxHash(null);
    }
  }, [isError, error]);

  const handleTx = async (
    callback: () => Promise<`0x${string}`>,
    label: string
  ) => {
    try {
      toast.loading(`${label}...`);
      const hash = await callback();
      setTxHash(hash);
      toast.dismiss();
      toast.success("Transaction sent!");
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Transaction failed");
    }
  };

  const setRelativeExpiry = (seconds: number) => {
    const now = Math.floor(Date.now() / 1000);
    const future = now + seconds;
    setExpiry(future.toString());
  };

  const formatExpiryDate = (timestamp: string) => {
    if (!timestamp || !mounted) return "";
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const handlePairChange = (pair: string) => {
    setTokenPair(pair);
    const selectedAddress = feedsForChain[pair];
    if (selectedAddress) setFeedAddress(selectedAddress);
  };

  const isFormValid = tokenPair && targetPrice && expiry && creatorFee;
  const isFeedFormValid = tokenPair && feedAddress;

  // Don't render dynamic content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDFCF5] text-black py-8 px-4">
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_1px_1px,#EAEAEA_1px,transparent_0)] [background-size:20px_20px] opacity-30" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Factory Playground
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            <Settings2Icon /> Factory Playground
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create and manage prediction pools with custom price feeds and
            parameters
          </p>
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
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Set Price Feed Section */}
          <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Set Price Feed</h2>
                <p className="text-sm text-gray-600">
                  Configure oracle feeds for token pairs
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Token Pair
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="e.g. ETH/USD"
                  value={tokenPair}
                  onChange={(e) => setTokenPair(e.target.value)}
                />
              </div> */}

              <PriceFeedSelector
                tokenPair={tokenPair}
                setTokenPair={setTokenPair}
                feedAddress={feedAddress}
                setFeedAddress={setFeedAddress}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Feed Address
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 font-mono text-sm"
                  placeholder="0x..."
                  value={feedAddress}
                  onChange={(e) => setFeedAddress(e.target.value)}
                />
              </div>

              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  isFeedFormValid && !isLoading
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() =>
                  handleTx(
                    () => setPriceFeed(tokenPair, feedAddress as `0x${string}`),
                    "Setting feed"
                  )
                }
                disabled={!isFeedFormValid || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  "Set Price Feed"
                )}
              </button>

              {currentFeed && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <span className="text-sm">✅ Current feed:</span>
                    <span className="font-mono text-xs break-all">
                      {currentFeed}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Create Prediction Pool Section */}
          <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create Prediction Pool</h2>
                <p className="text-sm text-gray-600">
                  Set up a new prediction market
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Target Price
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="e.g. 3000"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Creator Fee (%)
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="50 = 0.5%"
                    value={creatorFee}
                    onChange={(e) => setCreatorFee(e.target.value)}
                  />
                </div>
              </div>

              {/* Ramp Start Section - Only visible if expiry is set */}
              {expiry && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ramp Start (optional)
                  </label>

                  {/* Quick Preset Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: "1 hour before expiry", offset: 3600 },
                      { label: "6 hours before expiry", offset: 3600 * 6 },
                      { label: "12 hours before expiry", offset: 3600 * 12 },
                      { label: "1 day before expiry", offset: 3600 * 24 },
                      { label: "2 days before expiry", offset: 3600 * 24 * 2 },
                    ].map(({ label, offset }) => {
                      const expiryTime = Number(expiry);
                      const timestamp = expiryTime - offset;
                      const now = Math.floor(Date.now() / 1000);

                      // Only allow times in the future
                      if (timestamp <= now) return null;

                      return (
                        <button
                          key={label}
                          type="button"
                          className="py-2 px-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
                          onClick={() => {
                            setRampStart(timestamp.toString());
                            setRampStartDateTime(
                              new Date(timestamp * 1000)
                                .toISOString()
                                .slice(0, 16)
                            );
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional manual datetime input */}
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400 font-mono text-sm"
                    value={rampStartDateTime}
                    onChange={(e) => {
                      const timestamp =
                        new Date(e.target.value).getTime() / 1000;
                      const now = Math.floor(Date.now() / 1000);
                      const expiryTime = Number(expiry);
                      if (timestamp > now && timestamp < expiryTime) {
                        setRampStart(timestamp.toString());
                        setRampStartDateTime(e.target.value);
                      }
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                    max={new Date(Number(expiry) * 1000)
                      .toISOString()
                      .slice(0, 16)}
                  />

                  {/* Display selected ramp start */}
                  {rampStart && mounted && (
                    <p className="text-xs text-gray-500 mt-1">
                      ⏱️ {formatExpiryDate(rampStart)} (Ramp Start)
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Expiry Time
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400 font-mono text-sm"
                  placeholder="UNIX timestamp"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
                {expiry && mounted && (
                  <p className="text-xs text-gray-500 mt-1">
                    📅 {formatExpiryDate(expiry)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "1 Min", seconds: 60 },
                  { label: "1 Day", seconds: 24 * 60 * 60 },
                  { label: "1 Week", seconds: 7 * 24 * 60 * 60 },
                  { label: "1 Month", seconds: 30 * 24 * 60 * 60 },
                ].map(({ label, seconds }) => (
                  <button
                    key={label}
                    onClick={() => setRelativeExpiry(seconds)}
                    className="py-2 px-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
                  >
                    +{label}
                  </button>
                ))}
              </div>

              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  isFormValid && !isLoading
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg transform hover:-translate-y-0.5"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() =>
                  handleTx(
                    () =>
                      createPredictionPool(
                        tokenPair,
                        BigInt(targetPrice),
                        BigInt(expiry),
                        BigInt(rampStart || 0),
                        BigInt(creatorFee)
                      ),
                    "Creating Pool"
                  )
                }
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Pool...
                  </span>
                ) : (
                  "Create Prediction Pool"
                )}
              </button>
            </div>
          </section>
        </div>

        {/* Pool List Section */}
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🏊‍♂️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Active Pools</h2>
                <p className="text-sm text-gray-600">
                  {allPools?.length || 0} pool
                  {allPools?.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>
          </div>

          {allPools?.length ? (
            <div className="grid gap-3">
              {allPools.map((addr, index) => (
                <a
                  key={addr}
                  href={`/try-contracts/pools/${addr}`}
                  className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-mono text-sm text-gray-700">{addr}</p>
                      <p className="text-xs text-gray-500">
                        Click to view details
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    →
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">🏊‍♂️</span>
              </div>
              <p className="text-gray-500 text-lg font-medium">
                No pools created yet
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Create your first prediction pool above
              </p>
            </div>
          )}
        </section>

        {/* Transaction Status */}
        {txHash && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Transaction pending...
                </p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  className="text-xs text-yellow-600 underline hover:no-underline font-mono"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {txHash}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
