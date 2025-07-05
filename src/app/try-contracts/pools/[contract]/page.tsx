"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import toast from "react-hot-toast";
import { usePoolMetadata, useGetUserShares, usePoolWrites } from "@/lib/web3/pool";

export default function PoolDetailPage() {
  const { contract } = useParams() as { contract: `0x${string}` };
  const { address: user } = useAccount();
  const [amount, setAmount] = useState("0.01");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { metadata } = usePoolMetadata(contract);
  const { bullShares, bearShares } = useGetUserShares(contract, user || "");
  const { mint, burn, takeSnapshot, claim, withdrawCreatorFee } = usePoolWrites(contract);

  const { isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    chainId: 11155111,
    confirmations: 1,
  });

  const handle = async (fn: () => Promise<`0x${string}`>, label: string) => {
    try {
      toast.loading(`${label}...`);
      const hash = await fn();
      setTxHash(hash);
      toast.dismiss();
      toast.success("Tx sent!");
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Tx failed");
    }
  };

  if (isSuccess) {
    toast.success("Transaction confirmed!");
    setTxHash(null);
  }

  if (isError && error) {
    toast.error(`Tx failed: ${error.message}`);
    setTxHash(null);
  }

  return (
    <div className="min-h-screen bg-[#FDFCF5] text-black py-12 px-4">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_1px_1px,#EAEAEA_1px,transparent_0)] [background-size:20px_20px] opacity-30" />
      <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold break-all">📍 Pool: {contract}</h2>

        <div className="bg-white rounded-xl shadow p-4 space-y-2">
          <p><strong>Token Pair:</strong> {metadata?.tokenPair ? String(metadata.tokenPair) : ""}</p>
          <p><strong>Target Price:</strong> {metadata?.targetPrice?.toString()}</p>
          <p><strong>Expiry:</strong> {metadata?.expiry ? new Date(Number(metadata.expiry) * 1000).toLocaleString() : "N/A"}</p>
          <p><strong>Creator Fee:</strong> {Number(metadata?.creatorFee || 0) / 100}%</p>
        </div>

        <div className="space-y-3">
          <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in ETH" />
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-green" onClick={() => handle(() => mint("BULL", amount), "Minting BULL")}>Mint BULL</button>
            <button className="btn-green" onClick={() => handle(() => mint("BEAR", amount), "Minting BEAR")}>Mint BEAR</button>
            <button className="btn-blue" onClick={() => handle(() => burn("BULL", amount), "Burning BULL")}>Burn BULL</button>
            <button className="btn-blue" onClick={() => handle(() => burn("BEAR", amount), "Burning BEAR")}>Burn BEAR</button>
          </div>
          <button className="btn-purple w-full" onClick={() => handle(takeSnapshot, "Taking snapshot")}>Take Snapshot</button>
          <button className="btn-yellow w-full" onClick={() => handle(claim, "Claiming rewards")}>Claim Rewards</button>
          <button className="btn-dark w-full" onClick={() => handle(withdrawCreatorFee, "Withdrawing fee")}>Withdraw Creator Fee</button>
        </div>

        <div className="text-sm space-y-1">
          {typeof bullShares === "bigint" || typeof bullShares === "number" || typeof bullShares === "string"
            ? <p>🐂 Your BULL: {Number(bullShares) / 1e18} ETH</p>
            : null}
          {(typeof bearShares === "bigint" || typeof bearShares === "number" || typeof bearShares === "string") && (
            <p>🐻 Your BEAR: {Number(bearShares) / 1e18} ETH</p>
          )}
        </div>

        {txHash && (
          <p className="text-xs text-gray-600">
            Pending tx: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} className="underline text-blue-600" target="_blank">{txHash}</a>
          </p>
        )}
      </div>
    </div>
  );
}
