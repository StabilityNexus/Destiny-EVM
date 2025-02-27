import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
// import PredictionGameABI from '@/contracts/abi/PredictionGame.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_GAME_CONTRACT || '';

export async function GET() {
  try {
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const contract = new ethers.Contract(CONTRACT_ADDRESS, PredictionGameABI.abi, provider);

    // This will be replaced with your actual contract call
    const games = await Promise.resolve([
      {
        id: '1',
        pair: 'BTC/USD',
        targetValue: '68000.00',
        deadline: new Date().getTime() + 86400000, // 24 hours from now
        bullCirculatingSupply: '50.00',
        bearCirculatingSupply: '50.00',
        isInitialized: true,
        baseAmountBull: '0.001',
        baseAmountBear: '0.001',
        status: 'active'
      },
      {
        id: '2',
        pair: 'ETH/USD',
        targetValue: '4000.00',
        deadline: new Date().getTime() + 86400000, // 24 hours from now
        bullCirculatingSupply: '50.00',
        bearCirculatingSupply: '50.00',
        isInitialized: true,
        baseAmountBull: '0.001',
        baseAmountBear: '0.001',
        status: 'active'
      },
    ]);

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}