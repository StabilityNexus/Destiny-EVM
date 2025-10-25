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
    initialLiquidityEth: string // NEW: Required initial liquidity
  ) => {
    const value = parseEther(initialLiquidityEth); // NEW

    return await writeContractAsync({
      address: factoryAddress,
      abi: PredictionFactoryAbi,
      functionName: "createPredictionPool",
      args: [tokenPair, targetPrice, expiry, rampStart, creatorFee],
      value, // NEW: Send ETH with transaction
    });
  };
}

// ---------- 🔹 2. Get all pools (paginated) - No changes ----------
export function useAllPools(
  offset: bigint = BigInt(0),
  limit: bigint = BigInt(50)
) {
  const factoryAddress = useFactoryAddress();
  const { data, isLoading } = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getAllPools",
    args: [offset, limit],
  });

  return {
    allPools: data as `0x${string}`[] | undefined,
    isLoading,
  };
}

// ---------- 🔹 3. Get total number of pools - No changes ----------
export function useAllPoolsCount() {
  const factoryAddress = useFactoryAddress();
  const { data, isLoading } = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getAllPoolsCount",
  });

  return {
    totalPools: data as bigint | undefined,
    isLoading,
  };
}

// ---------- 🔹 4. Get pools created by a specific creator (paginated) - No changes ----------
export function useGetPoolsByCreator(
  creator: `0x${string}`,
  offset: bigint = BigInt(0),
  limit: bigint = BigInt(50)
) {
  const factoryAddress = useFactoryAddress();
  const { data, isLoading } = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getPoolsByCreator",
    args: [creator, offset, limit],
  });

  return {
    pools: data as `0x${string}`[] | undefined,
    isLoading,
  };
}

// ---------- 🔹 5. Get number of pools by creator - No changes ----------
export function useGetPoolsByCreatorCount(creator: `0x${string}`) {
  const factoryAddress = useFactoryAddress();
  const { data, isLoading } = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getPoolsByCreatorCount",
    args: [creator],
  });

  return {
    count: data as bigint | undefined,
    isLoading,
  };
}

// ---------- 🔹 6. Get price feed for a given token pair - No changes ----------
export function useGetPriceFeed(tokenPair: string) {
  const factoryAddress = useFactoryAddress();
  const { data, isLoading } = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getPriceFeed",
    args: [tokenPair],
  });

  return {
    feedAddress: data as `0x${string}` | undefined,
    isLoading,
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

// ---------- 🔹 8. Get owner of the factory - No changes ----------
export function useFactoryOwner() {
  const factoryAddress = useFactoryAddress();
  const { data, isLoading } = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "owner",
  });

  return {
    owner: data as `0x${string}` | undefined,
    isLoading,
  };
}

// ---------- 🔹 9. Check if an address is a valid pool - No changes ----------
export function useIsPool(poolAddress: `0x${string}`) {
  const factoryAddress = useFactoryAddress();
  const { data, isLoading } = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "isPool",
    args: [poolAddress],
  });

  return {
    isPool: data as boolean | undefined,
    isLoading,
  };
}

// ---------- 🔹 10. Get minimum initial liquidity required (NEW) ----------
export function useMinInitialLiquidity() {
  const factoryAddress = useFactoryAddress();
  const { data, isLoading } = useReadContract({
    address: factoryAddress,
    abi: PredictionFactoryAbi,
    functionName: "getMinInitialLiquidity",
  });

  return {
    minLiquidity: data as bigint | undefined,
    isLoading,
  };
}
