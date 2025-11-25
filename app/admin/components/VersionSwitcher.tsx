"use client";

import { useState, useEffect } from "react";

export function VersionSwitcher() {
  const [version, setVersion] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 讀取當前版本
    fetch("/api/admin/product-version")
      .then((r) => r.json())
      .then((data) => {
        setVersion(data.version);
        setLoading(false);
      });
  }, []);

  const handleSwitch = async (newVersion: 1 | 2) => {
    setLoading(true);
    await fetch("/api/admin/product-version", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: newVersion }),
    });
    setVersion(newVersion);
    setLoading(false);
    // 重新載入頁面以套用新版本
    window.location.reload();
  };

  return (
    <div className="mb-6 rounded-xl border-2 border-blue-500 bg-blue-50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            🔄 商品系統版本控制
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            目前後台編輯版本: <span className="font-bold">V{version}</span>
            {version === 1 && " (舊版本 - 現有系統)"}
            {version === 2 && " (新版本 - 優化框架)"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            ℹ️ 前台固定顯示 V2（新版本），後台可切換編輯 V1 或 V2
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleSwitch(1)}
            disabled={loading || version === 1}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              version === 1
                ? "bg-zinc-900 text-white"
                : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
            } disabled:opacity-50`}
          >
            編輯 V1
          </button>
          <button
            onClick={() => handleSwitch(2)}
            disabled={loading || version === 2}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              version === 2
                ? "bg-zinc-900 text-white"
                : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
            } disabled:opacity-50`}
          >
            編輯 V2
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-blue-200 pt-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4">
          <h3 className="text-sm font-semibold text-zinc-900">
            V1 - 舊版本系統
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-zinc-600">
            <li>✓ 現有的 FrontCategory + TagGroup 架構</li>
            <li>✓ 可繼續維護現有商品資料</li>
            <li>✓ 所有現有功能保持運作</li>
          </ul>
        </div>

        <div className="rounded-lg bg-blue-100 p-4">
          <h3 className="text-sm font-semibold text-zinc-900">
            V2 - 新版本框架 ⭐
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-zinc-600">
            <li>🚀 優化的分類邏輯</li>
            <li>🏷️ 重作的標籤系統</li>
            <li>✨ 更易懂的前後台介面</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
