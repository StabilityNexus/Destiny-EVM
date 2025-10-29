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

/**
 * Provide a function to create a new prediction pool on the factory contract with initial ETH liquidity.
 *
 * @returns A function that, when called, creates a prediction pool and returns the resulting transaction response.
 *
 * @param tokenPair - Token pair identifier (e.g., "ETH/USD")
 * @param targetPrice - Target price expressed in the price feed's decimals
 * @param expiry - Unix timestamp when the pool expires
 * @param rampStart - Unix timestamp when fee ramping begins
 * @param creatorFee - Creator fee in basis points (maximum 1000)
 * @param initialLiquidityEth - Initial liquidity to send in ETH (string form, minimum "0.0001")
 */
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

/**
 * Fetches a page of pool addresses from the factory contract.
 *
 * @param offset - Starting index for pagination (defaults to `0`)
 * @param limit - Maximum number of pool addresses to return (defaults to `50`)
 * @returns An object containing:
 * - `allPools`: an array of pool addresses (`0x...`) or `undefined` if not loaded
 * - `isLoading`: `true` while the query is in progress, `false` otherwise
 * - `refetch`: a function to re-run the query and refresh results
 */
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

/**
 * Retrieve the total number of prediction pools from the factory contract.
 *
 * @returns An object containing:
 * - `totalPools`: the total number of pools as a `bigint`, or `undefined` if not yet loaded
 * - `isLoading`: `true` while the on-chain query is in progress, `false` otherwise
 * - `refetch`: a function to re-run the on-chain query
 */
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

/**
 * Retrieve prediction pools created by a given address with pagination.
 *
 * @param creator - The creator's 0x-prefixed Ethereum address
 * @param offset - Starting index for pagination (defaults to 0)
 * @param limit - Maximum number of pool addresses to return (defaults to 50)
 * @returns An object containing `pools` (an array of pool addresses or `undefined`), `isLoading` (loading state), and `refetch` (function to re-fetch the data)
 */
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

/**
 * Retrieve the number of prediction pools created by a specific address.
 *
 * @param creator - The creator's Ethereum address (0x-prefixed) to query
 * @returns An object containing:
 *  - `count`: the number of pools created by `creator` as a `bigint`, or `undefined` if not loaded
 *  - `isLoading`: `true` while the query is in progress, otherwise `false`
 *  - `refetch`: a function to re-run the underlying contract read
 */
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

/**
 * Retrieve the price feed contract address for a given token pair from the factory contract.
 *
 * @param tokenPair - The token pair identifier used by the factory (for example `"ETH/USDC"`)
 * @returns An object with:
 *  - `feedAddress`: the price feed address for `tokenPair`, or `undefined` if not set
 *  - `isLoading`: `true` while the on-chain read is in progress, `false` otherwise
 *  - `refetch`: a function to re-run the read and update the returned values
 */
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

/**
 * Set the price feed contract address for a given token pair on the factory contract (owner only).
 *
 * @param tokenPair - Identifier of the token pair whose price feed will be set
 * @param feedAddress - The price feed contract address (0x-prefixed)
 * @returns The transaction response returned by the contract write call
 */
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

/**
 * Retrieve the owner address of the prediction factory and expose loading and refetch controls.
 *
 * @returns An object containing:
 * - `owner`: the owner's address as a `0x`-prefixed string, or `undefined` if not available
 * - `isLoading`: `true` while the owner address is being fetched, `false` otherwise
 * - `refetch`: a function that re-runs the owner query
 */
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

/**
 * Determine whether a given address is registered as a prediction pool.
 *
 * @param poolAddress - The 0x-prefixed address to check
 * @returns An object containing:
 *  - `isPool`: `true` if the address is a registered pool, `false` otherwise; may be `undefined` while loading
 *  - `isLoading`: `true` while the check is in progress
 *  - `refetch`: function to re-run the check
 */
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

/**
 * Retrieve the factory's minimum initial liquidity requirement and expose loading and refetch controls.
 *
 * @returns An object containing:
 *  - `minLiquidity` — the minimum initial liquidity required (as a `bigint`) or `undefined` if not loaded.
 *  - `isLoading` — `true` while the value is being fetched, `false` otherwise.
 *  - `refetch` — a function to re-run the underlying contract read.
 */
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