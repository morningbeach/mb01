"use client";

import { useState } from "react";
import Image from "next/image";

interface Dimension {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  tags: Array<{
    id: string;
    slug: string;
    name_zh: string;
    name_en: string;
  }>;
}

interface TestResult {
  detectedCategory: string;
  categoryLabel: string;
  detectedMainCategory: string;
  detectedMainCategoryName: string;
  detectedItemSlug: string;
  detectedItemName: string;
  dimensions: Dimension[];
  detectedTagMap: Record<string, string[]>;
  productData: any;
  rawResponse?: string;
}

export default function PromptTesterClient() {
  const [apiKey, setApiKey] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [userHint, setUserHint] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 預設提示詞模板
  const defaultPromptTemplate = `【重要：標籤偵測規則】
以下是這個類別可用的維度和標籤。請根據圖片內容，從每個維度中選擇最適合的標籤 slug 填入 detectedTags：

{{TAG_LIST}}

detectedTags 格式範例：
{
  "box-type": ["folding-carton"],
  "box-material": ["cardboard", "kraft"],
  "box-finish": ["matte-lamination", "spot-uv"],
  "box-application": ["cosmetics"]
}

規則：
- 請只從上述標籤中選擇，使用 slug（括號內的值）而非中文名稱
- 如果某個維度沒有適合的標籤，留空陣列 []
- 每個維度可選多個標籤
- 盡可能多選擇適合的標籤，不要遺漏明顯的特徵
- 如果現有標籤都不足以描述產品，可以在 suggestedNewTags 中建議新標籤`;

  // 載入 API Key
  useState(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) setApiKey(savedKey);
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleTest = async () => {
    if (!apiKey || !imageFile) {
      alert("請設定 API Key 並上傳圖片");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("apiKey", apiKey);
      formData.append("image", imageFile);
      formData.append("userHint", userHint);
      formData.append("customPrompt", customPrompt || defaultPromptTemplate);

      const res = await fetch("/api/admin/products-v2/prompt-test", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "分析失敗");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTotalDetectedTags = () => {
    if (!result) return 0;
    return Object.values(result.detectedTagMap).reduce(
      (sum, tags) => sum + tags.length,
      0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 AI 提示詞測試工具
        </h1>
        <p className="text-gray-600 mb-6">
          測試和優化 AI 標籤偵測的提示詞，找出能讓 AI 標記最多適合標籤的提示詞
        </p>

        {/* API Key */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              localStorage.setItem("gemini_api_key", e.target.value);
            }}
            placeholder="輸入您的 Google Gemini API Key"
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側：輸入區 */}
          <div className="space-y-6">
            {/* 圖片上傳 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">測試圖片</h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="mb-4"
              />
              {imagePreview && (
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            {/* 用戶提示 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">用戶提示（選填）</h2>
              <textarea
                value={userHint}
                onChange={(e) => setUserHint(e.target.value)}
                placeholder="例如：這是環保購物袋系列"
                className="w-full border rounded-lg px-4 py-3 h-24 resize-none"
              />
            </div>

            {/* 自訂提示詞 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">標籤偵測提示詞</h2>
                <button
                  onClick={() => setCustomPrompt("")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  恢復預設
                </button>
              </div>
              <textarea
                value={customPrompt || defaultPromptTemplate}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="自訂標籤偵測的提示詞..."
                className="w-full border rounded-lg px-4 py-3 h-64 resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 使用 {`{{TAG_LIST}}`} 作為標籤列表的佔位符
              </p>
            </div>

            {/* 測試按鈕 */}
            <button
              onClick={handleTest}
              disabled={!apiKey || !imageFile || isAnalyzing}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? "🔄 分析中..." : "🚀 開始測試"}
            </button>
          </div>

          {/* 右側：結果區 */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">❌ {error}</p>
              </div>
            )}

            {result && (
              <>
                {/* AI 偵測結果摘要 - 四步驟流程 */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
                  <h2 className="text-lg font-semibold mb-4 text-blue-900">🤖 AI 四步驟偵測結果</h2>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                      <div className="text-xs text-purple-600 font-medium mb-1">步驟 1：產品類別</div>
                      <div className="text-xl font-bold text-purple-700">
                        {result.categoryLabel}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{result.detectedCategory}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                      <div className="text-xs text-blue-600 font-medium mb-1">步驟 2：12 大品類</div>
                      <div className="text-xl font-bold text-blue-700">
                        {result.detectedMainCategoryName || '未偵測'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{result.detectedMainCategory || 'N/A'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
                      <div className="text-xs text-indigo-600 font-medium mb-1">步驟 3：具體品項</div>
                      <div className="text-xl font-bold text-indigo-700">
                        {result.detectedItemName || '未偵測'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{result.detectedItemSlug || 'N/A'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                      <div className="text-xs text-green-600 font-medium mb-1">步驟 4：材質/工藝/功能/認證</div>
                      <div className="text-xl font-bold text-green-700 mb-3">
                        {getTotalDetectedTags()} 個標籤
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        涵蓋 {Object.keys(result.detectedTagMap).length} 個維度
                      </div>
                      {/* 顯示所有偵測到的標籤 - 簡化版直接顯示 slug */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(() => {
                          const tagCount = getTotalDetectedTags();
                          
                          if (tagCount === 0) {
                            return (
                              <span className="text-xs text-gray-400 italic">
                                未偵測到標籤
                              </span>
                            );
                          }

                          // 直接從 detectedTagMap 顯示所有標籤
                          const allTags: Array<{ dimSlug: string; tagSlug: string }> = [];
                          Object.entries(result.detectedTagMap).forEach(([dimSlug, tagSlugs]) => {
                            (tagSlugs as string[]).forEach((tagSlug) => {
                              allTags.push({ dimSlug, tagSlug });
                            });
                          });

                          return allTags.map((item, idx) => (
                            <span
                              key={`${item.dimSlug}-${item.tagSlug}-${idx}`}
                              className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs border border-green-200"
                              title={`${item.dimSlug}: ${item.tagSlug}`}
                            >
                              {item.tagSlug}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 統計摘要 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">📊 詳細統計</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-purple-600 font-medium">
                        產品類別
                      </div>
                      <div className="text-2xl font-bold text-purple-700 mt-1">
                        {result.categoryLabel}
                      </div>
                      <div className="text-xs text-purple-500 mt-1">
                        {result.detectedCategory}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-green-600 font-medium">
                        偵測標籤數
                      </div>
                      <div className="text-2xl font-bold text-green-700 mt-1">
                        {getTotalDetectedTags()} 個
                      </div>
                      <div className="text-xs text-green-500 mt-1">
                        {Object.keys(result.detectedTagMap).length} 個維度
                      </div>
                    </div>
                  </div>
                </div>

                {/* 維度標籤詳情 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">🏷️ 偵測到的標籤</h2>
                  <div className="space-y-4">
                    {result.dimensions.map((dim) => {
                      const detectedSlugs = result.detectedTagMap[dim.slug] || [];
                      const detectedTags = dim.tags.filter((t) =>
                        detectedSlugs.includes(t.slug)
                      );

                      return (
                        <div key={dim.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-700">
                              {dim.name_zh}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {detectedTags.length} / {dim.tags.length}
                            </span>
                          </div>
                          {detectedTags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {detectedTags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                                >
                                  {tag.name_zh} ✓
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              未偵測到此維度的標籤
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 產品資訊預覽 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">📝 產品資訊</h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">中文名稱：</span>
                      {result.productData.name_zh}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">英文名稱：</span>
                      {result.productData.name_en}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">簡短描述：</span>
                      {result.productData.shortDesc_zh}
                    </div>
                  </div>
                </div>

                {/* Raw Response (可展開) */}
                <details className="bg-white rounded-lg shadow p-6">
                  <summary className="text-lg font-semibold cursor-pointer">
                    🔍 完整 API 回傳資料
                  </summary>
                  <pre className="mt-4 p-4 bg-gray-50 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </>
            )}

            {!result && !error && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-400">上傳圖片並開始測試以查看結果</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
