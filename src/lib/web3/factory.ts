import { useChainId, useReadContract, useWriteContract } from "wagmi";
import PredictionFactoryAbi from "@/lib/contracts/abi/PredictionFactory.json" assert { type: "json" };
import { FACTORY_ADDRESSES } from "../contracts/addresses";
import { parseEther } from "viem/utils";

// ---------- 🔹 Get correct factory address for the connected network ----------
function useFactoryAddress(): `0x${string}` {
  const chainId = useChainId();
  if (!chainId)
    throw new Error(
      "Chain ID is undefined. Please connect to a supported network."
    );

  const factoryAddress = FACTORY_ADDRESSES[chainId];
  if (!factoryAddress)
    throw new Error(
      `Unsupported network: ${chainId}. Please switch to a supported network.`
    );

  return factoryAddress;
}

// ---------- 🔹 1. Create a new prediction pool (UPDATED: Now payable) ----------
export function useCreatePredictionPool() {
  const { writeContractAsync } = useWriteContract();
  const factoryAddress = useFactoryAddress();

  /**
   * Create a prediction pool with initial liquidity
   * @param tokenPair e.g., "ETH/USD"
   * @param targetPrice Target price in feed decimals
   * @param expiry Unix timestamp of expiry
   * @param rampStart Unix timestamp when fee ramping begins
   * @param creatorFee Creator fee in basis points (max 1000)
   * @param initialLiquidityEth Initial liquidity in ETH (min 0.0001 ETH)
   */
  return async (
    tokenPair: string,
    targetPrice: bigint,
    expiry: bigint,
    rampStart: bigint,
    creatorFee: bigint,
    initialLiquidityEth: string
  ) => {
    const value = parseEther(initialLiquidityEth);

    return await writeContractAsync({
      address: factoryAddress,
      abi: PredictionFactoryAbi,
      functionName: "createPredictionPool",
      args: [tokenPair, targetPrice, expiry, rampStart, creatorFee],
      value,
    });
  };
}

// ---------- 🔹 2. Get all pools (paginated) - UPDATED with refetch ----------
export function useAllPools(
  offset: bigint = BigInt(0),
  limit: bigint = BigInt(50)
) {
  const factoryAddress = useFactoryAddress();
  const poolsQuery = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getAllPools",
    args: [offset, limit],
  });

  return {
    allPools: poolsQuery.data as `0x${string}`[] | undefined,
    isLoading: poolsQuery.isLoading,
    refetch: poolsQuery.refetch,
  };
}

// ---------- 🔹 3. Get total number of pools - UPDATED with refetch ----------
export function useAllPoolsCount() {
  const factoryAddress = useFactoryAddress();
  const countQuery = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getAllPoolsCount",
  });

  return {
    totalPools: countQuery.data as bigint | undefined,
    isLoading: countQuery.isLoading,
    refetch: countQuery.refetch,
  };
}

// ---------- 🔹 4. Get pools created by a specific creator (paginated) - UPDATED with refetch ----------
export function useGetPoolsByCreator(
  creator: `0x${string}`,
  offset: bigint = BigInt(0),
  limit: bigint = BigInt(50)
) {
  const factoryAddress = useFactoryAddress();
  const poolsQuery = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getPoolsByCreator",
    args: [creator, offset, limit],
  });

  return {
    pools: poolsQuery.data as `0x${string}`[] | undefined,
    isLoading: poolsQuery.isLoading,
    refetch: poolsQuery.refetch,
  };
}

// ---------- 🔹 5. Get number of pools by creator - UPDATED with refetch ----------
export function useGetPoolsByCreatorCount(creator: `0x${string}`) {
  const factoryAddress = useFactoryAddress();
  const countQuery = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getPoolsByCreatorCount",
    args: [creator],
  });

  return {
    count: countQuery.data as bigint | undefined,
    isLoading: countQuery.isLoading,
    refetch: countQuery.refetch,
  };
}

// ---------- 🔹 6. Get price feed for a given token pair - UPDATED with refetch ----------
export function useGetPriceFeed(tokenPair: string) {
  const factoryAddress = useFactoryAddress();
  const feedQuery = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getPriceFeed",
    args: [tokenPair],
  });

  return {
    feedAddress: feedQuery.data as `0x${string}` | undefined,
    isLoading: feedQuery.isLoading,
    refetch: feedQuery.refetch,
  };
}

// ---------- 🔹 7. Set price feed (OWNER only) - No changes ----------
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

// ---------- 🔹 8. Get owner of the factory - UPDATED with refetch ----------
export function useFactoryOwner() {
  const factoryAddress = useFactoryAddress();
  const ownerQuery = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "owner",
  });

  return {
    owner: ownerQuery.data as `0x${string}` | undefined,
    isLoading: ownerQuery.isLoading,
    refetch: ownerQuery.refetch,
  };
}

// ---------- 🔹 9. Check if an address is a valid pool - UPDATED with refetch ----------
export function useIsPool(poolAddress: `0x${string}`) {
  const factoryAddress = useFactoryAddress();
  const isPoolQuery = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "isPool",
    args: [poolAddress],
  });

  return {
    isPool: isPoolQuery.data as boolean | undefined,
    isLoading: isPoolQuery.isLoading,
    refetch: isPoolQuery.refetch,
  };
}

// ---------- 🔹 10. Get minimum initial liquidity required (NEW) - with refetch ----------
export function useMinInitialLiquidity() {
  const factoryAddress = useFactoryAddress();
  const minLiqQuery = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getMinInitialLiquidity",
  });

  return {
    minLiquidity: minLiqQuery.data as bigint | undefined,
    isLoading: minLiqQuery.isLoading,
    refetch: minLiqQuery.refetch,
  };
}
