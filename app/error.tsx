"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 記錄錯誤到控制台
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          發生錯誤 / Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          如果您正在使用瀏覽器翻譯功能，請關閉翻譯後重試。
          <br />
          If you are using browser translation, please disable it and try again.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            重試 / Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            重新整理頁面 / Reload Page
          </button>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-gray-400">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
