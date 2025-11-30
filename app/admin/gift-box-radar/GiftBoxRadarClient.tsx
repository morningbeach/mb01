"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { TrendAsset, TrendPlatform } from "@/lib/apify-adapters";

// 測試用：先確保組件能渲染
console.log("[GiftBoxRadarClient] Component loaded");

// 建議標籤（中英文）
interface SuggestedTag {
  zh: string;
  en: string;
}

interface Tag {
  id: string;
  name: string;
  name_en?: string;
  name_zh?: string;
}

interface SelectedImage {
  url: string;
  title: string;
  platform: TrendPlatform;
  asset: TrendAsset;
  prompt: string;
  status: "pending" | "processing" | "done" | "error" | "analyzing" | "analyzed";
  editedUrl?: string;
  error?: string;
  userHint?: string;
  productData?: {
    name_zh?: string;
    name_en?: string;
    description_zh?: string;
    description_en?: string;
    features_zh?: string;
    features_en?: string;
    dimensions_zh?: string;
    dimensions_en?: string;
    materials_zh?: string;
    materials_en?: string;
    minQty?: number;
    priceHint_zh?: string;
    priceHint_en?: string;
    leadTime_zh?: string;
    leadTime_en?: string;
    suggestedTags?: SuggestedTag[];
    matchedTags?: Tag[];
    unmatchedTags?: SuggestedTag[];
  };
}

const PLATFORMS = [
  { id: "pinterest", name: "Pinterest", icon: "📌" },
  { id: "behance", name: "Behance", icon: "🎨" },
  { id: "google", name: "Google Images", icon: "🔍" },
  { id: "amazon", name: "Amazon", icon: "🏢" },
  { id: "shopee", name: "Shopee", icon: "🛒" },
  { id: "tiktok", name: "TikTok", icon: "🎬" },
  { id: "alibaba1688", name: "1688/Alibaba", icon: "🏭" },
] as const;

const REGIONS = [
  { id: "US", name: "美國" },
  { id: "TW", name: "台灣" },
  { id: "CN", name: "中國" },
  { id: "JP", name: "日本" },
];

export default function GiftBoxRadarClient() {
  const [selectedSources, setSelectedSources] = useState<TrendPlatform[]>(["pinterest", "behance", "amazon"]);
  const [keywords, setKeywords] = useState<string[]>(["gift box", "禮品盒"]);
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [region, setRegion] = useState("US");
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TrendAsset[]>([]);
  const [checkedAssets, setCheckedAssets] = useState<Set<string>>(new Set());
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  const [geminiModel, setGeminiModel] = useState<string>("gemini-3-pro-image-preview");
  const [batchPrompt, setBatchPrompt] = useState<string>("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>(""); // 新增搜尋狀態
  const [publishingProduct, setPublishingProduct] = useState<string | null>(null);
  const [existingTags, setExistingTags] = useState<Tag[]>([]);
  const [expandedProductDetail, setExpandedProductDetail] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  
  // Google Images 篩選器狀態
  const [showGoogleFilters, setShowGoogleFilters] = useState(false);
  const [googleFilters, setGoogleFilters] = useState({
    whiteBackground: true,
    highQuality: true,
    recentOnly: true,
    commercialUse: true,
    productPhotography: false,
    excludeLowQuality: true,
    useApify: false,
    backgroundColor: 'white' as string,  // 背景顏色
    productColor: 'any' as string,       // 商品主色
  });

  // 載入 Gemini Key 和標籤
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) setGeminiApiKey(savedKey);
    
    // 載入現有標籤
    fetch("/api/admin/tags-v2")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setExistingTags(data.tags);
        }
      })
      .catch(console.error);
  }, []);
  
  // 儲存 Gemini API Key
  const saveGeminiApiKey = () => {
    localStorage.setItem("gemini_api_key", geminiApiKey);
    alert("Gemini API Key 已儲存");
  };
  
  // 獲取可用的 Gemini 模型
  const fetchAvailableModels = async () => {
    if (!geminiApiKey) {
      alert("請先輸入 Gemini API Key");
      return;
    }
    
    setLoadingModels(true);
    try {
      const response = await fetch("/api/admin/gemini-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: geminiApiKey }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAvailableModels(data.models);
        alert(`成功載入 ${data.totalCount} 個可用模型`);
      } else {
        throw new Error(data.error || "獲取模型列表失敗");
      }
    } catch (error: any) {
      alert(`錯誤: ${error.message}`);
    } finally {
      setLoadingModels(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const toggleSource = (source: TrendPlatform) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const search = async () => {
    if (selectedSources.length === 0) {
      setError("請至少選擇一個資料源");
      return;
    }

    if (keywords.length === 0) {
      setError("請至少輸入一個關鍵字");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setCheckedAssets(new Set());
    setSearchStatus("開始搜尋...");

    try {
      console.log("[Frontend] Sending stream search request:", {
        sources: selectedSources,
        keywords,
        region,
        limit,
      });

      // 使用 SSE 串流 API
      const res = await fetch("/api/admin/gift-box-radar/search-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: selectedSources,
          keywords,
          region,
          limit,
          googleFilters: selectedSources.includes("google") ? googleFilters : undefined,
        }),
      });

      if (!res.ok) {
        let errorMsg = `HTTP ${res.status}`;
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {
          errorMsg = `伺服器錯誤 (${res.status})`;
        }
        throw new Error(errorMsg);
      }

      // 處理 SSE 串流
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error("無法讀取串流");
      }

      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // 解析 SSE 事件
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 保留未完成的行
        
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventType = line.slice(7);
            continue;
          }
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.platform && data.assets) {
                // 收到新的搜尋結果
                console.log(`[Frontend] Received ${data.count} items from ${data.platform}`);
                setSearchStatus(`搜尋中... 已找到 ${data.totalCount} 筆結果 (${data.platform}: +${data.count})`);
                setResults(prev => [...prev, ...data.assets]);
              } else if (data.message === "搜尋完成") {
                setSearchStatus(`搜尋完成，共 ${data.totalCount} 筆結果`);
              } else if (data.platform && !data.assets) {
                // 平台開始搜尋
                setSearchStatus(`正在搜尋 ${data.platform}...`);
              }
            } catch (e) {
              console.error("SSE parse error:", e, line);
            }
          }
        }
      }
      
      // 搜尋完成
      setSearchStatus("");
      
    } catch (err: any) {
      console.error("[Frontend] Search error:", err);
      
      let errorMessage = err.message || "搜尋失敗";
      
      if (err.name === "AbortError") {
        errorMessage = "搜尋超時，請減少關鍵字數量或選擇較少的平台";
      } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        errorMessage = "網路連線失敗。請檢查：\n1. 開發伺服器是否運行\n2. 瀏覽器控制台是否有 CORS 錯誤";
      } else if (errorMessage.includes("401")) {
        errorMessage = "未授權：請重新登入管理後台";
      }
      
      setError(errorMessage);
      setSearchStatus("");
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (assetId: string) => {
    setCheckedAssets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const exportSelected = async () => {
    const selectedAssets = results.filter((a) => checkedAssets.has(a.id));
    if (selectedAssets.length === 0) {
      alert("請至少勾選一張圖片");
      return;
    }

    setExporting(true);
    setExportProgress(0);

    try {
      const res = await fetch("/api/admin/gift-box-radar/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assets: selectedAssets.map((a) => ({
            imageUrl: a.imageUrl,
            title: a.title,
            id: a.id,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      
      // 將匯出成功的圖片加入編輯列表
      const newSelectedImages: SelectedImage[] = data.results
        .filter((r: any) => r.success)
        .map((r: any) => {
          const asset = selectedAssets.find((a) => a.id === r.id)!;
          return {
            url: r.url,
            title: asset.title,
            platform: asset.platform,
            asset,
            prompt: batchPrompt || "優化禮盒包裝設計，保持主要視覺元素",
            status: "pending" as const,
          };
        });

      setSelectedImages((prev) => [...prev, ...newSelectedImages]);
      alert(`成功匯出 ${data.successCount} 張圖片！`);
    } catch (err: any) {
      alert(`匯出失敗: ${err.message}`);
      console.error("Export error:", err);
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  const editWithGemini = async (index: number) => {
    if (!geminiApiKey) {
      alert("請先設定 Gemini API Key");
      return;
    }

    const img = selectedImages[index];
    if (!img.prompt.trim()) {
      alert("請輸入提示詞");
      return;
    }
    
    setSelectedImages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, status: "processing", error: undefined } : item))
    );

    try {
      const res = await fetch("/api/admin/gemini-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: img.url,
          prompt: img.prompt,
          apiKey: geminiApiKey,
          model: geminiModel,
        }),
        signal: AbortSignal.timeout(120000), // 2 minute timeout
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          throw new Error(data.error || `HTTP ${res.status}`);
        } else {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
        }
      }

      const data = await res.json();
      
      if (data.success) {
        setSelectedImages((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, status: "done", editedUrl: data.editedUrl }
              : item
          )
        );
      } else {
        throw new Error(data.error || "編輯失敗");
      }
    } catch (err: any) {
      console.error("Edit image error:", err);
      let errorMessage = err.message;
      
      // Handle specific error types
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        errorMessage = "請求超時（>2分鐘），請稍後重試";
      } else if (err.message === 'Failed to fetch') {
        errorMessage = "網路連接失敗，請檢查網路或API Key是否正確";
      } else if (err.message.includes('401')) {
        errorMessage = "API Key 無效或已過期";
      } else if (err.message.includes('429')) {
        errorMessage = "API 請求次數超過限制，請稍後重試";
      } else if (err.message.includes('500') || err.message.includes('503')) {
        errorMessage = "Gemini 服務暫時不可用，請稍後重試";
      }
      
      setSelectedImages((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, status: "error", error: errorMessage } : item
        )
      );
    }
  };

  // 分析已編輯的圖片（比照 trend-scanner）
  const analyzeEditedImage = async (index: number) => {
    const image = selectedImages[index];
    if (!image.editedUrl) {
      alert("請先編輯圖片");
      return;
    }
    
    if (!geminiApiKey) {
      alert("請先設定 Gemini API Key");
      return;
    }
    
    setSelectedImages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, status: "analyzing" } : item))
    );
    
    try {
      const res = await fetch("/api/admin/products-v2/analyze-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: geminiApiKey,
          imageUrl: image.editedUrl,
          title: image.title,
          userHint: image.userHint,
          existingTags: existingTags,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // 匹配標籤
        const suggestedTags: (SuggestedTag | string)[] = data.productData.suggestedTags || [];
        const matchedTags: Tag[] = [];
        const unmatchedTags: SuggestedTag[] = [];
        
        const normalize = (str: string) => str?.toLowerCase().trim().replace(/\s+/g, '') || '';
        
        suggestedTags.forEach((tag: SuggestedTag | string) => {
          const tagZh = typeof tag === 'string' ? tag : tag.zh;
          const tagEn = typeof tag === 'string' ? tag : tag.en;
          const normalizedZh = normalize(tagZh);
          const normalizedEn = normalize(tagEn);
          
          const found = existingTags.find((t) => {
            if (t.name === tagZh || t.name_zh === tagZh || t.name === tagEn) return true;
            if (t.name_en?.toLowerCase() === tagEn?.toLowerCase()) return true;
            if (normalize(t.name) === normalizedZh || normalize(t.name_zh || '') === normalizedZh) return true;
            if (normalize(t.name_en || '') === normalizedEn) return true;
            if (normalizedZh && normalize(t.name_zh || t.name).includes(normalizedZh)) return true;
            if (normalizedZh && normalizedZh.includes(normalize(t.name_zh || t.name))) return true;
            if (normalizedEn && normalize(t.name_en || '').includes(normalizedEn)) return true;
            if (normalizedEn && normalizedEn.includes(normalize(t.name_en || ''))) return true;
            return false;
          });
          
          if (found && !matchedTags.some(mt => mt.id === found.id)) {
            matchedTags.push(found);
          } else if (!found) {
            unmatchedTags.push(typeof tag === 'string' ? { zh: tag, en: tag } : tag);
          }
        });
        
        setSelectedImages((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  status: "analyzed" as const,
                  productData: {
                    ...data.productData,
                    matchedTags,
                    unmatchedTags,
                  },
                }
              : item
          )
        );
      } else {
        throw new Error(data.error || "分析失敗");
      }
    } catch (error: any) {
      setSelectedImages((prev) =>
        prev.map((item, i) =>
          i === index
            ? { ...item, status: "done" as const, error: error.message }
            : item
        )
      );
      alert(`分析失敗: ${error.message}\n\n圖片已保留，您可以稍後重試分析。`);
    }
  };

  // 發布編輯後的產品（比照 trend-scanner）
  const publishEditedProduct = async (index: number) => {
    const image = selectedImages[index];
    if (!image.productData || !image.editedUrl) return;
    
    const imageKey = image.url;
    setPublishingProduct(imageKey);
    
    try {
      const slug = (image.productData.name_en || image.productData.name_zh || "product")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        + "-" + Date.now();
      
      const res = await fetch("/api/admin/products-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: image.productData.name_en || image.productData.name_zh || "New Product",
          name_zh: image.productData.name_zh,
          name_en: image.productData.name_en,
          description_zh: image.productData.description_zh,
          description_en: image.productData.description_en,
          shortDesc_zh: image.productData.features_zh,
          shortDesc_en: image.productData.features_en,
          dimensions_zh: image.productData.dimensions_zh,
          dimensions_en: image.productData.dimensions_en,
          materials_zh: image.productData.materials_zh,
          materials_en: image.productData.materials_en,
          minQty: image.productData.minQty,
          priceHint_zh: image.productData.priceHint_zh,
          priceHint_en: image.productData.priceHint_en,
          leadTime_zh: image.productData.leadTime_zh,
          leadTime_en: image.productData.leadTime_en,
          coverImage: image.editedUrl,
          category: "GIFT",
          tagIds: image.productData.matchedTags?.map((t: Tag) => t.id) || [],
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert("✅ 產品已成功發布！");
        removeSelectedImage(index);
      } else {
        throw new Error(data.error || data.message || "發布失敗");
      }
    } catch (error: any) {
      alert(`發布失敗: ${error.message}`);
    } finally {
      setPublishingProduct(null);
    }
  };
  
  // 批次編輯所有圖片
  const editAllImages = async () => {
    if (!geminiApiKey) {
      alert("請先設定 Gemini API Key");
      return;
    }
    
    const imagesToEdit = selectedImages
      .map((img, idx) => ({ img, idx }))
      .filter(({ img }) => img.status === "pending" && img.prompt.trim());
    
    for (const { idx } of imagesToEdit) {
      await editWithGemini(idx);
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎁 Global Gift Box Radar
          </h1>
          <p className="text-gray-600">
            全球禮盒設計趨勢掃描器 - 使用 Apify 聚合多平台資料
          </p>
        </div>

        {/* Search Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">搜尋設定</h2>

          {/* Platform Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">資料源（Phase 1）</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => toggleSource(platform.id as TrendPlatform)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    selectedSources.includes(platform.id as TrendPlatform)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {platform.icon} {platform.name}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">關鍵字</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                placeholder="輸入關鍵字後按 Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addKeyword}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                新增
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700 mb-2"
          >
            {showAdvanced ? "▼" : "▶"} 進階選項
          </button>

          {showAdvanced && (
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">地區</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">數量限制</label>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
                    min="10"
                    max="200"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Google Images 進階篩選器 */}
              {selectedSources.includes("google") && (
                <div className="border-t pt-4">
                  <button
                    onClick={() => setShowGoogleFilters(!showGoogleFilters)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-3"
                  >
                    <span>{showGoogleFilters ? "▼" : "▶"}</span>
                    <span>🔍 Google Images 進階篩選</span>
                    <span className="text-xs text-gray-500">
                      （{Object.values(googleFilters).filter(Boolean).length}/6 個篩選器啟用）
                    </span>
                  </button>

                  {showGoogleFilters && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg space-y-4">
                      <p className="text-xs text-gray-600 mb-3">
                        💡 適合設計師的專業篩選選項，打造精準的圖片搜尋結果
                      </p>

                      {/* 顏色選擇器 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border-2 border-indigo-200">
                        {/* 背景顏色 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            🎨 背景顏色
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { value: 'any', label: '不限', color: 'bg-gradient-to-br from-gray-200 to-gray-300' },
                              { value: 'white', label: '白色', color: 'bg-white border-2 border-gray-300' },
                              { value: 'black', label: '黑色', color: 'bg-black' },
                              { value: 'gray', label: '灰色', color: 'bg-gray-400' },
                              { value: 'blue', label: '藍色', color: 'bg-blue-500' },
                              { value: 'red', label: '紅色', color: 'bg-red-500' },
                              { value: 'orange', label: '橙色', color: 'bg-orange-500' },
                              { value: 'yellow', label: '黃色', color: 'bg-yellow-400' },
                              { value: 'green', label: '綠色', color: 'bg-green-500' },
                              { value: 'teal', label: '青色', color: 'bg-teal-500' },
                              { value: 'purple', label: '紫色', color: 'bg-purple-500' },
                              { value: 'pink', label: '粉色', color: 'bg-pink-500' },
                              { value: 'brown', label: '棕色', color: 'bg-amber-700' },
                            ].map((colorOption) => (
                              <button
                                key={colorOption.value}
                                onClick={() => setGoogleFilters({ ...googleFilters, backgroundColor: colorOption.value })}
                                className={`
                                  relative h-12 rounded-lg transition-all
                                  ${colorOption.color}
                                  ${googleFilters.backgroundColor === colorOption.value 
                                    ? 'ring-4 ring-indigo-500 scale-105 shadow-lg' 
                                    : 'hover:scale-105 hover:shadow-md'
                                  }
                                `}
                                title={colorOption.label}
                              >
                                {googleFilters.backgroundColor === colorOption.value && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-2xl ${colorOption.value === 'white' || colorOption.value === 'yellow' ? 'text-gray-800' : 'text-white'}`}>
                                      ✓
                                    </span>
                                  </div>
                                )}
                                <span className={`absolute bottom-0 left-0 right-0 text-[10px] font-medium px-1 py-0.5 ${
                                  colorOption.value === 'white' || colorOption.value === 'yellow' 
                                    ? 'text-gray-800' 
                                    : colorOption.value === 'any'
                                    ? 'text-gray-700'
                                    : 'text-white'
                                }`}>
                                  {colorOption.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 商品主色 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            🎁 商品主色
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { value: 'any', label: '不限', color: 'bg-gradient-to-br from-gray-200 to-gray-300' },
                              { value: 'white', label: '白色', color: 'bg-white border-2 border-gray-300' },
                              { value: 'black', label: '黑色', color: 'bg-black' },
                              { value: 'gray', label: '灰色', color: 'bg-gray-400' },
                              { value: 'blue', label: '藍色', color: 'bg-blue-500' },
                              { value: 'red', label: '紅色', color: 'bg-red-500' },
                              { value: 'orange', label: '橙色', color: 'bg-orange-500' },
                              { value: 'yellow', label: '黃色', color: 'bg-yellow-400' },
                              { value: 'green', label: '綠色', color: 'bg-green-500' },
                              { value: 'teal', label: '青色', color: 'bg-teal-500' },
                              { value: 'purple', label: '紫色', color: 'bg-purple-500' },
                              { value: 'pink', label: '粉色', color: 'bg-pink-500' },
                              { value: 'brown', label: '棕色', color: 'bg-amber-700' },
                            ].map((colorOption) => (
                              <button
                                key={colorOption.value}
                                onClick={() => setGoogleFilters({ ...googleFilters, productColor: colorOption.value })}
                                className={`
                                  relative h-12 rounded-lg transition-all
                                  ${colorOption.color}
                                  ${googleFilters.productColor === colorOption.value 
                                    ? 'ring-4 ring-pink-500 scale-105 shadow-lg' 
                                    : 'hover:scale-105 hover:shadow-md'
                                  }
                                `}
                                title={colorOption.label}
                              >
                                {googleFilters.productColor === colorOption.value && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-2xl ${colorOption.value === 'white' || colorOption.value === 'yellow' ? 'text-gray-800' : 'text-white'}`}>
                                      ✓
                                    </span>
                                  </div>
                                )}
                                <span className={`absolute bottom-0 left-0 right-0 text-[10px] font-medium px-1 py-0.5 ${
                                  colorOption.value === 'white' || colorOption.value === 'yellow' 
                                    ? 'text-gray-800' 
                                    : colorOption.value === 'any'
                                    ? 'text-gray-700'
                                    : 'text-white'
                                }`}>
                                  {colorOption.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 顏色組合提示 */}
                        <div className="col-span-full mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-indigo-700 font-semibold">當前組合：</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded ${
                                googleFilters.backgroundColor === 'white' ? 'bg-white border-2 border-gray-300 text-gray-800' :
                                googleFilters.backgroundColor === 'black' ? 'bg-black text-white' :
                                googleFilters.backgroundColor === 'any' ? 'bg-gray-200 text-gray-700' :
                                `bg-${googleFilters.backgroundColor}-500 text-white`
                              }`}>
                                {googleFilters.backgroundColor === 'any' ? '任意背景' : `${googleFilters.backgroundColor} 背景`}
                              </span>
                              <span className="text-indigo-600">+</span>
                              <span className={`px-2 py-1 rounded ${
                                googleFilters.productColor === 'white' ? 'bg-white border-2 border-gray-300 text-gray-800' :
                                googleFilters.productColor === 'black' ? 'bg-black text-white' :
                                googleFilters.productColor === 'any' ? 'bg-gray-200 text-gray-700' :
                                `bg-${googleFilters.productColor}-500 text-white`
                              }`}>
                                {googleFilters.productColor === 'any' ? '任意商品' : `${googleFilters.productColor} 商品`}
                              </span>
                            </div>
                          </div>
                          {googleFilters.backgroundColor === googleFilters.productColor && googleFilters.backgroundColor !== 'any' && (
                            <p className="text-xs text-orange-600 mt-2">
                              ⚠️ 背景色和商品色相同，可能導致對比度不佳
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 快速預設組 */}
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <button
                          onClick={() => setGoogleFilters({
                            whiteBackground: true,
                            highQuality: true,
                            recentOnly: true,
                            commercialUse: true,
                            productPhotography: false,
                            excludeLowQuality: true,
                            useApify: false,
                            backgroundColor: 'white',
                            productColor: 'any',
                          })}
                          className="px-3 py-1 text-xs bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
                        >
                          ⚡ 電商產品照（白底彩品）
                        </button>
                        <button
                          onClick={() => setGoogleFilters({
                            whiteBackground: false,
                            highQuality: true,
                            recentOnly: false,
                            commercialUse: false,
                            productPhotography: true,
                            excludeLowQuality: true,
                            useApify: false,
                            backgroundColor: 'white',
                            productColor: 'any',
                          })}
                          className="px-3 py-1 text-xs bg-white border border-purple-300 text-purple-700 rounded hover:bg-purple-50"
                        >
                          📸 專業攝影（嚴格）
                        </button>
                        <button
                          onClick={() => setGoogleFilters({
                            whiteBackground: false,
                            highQuality: true,
                            recentOnly: true,
                            commercialUse: true,
                            productPhotography: false,
                            excludeLowQuality: false,
                            useApify: false,
                            backgroundColor: 'black',
                            productColor: 'any',
                          })}
                          className="px-3 py-1 text-xs bg-gray-800 border border-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          🌙 黑底風格（高級感）
                        </button>
                        <button
                          onClick={() => setGoogleFilters({
                            whiteBackground: false,
                            highQuality: true,
                            recentOnly: true,
                            commercialUse: true,
                            productPhotography: false,
                            excludeLowQuality: false,
                            useApify: false,
                            backgroundColor: 'any',
                            productColor: 'red',
                          })}
                          className="px-3 py-1 text-xs bg-red-500 border border-red-600 text-white rounded hover:bg-red-600"
                        >
                          🎁 紅色商品（節慶）
                        </button>
                        <button
                          onClick={() => setGoogleFilters({
                            whiteBackground: false,
                            highQuality: false,
                            recentOnly: false,
                            commercialUse: false,
                            productPhotography: false,
                            excludeLowQuality: false,
                            useApify: false,
                            backgroundColor: 'any',
                            productColor: 'any',
                          })}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                          🔄 全部關閉
                        </button>
                      </div>

                      {/* 詳細篩選選項 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* 白背景模式 */}
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={googleFilters.whiteBackground}
                            onChange={(e) => setGoogleFilters({ ...googleFilters, whiteBackground: e.target.checked })}
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">⚪ 白背景模式</div>
                            <div className="text-xs text-gray-600 mt-1">
                              限定白色為主色調，適合電商產品照
                            </div>
                          </div>
                        </label>

                        {/* 高品質模式 */}
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={googleFilters.highQuality}
                            onChange={(e) => setGoogleFilters({ ...googleFilters, highQuality: e.target.checked })}
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">✨ 高品質模式</div>
                            <div className="text-xs text-gray-600 mt-1">
                              超大尺寸、真實照片、JPG 格式、去重
                            </div>
                          </div>
                        </label>

                        {/* 最近內容 */}
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={googleFilters.recentOnly}
                            onChange={(e) => setGoogleFilters({ ...googleFilters, recentOnly: e.target.checked })}
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">🆕 僅最近內容</div>
                            <div className="text-xs text-gray-600 mt-1">
                              限制最近 2 年上傳，追蹤最新趨勢
                            </div>
                          </div>
                        </label>

                        {/* 商業授權 */}
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={googleFilters.commercialUse}
                            onChange={(e) => setGoogleFilters({ ...googleFilters, commercialUse: e.target.checked })}
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">📜 商業授權</div>
                            <div className="text-xs text-gray-600 mt-1">
                              包含 CC 授權圖片（可合法使用）
                            </div>
                          </div>
                        </label>

                        {/* 產品攝影模式 */}
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-orange-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={googleFilters.productPhotography}
                            onChange={(e) => setGoogleFilters({ ...googleFilters, productPhotography: e.target.checked })}
                            className="mt-1 w-4 h-4 text-orange-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              📸 產品攝影模式
                              <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">嚴格</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              僅限電商網站（Amazon, Shopify, Etsy）
                            </div>
                          </div>
                        </label>

                        {/* 排除低品質 */}
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={googleFilters.excludeLowQuality}
                            onChange={(e) => setGoogleFilters({ ...googleFilters, excludeLowQuality: e.target.checked })}
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">🚫 排除低品質</div>
                            <div className="text-xs text-gray-600 mt-1">
                              過濾 DIY、手作、廉價、低解析度內容
                            </div>
                          </div>
                        </label>

                        {/* 使用 Apify */}
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={googleFilters.useApify}
                            onChange={(e) => setGoogleFilters({ ...googleFilters, useApify: e.target.checked })}
                            className="mt-1 w-4 h-4 text-indigo-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              🤖 使用 Apify Actor
                              <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">進階</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              透過 Apify 爬蟲取得更多結果（需 token）
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* 提示訊息 */}
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <strong>💡 提示：</strong> 
                        {googleFilters.useApify 
                          ? "Apify 模式可取得更多結果，但需要 APIFY_TOKEN 環境變數"
                          : googleFilters.backgroundColor === googleFilters.productColor && googleFilters.backgroundColor !== 'any'
                          ? `⚠️ 背景色和商品色都是 ${googleFilters.backgroundColor}，建議改變其中一個以提升對比度`
                          : googleFilters.productPhotography 
                          ? "產品攝影模式會大幅限制結果範圍，但品質最高"
                          : googleFilters.backgroundColor === 'white' && googleFilters.productColor === 'any'
                          ? "白背景 + 任意商品色：系統會自動搜尋彩色商品，避免全白圖片"
                          : googleFilters.backgroundColor === 'black' && googleFilters.productColor === 'any'
                          ? "黑背景 + 任意商品色：適合尋找高級感、藝術感的設計"
                          : googleFilters.backgroundColor !== 'any' && googleFilters.productColor !== 'any'
                          ? `${googleFilters.backgroundColor} 背景 + ${googleFilters.productColor} 商品：精準色彩搭配，結果更聚焦`
                          : "建議選擇背景色和商品色組合，以獲得更精準的搜尋結果"
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={search}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (searchStatus || "搜尋中...") : "🔍 開始搜尋"}
          </button>

          {/* 即時搜尋狀態 */}
          {loading && searchStatus && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                {searchStatus}
              </div>
              {results.length > 0 && (
                <div className="mt-1 text-xs text-blue-600">
                  目前已載入 {results.length} 張圖片，持續搜尋中...
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Results - 即使在載入中也顯示 */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                搜尋結果 ({results.length} 張)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCheckedAssets(new Set(results.map((r) => r.id)))}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  全選
                </button>
                <button
                  onClick={() => setCheckedAssets(new Set())}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消全選
                </button>
                <button
                  onClick={exportSelected}
                  disabled={exporting || checkedAssets.size === 0}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  匯出選中 ({checkedAssets.size})
                </button>
              </div>
            </div>

            {/* Batch Prompt */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">批次編輯提示詞（選填）</label>
              <input
                type="text"
                value={batchPrompt}
                onChange={(e) => setBatchPrompt(e.target.value)}
                placeholder="例如：優化禮盒包裝設計，保持主要視覺元素"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((asset) => (
                <div
                  key={asset.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={checkedAssets.has(asset.id)}
                      onChange={() => toggleCheck(asset.id)}
                      className="absolute top-2 left-2 w-5 h-5 z-10 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative h-48 bg-gray-100 hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={asset.imageUrl}
                        alt={asset.title}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/400x400?text=No+Image";
                        }}
                      />
                    </a>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      {PLATFORMS.find((p) => p.id === asset.platform)?.icon}{" "}
                      {asset.platform}
                    </div>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium line-clamp-2 mb-2 hover:text-blue-600 block"
                    >
                      {asset.title}
                    </a>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>🔥 {asset.popularityScore}</span>
                      {asset.price && (
                        <span>
                          {asset.currency} {asset.price}
                        </span>
                      )}
                    </div>
                    {(asset.likeCount || asset.viewCount || asset.reviewCount) && (
                      <div className="flex gap-2 mt-2 text-xs text-gray-500">
                        {asset.viewCount ? <span>👁️ {asset.viewCount.toLocaleString()}</span> : null}
                        {asset.likeCount ? <span>❤️ {asset.likeCount.toLocaleString()}</span> : null}
                        {asset.reviewCount ? <span>⭐ {asset.reviewCount.toLocaleString()}</span> : null}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== Gemini 圖片編輯區 ========== */}
        {selectedImages.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    🤖 Gemini AI 圖片編輯
                  </h2>
                  <p className="text-purple-100 text-sm">
                    輸入提示詞，AI 將根據指令修改圖片
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editAllImages}
                    disabled={selectedImages.every((img) => img.status !== "pending" || !img.prompt.trim())}
                    className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🚀 批次執行
                  </button>
                </div>
              </div>
            </div>
            
            {/* Gemini 設定區 */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gemini API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="輸入 Gemini API Key"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={saveGeminiApiKey}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      儲存
                    </button>
                    <button
                      onClick={fetchAvailableModels}
                      disabled={loadingModels}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loadingModels ? "載入中..." : "檢查模型"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    取得：<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">Google AI Studio</a>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gemini 模型選擇
                  </label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="gemini-3-pro-image-preview">Gemini 3 Pro Image Preview (推薦)</option>
                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    如果遇到地區限制錯誤，請選擇 Gemini 2.0 Flash
                  </p>
                </div>
              </div>
              
              {/* 批次提示詞 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={batchPrompt}
                  onChange={(e) => setBatchPrompt(e.target.value)}
                  placeholder="輸入批次提示詞，套用到所有圖片..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => {
                    if (batchPrompt.trim()) {
                      setSelectedImages((prev) =>
                        prev.map((img) => ({ ...img, prompt: batchPrompt }))
                      );
                    }
                  }}
                  disabled={!batchPrompt.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  套用全部
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                提示詞範例：「移除背景換成白色」「加上高級感的陰影」「調整成暖色調」
              </p>
            </div>
            
            {/* 圖片編輯列表 */}
            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedImages.map((image, index) => (
                <div
                  key={index}
                  className={`border rounded-lg overflow-hidden ${
                    image.status === "analyzed" 
                      ? "border-green-500 ring-2 ring-green-200" 
                      : "border-gray-200"
                  }`}
                >
                  {/* 圖片預覽 */}
                  <div className="grid grid-cols-2 gap-1 p-2 bg-gray-100">
                    {/* 原圖 */}
                    <div className="relative">
                      <div 
                        className="aspect-square bg-white rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500"
                        onClick={() => setLightboxImage(image.url)}
                      >
                        <Image
                          src={image.url}
                          alt={image.title}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/200x200?text=Error";
                          }}
                        />
                      </div>
                      <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-1 rounded">
                        原圖
                      </span>
                    </div>
                    
                    {/* 編輯後 */}
                    <div className="relative">
                      <div className="aspect-square bg-white rounded overflow-hidden flex items-center justify-center">
                        {image.status === "processing" && (
                          <div className="text-center">
                            <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-xs text-gray-500 mt-2">AI 處理中...</p>
                          </div>
                        )}
                        {image.status === "analyzing" && (
                          <div className="text-center">
                            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-xs text-gray-500 mt-2">分析中...</p>
                          </div>
                        )}
                        {(image.status === "done" || image.status === "analyzed") && image.editedUrl && (
                          <div 
                            className="w-full h-full cursor-pointer hover:ring-2 hover:ring-purple-500"
                            onClick={() => setLightboxImage(image.editedUrl!)}
                          >
                            <Image
                              src={image.editedUrl}
                              alt="編輯後"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        {image.status === "error" && (
                          <div className="text-center p-2">
                            <span className="text-2xl">❌</span>
                            <p className="text-xs text-red-500 mt-1">{image.error}</p>
                          </div>
                        )}
                        {image.status === "pending" && (
                          <span className="text-gray-400 text-sm">等待編輯</span>
                        )}
                      </div>
                      <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-1 rounded">
                        AI 編輯
                      </span>
                    </div>
                  </div>
                  
                  {/* 標題與操作 */}
                  <div className="p-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700 font-medium line-clamp-1 mb-2">
                      {image.title}
                    </p>
                    
                    {/* 提示詞輸入（編輯階段） */}
                    {(image.status === "pending" || image.status === "processing" || image.status === "error") && (
                      <div className="space-y-2">
                        <textarea
                          value={image.prompt}
                          onChange={(e) =>
                            setSelectedImages((prev) =>
                              prev.map((item, i) =>
                                i === index ? { ...item, prompt: e.target.value } : item
                              )
                            )
                          }
                          placeholder="輸入提示詞..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                        
                        <div className="flex justify-between">
                          <button
                            onClick={() => removeSelectedImage(index)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            移除
                          </button>
                          <button
                            onClick={() => editWithGemini(index)}
                            disabled={image.status === "processing" || !image.prompt.trim()}
                            className={`px-3 py-1 text-sm rounded-lg font-medium ${
                              image.status === "processing" || !image.prompt.trim()
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-purple-600 text-white hover:bg-purple-700"
                            }`}
                          >
                            {image.status === "processing" ? "處理中..." : "執行編輯"}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* 編輯完成：分析按鈕 */}
                    {image.status === "done" && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={image.userHint || ""}
                          onChange={(e) => {
                            setSelectedImages((prev) =>
                              prev.map((img, i) =>
                                i === index ? { ...img, userHint: e.target.value } : img
                              )
                            );
                          }}
                          placeholder="可選：告訴 AI 這是什麼產品..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => analyzeEditedImage(index)}
                          className="w-full px-3 py-2 text-sm rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          🔍 分析產品
                        </button>
                        <button
                          onClick={() => removeSelectedImage(index)}
                          className="w-full text-xs text-red-500 hover:text-red-700"
                        >
                          移除
                        </button>
                      </div>
                    )}
                    
                    {/* 分析完成：顯示資料與發布按鈕 */}
                    {image.status === "analyzed" && image.productData && (
                      <div className="space-y-3">
                        <div className="bg-green-50 p-2 rounded border border-green-200">
                          <p className="text-xs text-green-800 font-medium mb-1">✅ 分析完成</p>
                          <p className="text-sm font-medium text-gray-800">{image.productData.name_zh}</p>
                          <p className="text-xs text-gray-500">{image.productData.name_en}</p>
                        </div>
                        
                        {/* 標籤 */}
                        {image.productData.matchedTags && image.productData.matchedTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {image.productData.matchedTags.map((tag) => (
                              <span key={tag.id} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                {tag.name_zh || tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* 重新分析區塊 */}
                        <div className="border-t border-gray-200 pt-2">
                          <input
                            type="text"
                            value={image.userHint || ""}
                            onChange={(e) => {
                              setSelectedImages((prev) =>
                                prev.map((img, i) =>
                                  i === index ? { ...img, userHint: e.target.value } : img
                                )
                              );
                            }}
                            placeholder="輸入提示詞重新分析..."
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 mb-1"
                          />
                          <button
                            onClick={() => analyzeEditedImage(index)}
                            className="w-full px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                          >
                            🔄 重新分析
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => setExpandedProductDetail(image.url)}
                            className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            查看詳情
                          </button>
                          <button
                            onClick={() => publishEditedProduct(index)}
                            disabled={publishingProduct === image.url}
                            className="flex-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            {publishingProduct === image.url ? "發布中..." : "發布產品"}
                          </button>
                        </div>
                        <button
                          onClick={() => removeSelectedImage(index)}
                          className="w-full text-xs text-red-500 hover:text-red-700"
                        >
                          移除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightboxImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300"
                onClick={() => setLightboxImage(null)}
              >
                ✕
              </button>
              <Image
                src={lightboxImage}
                alt="Preview"
                width={1200}
                height={1200}
                className="object-contain max-h-[90vh]"
                unoptimized
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
        
        {/* 產品詳情編輯 Modal */}
        {expandedProductDetail && (() => {
          const image = selectedImages.find(img => img.url === expandedProductDetail);
          if (!image || !image.productData) return null;
          
          return (
            <div 
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setExpandedProductDetail(null)}
            >
              <div 
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold">📊 產品分析詳情 - 可編輯</h2>
                  <button
                    onClick={() => setExpandedProductDetail(null)}
                    className="text-2xl hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* 圖片預覽 */}
                    <div>
                      <Image
                        src={image.editedUrl || image.url}
                        alt={image.title}
                        width={500}
                        height={500}
                        className="w-full rounded-lg"
                        unoptimized
                      />
                    </div>
                    
                    {/* 編輯表單 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          產品名稱（中文）<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={image.productData.name_zh || ""}
                          onChange={(e) => {
                            const idx = selectedImages.findIndex(img => img.url === expandedProductDetail);
                            if (idx !== -1) {
                              setSelectedImages(prev => prev.map((img, i) => 
                                i === idx 
                                  ? { ...img, productData: { ...img.productData!, name_zh: e.target.value }}
                                  : img
                              ));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name (English)<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={image.productData.name_en || ""}
                          onChange={(e) => {
                            const idx = selectedImages.findIndex(img => img.url === expandedProductDetail);
                            if (idx !== -1) {
                              setSelectedImages(prev => prev.map((img, i) => 
                                i === idx 
                                  ? { ...img, productData: { ...img.productData!, name_en: e.target.value }}
                                  : img
                              ));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">描述（中文）</label>
                        <textarea
                          value={image.productData.description_zh || ""}
                          onChange={(e) => {
                            const idx = selectedImages.findIndex(img => img.url === expandedProductDetail);
                            if (idx !== -1) {
                              setSelectedImages(prev => prev.map((img, i) => 
                                i === idx 
                                  ? { ...img, productData: { ...img.productData!, description_zh: e.target.value }}
                                  : img
                              ));
                            }
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                        <textarea
                          value={image.productData.description_en || ""}
                          onChange={(e) => {
                            const idx = selectedImages.findIndex(img => img.url === expandedProductDetail);
                            if (idx !== -1) {
                              setSelectedImages(prev => prev.map((img, i) => 
                                i === idx 
                                  ? { ...img, productData: { ...img.productData!, description_en: e.target.value }}
                                  : img
                              ));
                            }
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">材質（中文）</label>
                        <input
                          type="text"
                          value={image.productData.materials_zh || ""}
                          onChange={(e) => {
                            const idx = selectedImages.findIndex(img => img.url === expandedProductDetail);
                            if (idx !== -1) {
                              setSelectedImages(prev => prev.map((img, i) => 
                                i === idx 
                                  ? { ...img, productData: { ...img.productData!, materials_zh: e.target.value }}
                                  : img
                              ));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Materials (English)</label>
                        <input
                          type="text"
                          value={image.productData.materials_en || ""}
                          onChange={(e) => {
                            const idx = selectedImages.findIndex(img => img.url === expandedProductDetail);
                            if (idx !== -1) {
                              setSelectedImages(prev => prev.map((img, i) => 
                                i === idx 
                                  ? { ...img, productData: { ...img.productData!, materials_en: e.target.value }}
                                  : img
                              ));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">最小訂購量</label>
                        <input
                          type="number"
                          value={image.productData.minQty || ""}
                          onChange={(e) => {
                            const idx = selectedImages.findIndex(img => img.url === expandedProductDetail);
                            if (idx !== -1) {
                              setSelectedImages(prev => prev.map((img, i) => 
                                i === idx 
                                  ? { ...img, productData: { ...img.productData!, minQty: parseInt(e.target.value) || undefined }}
                                  : img
                              ));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* 標籤顯示 */}
                      {image.productData.matchedTags && image.productData.matchedTags.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">已匹配標籤</label>
                          <div className="flex flex-wrap gap-2">
                            {image.productData.matchedTags.map((tag) => (
                              <span key={tag.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {tag.name_zh || tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {image.productData.unmatchedTags && image.productData.unmatchedTags.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">建議新增標籤</label>
                          <div className="flex flex-wrap gap-2">
                            {image.productData.unmatchedTags.map((tag, i) => (
                              <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                {tag.zh}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          const idx = selectedImages.findIndex(img => img.url === expandedProductDetail);
                          if (idx !== -1) {
                            publishEditedProduct(idx);
                          }
                        }}
                        disabled={publishingProduct === expandedProductDetail}
                        className="w-full mt-4 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
                      >
                        {publishingProduct === expandedProductDetail ? "發布中..." : "✅ 發布產品"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
