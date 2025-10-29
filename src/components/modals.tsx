"use client";

import React from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "pending" | "success" | "error" | "idle";
  txHash?: `0x${string}`;
  errorMessage?: string;
  title?: string;
  description?: string;
}

/**
 * Display a modal that reflects transaction lifecycle states: pending, success, error, or idle.
 *
 * The modal shows status-appropriate content (spinner, success/error indicators, messages), an optional
 * transaction hash with a link to a block explorer, and Close controls. Clicking the backdrop or Close
 * button invokes `onClose` except while the status is `"pending"`.
 *
 * @param isOpen - Whether the modal is visible
 * @param onClose - Callback invoked to close the modal (not called while status is `"pending"`)
 * @param status - One of `"pending"`, `"success"`, `"error"`, or `"idle"` to determine displayed content
 * @param txHash - Optional transaction hash (expected as `0x...`) used to render the block explorer link
 * @param errorMessage - Optional error details shown when `status` is `"error"`
 * @param title - Optional override for the modal title
 * @param description - Optional override for the modal description
 * @returns The modal JSX element when `isOpen` is true, or `null` when closed
 */
export function TransactionModal({
  isOpen,
  onClose,
  status,
  txHash,
  errorMessage,
  title,
  description,
}: TransactionModalProps) {
  if (!isOpen) return null;

  const getBlockExplorerUrl = (hash: string) => {
    // Adjust based on your network
    return `https://basescan.org/tx/${hash}`; // Base mainnet
    // return `https://sepolia.basescan.org/tx/${hash}`; // Base Sepolia
  };

  const renderContent = () => {
    switch (status) {
      case "pending":
        return (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">
              {title || "Processing Transaction"}
            </h3>
            <p className="text-gray-600 mb-6">
              {description || "Please wait while your transaction is being confirmed..."}
            </p>
            {txHash && (
              <a
                href={getBlockExplorerUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                View on Explorer
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        );

      case "success":
        return (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">
              {title || "Transaction Successful!"}
            </h3>
            <p className="text-gray-600 mb-6">
              {description || "Your transaction has been confirmed on the blockchain"}
            </p>
            {txHash && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 break-all">
                  <p className="text-xs text-gray-600 mb-1">Transaction Hash</p>
                  <p className="text-sm font-mono text-black">{txHash}</p>
                </div>
                <a
                  href={getBlockExplorerUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all"
                >
                  View on Block Explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-6 px-8 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">
              {title || "Transaction Failed"}
            </h3>
            <p className="text-gray-600 mb-4">
              {description || "Your transaction could not be completed"}
            </p>
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-800 break-words">{errorMessage}</p>
              </div>
            )}
            {txHash && (
              <a
                href={getBlockExplorerUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm mb-4"
              >
                View on Explorer
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="mt-4 px-8 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={status !== "pending" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 pointer-events-auto relative animate-in fade-in zoom-in duration-200">
          {/* Close button - only show when not pending */}
          {status !== "pending" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {renderContent()}
        </div>
      </div>
    </>
  );
}