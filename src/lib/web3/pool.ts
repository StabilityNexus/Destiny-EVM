import { useReadContract, useWriteContract, useAccount } from "wagmi";
import abi from "@/lib/contracts/abi/PredictionPool.json" assert { type: "json" };
import { parseEther } from "viem/utils";

/**
 * Reads on-chain pool metadata for the given pool address.
 *
 * @param address - Optional pool contract address; must be a hex string starting with `0x`. If not provided or invalid, `metadata` will be `null`.
 * @returns An object containing:
 * - `metadata`: an object with pool values (`tokenPair`, `targetPrice`, `expiry`, `rampStart`, `creatorFee`, `latestPrice`, `currentFee`, `snapshotPrice`, `snapshotTaken`, `initialized`, `creator`, `protocolFeeRecipient`, `createdAt`) when required fields are available, or `null` otherwise.
 * - `refetch`: a function that refreshes the underlying on-chain queries used to build `metadata`.
 */

export function usePoolMetadata(address?: `0x${string}`) {
  const enabled = !!address && address.startsWith("0x");

  const tokenPairQuery = useReadContract({
    abi,
    address,
    functionName: "tokenPair",
  });

  const targetPriceQuery = useReadContract({
    abi,
    address,
    functionName: "targetPrice",
  });

  const expiryQuery = useReadContract({
    abi,
    address,
    functionName: "expiry",
  });

  const rampStartQuery = useReadContract({
    abi,
    address,
    functionName: "rampStart",
  });

  const creatorFeeQuery = useReadContract({
    abi,
    address,
    functionName: "creatorFee",
  });

  const snapshotPriceQuery = useReadContract({
    abi,
    address,
    functionName: "snapshotPrice",
  });

  const snapshotTakenQuery = useReadContract({
    abi,
    address,
    functionName: "snapshotTaken",
  });

  const latestPriceQuery = useReadContract({
    abi,
    address,
    functionName: "getLatestPrice",
  });

  const currentFeeQuery = useReadContract({
    abi,
    address,
    functionName: "fee",
  });

  const initializedQuery = useReadContract({
    abi,
    address,
    functionName: "initialized",
  });

  const creatorQuery = useReadContract({
    abi,
    address,
    functionName: "creator",
  });

  const protocolFeeRecipientQuery = useReadContract({
    abi,
    address,
    functionName: "protocolFeeRecipient",
  });

  const createdAtQuery = useReadContract({
    abi,
    address,
    functionName: "createdAt",
  });

  return {
    metadata:
      tokenPairQuery.data &&
        targetPriceQuery.data &&
        expiryQuery.data &&
        rampStartQuery.data &&
        creatorFeeQuery.data &&
        latestPriceQuery.data
        ? {
          tokenPair: tokenPairQuery.data,
          targetPrice: targetPriceQuery.data,
          expiry: expiryQuery.data,
          rampStart: rampStartQuery.data,
          creatorFee: creatorFeeQuery.data,
          latestPrice: latestPriceQuery.data,
          currentFee: currentFeeQuery.data,
          snapshotPrice: snapshotPriceQuery.data,
          snapshotTaken: snapshotTakenQuery.data,
          initialized: initializedQuery.data,
          creator: creatorQuery.data as `0x${string}` | undefined,
          protocolFeeRecipient: protocolFeeRecipientQuery.data as `0x${string}` | undefined,
          createdAt: createdAtQuery.data,
        }
        : null,
    refetch: async () => {
      await tokenPairQuery.refetch();
      await targetPriceQuery.refetch();
      await expiryQuery.refetch();
      await snapshotPriceQuery.refetch();
      await snapshotTakenQuery.refetch();
      await latestPriceQuery.refetch();
      await currentFeeQuery.refetch();
      await creatorQuery.refetch();
    },
  };
}

/**
 * Reads a user's bull and bear share balances from the specified pool contract.
 *
 * @returns An object with:
 * - `bullShares`: the user's bull share balance as a `bigint` (defaults to `0n` if unavailable),
 * - `bearShares`: the user's bear share balance as a `bigint` (defaults to `0n` if unavailable),
 * - `refetch`: a function that refetches both share queries.
 */

export function useGetUserShares(address?: `0x${string}`, user?: string) {
  const enabled = !!address && !!user;

  const bullSharesQuery = useReadContract({
    abi,
    address,
    functionName: "bullShares",
    args: user ? [user] : undefined,
  });

  const bearSharesQuery = useReadContract({
    abi,
    address,
    functionName: "bearShares",
    args: user ? [user] : undefined,
  });

  return {
    bullShares: (bullSharesQuery.data as bigint) || BigInt(0),
    bearShares: (bearSharesQuery.data as bigint) || BigInt(0),
    refetch: async () => {
      await bullSharesQuery.refetch();
      await bearSharesQuery.refetch();
    },
  };
}

/**
 * Reads and exposes the pool's total bull and bear shares and a refetch helper.
 *
 * @param address - Optional pool contract address (hex string starting with `0x`)
 * @returns An object with:
 *  - `totalBullShares`: the total bull shares as a `bigint` (defaults to `0n`),
 *  - `totalBearShares`: the total bear shares as a `bigint` (defaults to `0n`),
 *  - `refetch`: an async function that refreshes both total shares queries
 */

export function useTotalShares(address?: `0x${string}`) {
  const totalBullSharesQuery = useReadContract({
    abi,
    address,
    functionName: "totalBullShares",
  });

  const totalBearSharesQuery = useReadContract({
    abi,
    address,
    functionName: "totalBearShares",
  });

  return {
    totalBullShares: (totalBullSharesQuery.data as bigint) || BigInt(0),
    totalBearShares: (totalBearSharesQuery.data as bigint) || BigInt(0),
    refetch: async () => {
      await totalBullSharesQuery.refetch();
      await totalBearSharesQuery.refetch();
    },
  };
}

/**
 * Reads current buy and sell prices for bull and bear positions from a pool contract.
 *
 * @param address - Optional pool contract address (0x-prefixed). When omitted, returned prices are zero.
 * @returns An object containing:
 *   - `priceBuyBull`: The current buy price for bull positions as a `bigint`.
 *   - `priceBuyBear`: The current buy price for bear positions as a `bigint`.
 *   - `priceSellBull`: The current sell price for bull positions as a `bigint`.
 *   - `priceSellBear`: The current sell price for bear positions as a `bigint`.
 *   - `refetch`: A function that refetches all four price queries.
 */

export function useTokenPrices(address?: `0x${string}`) {
  const priceBuyBullQuery = useReadContract({
    abi,
    address,
    functionName: "priceBuyBull",
  });

  const priceBuyBearQuery = useReadContract({
    abi,
    address,
    functionName: "priceBuyBear",
  });

  const priceSellBullQuery = useReadContract({
    abi,
    address,
    functionName: "priceSellBull",
  });

  const priceSellBearQuery = useReadContract({
    abi,
    address,
    functionName: "priceSellBear",
  });

  return {
    priceBuyBull: (priceBuyBullQuery.data as bigint) || BigInt(0),
    priceBuyBear: (priceBuyBearQuery.data as bigint) || BigInt(0),
    priceSellBull: (priceSellBullQuery.data as bigint) || BigInt(0),
    priceSellBear: (priceSellBearQuery.data as bigint) || BigInt(0),
    refetch: async () => {
      await priceBuyBullQuery.refetch();
      await priceBuyBearQuery.refetch();
      await priceSellBullQuery.refetch();
      await priceSellBearQuery.refetch();
    },
  };
}

/**
 * Reads the on-chain pool state for the given pool contract address.
 *
 * @param address - Optional pool contract address (expected to be a hex `0x...` string). If omitted or invalid, no data will be available.
 * @returns An object with:
 *  - `state`: `null` when no data is available, otherwise an object containing `bullReserve`, `bearReserve`, `bullPrice`, `bearPrice`, `currentFee`, and `tvl` (all `bigint`).
 *  - `isLoading`: `boolean` indicating whether the underlying query is still loading.
 *  - `refetch`: function to re-run the underlying read query.
 */

export function usePoolState(address?: `0x${string}`) {
  const poolStateQuery = useReadContract({
    abi,
    address,
    functionName: "getPoolState",
  });

  if (!poolStateQuery.data) {
    return {
      state: null,
      isLoading: poolStateQuery.isLoading,
      refetch: poolStateQuery.refetch,
    };
  }

  const [bullReserve, bearReserve, bullPrice, bearPrice, currentFee, tvl] =
    poolStateQuery.data as [bigint, bigint, bigint, bigint, bigint, bigint];

  return {
    state: {
      bullReserve,
      bearReserve,
      bullPrice,
      bearPrice,
      currentFee,
      tvl,
    },
    isLoading: poolStateQuery.isLoading,
    refetch: poolStateQuery.refetch,
  };
}

/**
 * Reads a user's position for the specified pool and side, exposing the position's shares, value, and a refetch function.
 *
 * @param address - The pool contract address (0x-prefixed)
 * @param user - The user's address whose position to read
 * @param side - "BULL" or "BEAR" indicating which side's position to read
 * @returns An object with `shares` (bigint), `value` (bigint), and `refetch` (function) — `shares` and `value` are `0n` when no position data is available
 */

export function useUserPosition(
  address?: `0x${string}`,
  user?: string,
  side?: "BULL" | "BEAR"
) {
  const sideEnum = side === "BULL" ? 0 : 1;

  const positionQuery = useReadContract({
    abi,
    address,
    functionName: "getUserPosition",
    args: user && side ? [user, sideEnum] : undefined,
  });

  if (!positionQuery.data) {
    return {
      shares: BigInt(0),
      value: BigInt(0),
      refetch: positionQuery.refetch,
    };
  }

  const [shares, value] = positionQuery.data as [bigint, bigint];

  return { shares, value, refetch: positionQuery.refetch };
}

/**
 * Reads the pool's total value locked (TVL) from the contract.
 *
 * @returns An object containing `tvl` — the pool's TVL as a `bigint` (0 if not available) — and `refetch` — a function to reload the TVL query.
 */

export function usePoolTVL(address?: `0x${string}`) {
  const tvlQuery = useReadContract({
    abi,
    address,
    functionName: "getTVL",
  });

  return {
    tvl: (tvlQuery.data as bigint) || BigInt(0),
    refetch: tvlQuery.refetch,
  };
}

/**
 * Provides write actions for a PredictionPool contract at the specified address.
 *
 * @param poolAddress - The pool contract address (0x-prefixed). If omitted, calling any action will throw.
 * @returns An object with write methods:
 *  - `mint(side, amountEth)` — mints position tokens for `side` ("BULL" | "BEAR") by sending `amountEth` (in ether) as value; returns the transaction result.
 *  - `burn(side, shares)` — burns `shares` for `side` and returns the transaction result.
 *  - `takeSnapshot()` — invokes the pool's snapshot function and returns the transaction result.
 *  - `claimBull()` — claims bull-side winnings and returns the transaction result.
 *  - `claimBear()` — claims bear-side winnings and returns the transaction result.
 * @throws Error - Throws `Error("No pool address provided")` if a method is invoked when `poolAddress` is not supplied.
 */

export function usePoolWrites(poolAddress?: `0x${string}`) {
  const { writeContractAsync } = useWriteContract();
  const { address: user } = useAccount();
  const enabled = !!poolAddress;

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

  const burn = async (side: "BULL" | "BEAR", shares: bigint) => {
    if (!enabled) throw new Error("No pool address provided");
    const sideEnum = side === "BULL" ? 0 : 1;

    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "burn",
      args: [sideEnum, shares],
    });
  };

  const takeSnapshot = async () => {
    if (!enabled) throw new Error("No pool address provided");
    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "takeSnapshot",
    });
  };

  const claimBull = async () => {
    if (!enabled) throw new Error("No pool address provided");
    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "claimBull",
    });
  };

  const claimBear = async () => {
    if (!enabled) throw new Error("No pool address provided");
    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "claimBear",
    });
  };

  return {
    mint,
    burn,
    takeSnapshot,
    claimBull,
    claimBear,
  };
}