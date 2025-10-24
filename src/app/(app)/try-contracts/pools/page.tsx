"use client";

import Link from "next/link";
import { useAllPools } from "@/lib/web3/factory";
import { usePoolMetadata } from "@/lib/web3/pool";

export default function PoolsListPage() {
  const { allPools } = useAllPools();

  return (
    <div className="min-h-screen bg-[#FDFCF5] text-black py-12 px-4">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_1px_1px,#EAEAEA_1px,transparent_0)] [background-size:20px_20px] opacity-30" />
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">📊 Prediction Pools</h1>

        {allPools?.length === 0 ? (
          <p className="text-center text-gray-500">No pools found.</p>
        ) : (
          <div className="grid gap-4">
            {(allPools ?? []).map((addr) => (
              <PoolCard key={addr} address={addr as `0x${string}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PoolCard({ address }: { address: `0x${string}` }) {
  const { metadata } = usePoolMetadata(address);

  return (
    <Link href={`/app/pool/${address}`}>
      <div className="bg-white border p-4 rounded-xl shadow hover:bg-[#FAFAF0] transition">
        <h2 className="font-semibold text-lg">{typeof metadata?.tokenPair === "string" ? metadata.tokenPair : "Loading..."}</h2>
        <p className="text-sm text-gray-700">Target: {metadata?.targetPrice?.toString() || "–"}</p>
        <p className="text-sm text-gray-700">Expiry: {metadata?.expiry ? new Date(Number(metadata.expiry) * 1000).toLocaleString() : "–"}</p>
        <p className="text-xs text-gray-500 mt-1 break-all">Contract: {address}</p>
      </div>
    </Link>
  );
}
