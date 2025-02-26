import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
// import PredictionGameABI from '@/contracts/abi/PredictionGame.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_GAME_CONTRACT || '';

export async function GET() {
  try {
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const contract = new ethers.Contract(CONTRACT_ADDRESS, PredictionGameABI.abi, provider);

    // This will be replaced with your actual contract call to get BTC games
    const games = await Promise.resolve([
      {
        id: '2',
        pair: 'BTC/USD',
        isAbove: '69000.00',
        feed: 'BTC/USD',
        deadline: (new Date().getTime() + 172800000).toString(), // 48 hours from now
        bullCirculatingSupply: '60.00',
        bearCirculatingSupply: '40.00',
        isInitialized: true,
        baseAmountBull: '0.002',
        baseAmountBear: '0.002',
        start: new Date().getTime().toString(),
        contract: CONTRACT_ADDRESS
      }
    ]);

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching BTC games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BTC games' },
      { status: 500 }
    );
  }
}