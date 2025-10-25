import { useReadContract, useWriteContract, useAccount } from "wagmi";
import abi from "@/lib/contracts/abi/PredictionPool.json" assert { type: "json" };
import { parseEther } from "viem/utils";

// ========== READ HOOKS ==========

export function usePoolMetadata(address?: `0x${string}`) {
  const enabled = !!address && address.startsWith("0x");

  const { data: tokenPair } = useReadContract({
    abi,
    address,
    functionName: "tokenPair",
  });

  const { data: targetPrice } = useReadContract({
    abi,
    address,
    functionName: "targetPrice",
  });

  const { data: expiry } = useReadContract({
    abi,
    address,
    functionName: "expiry",
  });

  const { data: rampStart } = useReadContract({
    abi,
    address,
    functionName: "rampStart",
  });

  const { data: creatorFee } = useReadContract({
    abi,
    address,
    functionName: "creatorFee",
  });

  const { data: snapshotPrice } = useReadContract({
    abi,
    address,
    functionName: "snapshotPrice",
  });

  const { data: snapshotTaken } = useReadContract({
    abi,
    address,
    functionName: "snapshotTaken",
  });

  const { data: latestPrice } = useReadContract({
    abi,
    address,
    functionName: "getLatestPrice",
  });

  const { data: currentFee } = useReadContract({
    abi,
    address,
    functionName: "fee",
  });

  // NEW: Pool initialization status
  const { data: initialized } = useReadContract({
    abi,
    address,
    functionName: "initialized",
  });

  return {
    metadata:
      tokenPair &&
        targetPrice &&
        expiry &&
        rampStart &&
        creatorFee &&
        latestPrice
        ? {
          tokenPair,
          targetPrice,
          expiry,
          rampStart,
          creatorFee,
          latestPrice,
          currentFee,
          snapshotPrice,
          snapshotTaken,
          initialized, // NEW
        }
        : null,
  };
}

// ========== USER SHARES (No changes) ==========

export function useGetUserShares(address?: `0x${string}`, user?: string) {
  const enabled = !!address && !!user;

  const { data: bullShares } = useReadContract({
    abi,
    address,
    functionName: "bullShares",
    args: user ? [user] : undefined,
  });

  const { data: bearShares } = useReadContract({
    abi,
    address,
    functionName: "bearShares",
    args: user ? [user] : undefined,
  });

  return {
    bullShares: (bullShares as bigint) || BigInt(0),
    bearShares: (bearShares as bigint) || BigInt(0),
  };
}

// ========== NEW: PRICE HOOKS (FATE MODEL) ==========

/**
 * Get current buy/sell prices for BULL and BEAR tokens
 */
export function useTokenPrices(address?: `0x${string}`) {
  const { data: priceBuyBull } = useReadContract({
    abi,
    address,
    functionName: "priceBuyBull",
  });

  const { data: priceBuyBear } = useReadContract({
    abi,
    address,
    functionName: "priceBuyBear",
  });

  const { data: priceSellBull } = useReadContract({
    abi,
    address,
    functionName: "priceSellBull",
  });

  const { data: priceSellBear } = useReadContract({
    abi,
    address,
    functionName: "priceSellBear",
  });

  return {
    priceBuyBull: (priceBuyBull as bigint) || BigInt(0),
    priceBuyBear: (priceBuyBear as bigint) || BigInt(0),
    priceSellBull: (priceSellBull as bigint) || BigInt(0),
    priceSellBear: (priceSellBear as bigint) || BigInt(0),
  };
}

// ========== NEW: POOL STATE HOOK ==========

/**
 * Get comprehensive pool state in a single call
 */
export function usePoolState(address?: `0x${string}`) {
  const { data, isLoading } = useReadContract({
    abi,
    address,
    functionName: "getPoolState",
  });

  if (!data) {
    return {
      state: null,
      isLoading,
    };
  }

  const [bullReserve, bearReserve, bullPrice, bearPrice, currentFee, tvl] =
    data as [bigint, bigint, bigint, bigint, bigint, bigint];

  return {
    state: {
      bullReserve,
      bearReserve,
      bullPrice,
      bearPrice,
      currentFee,
      tvl,
    },
    isLoading,
  };
}

// ========== NEW: USER POSITION HOOK ==========

/**
 * Get user's position value and shares for a specific side
 */
export function useUserPosition(
  address?: `0x${string}`,
  user?: string,
  side?: "BULL" | "BEAR"
) {
  const sideEnum = side === "BULL" ? 0 : 1;

  const { data } = useReadContract({
    abi,
    address,
    functionName: "getUserPosition",
    args: user && side ? [user, sideEnum] : undefined,
  });

  if (!data) {
    return {
      shares: BigInt(0),
      value: BigInt(0),
    };
  }

  const [shares, value] = data as [bigint, bigint];

  return { shares, value };
}

// ========== NEW: TVL HOOK ==========

export function usePoolTVL(address?: `0x${string}`) {
  const { data: tvl } = useReadContract({
    abi,
    address,
    functionName: "getTVL",
  });

  return {
    tvl: (tvl as bigint) || BigInt(0),
  };
}

// ========== WRITE FUNCTIONS (UPDATED) ==========

export function usePoolWrites(poolAddress?: `0x${string}`) {
  const { writeContractAsync } = useWriteContract();
  const { address: user } = useAccount();
  const enabled = !!poolAddress;

  /**
   * Mint shares (place bet)
   * @param side "BULL" or "BEAR"
   * @param amountEth Amount of ETH to send
   */
  const mint = async (side: "BULL" | "BEAR", amountEth: string) => {
    if (!enabled) throw new Error("No pool address provided");
    const sideEnum = side === "BULL" ? 0 : 1;
    const value = parseEther(amountEth);

    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "mint",
      args: [sideEnum],
      value,
    });
  };

  /**
   * Burn shares (withdraw before expiry)
   * @param side "BULL" or "BEAR"
   * @param shares Number of shares to burn (not ETH amount!)
   */
  const burn = async (side: "BULL" | "BEAR", shares: bigint) => {
    if (!enabled) throw new Error("No pool address provided");
    const sideEnum = side === "BULL" ? 0 : 1;

    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "burn",
      args: [sideEnum, shares], // Changed: now expects shares (bigint), not ETH amount
    });
  };

  /**
   * Take snapshot of oracle price (after expiry)
   */
  const takeSnapshot = async () => {
    if (!enabled) throw new Error("No pool address provided");
    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "takeSnapshot",
    });
  };

  /**
   * Claim BULL rewards (for winners)
   * UPDATED: Now uses claimBull() instead of claim()
   */
  const claimBull = async () => {
    if (!enabled) throw new Error("No pool address provided");
    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "claimBull", // CHANGED: was "claim"
    });
  };

  /**
   * Claim BEAR rewards (for winners)
   * NEW: Separate function for BEAR side
   */
  const claimBear = async () => {
    if (!enabled) throw new Error("No pool address provided");
    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "claimBear", // NEW
    });
  };

  // REMOVED: withdrawCreatorFee (fees now auto-distributed in takeSnapshot)

  return {
    mint,
    burn,
    takeSnapshot,
    claimBull,  // CHANGED: was "claim"
    claimBear   // NEW
  };
}
