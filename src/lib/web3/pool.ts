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
        }
        : null,
  };
}

// ========== USER SHARES ==========

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
    bullShares: bullShares as bigint || BigInt(0),
    bearShares: bearShares as bigint || BigInt(0)
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

  const burn = async (side: "BULL" | "BEAR", amountEth: string) => {
    if (!enabled) throw new Error("No pool address provided");
    const sideEnum = side === "BULL" ? 0 : 1;
    const amount = parseEther(amountEth);

    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "burn",
      args: [sideEnum, amount],
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

  const claim = async () => {
    if (!enabled) throw new Error("No pool address provided");
    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "claim",
    });
  };

  const withdrawCreatorFee = async () => {
    if (!enabled) throw new Error("No pool address provided");
    return await writeContractAsync({
      address: poolAddress!,
      abi,
      functionName: "withdrawCreatorFee",
    });
  };

  return { mint, burn, takeSnapshot, claim, withdrawCreatorFee };
}

