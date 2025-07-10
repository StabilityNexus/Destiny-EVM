"use client";

import { useState, useEffect } from "react";
import {
  useSetPriceFeed,
  useGetPriceFeed,
  useCreatePredictionPool,
  useAllPools,
} from "@/lib/web3/factory";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import toast from "react-hot-toast";

export default function FactoryTryPage() {
  const { address } = useAccount();

  const [tokenPair, setTokenPair] = useState("ETH/USD");
  const [feedAddress, setFeedAddress] = useState("0x...");
  const [targetPrice, setTargetPrice] = useState("3000");
  const [expiry, setExpiry] = useState("");
  const [creatorFee, setCreatorFee] = useState("50");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { setPriceFeed } = useSetPriceFeed();
  const createPredictionPool = useCreatePredictionPool();
  const { feedAddress: currentFeed } = useGetPriceFeed(tokenPair);
  const { allPools } = useAllPools();

  const { isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt(
    {
      hash: txHash ?? undefined,
      chainId: 11155111,
      confirmations: 1,
    }
  );

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

  return (
    <div className="min-h-screen bg-[#FDFCF5] text-black py-12 px-4">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_1px_1px,#EAEAEA_1px,transparent_0)] [background-size:20px_20px] opacity-30" />

      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="text-4xl font-extrabold text-center">
          ⚙️ Factory Playground
        </h1>

        {/* Set Price Feed */}
        <section className="bg-white rounded-xl p-6 shadow space-y-3">
          <h2 className="text-xl font-semibold">Set Price Feed</h2>
          <input
            className="input"
            placeholder="Token Pair (e.g. ETH/USD)"
            value={tokenPair}
            onChange={(e) => setTokenPair(e.target.value)}
          />
          <input
            className="input"
            placeholder="Feed Address"
            value={feedAddress}
            onChange={(e) => setFeedAddress(e.target.value)}
          />
          <button
            className="btn-green"
            onClick={() =>
              handleTx(
                () => setPriceFeed(tokenPair, feedAddress as `0x${string}`),
                "Setting feed"
              )
            }
            disabled={isLoading}
          >
            Set Feed
          </button>
          <p className="text-sm text-gray-600">
            Current feed:{" "}
            <span className="font-mono">{currentFeed || "Not set"}</span>
          </p>
        </section>

        {/* Create Prediction Pool */}
        <section className="bg-white rounded-xl p-6 shadow space-y-3">
          <h2 className="text-xl font-semibold">Create Prediction Pool</h2>
          <input
            className="input"
            placeholder="Target Price (e.g. 3000)"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
          />
          <input
            className="input"
            placeholder="Expiry (UNIX timestamp)"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setRelativeExpiry(60)} className="btn-light">
              +1 Min
            </button>
            <button
              onClick={() => setRelativeExpiry(1 * 24 * 60 * 60)}
              className="btn-light"
            >
              +1 Day
            </button>
            <button
              onClick={() => setRelativeExpiry(7 * 24 * 60 * 60)}
              className="btn-light"
            >
              +1 Week
            </button>
            <button
              onClick={() => setRelativeExpiry(30 * 24 * 60 * 60)}
              className="btn-light"
            >
              +1 Month
            </button>
          </div>

          <input
            className="input"
            placeholder="Creator Fee (e.g. 50 = 0.5%)"
            value={creatorFee}
            onChange={(e) => setCreatorFee(e.target.value)}
          />
          <button
            className="btn-green"
            onClick={() =>
              handleTx(
                () =>
                  createPredictionPool(
                    tokenPair,
                    BigInt(targetPrice),
                    BigInt(expiry),
                    BigInt(creatorFee)
                  ),
                "Creating Pool"
              )
            }
            disabled={isLoading}
          >
            Create Pool
          </button>
        </section>

        {/* Pool List */}
        <section className="bg-white rounded-xl p-6 shadow space-y-2">
          <h2 className="text-xl font-semibold">All Pools</h2>
          {allPools?.length ? (
            allPools.map((addr) => (
              <a
                key={addr}
                href={`/try-contracts/pools/${addr}`}
                className="block text-blue-600 underline text-sm font-mono"
              >
                {addr}
              </a>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No pools yet.</p>
          )}
        </section>

        {/* Transaction Hash */}
        {txHash && (
          <p className="text-sm text-gray-600">
            Pending tx:{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {txHash}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
