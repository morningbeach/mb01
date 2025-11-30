"use client";

import { useState } from "react";

export default function PinterestOfficialTestClient() {
  const [testResult, setTestResult] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState("packaging\ngift box\neco packaging");
  const [limit, setLimit] = useState(25);

  // 測試 API 連線
  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/admin/pinterest-official/test");
      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 執行搜尋
  const handleSearch = async () => {
    setLoading(true);
    setSearchResult(null);

    try {
      const queryArray = queries
        .split("\n")
        .map((q) => q.trim())
        .filter((q) => q.length > 0);

      const response = await fetch("/api/admin/pinterest-official/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queries: queryArray,
          limit,
          saveToFile: true,
        }),
      });

      const data = await response.json();
      setSearchResult(data);
    } catch (error: any) {
      setSearchResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Pinterest Official API 測試</h1>
      <p className="text-gray-600 mb-6">
        使用 Pinterest Official API v5 進行搜尋測試
      </p>

      {/* API 連線測試 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">1️⃣ API 連線測試</h2>
        <p className="text-sm text-gray-600 mb-4">
          測試 Pinterest Access Token 是否有效
        </p>

        <button
          onClick={handleTestConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "測試中..." : "測試連線"}
        </button>

        {testResult && (
          <div
            className={`mt-4 p-4 rounded ${
              testResult.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="font-semibold mb-2">
              {testResult.success ? "✅ 連線成功" : "❌ 連線失敗"}
            </div>
            <div className="text-sm">
              <p>{testResult.message || testResult.error}</p>

              {testResult.userInfo && (
                <div className="mt-2 text-xs bg-white p-2 rounded">
                  <strong>用戶資訊：</strong>
                  <pre>{JSON.stringify(testResult.userInfo, null, 2)}</pre>
                </div>
              )}

              {testResult.instructions && (
                <div className="mt-3 text-xs">
                  <strong>設定步驟：</strong>
                  {testResult.instructions.howToGetToken ? (
                    <ol className="list-decimal ml-5 mt-1">
                      {testResult.instructions.howToGetToken.map(
                        (step: string, i: number) => (
                          <li key={i}>{step}</li>
                        )
                      )}
                    </ol>
                  ) : (
                    <ul className="list-disc ml-5 mt-1">
                      <li>{testResult.instructions.step1}</li>
                      <li>{testResult.instructions.step2}</li>
                      <li>{testResult.instructions.step3}</li>
                      <li>{testResult.instructions.step4}</li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 搜尋測試 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">2️⃣ 搜尋測試</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              搜尋關鍵字（每行一個）
            </label>
            <textarea
              value={queries}
              onChange={(e) => setQueries(e.target.value)}
              rows={5}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="packaging&#10;gift box&#10;eco packaging"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              每個查詢的結果數量（1-250）
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 25)}
              min={1}
              max={250}
              className="w-32 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? "搜尋中..." : "🔍 開始搜尋"}
          </button>
        </div>

        {searchResult && (
          <div className="mt-6">
            {searchResult.success ? (
              <div className="space-y-4">
                {/* 統計資訊 */}
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h3 className="font-semibold mb-2">搜尋統計</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">總查詢數</div>
                      <div className="text-2xl font-bold">
                        {searchResult.stats.totalQueries}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">總 Pins</div>
                      <div className="text-2xl font-bold">
                        {searchResult.stats.totalPins}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">平均/查詢</div>
                      <div className="text-2xl font-bold">
                        {searchResult.stats.averagePerQuery}
                      </div>
                    </div>
                  </div>
                  {searchResult.savedFile && (
                    <div className="mt-2 text-xs text-gray-600">
                      已儲存: {searchResult.savedFile}
                    </div>
                  )}
                </div>

                {/* 搜尋結果 */}
                {searchResult.results.map((result: any, idx: number) => (
                  <div
                    key={idx}
                    className="border rounded p-4 bg-gray-50"
                  >
                    <h4 className="font-semibold mb-2">
                      {result.query}{" "}
                      <span className="text-sm text-gray-600">
                        ({result.totalCount} 筆
                        {result.hasMore && ", 還有更多"})
                      </span>
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {result.pins.slice(0, 8).map((pin: any) => (
                        <div
                          key={pin.id}
                          className="bg-white rounded border overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          {pin.imageUrl && (
                            <img
                              src={pin.imageUrl}
                              alt={pin.title}
                              className="w-full h-32 object-cover"
                            />
                          )}
                          <div className="p-2">
                            <div className="text-xs font-medium truncate">
                              {pin.title || "無標題"}
                            </div>
                            <a
                              href={pin.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              查看 →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    {result.pins.length > 8 && (
                      <div className="mt-2 text-sm text-gray-600">
                        還有 {result.pins.length - 8} 個結果...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="font-semibold mb-2">❌ 搜尋失敗</div>
                <div className="text-sm">{searchResult.error}</div>
                {searchResult.instructions && (
                  <div className="mt-3 text-xs">
                    <strong>解決方法：</strong>
                    <ul className="list-disc ml-5 mt-1">
                      <li>{searchResult.instructions.step1}</li>
                      <li>{searchResult.instructions.step2}</li>
                      <li>{searchResult.instructions.step3}</li>
                      <li>{searchResult.instructions.step4}</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* API 文檔 */}
      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📚 API 設定指南</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>1. 申請 Pinterest Developer Account：</strong>
            <br />
            前往{" "}
            <a
              href="https://developers.pinterest.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://developers.pinterest.com/
            </a>
          </p>
          <p>
            <strong>2. 建立應用程式：</strong>
            <br />
            在 Developer Portal 建立新的 App
          </p>
          <p>
            <strong>3. 取得 Access Token：</strong>
            <br />
            在 OAuth 設定中生成 Access Token（需要 pins:read 權限）
          </p>
          <p>
            <strong>4. 設定環境變數：</strong>
            <br />
            在專案根目錄的 <code className="bg-white px-1">.env.local</code>{" "}
            檔案中加入：
            <br />
            <code className="bg-white px-2 py-1 rounded block mt-1">
              PINTEREST_ACCESS_TOKEN=pina_your_token_here
            </code>
          </p>
          <p>
            <strong>5. 重新啟動伺服器：</strong>
            <br />
            儲存 .env.local 後，停止並重新啟動 <code>npm run dev</code>
          </p>
        </div>
      </div>
    </div>
  );
}
