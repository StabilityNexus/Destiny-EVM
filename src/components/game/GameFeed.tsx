import React, { useState, useMemo } from "react";
import {
  Timer,
  Grid,
  List,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAllPools } from "@/lib/web3/factory";
import { usePoolMetadata } from "@/lib/web3/pool";
import { useTimer } from "react-timer-hook";

const Countdown = ({ expiry }: { expiry: bigint }) => {
  const { seconds, minutes, hours, days, isRunning } = useTimer({
    expiryTimestamp: new Date(Number(expiry) * 1000),
    autoStart: true,
  });

  if (!isRunning) {
    return <span className="text-red-600 text-sm font-semibold">Expired</span>;
  }

  return (
    <span className="text-gray-600 text-sm font-mono">
      {[
        days && `${days}d`,
        hours && `${hours}h`,
        minutes && `${minutes}m`,
        `${seconds}s`,
      ]
        .filter(Boolean)
        .join(" ")}
    </span>
  );
};

const PoolCard = ({
  address,
  viewMode,
}: {
  address: `0x${string}`;
  viewMode: "grid" | "list";
}) => {
  const { metadata } = usePoolMetadata(address);
  const router = useRouter();
  const isExpired = metadata
    ? Number(metadata.expiry) < Date.now() / 1000
    : false;

  const handleClick = () => {
    router.push(`/try-contracts/pools/${address}`);
  };

  if (viewMode === "list") {
    return (
      <div
        className="group bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-sm"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-black truncate">
                  {typeof metadata?.tokenPair === "string"
                    ? metadata.tokenPair
                    : "Loading..."}
                </h3>
                <div className="flex items-center gap-6 mt-2">
                  <p className="text-sm text-gray-600">
                    Target:{" "}
                    <span className="font-semibold text-black">
                      ${metadata?.targetPrice?.toString() || "—"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Creator Fee:{" "}
                    {metadata?.creatorFee
                      ? Number(metadata.creatorFee) / 100
                      : 0}
                    %
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4" />
                {typeof metadata?.expiry === "bigint" ? (
                  <Countdown expiry={metadata.expiry} />
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-8">
            <button
              className="px-5 py-2.5 bg-[#BAD8B6] hover:bg-[#9CC499] text-black text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 min-w-[90px] justify-center shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle bull bet
              }}
            >
              <TrendingUp className="h-4 w-4" />
              BULL
            </button>
            <button
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 min-w-[90px] justify-center shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle bear bet
              }}
            >
              <TrendingDown className="h-4 w-4" />
              BEAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-sm"
      onClick={handleClick}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-black mb-2">
            {typeof metadata?.tokenPair === "string"
              ? metadata.tokenPair
              : "Loading..."}
          </h3>
          <p className="text-sm text-gray-600">
            Target:{" "}
            <span className="font-semibold text-black">
              ${metadata?.targetPrice?.toString() || "—"}
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            {typeof metadata?.expiry === "bigint" ? (
              <Countdown expiry={metadata.expiry} />
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>
          <span className="text-sm text-gray-500">
            Fee: {metadata?.creatorFee ? Number(metadata.creatorFee) / 100 : 0}%
          </span>
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 py-2.5 bg-[#BAD8B6] hover:bg-[#9CC499] text-black text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle bull bet
            }}
          >
            <TrendingUp className="h-4 w-4" />
            BULL
          </button>
          <button
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle bear bet
            }}
          >
            <TrendingDown className="h-4 w-4" />
            BEAR
          </button>
        </div>
      </div>
    </div>
  );
};

export const PredictionPoolsFeed = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const { allPools, isLoading } = useAllPools();
  const router = useRouter();

  const perPage = 12;
  const paginatedPools = useMemo(
    () =>
      allPools?.slice((currentPage - 1) * perPage, currentPage * perPage) || [],
    [allPools, currentPage]
  );
  const totalPages = useMemo(
    () => Math.ceil((allPools?.length || 0) / perPage),
    [allPools]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black" />
          <p className="mt-4 text-gray-700">Loading prediction pools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF5] text-black">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-black mb-2 tracking-tight">
              🎯 Active Prediction Markets
            </h1>
            <p className="text-gray-700 text-lg">
              {allPools?.length || 0}{" "}
              {allPools?.length === 1 ? "pool" : "pools"} available
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
              {[
                { mode: "list", icon: List },
                { mode: "grid", icon: Grid },
              ].map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as "list" | "grid")}
                  className={`p-2.5 rounded-md transition-all duration-200 ${
                    viewMode === mode
                      ? "bg-[#BAD8B6] text-black shadow-sm"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {!allPools?.length ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Timer className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                No prediction pools yet
              </h3>
              <p className="text-gray-700 mb-8 text-lg">
                Get started by creating the first prediction pool.
              </p>
              <button
                onClick={() => router.push("/try-contracts/factory")}
                className="inline-flex items-center px-6 py-3 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-all duration-200 shadow-sm"
              >
                Create First Pool
              </button>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-3"
            }
          >
            {paginatedPools.map((address) => (
              <PoolCard key={address} address={address} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      currentPage === page
                        ? "bg-black text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
