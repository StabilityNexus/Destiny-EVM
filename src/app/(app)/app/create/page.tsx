"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Info,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";

const TOKEN_PAIRS = [
  { id: "ETH/USD", label: "ETH/USD", icon: "Ξ", feedAddress: "0x..." },
  { id: "BTC/USD", label: "BTC/USD", icon: "₿", feedAddress: "0x..." },
  { id: "LINK/USD", label: "LINK/USD", icon: "⬡", feedAddress: "0x..." },
  { id: "MATIC/USD", label: "MATIC/USD", icon: "◆", feedAddress: "0x..." },
];

export default function CreatePoolPage() {
  const [formData, setFormData] = useState({
    tokenPair: "",
    targetPrice: "",
    expiryDate: "",
    expiryTime: "",
    creatorFee: 2,
    rampStartHours: 24,
  });

  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const daysFromNow = useMemo(() => {
    if (!formData.expiryDate) return null;
    const expiry: Date = new Date(formData.expiryDate);
    const now: Date = new Date();
    const diff = expiry - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [formData.expiryDate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tokenPair) newErrors.tokenPair = "Please select a token pair";
    if (!formData.targetPrice || parseFloat(formData.targetPrice) <= 0) {
      newErrors.targetPrice = "Please enter a valid target price";
    }
    if (!formData.expiryDate)
      newErrors.expiryDate = "Please select an expiry date";
    if (!formData.expiryTime)
      newErrors.expiryTime = "Please select an expiry time";

    const expiryDateTime = new Date(
      `${formData.expiryDate}T${formData.expiryTime}`
    );
    if (expiryDateTime <= new Date()) {
      newErrors.expiryDate = "Expiry must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleCreatePool = async () => {
    console.log("Creating pool with data:", formData);
  };

  const selectedPair = TOKEN_PAIRS.find((p) => p.id === formData.tokenPair);

  return (
    <div className="min-h-screen bg-[#FDFCF5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-black mb-3 tracking-tight">
            Create Prediction Pool
          </h1>
          <p className="text-lg text-gray-700">
            Set up a new binary prediction market for any asset
          </p>
        </div>

        {!showPreview ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-2">
                  Token Pair
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TOKEN_PAIRS.map((pair) => (
                    <button
                      key={pair.id}
                      type="button"
                      onClick={() => handleInputChange("tokenPair", pair.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        formData.tokenPair === pair.id
                          ? "border-[#BAD8B6] bg-[#BAD8B6] bg-opacity-20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{pair.icon}</div>
                      <div className="text-sm font-semibold text-black">
                        {pair.label}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.tokenPair && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.tokenPair}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-2">
                  Target Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetPrice}
                    onChange={(e) =>
                      handleInputChange("targetPrice", e.target.value)
                    }
                    placeholder="Enter target price"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#BAD8B6] focus:border-[#BAD8B6] outline-none text-lg font-mono"
                  />
                </div>
                {errors.targetPrice && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.targetPrice}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Bulls win if price is above target at expiry
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-2">
                  Expiry Date & Time
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        handleInputChange("expiryDate", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#BAD8B6] focus:border-[#BAD8B6] outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      value={formData.expiryTime}
                      onChange={(e) =>
                        handleInputChange("expiryTime", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#BAD8B6] focus:border-[#BAD8B6] outline-none"
                    />
                  </div>
                </div>
                {daysFromNow !== null && daysFromNow >= 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {daysFromNow} days from now
                  </p>
                )}
                {errors.expiryDate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.expiryDate}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-2">
                  Fee Ramp Start (hours before expiry)
                </label>
                <input
                  type="range"
                  min="1"
                  max="168"
                  value={formData.rampStartHours}
                  onChange={(e) =>
                    handleInputChange("rampStartHours", e.target.value)
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#BAD8B6]"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">1 hour</span>
                  <span className="text-lg font-semibold text-black">
                    {formData.rampStartHours}h
                  </span>
                  <span className="text-sm text-gray-600">7 days</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Trading fees ramp from 0% to 100% during this period
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Creator Fee
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={formData.creatorFee}
                  onChange={(e) =>
                    handleInputChange("creatorFee", e.target.value)
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#BAD8B6]"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">0%</span>
                  <span className="text-lg font-semibold text-black">
                    {formData.creatorFee}%
                  </span>
                  <span className="text-sm text-gray-600">10% (max)</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Your earnings from the total pool at settlement
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-[#BAD8B6] hover:bg-[#9CC499] text-black font-bold py-4 rounded-lg transition-all duration-200 shadow-sm text-lg flex items-center justify-center gap-2"
            >
              Preview Pool
              <TrendingUp className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Pool Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-600 hover:text-black text-sm font-semibold"
                >
                  ← Edit
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Token Pair</span>
                  <span className="text-xl font-bold text-black flex items-center gap-2">
                    {selectedPair?.icon} {formData.tokenPair}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Target Price</span>
                  <span className="text-xl font-bold text-black">
                    ${parseFloat(formData.targetPrice).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Expires</span>
                  <span className="text-lg font-semibold text-black">
                    {new Date(
                      `${formData.expiryDate}T${formData.expiryTime}`
                    ).toLocaleDateString()}{" "}
                    at {formData.expiryTime}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Fee Ramp Start</span>
                  <span className="text-lg font-semibold text-black">
                    {formData.rampStartHours}h before expiry
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Creator Fee</span>
                  <span className="text-lg font-semibold text-black">
                    {formData.creatorFee}%
                  </span>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">How it works:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        Bulls win if price is <strong>above</strong> $
                        {formData.targetPrice} at expiry
                      </li>
                      <li>
                        Bears win if price is <strong>below</strong> $
                        {formData.targetPrice} at expiry
                      </li>
                      <li>Winners split the entire pool minus creator fee</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreatePool}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 rounded-lg transition-all duration-200 shadow-sm text-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Create Prediction Pool
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
