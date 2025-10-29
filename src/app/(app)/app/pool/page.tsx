"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Trophy,
  Users,
  Shield,
  Zap,
  Target,
  ArrowRight,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Renders the "How Prediction Pools Work" informational page that explains pool mechanics, fees, settlement, reward calculation, and key features.
 *
 * The page is a static, client-side React component composed of a hero, quick overview cards, a detailed four-step guide (BULL vs BEAR, minting, burning, expiry/settlement), a reward calculation example, feature highlights, and a CTA section. It includes CTA buttons that navigate to "/app" (view pools) and "/app/factory" (create pool).
 *
 * @returns The JSX element for the How Prediction Pools Work page.
 */
export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCF5] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-black mb-4">
            How Prediction Pools Work
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Binary prediction markets where participants bet on whether an asset
            price will go up or down. Winners split the entire pool!
          </p>
        </div>

        {/* Quick Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">
              1. Choose Your Side
            </h3>
            <p className="text-sm text-gray-600">
              Pick BULL if you think the price will go up, or BEAR if you think
              it will go down
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">
              2. Wait for Expiry
            </h3>
            <p className="text-sm text-gray-600">
              The pool closes at the set expiry time. Oracle takes a final price
              snapshot
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">
              3. Claim Rewards
            </h3>
            <p className="text-sm text-gray-600">
              Winners share the entire pool based on their share percentage
            </p>
          </div>
        </div>

        {/* Detailed Steps */}
        <div className="space-y-8 mb-16">
          <h2 className="text-3xl font-bold text-black text-center mb-8">
            Detailed Guide
          </h2>

          {/* Step 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-3">
                  Understanding BULL vs BEAR
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <h4 className="font-bold text-green-900">BULL Side</h4>
                    </div>
                    <p className="text-sm text-green-800">
                      Choose BULL if you predict the price will be{" "}
                      <strong>above</strong> the target price at expiry. If the
                      final snapshot price &gt; target price, BULL wins!
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <h4 className="font-bold text-red-900">BEAR Side</h4>
                    </div>
                    <p className="text-sm text-red-800">
                      Choose BEAR if you predict the price will be{" "}
                      <strong>at or below</strong> the target price at expiry.
                      If final snapshot price ≤ target price, BEAR wins!
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">
                  <strong>Example:</strong> If ETH/USD pool has a target of
                  $3,000 and expires in 7 days:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 ml-4">
                  <li>If final price is $3,100 → BULL wins 🐂</li>
                  <li>If final price is $2,900 → BEAR wins 🐻</li>
                  <li>If final price is exactly $3,000 → BEAR wins 🐻</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-3">
                  Buying Shares (Minting)
                </h3>
                <p className="text-gray-700 mb-4">
                  When you deposit ETH, you receive <strong>shares</strong> on
                  your chosen side. The number of shares you get depends on the
                  current pool ratio:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <h4 className="font-bold text-blue-900 mb-2">
                    Dynamic Pricing
                  </h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Share prices adjust automatically based on supply and
                    demand:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • <strong>Balanced pool</strong> (50/50): Both sides cost
                      ~1 ETH per share
                    </li>
                    <li>
                      • <strong>Imbalanced pool</strong> (70/30): Majority side
                      costs more, minority side costs less
                    </li>
                    <li>
                      • <strong>Why?</strong> Encourages balancing and offers
                      better odds to minority bettors
                    </li>
                  </ul>
                </div>
                <p className="text-gray-700">
                  <strong>Fee Structure:</strong> A dynamic fee is charged that
                  increases as the pool approaches expiry. This fee goes to the
                  opposite side's pool, creating interesting arbitrage
                  opportunities.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-3">
                  Early Exit (Burning)
                </h3>
                <p className="text-gray-700 mb-4">
                  Changed your mind? You can sell your shares back before
                  expiry:
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <ul className="text-sm text-yellow-900 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Burn anytime</strong> before pool expires to
                        exit your position
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Get ETH back</strong> based on current share
                        price (minus fees)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Fee applies</strong> - your fee goes to opposite
                        side's pool
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Risk/Reward</strong> - Price might move in your
                        favor if you wait!
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-3">
                  Pool Expiry & Settlement
                </h3>
                <p className="text-gray-700 mb-4">
                  When the countdown reaches zero, the pool closes:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">
                        1. Snapshot Taken
                      </h4>
                      <p className="text-sm text-gray-600">
                        Pool creator triggers snapshot function, which records
                        the final Chainlink oracle price
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">
                        2. Winner Determined
                      </h4>
                      <p className="text-sm text-gray-600">
                        Smart contract compares snapshot price to target price
                        and declares BULL or BEAR as winner
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">
                        3. Fees Distributed
                      </h4>
                      <p className="text-sm text-gray-600">
                        Creator fee and protocol fee are deducted from total
                        pool. Remaining balance goes to winners
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">
                        4. Claim Your Rewards
                      </h4>
                      <p className="text-sm text-gray-600">
                        Winners can claim their proportional share of the
                        winning pool. Your reward = (Your Shares / Total Winning
                        Shares) × Total Winning Pool
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reward Calculation */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-black mb-4 text-center">
            💰 Reward Calculation Example
          </h2>
          <div className="bg-white rounded-xl p-6">
            <p className="text-gray-700 mb-4">
              <strong>Scenario:</strong>
            </p>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li>• Total Pool: 100 ETH (60 ETH BULL, 40 ETH BEAR)</li>
              <li>• You deposited: 10 ETH on BULL side</li>
              <li>• Your shares: ~16.67% of BULL side</li>
              <li>
                • Target: $3,000 | Final Price: $3,200 →{" "}
                <strong>BULL WINS! 🐂</strong>
              </li>
            </ul>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900 mb-2">
                <strong>Your Payout Calculation:</strong>
              </p>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>Total Pool: 100 ETH</li>
                <li>Fees (5% creator + 5% protocol): 10 ETH deducted</li>
                <li>Remaining for BULL winners: 90 ETH</li>
                <li>
                  Your share: 16.67% × 90 ETH ={" "}
                  <strong className="text-green-600">15 ETH</strong>
                </li>
                <li>
                  Your profit: 15 - 10 ={" "}
                  <strong className="text-green-600">+5 ETH (50% gain!)</strong>
                </li>
              </ol>
            </div>

            <p className="text-xs text-gray-600 mt-4 text-center">
              The more imbalanced the pool, the higher your potential rewards!
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-black">
                Trustless & Transparent
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  Smart contracts handle all funds - no intermediaries
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Chainlink oracles provide tamper-proof price data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>All transactions verifiable on blockchain</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-black">Dynamic & Fair</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Prices adjust based on pool balance automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Better odds for minority side = balanced incentives</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Exit anytime before expiry (with dynamic fees)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make Your Prediction?
          </h2>
          <p className="text-lg mb-6 text-white/90">
            Join active pools or create your own prediction market
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push("/app")}
              className="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              View All Pools
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.push("/app/factory")}
              className="px-8 py-3 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold rounded-xl hover:bg-white/20 transition-all"
            >
              Create Pool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}