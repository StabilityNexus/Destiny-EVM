import { useMemo } from "react";
import { useReadContract, useWriteContract, useAccount } from "wagmi";
import abi from "@/lib/contracts/abi/PredictionPool.json" assert { type: "json" };
import { parseEther } from "viem/utils";

// ========== READ HOOKS ==========

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

  const { data: tokenPair } = tokenPairQuery;
  const { data: targetPrice } = targetPriceQuery;
  const { data: expiry } = expiryQuery;
  const { data: rampStart } = rampStartQuery;
  const { data: creatorFee } = creatorFeeQuery;
  const { data: latestPrice } = latestPriceQuery;
  const { data: currentFee } = currentFeeQuery;
  const { data: snapshotPrice } = snapshotPriceQuery;
  const { data: snapshotTaken } = snapshotTakenQuery;
  const { data: initialized } = initializedQuery;
  const creator = creatorQuery.data as `0x${string}` | undefined;
  const protocolFeeRecipient = protocolFeeRecipientQuery.data as `0x${string}` | undefined;
  const { data: createdAt } = createdAtQuery;

  const metadata = useMemo(
    () => tokenPair && targetPrice && expiry && rampStart && creatorFee && latestPrice
      ? {
          tokenPair, targetPrice, expiry, rampStart, creatorFee, latestPrice,
          currentFee, snapshotPrice, snapshotTaken, initialized, creator,
          protocolFeeRecipient, createdAt,
        }
      : null,
    [
      tokenPair, targetPrice, expiry, rampStart, creatorFee, latestPrice,
      currentFee, snapshotPrice, snapshotTaken, initialized, creator,
      protocolFeeRecipient, createdAt,
    ]
  );

  return {
    metadata,
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

// ========== USER SHARES ==========

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

// ========== TOTAL SHARES (NEW) ==========

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

// ========== TOKEN PRICES ==========

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

// ========== POOL STATE ==========

export function usePoolState(address?: `0x${string}`) {
  const poolStateQuery = useReadContract({
    abi,
    address,
    functionName: "getPoolState",
  });

  const data = poolStateQuery.data as
    | readonly [bigint, bigint, bigint, bigint, bigint, bigint]
    | undefined;
  const state = useMemo(() => {
    if (!data) return null;
    const [bullReserve, bearReserve, bullPrice, bearPrice, currentFee, tvl] = data;
    return { bullReserve, bearReserve, bullPrice, bearPrice, currentFee, tvl };
  }, [data]);

  return {
    state,
    isLoading: poolStateQuery.isLoading,
    refetch: poolStateQuery.refetch,
  };
}

// ========== USER POSITION ==========

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

// ========== TVL ==========

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

// ========== WRITE FUNCTIONS ==========

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
