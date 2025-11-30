"use client";

import { useState } from "react";

interface PinterestSearchResult {
  success: boolean;
  stats: {
    totalQueries: number;
    totalPins: number;
    avgPinsPerQuery: number;
    totalRepins: number;
    totalComments: number;
    totalReactions: number;
    queriesBreakdown: Array<{ query: string; count: number }>;
  };
  results: Array<{
    query: string;
    pins: Array<{
      id: string;
      title: string;
      description?: string;
      imageUrl: string;
      url: string;
      repinCount?: number;
      commentCount?: number;
    }>;
    totalCount: number;
  }>;
  savedFiles?: {
    json?: string;
    csv?: string;
  };
}

export default function PinterestScraperTestPage() {
  const [queries, setQueries] = useState("packaging\ngift box\neco packaging");
  const [limit, setLimit] = useState(50);
  const [saveToFile, setSaveToFile] = useState(true);
  const [format, setFormat] = useState<"json" | "csv" | "both">("both");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PinterestSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const queryArray = queries
        .split("\n")
        .map(q => q.trim())
        .filter(q => q.length > 0);

      if (queryArray.length === 0) {
        throw new Error("請至少輸入一個查詢關鍵字");
      }

      const response = await fetch("/api/admin/pinterest-scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queries: queryArray,
          limit,
          saveToFile,
          format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "搜尋失敗");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Pinterest Search Scraper 測試</h1>
      <p className="text-gray-600 mb-8">
        使用 Apify Pinterest Scraper Actor 搜尋 Pinterest 內容
      </p>

      {/* 搜尋表單 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="space-y-4">
          {/* 查詢關鍵字 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              查詢關鍵字（每行一個）
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
              value={queries}
              onChange={(e) => setQueries(e.target.value)}
              placeholder="packaging&#10;gift box&#10;eco packaging"
            />
          </div>

          {/* 數量限制 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              每個查詢抓取數量：{limit}
            </label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>400</span>
              <span>500</span>
            </div>
          </div>

          {/* 儲存設定 */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={saveToFile}
                onChange={(e) => setSaveToFile(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">儲存到檔案</span>
            </label>

            {saveToFile && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">格式:</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="both">Both</option>
                </select>
              </div>
            )}
          </div>

          {/* 搜尋按鈕 */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "搜尋中..." : "開始搜尋"}
          </button>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">
          <strong>錯誤：</strong> {error}
        </div>
      )}

      {/* 搜尋結果 */}
      {result && (
        <div className="space-y-6">
          {/* 統計資訊 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">統計資訊</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {result.stats.totalQueries}
                </div>
                <div className="text-sm text-gray-600">查詢數</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {result.stats.totalPins}
                </div>
                <div className="text-sm text-gray-600">總 Pins</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {result.stats.avgPinsPerQuery}
                </div>
                <div className="text-sm text-gray-600">平均/查詢</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {result.stats.totalRepins.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">總轉發</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">
                  {result.stats.totalComments.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">總評論</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600">
                  {result.stats.totalReactions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">總反應</div>
              </div>
            </div>

            {/* 查詢分解 */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                各查詢結果：
              </h3>
              <div className="space-y-1">
                {result.stats.queriesBreakdown.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm bg-white px-3 py-2 rounded"
                  >
                    <span className="font-medium">{item.query}</span>
                    <span className="text-gray-600">{item.count} pins</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 儲存檔案資訊 */}
          {result.savedFiles && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                ✓ 結果已儲存
              </h3>
              {result.savedFiles.json && (
                <div className="text-sm text-green-700 mb-1">
                  JSON: <code className="bg-white px-2 py-1 rounded">{result.savedFiles.json}</code>
                </div>
              )}
              {result.savedFiles.csv && (
                <div className="text-sm text-green-700">
                  CSV: <code className="bg-white px-2 py-1 rounded">{result.savedFiles.csv}</code>
                </div>
              )}
            </div>
          )}

          {/* Pin 結果 */}
          {result.results.map((queryResult, queryIndex) => (
            <div key={queryIndex} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                查詢: "{queryResult.query}" ({queryResult.totalCount} pins)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {queryResult.pins.slice(0, 12).map((pin) => (
                  <a
                    key={pin.id}
                    href={pin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <img
                        src={pin.imageUrl}
                        alt={pin.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2">
                        {pin.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        {pin.repinCount !== undefined && (
                          <span>🔄 {pin.repinCount}</span>
                        )}
                        {pin.commentCount !== undefined && (
                          <span>💬 {pin.commentCount}</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              {queryResult.pins.length > 12 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  還有 {queryResult.pins.length - 12} 個 pins（未顯示）
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
