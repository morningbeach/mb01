"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="max-w-lg w-full p-8 bg-zinc-800 rounded-lg shadow-lg text-center">
        <div className="text-6xl mb-4">🔧</div>
        <h2 className="text-2xl font-bold text-white mb-4">
          管理介面發生錯誤
        </h2>
        <p className="text-zinc-400 mb-2">
          可能原因：
        </p>
        <ul className="text-zinc-400 mb-6 text-left list-disc list-inside">
          <li>瀏覽器翻譯功能干擾（請關閉翻譯）</li>
          <li>API 請求超時</li>
          <li>網路連線問題</li>
        </ul>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            重試
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors font-medium"
          >
            重新整理頁面
          </button>
          <button
            onClick={() => window.location.href = "/admin"}
            className="w-full px-6 py-3 bg-zinc-600 text-white rounded-lg hover:bg-zinc-500 transition-colors font-medium"
          >
            返回管理首頁
          </button>
        </div>
        {error.message && (
          <details className="mt-6 text-left">
            <summary className="text-zinc-500 cursor-pointer hover:text-zinc-400">
              技術詳情
            </summary>
            <pre className="mt-2 p-3 bg-zinc-900 rounded text-xs text-red-400 overflow-x-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
