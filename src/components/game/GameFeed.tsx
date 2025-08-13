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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAllPools } from "@/lib/web3/factory";
import { usePoolMetadata } from "@/lib/web3/pool";
import { useTimer } from "react-timer-hook";
import { Button } from "../ui/button";

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

/**
 * PoolCard now accepts an optional `preloadedMetadata` prop.
 * If provided parent metadata will be used for display/filtering,
 * otherwise the component still calls usePoolMetadata (no conditional hooks).
 */
const PoolCard = ({
  address,
  viewMode,
  preloadedMetadata,
}: {
  address: `0x${string}`;
  viewMode: "grid" | "list";
  preloadedMetadata?: any;
}) => {
  // Always call the hook (hooks must be deterministic). Prefer parent metadata if available.
  const { metadata: hookMetadata } = usePoolMetadata(address);
  const metadata = preloadedMetadata ?? hookMetadata;

  const router = useRouter();
  const isExpired = metadata
    ? Number(metadata.expiry) < Date.now() / 1000
    : false;

  const handleBetClick = (e: React.MouseEvent, type: "bull" | "bear") => {
    e.stopPropagation();
    if (isExpired) return;
    // Handle bet logic...
  };

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
            {isExpired ? (
              <span className="text-sm text-red-600 font-semibold">
                Betting Closed
              </span>
            ) : (
              <>
                <button
                  className="px-5 py-2.5 bg-[#BAD8B6] hover:bg-[#9CC499] text-black text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 min-w-[90px] justify-center shadow-sm"
                  onClick={(e) => handleBetClick(e, "bull")}
                >
                  <TrendingUp className="h-4 w-4" />
                  BULL
                </button>
                <button
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 min-w-[90px] justify-center shadow-sm"
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

        {isExpired ? (
          <span className="text-sm text-red-600 font-semibold">
            Betting Closed
          </span>
        ) : (
          <div className="flex gap-3">
            <button
              className="flex-1 py-2.5 bg-[#BAD8B6] hover:bg-[#9CC499] text-black text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              onClick={(e) => handleBetClick(e, "bull")}
            >
              <TrendingUp className="h-4 w-4" />
              BULL
            </button>
            <button
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
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

/**
 * MetadataLoader: small component which fetches metadata for one address and sends it to parent.
 * This is safe: each address gets its own component + hook.
 */
const MetadataLoader = ({
  address,
  onUpdate,
}: {
  address: string;
  onUpdate: (address: string, metadata: any) => void;
}) => {
  const { metadata } = usePoolMetadata(address as `0x${string}`);
  useEffect(() => {
    if (metadata) {
      onUpdate(address, metadata);
    }
  }, [
    address,
    metadata ? JSON.stringify(metadata) : null, // shallow compare by value
    onUpdate,
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

  // Map address => metadata populated by MetadataLoader components
  const [metadataMap, setMetadataMap] = useState<Record<string, any>>({});

  const handleMetadataUpdate = useCallback((address: string, metadata: any) => {
    setMetadataMap((prev) => {
      const prevMetadata = prev[address];
      // Prevent updates if data is the same by value
      if (JSON.stringify(prevMetadata) === JSON.stringify(metadata)) {
        return prev;
      }
      return { ...prev, [address]: metadata };
    });
  }, []);

  const perPage = 5; // Increased for better pagination

  // Filter and sort pools — use metadataMap for expiry checks if available.
  const filteredPools = useMemo(() => {
    if (!allPools) return [];

    const now = Date.now() / 1000;
    const lowerQuery = searchQuery.trim().toLowerCase();

    let filtered = allPools.filter((address) => {
      const md = metadataMap[address];
      const isExpired = md ? Number(md.expiry) < now : false;

      // Status filter
      if (activeFilter === "active" && md) {
        if (isExpired) return false;
      } else if (activeFilter === "expired" && md) {
        if (!isExpired) return false;
      } else if (activeFilter === "active" && !md) {
        // metadata unknown -> include by default (treat as active until known)
      } else if (activeFilter === "expired" && !md) {
        // metadata unknown -> exclude expired-only list by default
        return false;
      }

      // Search filter: prefer tokenPair from metadata, fall back to address
      if (lowerQuery) {
        const tokenPair = (md?.tokenPair as string) ?? address;
        return tokenPair.toLowerCase().includes(lowerQuery);
      }

      return true;
    });

    // TODO: implement sorting if needed (sortBy)
    return filtered;
  }, [allPools, metadataMap, activeFilter, searchQuery, sortBy]);

  const paginatedPools = useMemo(
    () =>
      filteredPools.slice((currentPage - 1) * perPage, currentPage * perPage),
    [filteredPools, currentPage, perPage]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredPools.length / perPage)),
    [filteredPools, perPage]
  );

  // Reset page when filters change
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
        // treat unknown as active by default
        active++;
      }
    }

    return {
      all: allPools.length,
      active,
      expired,
    };
  }, [allPools, metadataMap]);

  // Pagination helpers (unchanged)
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
            <p className="text-gray-700 text-lg">
              {filteredPools.length} of {allPools?.length || 0}{" "}
              {allPools?.length === 1 ? "pool" : "pools"}
              {activeFilter !== "all" && ` (${activeFilter})`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/try-contracts/factory")}
              className="px-4 py-2 bg-[#BAD8B6] text-black font-semibold rounded-lg shadow-sm hover:bg-[#a7c8a3] transition-all duration-200"
            >
              CREATE PREDICTION +
            </Button>

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

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prediction pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#BAD8B6] focus:border-[#BAD8B6] outline-none transition-all duration-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
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
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeFilter === key
                      ? "bg-[#BAD8B6] text-black shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invisible metadata loaders to populate metadataMap */}
        <div className="sr-only" aria-hidden>
          {allPools?.map((addr) => (
            <MetadataLoader
              key={addr}
              address={addr}
              onUpdate={handleMetadataUpdate}
            />
          ))}
        </div>

        {/* Content */}
        {!filteredPools.length ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
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
              <p className="text-gray-700 mb-8 text-lg">
                {searchQuery || activeFilter !== "all"
                  ? "Try adjusting your search or filters to find more pools."
                  : "Get started by creating the first prediction pool."}
              </p>
              {!searchQuery && activeFilter === "all" && (
                <button
                  onClick={() => router.push("/try-contracts/factory")}
                  className="inline-flex items-center px-6 py-3 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-all duration-200 shadow-sm"
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
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-3"
              }
            >
              {paginatedPools.map((address) => (
                <PoolCard
                  key={address}
                  address={address as `0x${string}`}
                  viewMode={viewMode}
                  preloadedMetadata={metadataMap[address]}
                />
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Info */}
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * perPage + 1} to{" "}
                    {Math.min(currentPage * perPage, filteredPools.length)} of{" "}
                    {filteredPools.length} results
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      First
                    </button>

                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
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
                          className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                            currentPage === page
                              ? "bg-black text-white shadow-sm"
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
                      className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
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
