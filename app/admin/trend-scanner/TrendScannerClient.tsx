"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Product {
  title: string;
  link: string;
  source: string;
  thumbnail?: string;
  price?: string;
  position: number;
}

interface TrendResult {
  region: string;
  regionName: string;
  searchQuery: string;
  products: Product[];
}

interface ApiConfig {
  regions: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  sources: { id: string; name: string }[];
  apiStatus: {
    serpapi: boolean;
  };
}

// 建議標籤（中英文）
interface SuggestedTag {
  zh: string;
  en: string;
}

// 選中的圖片（用於 Gemini 編輯）
interface SelectedImage {
  url: string;
  title: string;
  prompt: string;
  status: "pending" | "processing" | "done" | "error" | "analyzing" | "analyzed";
  editedUrl?: string;
  error?: string;
  userHint?: string; // 用戶提示詞，用於重新分析
  // 產品分析資料
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

interface Tag {
  id: string;
  name: string;
  name_en?: string;
  name_zh?: string;
}

export default function TrendScannerClient() {
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["asia"]);
  const [category, setCategory] = useState<string>("packaging");
  const [source, setSource] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TrendResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasRealData, setHasRealData] = useState(false);
  
  // 使用者可設定的參數
  const [limit, setLimit] = useState<number>(20);
  const [keywords, setKeywords] = useState<string>("");
  const [customSerpApiKey, setCustomSerpApiKey] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // 圖片風格篩選
  const [imageStyle, setImageStyle] = useState<"all" | "with_bg" | "no_bg">("all");
  
  // 選中的圖片列表（用於 Gemini 編輯）
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [checkedImages, setCheckedImages] = useState<Set<string>>(new Set());
  
  // Gemini API Key
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  
  // Gemini 模型選擇
  const [geminiModel, setGeminiModel] = useState<string>("gemini-3-pro-image-preview");
  
  // 可用模型列表
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  
  // 批次提示詞
  const [batchPrompt, setBatchPrompt] = useState<string>("");
  
  // 自動翻譯
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // 圖片放大預覽
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // 產品分析功能
  const [analyzingImage, setAnalyzingImage] = useState<string | null>(null);
  const [analyzedProducts, setAnalyzedProducts] = useState<Map<string, any>>(new Map());
  const [publishingProduct, setPublishingProduct] = useState<string | null>(null);
  
  // 現有標籤列表
  const [existingTags, setExistingTags] = useState<Tag[]>([]);
  
  // 產品詳情展開
  const [expandedProductDetail, setExpandedProductDetail] = useState<string | null>(null);

  // 載入配置
  useEffect(() => {
    fetch("/api/admin/trend-scanner")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfig(data);
        }
      })
      .catch(console.error);
      
    // 載入 Gemini API Key
    const savedGeminiKey = localStorage.getItem("gemini_api_key");
    if (savedGeminiKey) {
      setGeminiApiKey(savedGeminiKey);
    }
    
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

  // 直接分析產品
  const analyzeProductDirectly = async (imageUrl: string, title: string) => {
    if (!geminiApiKey) {
      alert("請先設定 Gemini API Key");
      return;
    }
    
    setAnalyzingImage(imageUrl);
    
    try {
      // 直接傳送圖片 URL 給後端處理（避免 CORS 問題）
      const response = await fetch("/api/admin/products-v2/analyze-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: geminiApiKey,
          imageUrl,
          title,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 儲存分析結果
        setAnalyzedProducts(prev => new Map(prev).set(imageUrl, {
          ...data.productData,
          originalTitle: title,
          imageUrl,
        }));
        alert("✅ 分析完成！");
      } else {
        throw new Error(data.error || "分析失敗");
      }
    } catch (error: any) {
      alert(`分析失敗: ${error.message}`);
    } finally {
      setAnalyzingImage(null);
    }
  };
  
  // 分析已編輯的圖片
  const analyzeEditedImage = async (originalUrl: string) => {
    const image = selectedImages.find((img) => img.url === originalUrl);
    if (!image || !image.editedUrl) {
      alert("請先編輯圖片");
      return;
    }
    
    if (!geminiApiKey) {
      alert("請先設定 Gemini API Key");
      return;
    }
    
    // 更新狀態為分析中
    setSelectedImages((prev) =>
      prev.map((img) =>
        img.url === originalUrl ? { ...img, status: "analyzing" as const } : img
      )
    );
    
    try {
      // 直接傳送圖片 URL 給後端處理（避免 CORS 問題）
      const response = await fetch("/api/admin/products-v2/analyze-direct", {
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
      
      const data = await response.json();
      
      if (data.success) {
        // 匹配標籤（支援多種格式）
        const suggestedTags: (SuggestedTag | string)[] = data.productData.suggestedTags || [];
        const matchedTags: Tag[] = [];
        const unmatchedTags: SuggestedTag[] = [];
        
        // 輔助函數：標準化比較（忽略大小寫、空格等）
        const normalize = (str: string) => str?.toLowerCase().trim().replace(/\s+/g, '') || '';
        
        suggestedTags.forEach((tag: SuggestedTag | string) => {
          // 支援舊格式（字串）和新格式（{zh, en}）
          const tagZh = typeof tag === 'string' ? tag : tag.zh;
          const tagEn = typeof tag === 'string' ? tag : tag.en;
          const normalizedZh = normalize(tagZh);
          const normalizedEn = normalize(tagEn);
          
          // 嘗試多種匹配方式
          const found = existingTags.find((t) => {
            // 精確匹配
            if (t.name === tagZh || t.name_zh === tagZh || t.name === tagEn) return true;
            // 忽略大小寫匹配英文
            if (t.name_en?.toLowerCase() === tagEn?.toLowerCase()) return true;
            // 標準化匹配（忽略空格等）
            if (normalize(t.name) === normalizedZh || normalize(t.name_zh || '') === normalizedZh) return true;
            if (normalize(t.name_en || '') === normalizedEn) return true;
            // 部分匹配（標籤名稱包含在內）
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
        
        // 更新圖片狀態
        setSelectedImages((prev) =>
          prev.map((img) =>
            img.url === originalUrl
              ? {
                  ...img,
                  status: "analyzed" as const,
                  productData: {
                    ...data.productData,
                    matchedTags,
                    unmatchedTags,
                  },
                }
              : img
          )
        );
      } else {
        throw new Error(data.error || "分析失敗");
      }
    } catch (error: any) {
      // 分析失敗時，保留原本的 editedUrl，狀態回到 done（不毀掉已算好的圖）
      setSelectedImages((prev) =>
        prev.map((img) =>
          img.url === originalUrl
            ? { ...img, status: "done" as const, error: error.message }
            : img
        )
      );
      alert(`分析失敗: ${error.message}\n\n圖片已保留，您可以稍後重試分析。`);
    }
  };
  
  // 發布編輯後的產品
  const publishEditedProduct = async (image: SelectedImage) => {
    if (!image.productData || !image.editedUrl) return;
    
    setPublishingProduct(image.url);
    
    try {
      // 生成 slug（從英文名稱）
      const slug = (image.productData.name_en || image.productData.name_zh || "product")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        + "-" + Date.now();
      
      const response = await fetch("/api/admin/products-v2", {
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
      
      const data = await response.json();
      
      if (data.success) {
        alert("✅ 產品已成功發布！");
        // 從列表中移除
        removeSelectedImage(image.url);
      } else {
        throw new Error(data.error || data.message || "發布失敗");
      }
    } catch (error: any) {
      alert(`發布失敗: ${error.message}`);
    } finally {
      setPublishingProduct(null);
    }
  };
  
  // 發布產品（舊版，從 lightbox）
  const publishProduct = async (imageUrl: string) => {
    const productData = analyzedProducts.get(imageUrl);
    if (!productData) return;
    
    setPublishingProduct(imageUrl);
    
    try {
      // 生成 slug
      const slug = (productData.name_en || productData.name_zh || "product")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        + "-" + Date.now();
      
      const response = await fetch("/api/admin/products-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: productData.name_en || productData.name_zh || "New Product",
          name_zh: productData.name_zh,
          name_en: productData.name_en,
          description_zh: productData.description_zh,
          description_en: productData.description_en,
          coverImage: imageUrl,
          category: "GIFT",
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("✅ 產品已成功發布！");
        // 從分析列表中移除
        setAnalyzedProducts(prev => {
          const newMap = new Map(prev);
          newMap.delete(imageUrl);
          return newMap;
        });
      } else {
        throw new Error(data.error || data.message || "發布失敗");
      }
    } catch (error: any) {
      alert(`發布失敗: ${error.message}`);
    } finally {
      setPublishingProduct(null);
    }
  };
  
  // 切換區域選擇
  const toggleRegion = (regionId: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((r) => r !== regionId)
        : [...prev, regionId]
    );
  };

  // 開始掃描
  const startScan = async () => {
    if (selectedRegions.length === 0) {
      setError("請至少選擇一個區域");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // 自動翻譯關鍵字
      let translatedKeywords = keywords.trim();
      
      if (autoTranslate && keywords.trim() && geminiApiKey && selectedRegions.length === 1) {
        setIsTranslating(true);
        try {
          const translateRes = await fetch("/api/admin/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: keywords.trim(),
              targetLanguage: selectedRegions[0],
              apiKey: geminiApiKey,
            }),
          });
          
          const translateData = await translateRes.json();
          if (translateData.success) {
            translatedKeywords = translateData.translatedText;
            console.log(`已翻譯: ${keywords.trim()} -> ${translatedKeywords}`);
          }
        } catch (err) {
          console.error("翻譯失敗，使用原始關鍵字", err);
        } finally {
          setIsTranslating(false);
        }
      }
      
      const response = await fetch("/api/admin/trend-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regions: selectedRegions,
          category,
          source,
          limit,
          keywords: translatedKeywords || undefined,
          serpApiKey: customSerpApiKey || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        setHasRealData(data.hasRealData);
        // 清空之前的選擇
        setCheckedImages(new Set());
      } else {
        setError(data.message || "搜尋失敗");
      }
    } catch (err: any) {
      setError(err.message || "網路錯誤");
    } finally {
      setLoading(false);
    }
  };
  
  // 切換圖片選中狀態
  const toggleImageCheck = (imageUrl: string) => {
    setCheckedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageUrl)) {
        newSet.delete(imageUrl);
      } else {
        newSet.add(imageUrl);
      }
      return newSet;
    });
  };
  
  // 將選中的圖片加入編輯區
  const loadSelectedImages = () => {
    const allProducts = results.flatMap((r) => r.products);
    const newImages: SelectedImage[] = [];
    
    checkedImages.forEach((url) => {
      const product = allProducts.find((p) => p.thumbnail === url);
      if (product && !selectedImages.find((s) => s.url === url)) {
        newImages.push({
          url,
          title: product.title,
          prompt: "",
          status: "pending",
        });
      }
    });
    
    setSelectedImages((prev) => [...prev, ...newImages]);
  };
  
  // 更新單張圖片的提示詞
  const updateImagePrompt = (url: string, prompt: string) => {
    setSelectedImages((prev) =>
      prev.map((img) => (img.url === url ? { ...img, prompt } : img))
    );
  };
  
  // 移除選中的圖片
  const removeSelectedImage = (url: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.url !== url));
    setCheckedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
  };
  
  // 使用 Gemini 編輯單張圖片
  const editImageWithGemini = async (imageUrl: string) => {
    if (!geminiApiKey) {
      alert("請先設定 Gemini API Key");
      return;
    }
    
    const image = selectedImages.find((img) => img.url === imageUrl);
    if (!image || !image.prompt.trim()) {
      alert("請輸入提示詞");
      return;
    }
    
    // 更新狀態為處理中
    setSelectedImages((prev) =>
      prev.map((img) =>
        img.url === imageUrl ? { ...img, status: "processing", error: undefined } : img
      )
    );
    
    try {
      const response = await fetch("/api/admin/gemini-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: geminiApiKey,
          imageUrl: image.url,
          prompt: image.prompt,
          model: geminiModel,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedImages((prev) =>
          prev.map((img) =>
            img.url === imageUrl
              ? { ...img, status: "done", editedUrl: data.editedUrl }
              : img
          )
        );
      } else {
        throw new Error(data.error || "編輯失敗");
      }
    } catch (err: any) {
      setSelectedImages((prev) =>
        prev.map((img) =>
          img.url === imageUrl
            ? { ...img, status: "error", error: err.message }
            : img
        )
      );
    }
  };
  
  // 批次套用提示詞
  const applyBatchPrompt = () => {
    if (!batchPrompt.trim()) return;
    setSelectedImages((prev) =>
      prev.map((img) => ({ ...img, prompt: batchPrompt }))
    );
  };
  
  // 批次編輯所有圖片
  const editAllImages = async () => {
    if (!geminiApiKey) {
      alert("請先設定 Gemini API Key");
      return;
    }
    
    const imagesToEdit = selectedImages.filter(
      (img) => img.status === "pending" && img.prompt.trim()
    );
    
    for (const image of imagesToEdit) {
      await editImageWithGemini(image.url);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 標題 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🎨 包裝設計靈感搜尋
        </h1>
        <p className="text-gray-600">
          搜尋設計網站 (Behance, Dribbble, Pinterest) 或 B2B 電商 (Alibaba, 1688, Amazon) 的包裝設計作品
        </p>
      </div>

      {/* API 狀態 */}
      {config && (
        <div className="mb-6 flex gap-4">
          <div
            className={`px-3 py-1 rounded-full text-sm ${
              config.apiStatus.serpapi
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            SerpAPI: {config.apiStatus.serpapi ? "✓ 已連接" : "⚠ 未配置（使用模擬數據）"}
          </div>
        </div>
      )}

      {/* 設定面板 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        {/* 搜尋關鍵字 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">🔍 搜尋關鍵字</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-600">自動翻譯 (需要 Gemini API Key)</span>
            </label>
          </div>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="例如：luxury box design、磁吸盒設計、minimal packaging..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            {autoTranslate 
              ? "✨ 啟用自動翻譯：搜尋時會自動將關鍵字翻譯成目標市場語言" 
              : "輸入包裝設計相關關鍵字，將從 Behance、Dribbble、Pinterest 等設計網站搜尋"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 區域選擇 */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">選擇掃描區域</h3>
            <div className="flex flex-wrap gap-2">
              {config?.regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => toggleRegion(region.id)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedRegions.includes(region.id)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>

          {/* 類別選擇 */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">產品類別</h3>
            <div className="flex flex-wrap gap-2">
              {config?.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    category === cat.id
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 搜尋來源選擇 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">📂 搜尋來源</h3>
          <div className="flex flex-wrap gap-2">
            {config?.sources?.map((src) => (
              <button
                key={src.id}
                onClick={() => setSource(src.id)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  source === src.id
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
                }`}
              >
                {src.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {source === "design" && "🎨 Behance, Dribbble, Pinterest, Packaging of the World, The Dieline..."}
            {source === "b2b" && "🏭 Alibaba, 1688, Amazon, Made in China, Global Sources..."}
            {source === "all" && "同時搜尋設計網站和 B2B 電商平台"}
          </p>
        </div>

        {/* 趨勢數量設定 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="font-semibold text-gray-700">
              每區域抓取數量：
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => setLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 20)))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-gray-500 text-sm">（1-100 筆）</span>
          </div>
        </div>

        {/* 圖片風格篩選 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">🎨 圖片風格篩選</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setImageStyle("all")}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                imageStyle === "all"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setImageStyle("with_bg")}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                imageStyle === "with_bg"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              }`}
            >
              有背景
            </button>
            <button
              onClick={() => setImageStyle("no_bg")}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                imageStyle === "no_bg"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              }`}
            >
              去背景/白底
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            篩選搜尋結果中的圖片風格（適用於產品圖）
          </p>
        </div>

        {/* 進階設定 - API Keys */}
        <div className="mt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
          >
            {showAdvanced ? "▼" : "▶"} 進階設定（API Key）
          </button>
          
          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <p className="text-sm text-gray-600 mb-3">
                如果環境變數未設定，可在此輸入 API Key（僅本次有效）
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SerpAPI Key（用於 Google Shopping 搜尋）
                </label>
                <input
                  type="password"
                  value={customSerpApiKey}
                  onChange={(e) => setCustomSerpApiKey(e.target.value)}
                  placeholder="留空則使用模擬數據"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  取得方式：<a href="https://serpapi.com/" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">serpapi.com</a>（免費 100 次/月）
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gemini API Key（用於 AI 圖片編輯）
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="輸入 Gemini API Key"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingModels ? "載入中..." : "檢查可用模型"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  取得方式：<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">Google AI Studio</a>
                </p>
                
                {/* 可用模型列表 */}
                {availableModels.length > 0 && (
                  <div className="mt-3 p-3 border border-green-200 rounded-lg bg-green-50">
                    <h3 className="font-semibold text-sm text-green-800 mb-2">
                      ✅ 可用的 Gemini 模型 ({availableModels.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availableModels.map((model: any) => (
                        <div key={model.name} className="p-2 bg-white border border-green-100 rounded text-xs">
                          <div className="font-semibold text-green-700">{model.displayName}</div>
                          <div className="text-gray-600 mt-1">{model.name}</div>
                          {model.description && (
                            <div className="text-gray-500 mt-1">{model.description}</div>
                          )}
                          <div className="text-gray-400 mt-1 flex flex-wrap gap-2">
                            <span>支援: {model.supportedMethods.join(", ")}</span>
                            {model.inputTokenLimit && (
                              <span>| 輸入: {model.inputTokenLimit.toLocaleString()} tokens</span>
                            )}
                            {model.outputTokenLimit && (
                              <span>| 輸出: {model.outputTokenLimit.toLocaleString()} tokens</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gemini 模型選擇
                </label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
          )}
        </div>

        {/* 開始掃描按鈕 */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={startScan}
            disabled={loading || selectedRegions.length === 0}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
              loading || selectedRegions.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isTranslating ? "🌐 正在翻譯..." : "AI 掃描中..."}
              </span>
            ) : (
              "🔍 開始掃描趨勢"
            )}
          </button>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* 數據來源提示 */}
      {results.length > 0 && !hasRealData && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          ⚠️ 目前顯示的是模擬數據。設定 SerpAPI Key 可獲取真實 Google Shopping 搜尋結果。
        </div>
      )}

      {/* 結果顯示 */}
      {results.length > 0 && (
        <div className="space-y-8">
          {results.map((result) => (
            <div
              key={result.region}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* 區域標題 */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{result.regionName}</h2>
                    <p className="text-indigo-100 text-sm">
                      找到 {result.products.length} 個產品
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-200">搜尋關鍵字</p>
                    <p className="text-sm font-medium">{result.searchQuery}</p>
                  </div>
                </div>
              </div>

              {/* 產品卡片 */}
              <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {result.products.map((product, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group relative ${
                      checkedImages.has(product.thumbnail || "")
                        ? "border-indigo-500 ring-2 ring-indigo-200"
                        : "border-gray-200"
                    }`}
                  >
                    {/* 勾選框 */}
                    {product.thumbnail && (
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={checkedImages.has(product.thumbnail)}
                          onChange={() => toggleImageCheck(product.thumbnail!)}
                          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    )}
                    
                    {/* 產品圖片 */}
                    <div 
                      className="aspect-square bg-gray-100 relative overflow-hidden cursor-pointer"
                      onClick={() => product.thumbnail && setLightboxImage(product.thumbnail)}
                    >
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x200?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                      {/* 價格標籤 */}
                      {product.price && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                          {product.price}
                        </div>
                      )}
                      
                      {/* 分析狀態覆蓋 */}
                      {analyzingImage === product.thumbnail && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <div className="text-center text-white">
                            <svg className="animate-spin h-8 w-8 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-xs">分析中...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 產品資訊 */}
                    <div className="p-3">
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-indigo-600">
                        <a href={product.link} target="_blank" rel="noopener noreferrer">
                          {product.title}
                        </a>
                      </h3>
                      <p className="text-xs text-gray-500">
                        來源：{product.source}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 載入選中圖片按鈕 */}
              {checkedImages.size > 0 && (
                <div className="px-6 pb-6 flex justify-center">
                  <button
                    onClick={loadSelectedImages}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 shadow-lg"
                  >
                    ✨ 載入 {checkedImages.size} 張圖片到編輯區
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* ========== Gemini 圖片編輯區 ========== */}
      {selectedImages.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
          
          {/* 批次提示詞 */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={batchPrompt}
                onChange={(e) => setBatchPrompt(e.target.value)}
                placeholder="輸入批次提示詞，套用到所有圖片..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                onClick={applyBatchPrompt}
                disabled={!batchPrompt.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {selectedImages.map((image) => (
              <div
                key={image.url}
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
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x200?text=Error";
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
                          <img
                            src={image.editedUrl}
                            alt="編輯後"
                            className="w-full h-full object-cover"
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
                        onChange={(e) => updateImagePrompt(image.url, e.target.value)}
                        placeholder="輸入提示詞..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                      />
                      
                      <div className="flex justify-between">
                        <button
                          onClick={() => removeSelectedImage(image.url)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          移除
                        </button>
                        <button
                          onClick={() => editImageWithGemini(image.url)}
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
                            prev.map((img) =>
                              img.url === image.url ? { ...img, userHint: e.target.value } : img
                            )
                          );
                        }}
                        placeholder="可選：告訴 AI 這是什麼產品..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => analyzeEditedImage(image.url)}
                        className="w-full px-3 py-2 text-sm rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
                      >
                        🔍 分析產品
                      </button>
                      <button
                        onClick={() => removeSelectedImage(image.url)}
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
                              prev.map((img) =>
                                img.url === image.url ? { ...img, userHint: e.target.value } : img
                              )
                            );
                          }}
                          placeholder="輸入提示詞重新分析..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 mb-1"
                        />
                        <button
                          onClick={() => analyzeEditedImage(image.url)}
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
                          onClick={() => publishEditedProduct(image)}
                          disabled={publishingProduct === image.url}
                          className="flex-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          {publishingProduct === image.url ? "發布中..." : "發布產品"}
                        </button>
                      </div>
                      <button
                        onClick={() => removeSelectedImage(image.url)}
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

      {/* 初始狀態 */}
      {!loading && results.length === 0 && !error && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            搜尋包裝設計靈感
          </h3>
          <p className="text-gray-500 mb-4">
            從 Behance、Dribbble、Pinterest 等設計平台搜尋精選包裝設計作品
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-400">
            <span className="bg-gray-100 px-2 py-1 rounded">Behance</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Dribbble</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Pinterest</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Packaging of the World</span>
            <span className="bg-gray-100 px-2 py-1 rounded">The Dieline</span>
          </div>
        </div>
      )}
      
      {/* 圖片放大預覽 Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-7xl w-full">
            <button
              className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300"
              onClick={() => setLightboxImage(null)}
            >
              ✕
            </button>
            
            <div className="flex gap-4 items-start">
              {/* 圖片區域 */}
              <div className="flex-shrink-0">
                <img
                  src={lightboxImage}
                  alt="放大預覽"
                  className="max-w-[50vw] max-h-[90vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              {/* 分析資料區域 */}
              {analyzedProducts.has(lightboxImage) && (
                <div className="flex-1 bg-white rounded-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-xl font-bold mb-4">📊 產品分析結果</h3>
                  {(() => {
                    const data = analyzedProducts.get(lightboxImage);
                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">產品名稱（中文）</label>
                          <p className="text-gray-900">{data.name_zh || "未提供"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (English)</label>
                          <p className="text-gray-900">{data.name_en || "Not provided"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">描述（中文）</label>
                          <p className="text-gray-700 text-sm">{data.description_zh || "未提供"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                          <p className="text-gray-700 text-sm">{data.description_en || "Not provided"}</p>
                        </div>
                        {data.features_zh && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">特色（中文）</label>
                            <p className="text-gray-700 text-sm whitespace-pre-line">{data.features_zh}</p>
                          </div>
                        )}
                        {data.features_en && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Features (English)</label>
                            <p className="text-gray-700 text-sm whitespace-pre-line">{data.features_en}</p>
                          </div>
                        )}
                        {data.suggestedTags && data.suggestedTags.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">建議標籤</label>
                            <div className="flex flex-wrap gap-2">
                              {data.suggestedTags.map((tag: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => publishProduct(lightboxImage)}
                          disabled={publishingProduct === lightboxImage}
                          className="w-full mt-4 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
                        >
                          {publishingProduct === lightboxImage ? "發布中..." : "✅ 發布產品"}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
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
                    <img
                      src={image.editedUrl || image.url}
                      alt={image.title}
                      className="w-full rounded-lg"
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
                          setSelectedImages(prev => prev.map(img => 
                            img.url === expandedProductDetail 
                              ? { ...img, productData: { ...img.productData!, name_zh: e.target.value }}
                              : img
                          ));
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
                          setSelectedImages(prev => prev.map(img => 
                            img.url === expandedProductDetail 
                              ? { ...img, productData: { ...img.productData!, name_en: e.target.value }}
                              : img
                          ));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">描述（中文）</label>
                      <textarea
                        value={image.productData.description_zh || ""}
                        onChange={(e) => {
                          setSelectedImages(prev => prev.map(img => 
                            img.url === expandedProductDetail 
                              ? { ...img, productData: { ...img.productData!, description_zh: e.target.value }}
                              : img
                          ));
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
                          setSelectedImages(prev => prev.map(img => 
                            img.url === expandedProductDetail 
                              ? { ...img, productData: { ...img.productData!, description_en: e.target.value }}
                              : img
                          ));
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">特色（中文）</label>
                      <textarea
                        value={image.productData.features_zh || ""}
                        onChange={(e) => {
                          setSelectedImages(prev => prev.map(img => 
                            img.url === expandedProductDetail 
                              ? { ...img, productData: { ...img.productData!, features_zh: e.target.value }}
                              : img
                          ));
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Features (English)</label>
                      <textarea
                        value={image.productData.features_en || ""}
                        onChange={(e) => {
                          setSelectedImages(prev => prev.map(img => 
                            img.url === expandedProductDetail 
                              ? { ...img, productData: { ...img.productData!, features_en: e.target.value }}
                              : img
                          ));
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* 商業規格 */}
                    <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">📦 商業規格</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">尺寸（中文）</label>
                          <input
                            type="text"
                            value={image.productData.dimensions_zh || ""}
                            onChange={(e) => {
                              setSelectedImages(prev => prev.map(img => 
                                img.url === expandedProductDetail 
                                  ? { ...img, productData: { ...img.productData!, dimensions_zh: e.target.value }}
                                  : img
                              ));
                            }}
                            placeholder="如：長20 × 寬15 × 高8 公分"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (English)</label>
                          <input
                            type="text"
                            value={image.productData.dimensions_en || ""}
                            onChange={(e) => {
                              setSelectedImages(prev => prev.map(img => 
                                img.url === expandedProductDetail 
                                  ? { ...img, productData: { ...img.productData!, dimensions_en: e.target.value }}
                                  : img
                              ));
                            }}
                            placeholder="e.g., 20 × 15 × 8 cm"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">材質（中文）</label>
                          <input
                            type="text"
                            value={image.productData.materials_zh || ""}
                            onChange={(e) => {
                              setSelectedImages(prev => prev.map(img => 
                                img.url === expandedProductDetail 
                                  ? { ...img, productData: { ...img.productData!, materials_zh: e.target.value }}
                                  : img
                              ));
                            }}
                            placeholder="如：環保牛皮紙"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Materials (English)</label>
                          <input
                            type="text"
                            value={image.productData.materials_en || ""}
                            onChange={(e) => {
                              setSelectedImages(prev => prev.map(img => 
                                img.url === expandedProductDetail 
                                  ? { ...img, productData: { ...img.productData!, materials_en: e.target.value }}
                                  : img
                              ));
                            }}
                            placeholder="e.g., Eco-friendly kraft paper"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">最小訂購量 (MOQ)</label>
                          <input
                            type="number"
                            value={image.productData.minQty || ""}
                            onChange={(e) => {
                              setSelectedImages(prev => prev.map(img => 
                                img.url === expandedProductDetail 
                                  ? { ...img, productData: { ...img.productData!, minQty: parseInt(e.target.value) || undefined }}
                                  : img
                              ));
                            }}
                            placeholder="如：100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">價格提示（中文）</label>
                          <input
                            type="text"
                            value={image.productData.priceHint_zh || ""}
                            onChange={(e) => {
                              setSelectedImages(prev => prev.map(img => 
                                img.url === expandedProductDetail 
                                  ? { ...img, productData: { ...img.productData!, priceHint_zh: e.target.value }}
                                  : img
                              ));
                            }}
                            placeholder="如：每個 $5.00 起"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price Hint (English)</label>
                          <input
                            type="text"
                            value={image.productData.priceHint_en || ""}
                            onChange={(e) => {
                              setSelectedImages(prev => prev.map(img => 
                                img.url === expandedProductDetail 
                                  ? { ...img, productData: { ...img.productData!, priceHint_en: e.target.value }}
                                  : img
                              ));
                            }}
                            placeholder="e.g., From $5.00/pc"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">交期（中文）</label>
                          <input
                            type="text"
                            value={image.productData.leadTime_zh || ""}
                            onChange={(e) => {
                              setSelectedImages(prev => prev.map(img => 
                                img.url === expandedProductDetail 
                                  ? { ...img, productData: { ...img.productData!, leadTime_zh: e.target.value }}
                                  : img
                              ));
                            }}
                            placeholder="如：15-20 個工作天"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (English)</label>
                          <input
                            type="text"
                            value={image.productData.leadTime_en || ""}
                            onChange={(e) => {
                              setSelectedImages(prev => prev.map(img => 
                                img.url === expandedProductDetail 
                                  ? { ...img, productData: { ...img.productData!, leadTime_en: e.target.value }}
                                  : img
                              ));
                            }}
                            placeholder="e.g., 15-20 business days"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* 標籤 */}
                    <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">🏷️ 已配對標籤</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {image.productData.matchedTags?.map((tag) => (
                          <span key={tag.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                            {tag.name_zh || tag.name}
                            <button
                              onClick={() => {
                                setSelectedImages(prev => prev.map(img => 
                                  img.url === expandedProductDetail 
                                    ? { 
                                        ...img, 
                                        productData: { 
                                          ...img.productData!, 
                                          matchedTags: img.productData!.matchedTags?.filter(t => t.id !== tag.id)
                                        }
                                      }
                                    : img
                                ));
                              }}
                              className="text-blue-600 hover:text-red-500"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        {(!image.productData.matchedTags || image.productData.matchedTags.length === 0) && (
                          <span className="text-gray-400 text-sm">無配對標籤</span>
                        )}
                      </div>
                      
                      {/* 新增標籤選取器 */}
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">從現有標籤新增</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value=""
                          onChange={(e) => {
                            const selectedTagId = e.target.value;
                            if (!selectedTagId) return;
                            
                            const selectedTag = existingTags.find(t => t.id === selectedTagId);
                            if (!selectedTag) return;
                            
                            // 檢查是否已存在
                            const alreadyExists = image.productData?.matchedTags?.some(t => t.id === selectedTagId);
                            if (alreadyExists) {
                              alert("此標籤已新增");
                              return;
                            }
                            
                            setSelectedImages(prev => prev.map(img => 
                              img.url === expandedProductDetail 
                                ? { 
                                    ...img, 
                                    productData: { 
                                      ...img.productData!, 
                                      matchedTags: [...(img.productData?.matchedTags || []), selectedTag]
                                    }
                                  }
                                : img
                            ));
                          }}
                        >
                          <option value="">-- 選擇標籤 --</option>
                          {existingTags
                            .filter(tag => !image.productData?.matchedTags?.some(t => t.id === tag.id))
                            .map(tag => (
                              <option key={tag.id} value={tag.id}>
                                {tag.name_zh || tag.name} {tag.name_en ? `(${tag.name_en})` : ""}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                    
                    {image.productData.unmatchedTags && image.productData.unmatchedTags.length > 0 && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          💡 建議標籤（點擊可建立新標籤）
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {image.productData.unmatchedTags.map((tag, i) => (
                            <button
                              key={i}
                              onClick={async () => {
                                // 建立新標籤
                                if (!confirm(`是否要建立新標籤？\n中文：${tag.zh}\n英文：${tag.en}`)) return;
                                
                                try {
                                  const slug = tag.en
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/^-|-$/g, "");
                                  
                                  const res = await fetch("/api/admin/tags-v2", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      slug,
                                      name: tag.zh,
                                      name_zh: tag.zh,
                                      name_en: tag.en,
                                    }),
                                  });
                                  
                                  const data = await res.json();
                                  
                                  if (data.success && data.tag) {
                                    // 添加到現有標籤列表
                                    setExistingTags(prev => [...prev, data.tag]);
                                    
                                    // 添加到已配對標籤
                                    setSelectedImages(prev => prev.map(img => 
                                      img.url === expandedProductDetail 
                                        ? { 
                                            ...img, 
                                            productData: { 
                                              ...img.productData!, 
                                              matchedTags: [...(img.productData?.matchedTags || []), data.tag],
                                              unmatchedTags: img.productData?.unmatchedTags?.filter((_, idx) => idx !== i)
                                            }
                                          }
                                        : img
                                    ));
                                    
                                    alert(`✅ 標籤「${tag.zh}」已建立並添加！`);
                                  } else {
                                    throw new Error(data.error || data.message || "建立標籤失敗");
                                  }
                                } catch (error: any) {
                                  alert(`建立標籤失敗: ${error.message}`);
                                }
                              }}
                              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>➕</span>
                              <span>{tag.zh}</span>
                              <span className="text-yellow-600">({tag.en})</span>
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">點擊建議標籤可自動建立並添加到產品</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 操作按鈕 */}
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setExpandedProductDetail(null)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      publishEditedProduct(image);
                      setExpandedProductDetail(null);
                    }}
                    disabled={publishingProduct === image.url}
                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
                  >
                    {publishingProduct === image.url ? "發布中..." : "✅ 確認發布產品"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
