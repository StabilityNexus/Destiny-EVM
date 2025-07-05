"use client";

import { useState } from "react";
import { useSetPriceFeed, useGetPriceFeed, useAllPools } from "@/lib/web3/factory";
import { useWaitForTransactionReceipt } from "wagmi";
import toast from "react-hot-toast";

export default function TryContracts() {
  const [tokenPair, setTokenPair] = useState("ETH/USD");
  const [feedAddress, setFeedAddress] = useState("0xYourFeedHere");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { setPriceFeed } = useSetPriceFeed();
  const { feedAddress: currentFeed } = useGetPriceFeed(tokenPair);
  const { allPools } = useAllPools();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error,
  } = useWaitForTransactionReceipt(
    txHash
      ? {
          hash: txHash,
          chainId: 11155111, // sepolia
          confirmations: 1,
        }
      : { hash: undefined }
  );

  const handleSetFeed = async () => {
    try {
      toast.loading("Sending transaction...");
      const hash = await setPriceFeed(tokenPair, feedAddress);
      toast.dismiss();
      toast.success("Tx sent. Waiting for confirmation...");
      setTxHash(hash);
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Transaction failed to send.");
    }
  };

  // React to tx result
  if (isSuccess) {
    toast.success("Transaction confirmed! ✅");
    setTxHash(null); // reset
  }

  if (isError && error) {
    toast.error(`Transaction failed: ${error.message}`);
    setTxHash(null); // reset
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded space-y-6">
      <h2 className="text-2xl font-bold">Try setPriceFeed()</h2>

      <input
        className="border p-2 w-full rounded"
        placeholder="Token Pair (e.g. ETH/USD)"
        value={tokenPair}
        onChange={(e) => setTokenPair(e.target.value)}
      />

      <input
        className="border p-2 w-full rounded"
        placeholder="Feed Address"
        value={feedAddress}
        onChange={(e) => setFeedAddress(e.target.value)}
      />

      <button
        onClick={handleSetFeed}
        disabled={isConfirming}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {isConfirming ? "Waiting for confirmation..." : "Set Feed"}
      </button>

      {txHash && (
        <p className="text-sm text-gray-600">
          Pending tx:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            {txHash}
          </a>
        </p>
      )}
    </div>
  );
}
