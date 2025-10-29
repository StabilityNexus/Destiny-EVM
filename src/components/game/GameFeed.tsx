import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Timer,
  Grid,
  List,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAllPools } from "@/lib/web3/factory";
import { usePoolMetadata, usePoolState } from "@/lib/web3/pool";
import { useTimer } from "react-timer-hook";
import { Button } from "../ui/button";
import { formatEther } from "viem/utils";

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
  preloadedMetadata,
  preloadedPoolState,
}: {
  address: `0x${string}`;
  viewMode: "grid" | "list";
  preloadedMetadata?: any;
  preloadedPoolState?: any;
}) => {
  const { metadata: hookMetadata } = usePoolMetadata(address);
  const { state: hookPoolState } = usePoolState(address);

  const metadata = preloadedMetadata ?? hookMetadata;
  const poolState = preloadedPoolState ?? hookPoolState;

  console.log("Rendering PoolCard for", address, { metadata, poolState });

  const router = useRouter();
  const isExpired = metadata
    ? Number(metadata.expiry) < Date.now() / 1000
    : false;

  const handleBetClick = (e: React.MouseEvent, type: "bull" | "bear") => {
    e.stopPropagation();
    if (isExpired) return;
    // Navigate to pool page with the selected side pre-filled
    router.push(`/app/pool?contract=${address}?side=${type}`);
  };

  const handleClick = () => {
    router.push(`/app/pool?contract=${address}`);
  };

  // Calculate TVL and percentages
  const totalBull = poolState?.bullReserve || BigInt(0);
  const totalBear = poolState?.bearReserve || BigInt(0);
  const tvl = poolState?.tvl || totalBull + totalBear;
  const totalPool = Number(tvl);

  const bullPercentage =
    totalPool > 0 ? (Number(totalBull) / totalPool) * 100 : 50;
  const bearPercentage =
    totalPool > 0 ? (Number(totalBear) / totalPool) * 100 : 50;

  if (viewMode === "list") {
    return (
      <div
        className="group bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-black truncate">
                  {typeof metadata?.tokenPair === "string"
                    ? metadata.tokenPair
                    : "Loading..."}
                </h3>
                <div className="flex items-center gap-6 mt-1.5">
                  <p className="text-sm text-gray-600">
                    Target:{" "}
                    <span className="font-semibold text-black">
                      $
                      {metadata?.targetPrice
                        ? (Number(metadata.targetPrice) / 1e8).toLocaleString()
                        : "—"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Latest:{" "}
                    <span className="font-semibold text-black">
                      $
                      {metadata?.targetPrice
                        ? (Number(metadata.latestPrice) / 1e8).toLocaleString()
                        : "—"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Creator Fee:{" "}
                    {metadata?.creatorFee
                      ? Number(metadata.creatorFee) / 100
                      : 0}
                    %
                  </p>
                  {/* NEW: TVL Display */}
                  {tvl > BigInt(0) && (
                    <p className="text-sm text-gray-500">
                      TVL:{" "}
                      <span className="font-semibold text-black">
                        {Number(formatEther(tvl)).toFixed(4)} ETH
                      </span>
                    </p>
                  )}
                </div>
                {/* NEW: Bull/Bear Ratio Bar */}
                {tvl > BigInt(0) && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <span className="text-green-600">
                        Bull: {bullPercentage.toFixed(1)}%
                      </span>
                      <span className="text-red-600">
                        Bear: {bearPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 flex rounded-full overflow-hidden bg-gray-100">
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
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                <Clock className="h-4 w-4" />
                {typeof metadata?.expiry === "bigint" ? (
                  <Countdown expiry={metadata.expiry} />
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 ml-6">
            {isExpired ? (
              <span className="text-sm text-red-600 font-semibold px-4 py-2">
                Predictions Closed
              </span>
            ) : (
              <>
                <button
                  className="px-4 py-2 bg-[#BAD8B6] hover:bg-[#9CC499] text-black text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 min-w-[85px] justify-center"
                  onClick={(e) => handleBetClick(e, "bull")}
                >
                  <TrendingUp className="h-4 w-4" />
                  BULL
                </button>
                <button
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 min-w-[85px] justify-center"
                  onClick={(e) => handleBetClick(e, "bear")}
                >
                  <TrendingDown className="h-4 w-4" />
                  BEAR
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={handleClick}
    >
      <div className="space-y-3.5">
        <div>
          <h3 className="text-base font-semibold text-black mb-1.5">
            {typeof metadata?.tokenPair === "string"
              ? metadata.tokenPair
              : "Loading..."}
          </h3>
          <p className="text-sm text-gray-600">
            Target:{" "}
            <span className="font-semibold text-black">
              $
              {metadata?.targetPrice
                ? (Number(metadata.targetPrice) / 1e8).toLocaleString()
                : "—"}
            </span>
          </p>
        </div>

        {/* NEW: TVL and Stats */}
        {tvl > BigInt(0) && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Total Value Locked</span>
              <span className="text-sm font-bold text-black">
                {Number(formatEther(tvl)).toFixed(4)} ETH
              </span>
            </div>
            <div className="h-2 flex rounded-full overflow-hidden bg-gray-200">
              <div
                className="bg-green-500"
                style={{ width: `${bullPercentage}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${bearPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <span className="text-green-600">
                Bull {bullPercentage.toFixed(0)}%
              </span>
              <span className="text-red-600">
                Bear {bearPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl">
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

        {isExpired ? (
          <div className="text-center py-2">
            <span className="text-sm text-red-600 font-semibold">
              Predictions Closed
            </span>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <button
              className="flex-1 py-2 bg-[#BAD8B6] hover:bg-[#9CC499] text-black text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              onClick={(e) => handleBetClick(e, "bull")}
            >
              <TrendingUp className="h-4 w-4" />
              BULL
            </button>
            <button
              className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              onClick={(e) => handleBetClick(e, "bear")}
            >
              <TrendingDown className="h-4 w-4" />
              BEAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const MetadataLoader = ({
  address,
  onMetadataUpdate,
  onPoolStateUpdate,
}: {
  address: string;
  onMetadataUpdate: (address: string, metadata: any) => void;
  onPoolStateUpdate: (address: string, poolState: any) => void;
}) => {
  const { metadata } = usePoolMetadata(address as `0x${string}`);
  const { state: poolState } = usePoolState(address as `0x${string}`);

  useEffect(() => {
    if (metadata) {
      onMetadataUpdate(address, metadata);
    }
  }, [address, metadata ? JSON.stringify(metadata) : null, onMetadataUpdate]);

  useEffect(() => {
    if (poolState) {
      onPoolStateUpdate(address, poolState);
    }
  }, [
    address,
    poolState ? JSON.stringify(poolState) : null,
    onPoolStateUpdate,
  ]);

  return null;
};

export const PredictionPoolsFeed = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "expired"
  >("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "volume" | "ending_soon"
  >("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const { allPools, isLoading } = useAllPools();
  const router = useRouter();

  const [metadataMap, setMetadataMap] = useState<Record<string, any>>({});
  const [poolStateMap, setPoolStateMap] = useState<Record<string, any>>({});

  const handleMetadataUpdate = useCallback((address: string, metadata: any) => {
    setMetadataMap((prev) => {
      const prevMetadata = prev[address];
      if (JSON.stringify(prevMetadata) === JSON.stringify(metadata)) {
        return prev;
      }
      return { ...prev, [address]: metadata };
    });
  }, []);

  const handlePoolStateUpdate = useCallback(
    (address: string, poolState: any) => {
      setPoolStateMap((prev) => {
        const prevState = prev[address];
        if (JSON.stringify(prevState) === JSON.stringify(poolState)) {
          return prev;
        }
        return { ...prev, [address]: poolState };
      });
    },
    []
  );

  const perPage = 5;

  const filteredPools = useMemo(() => {
    if (!allPools) return [];

    const now = Date.now() / 1000;
    const lowerQuery = searchQuery.trim().toLowerCase();

    let filtered = allPools.filter((address) => {
      const md = metadataMap[address];
      const isExpired = md ? Number(md.expiry) < now : false;

      if (activeFilter === "active" && md) {
        if (isExpired) return false;
      } else if (activeFilter === "expired" && md) {
        if (!isExpired) return false;
      } else if (activeFilter === "active" && !md) {
        // Assume active if metadata not loaded yet
      } else if (activeFilter === "expired" && !md) {
        return false;
      }

      if (lowerQuery) {
        const tokenPair = (md?.tokenPair as string) ?? address;
        return tokenPair.toLowerCase().includes(lowerQuery);
      }

      return true;
    });

    // NEW: Sorting by volume
    if (sortBy === "volume") {
      filtered = filtered.sort((a, b) => {
        const tvlA = poolStateMap[a]?.tvl || BigInt(0);
        const tvlB = poolStateMap[b]?.tvl || BigInt(0);
        return tvlB > tvlA ? 1 : tvlB < tvlA ? -1 : 0;
      });
    } else if (sortBy === "ending_soon") {
      filtered = filtered.sort((a, b) => {
        const expiryA = metadataMap[a]?.expiry || BigInt(0);
        const expiryB = metadataMap[b]?.expiry || BigInt(0);
        return expiryA > expiryB ? 1 : expiryA < expiryB ? -1 : 0;
      });
    }

    return filtered;
  }, [allPools, metadataMap, poolStateMap, activeFilter, searchQuery, sortBy]);

  const paginatedPools = useMemo(
    () =>
      filteredPools.slice((currentPage - 1) * perPage, currentPage * perPage),
    [filteredPools, currentPage, perPage]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredPools.length / perPage)),
    [filteredPools, perPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, sortBy, searchQuery]);

  const getFilterCounts = useMemo(() => {
    if (!allPools) return { all: 0, active: 0, expired: 0 };

    const now = Date.now() / 1000;
    let active = 0;
    let expired = 0;

    for (const address of allPools) {
      const md = metadataMap[address];
      if (md) {
        if (Number(md.expiry) < now) expired++;
        else active++;
      } else {
        active++;
      }
    }

    return {
      all: allPools.length,
      active,
      expired,
    };
  }, [allPools, metadataMap]);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((v, i, arr) => arr.indexOf(v) === i);
  };

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-black mb-2 tracking-tight">
              🎯 Prediction Markets
            </h1>
            <p className="text-gray-700 text-base">
              {filteredPools.length} of {allPools?.length || 0}{" "}
              {allPools?.length === 1 ? "pool" : "pools"}
              {activeFilter !== "all" && ` (${activeFilter})`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/app/create")}
              className="px-4 py-2 bg-[#BAD8B6] text-black font-semibold rounded-xl hover:bg-[#a7c8a3] transition-all duration-200"
            >
              CREATE PREDICTION POOL +
            </Button>

            <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200">
              {[
                { mode: "list", icon: List },
                { mode: "grid", icon: Grid },
              ].map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as "list" | "grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === mode
                      ? "bg-[#BAD8B6] text-black"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prediction pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BAD8B6] focus:border-[#BAD8B6] outline-none transition-all duration-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "all", label: "All Pools", count: getFilterCounts.all },
                {
                  key: "active",
                  label: "Active",
                  count: getFilterCounts.active,
                },
                {
                  key: "expired",
                  label: "Expired",
                  count: getFilterCounts.expired,
                },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeFilter === key
                      ? "bg-[#BAD8B6] text-black"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* NEW: Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BAD8B6] focus:border-[#BAD8B6] outline-none bg-white"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="volume">Highest TVL</option>
                <option value="ending_soon">Ending Soon</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invisible metadata loaders */}
        <div className="sr-only" aria-hidden>
          {allPools?.map((addr) => (
            <MetadataLoader
              key={addr}
              address={addr}
              onMetadataUpdate={handleMetadataUpdate}
              onPoolStateUpdate={handlePoolStateUpdate}
            />
          ))}
        </div>

        {/* Content */}
        {!filteredPools.length ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {searchQuery || activeFilter !== "all" ? (
                  <Search className="h-8 w-8 text-gray-400" />
                ) : (
                  <Timer className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                {searchQuery || activeFilter !== "all"
                  ? "No pools match your filters"
                  : "No prediction pools yet"}
              </h3>
              <p className="text-gray-700 mb-8 text-base">
                {searchQuery || activeFilter !== "all"
                  ? "Try adjusting your search or filters to find more pools."
                  : "Get started by creating the first prediction pool."}
              </p>
              {!searchQuery && activeFilter === "all" && (
                <button
                  onClick={() => router.push("/app/create")}
                  className="inline-flex items-center px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-all duration-200"
                >
                  Create First Pool
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-2.5"
              }
            >
              {paginatedPools.map((address) => (
                <PoolCard
                  key={address}
                  address={address as `0x${string}`}
                  viewMode={viewMode}
                  preloadedMetadata={metadataMap[address]}
                  preloadedPoolState={poolStateMap[address]}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Info */}
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * perPage + 1} to{" "}
                    {Math.min(currentPage * perPage, filteredPools.length)} of{" "}
                    {filteredPools.length} results
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      First
                    </button>

                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {getVisiblePages().map((page, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            typeof page === "number" && setCurrentPage(page)
                          }
                          disabled={page === "..."}
                          className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                            currentPage === page
                              ? "bg-black text-white"
                              : page === "..."
                              ? "text-gray-400 cursor-default"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
