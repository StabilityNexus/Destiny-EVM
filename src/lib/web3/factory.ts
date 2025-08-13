import { useReadContract, useWriteContract } from "wagmi";
import { sepolia } from "viem/chains";
import PredictionFactoryAbi from "@/lib/contracts/abi/PredictionFactory.json" assert { type: "json" };
// import { CONTRACT_ADDRESSES } from "../contracts/addresses";

export const FACTORY_ADDRESS = "0x27F0445e9A28eeF757d132f5257dd994Ff06fB54" as const;

// 1. Create a new prediction pool
export function useCreatePredictionPool() {
  const { writeContractAsync } = useWriteContract();
  return async (
    tokenPair: string,
    targetPrice: bigint,
    expiry: bigint,
    creatorFee: bigint
  ) => {
    return await writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: PredictionFactoryAbi,
      functionName: "createPredictionPool",
      args: [tokenPair, targetPrice, expiry, creatorFee],
    });
  };
}

// 2. Get all pools created on the platform
export function useAllPools() {
  const { data, isLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: PredictionFactoryAbi,
    functionName: "getAllPools",
  });
  return { allPools: data as `0x${string}`[] | undefined, isLoading };
}

// 3. Get pools created by a specific wallet
export function useGetPoolsByCreator(creator: `0x${string}`) {
  const { data, isLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: PredictionFactoryAbi,
    functionName: "getPoolsByCreator",
    args: [creator],
  });
  return { pools: data as string[] | undefined, isLoading };
}

// 4. Get the price feed address for a token pair
export function useGetPriceFeed(tokenPair: string) {
  const { data, isLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: PredictionFactoryAbi,
    functionName: "getPriceFeed",
    args: [tokenPair],
  });

  return {
    feedAddress: data as `0x${string}` | undefined,
    isLoading,
  };
}

// 5. Set the price feed for a token pair (OWNER only)
export function useSetPriceFeed() {
  const { writeContractAsync } = useWriteContract();

  return {
    setPriceFeed: async (tokenPair: string, feedAddress: `0x${string}`) => {
      return await writeContractAsync({
        address: FACTORY_ADDRESS,
        abi: PredictionFactoryAbi,
        functionName: "setPriceFeed",
        args: [tokenPair, feedAddress],
      });
    },
  };
}
