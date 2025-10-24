"use client";

import Link from "next/link";
import { SearchX, Home, ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFoundPool() {
  return (
    <div className="h-[calc(100vh-88px)] bg-[#FDFCF5] overflow-hidden flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/95 backdrop-blur rounded-xl shadow-sm border border-gray-100 p-7 text-center">
          {/* Animated Icon */}
          <div className="mb-5 flex justify-center">
            <div className="relative animate-bounce">
              <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-5 rounded-full border border-red-100">
                <SearchX className="h-12 w-12 text-red-500" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-100 border border-yellow-200 rounded-full p-1">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-5">
            <div className="inline-block mb-3">
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1">
                <span className="text-xs font-mono font-bold text-red-600">
                  ERROR 404
                </span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Prediction Pool Not Found
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              The pool you're trying to access doesn't exist. It may have been
              removed or the address is incorrect.
            </p>
          </div>

          {/* Suggestions */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-3 mb-5">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              What you can do:
            </p>
            <ul className="text-[11px] text-gray-600 space-y-1 text-left">
              <li>• Check the pool address for typos</li>
              <li>• Browse active pools on the markets page</li>
              <li>• Create your own prediction pool</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#BAD8B6] to-[#9CC499] hover:from-[#9CC499] hover:to-[#8AB886] text-gray-900 font-bold text-xs rounded-lg transition-all shadow-sm"
            >
              <Home className="h-3.5 w-3.5" />
              Go to Homepage
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
