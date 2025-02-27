'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { TradingViewWidget } from '@/components/graph/TradingViewWidget';
import { useGameStore } from '@/store/gameStore';

export default function GamePage() {
  const params = useParams();
  const { currentGame, userPosition, transactions, fetchGameById } = useGameStore();

  useEffect(() => {
    if (params.gameId) {
      fetchGameById(params.gameId as string);
    }
  }, [params.gameId, fetchGameById]);

  if (!currentGame) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-64">
      {/* Game Header */}
      <div className="bg-[#CCFF00] p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{currentGame.pair}</h1>
            <div className="bg-white px-4 py-2 rounded-full">
              ABOVE OR BELOW ${Number(currentGame.isAbove).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-full">
              Prediction Window Open
            </div>
            <div className="bg-white px-4 py-2 rounded-full">
              ID: {currentGame.id}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* <TradingViewWidget symbol="BTCUSD" /> */}
          <Card>
            <CardHeader>
              <CardTitle>YOUR POSITION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Evaluation</h3>
                <p className="text-3xl font-bold">{userPosition?.totalAssets.toFixed(2)} USDC</p>
                <p className="text-sm text-gray-500">
                  You are {Number(userPosition?.bearCoins || 0) > Number(userPosition?.bullCoins || 0) ? 'bearish' : 'bullish'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#BAD8B6] p-4 rounded-lg">
                  <h4>BULL COINS</h4>
                  <p className="text-2xl font-bold">{userPosition?.bullCoins.toFixed(2)}</p>
                  <Button variant="outline" className="mt-2">Burn Bull 🔥</Button>
                </div>
                <div className="bg-[#FFB6B6] p-4 rounded-lg">
                  <h4>BEAR COINS</h4>
                  <p className="text-2xl font-bold">{userPosition?.bearCoins.toFixed(2)}</p>
                  <Button variant="outline" className="mt-2">Burn Bear 🔥</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Button className="w-1/2 bg-[#BAD8B6] hover:bg-[#9DC88E] text-black">
                    Above ${Number(currentGame.isAbove).toLocaleString()}
                  </Button>
                  <Button className="w-1/2 bg-[#FFB6B6] hover:bg-[#FF9E9E] text-black">
                    Below ${Number(currentGame.isAbove).toLocaleString()}
                  </Button>
                </div>
                <div className="bg-[#BAD8B6] p-6 rounded-lg">
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">You are bullish! 🐂</h3>
                    <p className="text-sm">
                      You predict that the price of {currentGame.pair} will be above ${Number(currentGame.isAbove).toLocaleString()} until{' '}
                      {new Date(parseInt(currentGame.deadline)).toUTCString()}
                    </p>
                  </div>
                  <div className="flex justify-center items-center gap-4 my-4">
                    <Button variant="outline" size="icon">-</Button>
                    <span className="text-2xl font-bold">1</span>
                    <Button variant="outline" size="icon">+</Button>
                  </div>
                  <div className="text-center space-y-2">
                    <div>1 BULL = 1.00 USDC</div>
                    <div>Current Fee: 0.00%</div>
                    <Button className="w-full bg-white hover:bg-gray-100 text-black">
                      Mint Bull 🐂
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#CCFF00] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Wallet</th>
                      <th className="p-2 text-left">Tx</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Token</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{tx.wallet}</td>
                        <td className="p-2">{tx.tx}</td>
                        <td className="p-2">{tx.type}</td>
                        <td className="p-2">{tx.token}</td>
                        <td className="p-2">{tx.amount}</td>
                        <td className="p-2">{tx.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}