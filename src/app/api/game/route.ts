import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
// import PredictionGameABI from '@/contracts/abi/PredictionGame.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_GAME_CONTRACT || '';

export async function GET() {
  try {
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const contract = new ethers.Contract(CONTRACT_ADDRESS, PredictionGameABI.abi, provider);

    // This will be replaced with your actual contract call to get all games
    const games = await Promise.resolve([
      {
        id: '1',
        pair: 'BTC/USD',
        isAbove: '68000.00',
        feed: 'BTC/USD',
        deadline: (new Date().getTime() + 86400000).toString(),
        bullCirculatingSupply: '50.00',
        bearCirculatingSupply: '50.00',
        isInitialized: true,
        baseAmountBull: '0.001',
        baseAmountBear: '0.001',
        start: new Date().getTime().toString(),
        contract: CONTRACT_ADDRESS
      },
      {
        id: '2',
        pair: 'ETH/USD',
        isAbove: '3900.00',
        feed: 'ETH/USD',
        deadline: (new Date().getTime() + 172800000).toString(),
        bullCirculatingSupply: '45.00',
        bearCirculatingSupply: '55.00',
        isInitialized: true,
        baseAmountBull: '0.01',
        baseAmountBear: '0.01',
        start: new Date().getTime().toString(),
        contract: CONTRACT_ADDRESS
      }
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