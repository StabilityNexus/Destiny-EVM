import { useChainId, useReadContract, useWriteContract } from "wagmi";
import PredictionFactoryAbi from "@/lib/contracts/abi/PredictionFactory.json" assert { type: "json" };
import { FACTORY_ADDRESSES } from "../contracts/addresses";

// ✅ Helper to safely get address or throw
function useFactoryAddress(): `0x${string}` {
  const chainId = useChainId();
  console.log("Current chainId:", chainId);
  if (!chainId) {
    throw new Error("Chain ID is undefined. Please ensure you are connected to a network.");
  }
  const factoryAddress = FACTORY_ADDRESSES[chainId];
  if (!factoryAddress) {
    throw new Error(`Unsupported network: ${chainId}. Please switch to a supported network.`);
  }
  return factoryAddress;
}

// 1. Create a new prediction pool
export function useCreatePredictionPool() {
  const { writeContractAsync } = useWriteContract();
  const factoryAddress = useFactoryAddress();

  return async (
    tokenPair: string,
    targetPrice: bigint,
    expiry: bigint,
    creatorFee: bigint
  ) => {
    return await writeContractAsync({
      address: factoryAddress,
      abi: PredictionFactoryAbi,
      functionName: "createPredictionPool",
      args: [tokenPair, targetPrice, expiry, creatorFee],
    });
  };
}

// 2. Get all pools created on the platform
export function useAllPools() {
  const factoryAddress = useFactoryAddress();
  const { data, isLoading } = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getAllPools",
  });

  return { allPools: data as `0x${string}`[] | undefined, isLoading };
}

// 3. Get pools created by a specific wallet
export function useGetPoolsByCreator(creator: `0x${string}`) {
  const factoryAddress = useFactoryAddress();
  const { data, isLoading } = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getPoolsByCreator",
    args: [creator],
  });

  return { pools: data as string[] | undefined, isLoading };
}

// 4. Get the price feed address for a token pair
export function useGetPriceFeed(tokenPair: string) {
  const factoryAddress = useFactoryAddress();
  const { data, isLoading } = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getPriceFeed",
    args: [tokenPair],
  });

  return { feedAddress: data as `0x${string}` | undefined, isLoading };
}

// 5. Set the price feed for a token pair (OWNER only)
export function useSetPriceFeed() {
  const { writeContractAsync } = useWriteContract();
  const factoryAddress = useFactoryAddress();

  return {
    setPriceFeed: async (tokenPair: string, feedAddress: `0x${string}`) => {
      return await writeContractAsync({
        address: factoryAddress,
        abi: PredictionFactoryAbi,
        functionName: "setPriceFeed",
        args: [tokenPair, feedAddress],
      });
    },
  };
}
