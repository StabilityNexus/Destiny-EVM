import { useReadContract, useWriteContract } from "wagmi";
import { sepolia } from "viem/chains";
import PredictionFactoryAbi from "@/lib/contracts/abi/PredictionFactory.json" assert { type: "json" };

export const FACTORY_ADDRESS = "0x27F0445e9A28eeF757d132f5257dd994Ff06fB54" as const;

/**
 * Hook to call setPriceFeed(tokenPair, feed)
 */
export function useSetPriceFeed() {
    const { writeContractAsync } = useWriteContract();

    const setPriceFeed = async (tokenPair: string, feed: string) => {
        const hash = await writeContractAsync({
            address: FACTORY_ADDRESS,
            abi: PredictionFactoryAbi,
            functionName: "setPriceFeed",
            args: [tokenPair, feed],
            chainId: sepolia.id,
        });

        return hash;
    };

    return { setPriceFeed };
}

/**
 * Hook to read getPriceFeed(tokenPair)
 */
export function useGetPriceFeed(tokenPair: string) {
    const { data, isLoading, error } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: PredictionFactoryAbi,
        functionName: "getPriceFeed",
        args: [tokenPair],
        chainId: sepolia.id,
    });

    return {
        feedAddress: data as string | undefined,
        isLoading,
        error,
    };
}

/**
 * Hook to fetch all pools deployed from factory
 */
export function useAllPools() {
    const { data, isLoading, error } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: PredictionFactoryAbi,
        functionName: "getAllPools",
        chainId: sepolia.id,
    });

    return {
        allPools: data as string[] | undefined,
        isLoading,
        error,
    };
}