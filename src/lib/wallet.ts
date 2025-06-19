import { createPublicClient, http } from 'viem';
import { sepolia, goerli, mainnet, polygon } from 'viem/chains';
import { RPC_URLS, DEFAULT_CHAIN } from '@/config';

export const publicClients = {
  sepolia: createPublicClient({
    chain: sepolia,
    transport: http(RPC_URLS.sepolia),
  }),
  mainnet: createPublicClient({
    chain: mainnet,
    transport: http(RPC_URLS.mainnet),
  }),
  polygon: createPublicClient({
    chain: polygon,
    transport: http(RPC_URLS.polygon),
  }),
};

export const getPublicClient = publicClients[DEFAULT_CHAIN];