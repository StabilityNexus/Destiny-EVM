import { useReadContract, useWriteContract, useAccount } from "wagmi";
import abi from "@/lib/contracts/abi/PredictionPool.json" assert { type: "json" };
import { config } from "@/lib/walletConfig";
import { parseEther } from "viem/utils";

// Read-only hooks
export function usePoolMetadata(address: `0x${string}`) {
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

  const { data: creatorFee } = useReadContract({
    abi,
    address,
    functionName: "creatorFee",
  });

  return {
    metadata:
      tokenPair && targetPrice && expiry && creatorFee
        ? { tokenPair, targetPrice, expiry, creatorFee }
        : null,
  };
}

export function useGetUserShares(address: `0x${string}`, user: string) {
  const { data: bullShares } = useReadContract({
    abi,
    address,
    functionName: "bullShares",
    args: [user],
  });

  const { data: bearShares } = useReadContract({
    abi,
    address,
    functionName: "bearShares",
    args: [user],
  });

  return { bullShares, bearShares };
}

// Write functions
export function usePoolWrites(poolAddress: `0x${string}`) {
  const { writeContractAsync } = useWriteContract();
  const { address: user } = useAccount();

  const mint = async (side: "BULL" | "BEAR", amountEth: string) => {
    const sideEnum = side === "BULL" ? 0 : 1;
    const value = parseEther(amountEth); // ETH to wei

    return await writeContractAsync({
      address: poolAddress,
      abi,
      functionName: "mint",
      args: [sideEnum],
      value,
    });
  };

  const burn = async (side: "BULL" | "BEAR", amountEth: string) => {
    const sideEnum = side === "BULL" ? 0 : 1;
    const amount = parseEther(amountEth);
    return await writeContractAsync({
      address: poolAddress,
      abi,
      functionName: "burn",
      args: [sideEnum, amount],
    });
  };

  const takeSnapshot = async () => {
    return await writeContractAsync({
      address: poolAddress,
      abi,
      functionName: "takeSnapshot",
    });
  };

  const claim = async () => {
    return await writeContractAsync({
      address: poolAddress,
      abi,
      functionName: "claim",
    });
  };

  const withdrawCreatorFee = async () => {
    return await writeContractAsync({
      address: poolAddress,
      abi,
      functionName: "withdrawCreatorFee",
    });
  };

  return {
    mint,
    burn,
    takeSnapshot,
    claim,
    withdrawCreatorFee,
  };
}
