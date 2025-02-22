import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );
    const data = await response.json();
    
    return NextResponse.json({
      price: data.bitcoin.usd
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch BTC price' },
      { status: 500 }
    );
  }
}