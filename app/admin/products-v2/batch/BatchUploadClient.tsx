"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

interface Tag {
  id: number;
  name: string;
  name_en?: string;
  name_zh?: string;
}

interface ProductItem {
  id: string;
  file: File;
  imageUrl: string;
  status: "pending" | "analyzing" | "ready" | "uploading" | "done" | "error";
  error?: string;
  productData?: any;
  selectedTags: Tag[];
  newTags: string[];
  customHint?: string;
  showAllFields?: boolean; // 是否展開所有欄位
}

export default function BatchUploadClient() {
  const [apiKey, setApiKey] = useState("");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [existingTags, setExistingTags] = useState<Tag[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [newTagInput, setNewTagInput] = useState({ name_zh: "", name_en: "" });
  const [currentProductForTag, setCurrentProductForTag] = useState<string | null>(null);
  const [aiHint, setAiHint] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 批次數量控制
  const [maxBatchSize, setMaxBatchSize] = useState(10);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // 載入 API Key 從 localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
    // 檢查是否已解鎖
    const unlocked = localStorage.getItem("batch_unlocked");
    if (unlocked === "true") {
      setIsUnlocked(true);
      setMaxBatchSize(100);
    }
  }, []);

  // 載入現有標籤
  useEffect(() => {
    fetch("/api/admin/tags-v2")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setExistingTags(data.tags);
        }
      })
      .catch(console.error);
  }, []);

  // 儲存 API Key
  const handleSaveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    alert("API Key 已儲存");
  };

  // 解鎖大批次功能
  const handleUnlock = () => {
    if (unlockPassword === "35437316") {
      setIsUnlocked(true);
      setMaxBatchSize(100);
      localStorage.setItem("batch_unlocked", "true");
      setShowUnlockModal(false);
      setUnlockPassword("");
      alert("✅ 已解鎖！批次上限提升至 100 張");
    } else {
      alert("❌ 密碼錯誤");
    }
  };

  // 鎖定（恢復預設）
  const handleLock = () => {
    setIsUnlocked(false);
    setMaxBatchSize(10);
    localStorage.removeItem("batch_unlocked");
  };

  // 處理圖片選擇
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.slice(0, maxBatchSize - products.length);
    
    const newProducts: ProductItem[] = newFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      imageUrl: URL.createObjectURL(file),
      status: "pending",
      selectedTags: [],
      newTags: [],
      customHint: "",
      showAllFields: false,
    }));

    setProducts((prev) => [...prev, ...newProducts].slice(0, maxBatchSize));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // AI 分析單張圖片
  const analyzeImage = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !apiKey) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, status: "analyzing", error: undefined } : p
      )
    );

    try {
      const formData = new FormData();
      formData.append("apiKey", apiKey);
      formData.append("image", product.file);
      formData.append("existingTags", JSON.stringify(existingTags));
      formData.append("userHint", product.customHint || aiHint);

      const res = await fetch("/api/admin/products-v2/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "分析失敗");
      }

      // 匹配建議標籤
      const suggestedTags = data.productData.suggestedTags || [];
      const matchedTags: Tag[] = [];
      const unmatchedTags: string[] = [];

      suggestedTags.forEach((tagName: string) => {
        const found = existingTags.find(
          (t) =>
            t.name === tagName ||
            t.name_zh === tagName ||
            t.name_en?.toLowerCase() === tagName.toLowerCase()
        );
        if (found) {
          matchedTags.push(found);
        } else {
          unmatchedTags.push(tagName);
        }
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                status: "ready",
                productData: data.productData,
                selectedTags: matchedTags,
                newTags: unmatchedTags,
              }
            : p
        )
      );
    } catch (error: any) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, status: "error", error: error.message }
            : p
        )
      );
    }
  };

  // 分析所有待分析圖片
  const analyzeAllImages = async () => {
    const pendingProducts = products.filter((p) => p.status === "pending");
    for (const product of pendingProducts) {
      await analyzeImage(product.id);
    }
  };

  // 上傳圖片到 R2
  const uploadImageToR2 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "圖片上傳失敗");
    }

    return data.url;
  };

  // 建立新標籤
  const createNewTag = async (name_zh: string, name_en: string): Promise<Tag> => {
    const baseSlug = name_en
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || 'tag';
    
    const slug = `${baseSlug}-${Date.now()}`;

    const res = await fetch("/api/admin/tags-v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name_zh, name_zh, name_en, slug }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || "建立標籤失敗");
    }

    return data.tag;
  };

  // 上傳單一產品
  const uploadProduct = async (product: ProductItem) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: "uploading" } : p))
    );

    try {
      // 1. 上傳圖片
      const imageUrl = await uploadImageToR2(product.file);

      // 2. 建立新標籤（如果有）
      const allTagIds = [...product.selectedTags.map((t) => t.id)];
      
      for (const newTagName of product.newTags) {
        const newTag = await createNewTag(newTagName, newTagName);
        allTagIds.push(newTag.id);
        setExistingTags((prev) => [...prev, newTag]);
      }

      // 3. 建立產品
      const sku = `MB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      
      const {
        suggestedTags,
        imageUrl: _imgUrl,
        mainImage: _mainImg,
        images: _images,
        ...cleanProductData
      } = product.productData || {};
      
      const productPayload = {
        name: cleanProductData.name_zh || cleanProductData.name_en || "未命名產品",
        slug: cleanProductData.slug || `product-${Date.now()}`,
        category: cleanProductData.category || "GIFT_BOX",
        
        name_en: cleanProductData.name_en,
        name_zh: cleanProductData.name_zh,
        shortDesc_en: cleanProductData.shortDesc_en,
        shortDesc_zh: cleanProductData.shortDesc_zh,
        description_en: cleanProductData.description_en,
        description_zh: cleanProductData.description_zh,
        
        dimensions_en: cleanProductData.dimensions_en,
        dimensions_zh: cleanProductData.dimensions_zh,
        materials_en: cleanProductData.materials_en,
        materials_zh: cleanProductData.materials_zh,
        leadTime_en: cleanProductData.leadTime_en,
        leadTime_zh: cleanProductData.leadTime_zh,
        
        priceHint_en: cleanProductData.priceHint_en,
        priceHint_zh: cleanProductData.priceHint_zh,
        minQty: cleanProductData.minQty,
        
        seoTitle_en: cleanProductData.seoTitle_en,
        seoTitle_zh: cleanProductData.seoTitle_zh,
        seoDescription_en: cleanProductData.seoDescription_en,
        seoDescription_zh: cleanProductData.seoDescription_zh,
        
        coverImage: imageUrl,
        images: [imageUrl],
        
        sku: sku,
        
        tagIds: allTagIds,
      };

      const res = await fetch("/api/admin/products-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "建立產品失敗");
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: "done" } : p))
      );
    } catch (error: any) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, status: "error", error: error.message }
            : p
        )
      );
    }
  };

  // 一鍵批次上架
  const uploadAllProducts = async () => {
    const readyProducts = products.filter((p) => p.status === "ready");
    if (readyProducts.length === 0) {
      alert("沒有可上架的產品");
      return;
    }

    setIsUploading(true);
    for (const product of readyProducts) {
      await uploadProduct(product);
    }
    setIsUploading(false);
  };

  // 移除產品
  const removeProduct = (productId: string) => {
    setProducts((prev) => {
      const product = prev.find((p) => p.id === productId);
      if (product) {
        URL.revokeObjectURL(product.imageUrl);
      }
      return prev.filter((p) => p.id !== productId);
    });
  };

  // 更新產品資料
  const updateProductData = (productId: string, field: string, value: any) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, productData: { ...p.productData, [field]: value } }
          : p
      )
    );
  };

  // 切換顯示所有欄位
  const toggleShowAllFields = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, showAllFields: !p.showAllFields } : p
      )
    );
  };

  // 切換標籤選擇
  const toggleTag = (productId: string, tag: Tag) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const isSelected = p.selectedTags.some((t) => t.id === tag.id);
        return {
          ...p,
          selectedTags: isSelected
            ? p.selectedTags.filter((t) => t.id !== tag.id)
            : [...p.selectedTags, tag],
        };
      })
    );
  };

  // 新增標籤
  const handleAddNewTag = async () => {
    if (!newTagInput.name_zh || !currentProductForTag) return;

    try {
      const newTag = await createNewTag(
        newTagInput.name_zh,
        newTagInput.name_en || newTagInput.name_zh
      );
      
      setExistingTags((prev) => [...prev, newTag]);
      
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== currentProductForTag) return p;
          return {
            ...p,
            selectedTags: [...p.selectedTags, newTag],
            newTags: p.newTags.filter((t) => t !== newTagInput.name_zh),
          };
        })
      );

      setShowNewTagModal(false);
      setNewTagInput({ name_zh: "", name_en: "" });
      setCurrentProductForTag(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getStatusBadge = (status: ProductItem["status"]) => {
    const styles: Record<string, string> = {
      pending: "bg-gray-100 text-gray-600",
      analyzing: "bg-blue-100 text-blue-600",
      ready: "bg-green-100 text-green-600",
      uploading: "bg-yellow-100 text-yellow-600",
      done: "bg-emerald-100 text-emerald-600",
      error: "bg-red-100 text-red-600",
    };
    const labels: Record<string, string> = {
      pending: "待分析",
      analyzing: "分析中...",
      ready: "可上架",
      uploading: "上傳中...",
      done: "已完成",
      error: "錯誤",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // 渲染所有欄位編輯區
  const renderAllFields = (product: ProductItem) => {
    if (!product.productData) return null;
    const data = product.productData;

    return (
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
        {/* 詳細描述 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">中文詳細描述</label>
            <textarea
              value={data.description_zh || ""}
              onChange={(e) => updateProductData(product.id, "description_zh", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm h-20 resize-none"
              placeholder="產品詳細描述（中文）"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">英文詳細描述</label>
            <textarea
              value={data.description_en || ""}
              onChange={(e) => updateProductData(product.id, "description_en", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm h-20 resize-none"
              placeholder="Product detailed description (English)"
            />
          </div>
        </div>

        {/* 尺寸規格 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">尺寸規格（中文）</label>
            <input
              type="text"
              value={data.dimensions_zh || ""}
              onChange={(e) => updateProductData(product.id, "dimensions_zh", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="例如：長 20cm x 寬 15cm x 高 10cm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">尺寸規格（英文）</label>
            <input
              type="text"
              value={data.dimensions_en || ""}
              onChange={(e) => updateProductData(product.id, "dimensions_en", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="e.g., L 20cm x W 15cm x H 10cm"
            />
          </div>
        </div>

        {/* 材質 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">材質（中文）</label>
            <input
              type="text"
              value={data.materials_zh || ""}
              onChange={(e) => updateProductData(product.id, "materials_zh", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="例如：環保再生紙、棉布"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">材質（英文）</label>
            <input
              type="text"
              value={data.materials_en || ""}
              onChange={(e) => updateProductData(product.id, "materials_en", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="e.g., Recycled paper, Cotton"
            />
          </div>
        </div>

        {/* 交期 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">交期（中文）</label>
            <input
              type="text"
              value={data.leadTime_zh || ""}
              onChange={(e) => updateProductData(product.id, "leadTime_zh", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="例如：7-14 工作天"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">交期（英文）</label>
            <input
              type="text"
              value={data.leadTime_en || ""}
              onChange={(e) => updateProductData(product.id, "leadTime_en", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="e.g., 7-14 business days"
            />
          </div>
        </div>

        {/* 價格提示 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">價格提示（中文）</label>
            <input
              type="text"
              value={data.priceHint_zh || ""}
              onChange={(e) => updateProductData(product.id, "priceHint_zh", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="例如：NT$ 50-100 / 個"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">價格提示（英文）</label>
            <input
              type="text"
              value={data.priceHint_en || ""}
              onChange={(e) => updateProductData(product.id, "priceHint_en", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="e.g., $2-5 / piece"
            />
          </div>
        </div>

        {/* 最低訂購量 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">最低訂購量 (MOQ)</label>
            <input
              type="number"
              value={data.minQty || ""}
              onChange={(e) => updateProductData(product.id, "minQty", parseInt(e.target.value) || null)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="例如：100"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">產品 Slug</label>
            <input
              type="text"
              value={data.slug || ""}
              onChange={(e) => updateProductData(product.id, "slug", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="product-url-slug"
            />
          </div>
        </div>

        {/* SEO 標題 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">SEO 標題（中文）</label>
            <input
              type="text"
              value={data.seoTitle_zh || ""}
              onChange={(e) => updateProductData(product.id, "seoTitle_zh", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="搜尋引擎標題"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">SEO 標題（英文）</label>
            <input
              type="text"
              value={data.seoTitle_en || ""}
              onChange={(e) => updateProductData(product.id, "seoTitle_en", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="SEO Title"
            />
          </div>
        </div>

        {/* SEO 描述 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">SEO 描述（中文）</label>
            <textarea
              value={data.seoDescription_zh || ""}
              onChange={(e) => updateProductData(product.id, "seoDescription_zh", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm h-16 resize-none"
              placeholder="搜尋引擎描述"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">SEO 描述（英文）</label>
            <textarea
              value={data.seoDescription_en || ""}
              onChange={(e) => updateProductData(product.id, "seoDescription_en", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm h-16 resize-none"
              placeholder="SEO Description"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 標題區 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI 批次產品上架</h1>
        <p className="text-gray-500 mt-1">
          使用 Google Gemini AI 自動分析產品圖片，產生中英文產品資訊
        </p>
      </div>

      {/* API Key 設定 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Google API Key 設定</h2>
        <div className="flex gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="輸入您的 Google Gemini API Key"
            className="flex-1 border rounded-lg px-4 py-2 text-sm"
          />
          <button
            onClick={handleSaveApiKey}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            儲存
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          API Key 將儲存在您的瀏覽器中，不會上傳到伺服器
        </p>
      </div>

      {/* 批次數量設定 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">📦 批次數量限制</h2>
            <p className="text-sm text-gray-500 mt-1">
              目前上限：<span className="font-bold text-blue-600">{maxBatchSize}</span> 張圖片
              {isUnlocked && <span className="ml-2 text-green-600">✅ 已解鎖</span>}
            </p>
          </div>
          <div className="flex gap-2">
            {!isUnlocked ? (
              <button
                onClick={() => setShowUnlockModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
              >
                🔓 解鎖 100 張
              </button>
            ) : (
              <button
                onClick={handleLock}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 text-sm"
              >
                🔒 鎖定回 10 張
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI 提示設定 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">🎯 AI 分析提示（可選）</h2>
        <textarea
          value={aiHint}
          onChange={(e) => setAiHint(e.target.value)}
          placeholder="告訴 AI 這批照片可能是什麼類型的產品，例如：\n- 這些是環保購物袋系列\n- 這批是聖誕節禮盒組合\n- 這些是客製化保溫瓶\n\nAI 會根據您的提示更準確地生成產品資訊"
          className="w-full border rounded-lg px-4 py-3 text-sm h-28 resize-none"
        />
        <p className="text-xs text-gray-400 mt-2">
          提供產品類型提示可以讓 AI 分析更精準，留空則由 AI 自動判斷
        </p>
      </div>

      {/* 上傳區域 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">產品圖片</h2>
          <span className="text-sm text-gray-500">
            {products.length} / {maxBatchSize} 張圖片
          </span>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          <div className="text-gray-400">
            <svg
              className="mx-auto h-12 w-12 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>點擊或拖放圖片到此處</p>
            <p className="text-sm">最多可上傳 {maxBatchSize} 張產品圖片</p>
          </div>
        </div>

        {/* 操作按鈕 */}
        {products.length > 0 && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={analyzeAllImages}
              disabled={!apiKey || products.every((p) => p.status !== "pending")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              🤖 AI 分析全部
            </button>
            <button
              onClick={uploadAllProducts}
              disabled={
                isUploading || products.every((p) => p.status !== "ready")
              }
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isUploading ? "上架中..." : "🚀 一鍵批次上架"}
            </button>
            <button
              onClick={() => {
                products.forEach((p) => URL.revokeObjectURL(p.imageUrl));
                setProducts([]);
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
            >
              清空全部
            </button>
          </div>
        )}
      </div>

      {/* 產品列表 */}
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="p-4">
              <div className="flex gap-4">
                {/* 圖片預覽 */}
                <div className="w-32 h-32 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.imageUrl}
                    alt="產品圖片"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* 產品資訊 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(product.status)}
                      {product.error && (
                        <span className="text-red-500 text-sm">
                          {product.error}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {product.status === "pending" && (
                        <button
                          onClick={() => analyzeImage(product.id)}
                          disabled={!apiKey}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          分析
                        </button>
                      )}
                      {product.status === "error" && (
                        <button
                          onClick={() => analyzeImage(product.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          重試
                        </button>
                      )}
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        移除
                      </button>
                    </div>
                  </div>

                  {/* 分析結果 */}
                  {product.productData && (
                    <div className="space-y-3">
                      {/* 產品名稱 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">中文名稱</label>
                          <input
                            type="text"
                            value={product.productData.name_zh || ""}
                            onChange={(e) =>
                              updateProductData(product.id, "name_zh", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">英文名稱</label>
                          <input
                            type="text"
                            value={product.productData.name_en || ""}
                            onChange={(e) =>
                              updateProductData(product.id, "name_en", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>

                      {/* 簡短描述 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">中文簡述</label>
                          <input
                            type="text"
                            value={product.productData.shortDesc_zh || ""}
                            onChange={(e) =>
                              updateProductData(product.id, "shortDesc_zh", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">英文簡述</label>
                          <input
                            type="text"
                            value={product.productData.shortDesc_en || ""}
                            onChange={(e) =>
                              updateProductData(product.id, "shortDesc_en", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>

                      {/* 分類 */}
                      <div>
                        <label className="text-xs text-gray-500">產品分類</label>
                        <select
                          value={product.productData.category || "GIFT"}
                          onChange={(e) =>
                            updateProductData(product.id, "category", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          <option value="GIFT">GIFT - 禮品</option>
                          <option value="GIFT_BOX">GIFT_BOX - 禮盒</option>
                          <option value="GIFT_SET">GIFT_SET - 禮品組</option>
                        </select>
                      </div>

                      {/* 展開/收起更多欄位按鈕 */}
                      <button
                        onClick={() => toggleShowAllFields(product.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        {product.showAllFields ? (
                          <>
                            <span>▲</span> 收起更多欄位
                          </>
                        ) : (
                          <>
                            <span>▼</span> 展開所有 AI 分析欄位
                          </>
                        )}
                      </button>

                      {/* 所有欄位區域 */}
                      {product.showAllFields && renderAllFields(product)}

                      {/* 標籤 */}
                      <div className="pt-3 border-t border-gray-100">
                        <label className="text-xs text-gray-500 mb-1 block">
                          產品標籤
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {product.selectedTags.map((tag) => (
                            <span
                              key={tag.id}
                              onClick={() => toggleTag(product.id, tag)}
                              className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-blue-200"
                            >
                              {tag.name_zh || tag.name} ✓
                            </span>
                          ))}
                          {product.newTags.map((tagName) => (
                            <span
                              key={tagName}
                              onClick={() => {
                                setCurrentProductForTag(product.id);
                                setNewTagInput({ name_zh: tagName, name_en: tagName });
                                setShowNewTagModal(true);
                              }}
                              className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-yellow-200"
                            >
                              {tagName} (新增)
                            </span>
                          ))}
                          <button
                            onClick={() => {
                              setCurrentProductForTag(product.id);
                              setNewTagInput({ name_zh: "", name_en: "" });
                              setShowNewTagModal(true);
                            }}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                          >
                            + 新增標籤
                          </button>
                        </div>

                        {/* 現有標籤選擇 */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {existingTags
                            .filter(
                              (t) => !product.selectedTags.some((st) => st.id === t.id)
                            )
                            .slice(0, 15)
                            .map((tag) => (
                              <span
                                key={tag.id}
                                onClick={() => toggleTag(product.id, tag)}
                                className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-gray-200"
                              >
                                {tag.name_zh || tag.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 載入中狀態 */}
                  {product.status === "analyzing" && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-500">AI 正在分析中...</span>
                    </div>
                  )}

                  {/* 待分析狀態 */}
                  {product.status === "pending" && (
                    <div className="text-gray-400 text-sm py-4">
                      等待 AI 分析...
                    </div>
                  )}

                  {/* 自訂 AI 提示 */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">
                          🎯 單獨提示（覆蓋全域提示）
                        </label>
                        <input
                          type="text"
                          value={product.customHint || ""}
                          onChange={(e) =>
                            setProducts((prev) =>
                              prev.map((p) =>
                                p.id === product.id
                                  ? { ...p, customHint: e.target.value }
                                  : p
                              )
                            )
                          }
                          placeholder="例如：這是環保帆布袋、聖誕禮盒..."
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      {(product.status === "ready" || product.status === "error") && (
                        <button
                          onClick={() => {
                            setProducts((prev) =>
                              prev.map((p) =>
                                p.id === product.id
                                  ? { ...p, status: "pending", productData: undefined }
                                  : p
                              )
                            );
                            setTimeout(() => analyzeImage(product.id), 100);
                          }}
                          disabled={!apiKey}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 whitespace-nowrap mt-5"
                        >
                          🔄 重新分析
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 新增標籤 Modal */}
      {showNewTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">新增標籤</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">中文名稱 *</label>
                <input
                  type="text"
                  value={newTagInput.name_zh}
                  onChange={(e) =>
                    setNewTagInput((prev) => ({ ...prev, name_zh: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">英文名稱</label>
                <input
                  type="text"
                  value={newTagInput.name_en}
                  onChange={(e) =>
                    setNewTagInput((prev) => ({ ...prev, name_en: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewTagModal(false);
                  setNewTagInput({ name_zh: "", name_en: "" });
                  setCurrentProductForTag(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleAddNewTag}
                disabled={!newTagInput.name_zh}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                確認新增
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 解鎖密碼 Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">🔐 解鎖大批次模式</h3>
            <p className="text-gray-500 text-sm mb-4">
              輸入密碼以將批次上限從 10 張提升到 100 張
            </p>
            <div>
              <label className="text-sm text-gray-600">密碼</label>
              <input
                type="password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="請輸入解鎖密碼"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUnlockModal(false);
                  setUnlockPassword("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleUnlock}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                解鎖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
