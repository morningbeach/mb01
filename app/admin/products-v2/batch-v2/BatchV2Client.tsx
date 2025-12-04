"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

interface Tag {
  id: string;
  name: string;
  name_en?: string;
  name_zh?: string;
  slug: string;
  color?: string;
}

interface Dimension {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  icon: string | null;
  allow_multiple: boolean;
  tags: Tag[];
}

interface ExtraImage {
  file: File;
  previewUrl: string;
}

interface AnalysisStep {
  label: string;
  result: string | Record<string, string[]>;
  displayName?: string;
  editable: boolean;
  suggestions: string[];
  dimension?: Dimension | null;
  dimensions?: Dimension[];
  selectedTags?: string[];
  selectedMap?: Record<string, string[]>;
}

interface Analysis {
  step1: AnalysisStep;
  step2: AnalysisStep;
  step3: AnalysisStep;
  step4: AnalysisStep;
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
  showAllFields?: boolean;
  extraImages?: ExtraImage[];
  detectedCategory?: string; // AI 偵測的類別
  dimensions?: Dimension[]; // 維度樹結構
  detectedTagMap?: Record<string, string[]>; // AI 偵測的標籤（按維度分組）
  analysis?: Analysis; // 分層分析結果
}

export default function BatchV2Client() {
  const [apiKey, setApiKey] = useState("");
  const [gptApiKey, setGptApiKey] = useState(""); // GPT API Key for translation
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [existingTags, setExistingTags] = useState<Tag[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [newTagInput, setNewTagInput] = useState({ name_zh: "", name_en: "", color: "#3B82F6" });
  const [currentProductForTag, setCurrentProductForTag] = useState<string | null>(null);
  const [currentDimensionForTag, setCurrentDimensionForTag] = useState<string | null>(null); // 新增標籤的目標維度
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [aiHint, setAiHint] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTranslating, setIsTranslating] = useState<string | null>(null); // 正在翻譯的產品 ID
  
  // 批次數量控制
  const [maxBatchSize, setMaxBatchSize] = useState(10);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  // TAG 展開控制
  const [expandedTagProducts, setExpandedTagProducts] = useState<Set<string>>(new Set());
  const [tagSearchTerms, setTagSearchTerms] = useState<Record<string, string>>({});
  
  // 維度展開控制（每個產品獨立）
  const [expandedDimensions, setExpandedDimensions] = useState<Record<string, Set<string>>>({});
  
  // 時間追蹤
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // AItrend 圖庫相關
  const [showAItrendModal, setShowAItrendModal] = useState(false);
  const [aitrendFolders, setAitrendFolders] = useState<string[]>([]);
  const [selectedAItrendFolder, setSelectedAItrendFolder] = useState('');
  const [aitrendImages, setAitrendImages] = useState<string[]>([]);
  const [selectedAItrendImages, setSelectedAItrendImages] = useState<string[]>([]);
  const [loadingAItrend, setLoadingAItrend] = useState(false);
  
  // 計時器更新
  useEffect(() => {
    if (startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime]);
  
  // 格式化時間顯示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins} 分 ${secs} 秒` : `${secs} 秒`;
  };

  // 載入 API Key 從 localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
    // 載入 GPT API Key
    const savedGptKey = localStorage.getItem("gpt_api_key");
    if (savedGptKey) {
      setGptApiKey(savedGptKey);
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
  
  // 檢查是否有來自 trend-scanner 的待分析圖片
  useEffect(() => {
    const pendingAnalysis = localStorage.getItem("pending_product_analysis");
    if (pendingAnalysis) {
      try {
        const data = JSON.parse(pendingAnalysis);
        // 檢查是否在 5 分鐘內
        if (Date.now() - data.timestamp < 5 * 60 * 1000) {
          // 將圖片加入到產品列表並自動分析
          handleImageUrlAnalysis(data.imageUrl, data.title);
        }
        // 清除 localStorage
        localStorage.removeItem("pending_product_analysis");
      } catch (error) {
        console.error("解析待分析圖片錯誤:", error);
      }
    }
  }, [apiKey]); // 依賴 apiKey，確保有 API Key 才執行

  // 儲存 API Key
  const handleSaveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    alert("Gemini API Key 已儲存");
  };

  // 儲存 GPT API Key
  const handleSaveGptApiKey = () => {
    localStorage.setItem("gpt_api_key", gptApiKey);
    alert("GPT API Key 已儲存");
  };

  // GPT 翻譯函數
  const translateWithGPT = async (text: string, fromLang: "zh" | "en", toLang: "zh" | "en"): Promise<string> => {
    if (!gptApiKey || !text.trim()) return "";
    
    const langNames = { zh: "Traditional Chinese", en: "English" };
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${gptApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional translator for product descriptions. Translate the following text from ${langNames[fromLang]} to ${langNames[toLang]}. Keep the translation natural and suitable for e-commerce product listings. Only output the translation, nothing else.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error("翻譯失敗");
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  };

  // 同步翻譯產品欄位
  const syncTranslate = async (productId: string, field: string, value: string, sourceLang: "zh" | "en") => {
    if (!gptApiKey || !value.trim()) return;
    
    setIsTranslating(productId);
    
    try {
      const targetLang = sourceLang === "zh" ? "en" : "zh";
      const targetField = field.replace(`_${sourceLang}`, `_${targetLang}`);
      
      const translated = await translateWithGPT(value, sourceLang, targetLang);
      
      if (translated) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, productData: { ...p.productData, [targetField]: translated } }
              : p
          )
        );
      }
    } catch (error) {
      console.error("翻譯錯誤:", error);
    } finally {
      setIsTranslating(null);
    }
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
      extraImages: [], // 初始化為空陣列
    }));

    setProducts((prev) => [...prev, ...newProducts].slice(0, maxBatchSize));
    
    // 第一次上傳檔案時開始計時
    if (!startTime) {
      setStartTime(Date.now());
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // 從 URL 載入圖片並分析（用於 trend-scanner 整合）
  const handleImageUrlAnalysis = async (imageUrl: string, title: string) => {
    if (!apiKey) {
      alert("請先設定 Gemini API Key");
      return;
    }
    
    try {
      // 下載圖片並轉換為 File 對象
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], title || "image.jpg", { type: blob.type });
      
      const newProduct: ProductItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        imageUrl,
        status: "pending",
        selectedTags: [],
        newTags: [],
        customHint: "",
        showAllFields: false,
        extraImages: [],
      };
      
      setProducts((prev) => [newProduct, ...prev]);
      
      // 自動開始分析
      setTimeout(() => {
        analyzeImage(newProduct.id);
      }, 500);
      
      // 開始計時
      if (!startTime) {
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error("載入圖片失敗:", error);
      alert("載入圖片失敗，請確認圖片 URL 是否有效");
    }
  };
  
  // 載入 AItrend 資料夾
  const loadAItrendFolders = async () => {
    try {
      const response = await fetch('/api/admin/ai-image-editor?action=folders');
      const data = await response.json();
      if (data.folders) {
        setAitrendFolders(data.folders);
        if (data.folders.length > 0) {
          setSelectedAItrendFolder(data.folders[0]);
        }
      }
    } catch (error) {
      console.error('Error loading AItrend folders:', error);
      alert('載入 AItrend 資料夾失敗');
    }
  };
  
  // 載入 AItrend 圖片
  const loadAItrendImages = async () => {
    if (!selectedAItrendFolder) {
      alert('請選擇資料夾');
      return;
    }
    
    setLoadingAItrend(true);
    try {
      const response = await fetch(
        `/api/admin/ai-image-editor?action=images&folder=${encodeURIComponent(selectedAItrendFolder)}`
      );
      const data = await response.json();
      
      if (data.images && data.images.length > 0) {
        setAitrendImages(data.images);
      } else {
        alert('此資料夾沒有圖片');
      }
    } catch (error) {
      console.error('Error loading AItrend images:', error);
      alert('載入圖片失敗');
    } finally {
      setLoadingAItrend(false);
    }
  };
  
  // 切換 AItrend 圖片選擇
  const toggleAItrendImage = (imageUrl: string) => {
    setSelectedAItrendImages(prev =>
      prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };
  
  // 從 AItrend 匯入選中的圖片
  const importFromAItrend = async () => {
    if (selectedAItrendImages.length === 0) {
      alert('請至少選擇一張圖片');
      return;
    }
    
    if (products.length + selectedAItrendImages.length > maxBatchSize) {
      alert(`最多只能匯入 ${maxBatchSize - products.length} 張圖片`);
      return;
    }
    
    setLoadingAItrend(true);
    
    try {
      // 下載選中的圖片並轉換為 File 物件
      const newProducts: ProductItem[] = [];
      
      for (const imageUrl of selectedAItrendImages) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const filename = imageUrl.split('/').pop() || 'image.jpg';
          const file = new File([blob], filename, { type: blob.type });
          
          newProducts.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            file,
            imageUrl: URL.createObjectURL(file),
            status: "pending",
            selectedTags: [],
            newTags: [],
            customHint: "",
            showAllFields: false,
            extraImages: [],
          });
        } catch (error) {
          console.error(`Failed to import ${imageUrl}:`, error);
        }
      }
      
      setProducts((prev) => [...prev, ...newProducts].slice(0, maxBatchSize));
      
      // 第一次匯入時開始計時
      if (!startTime) {
        setStartTime(Date.now());
      }
      
      // 關閉 modal 並重置選擇
      setShowAItrendModal(false);
      setSelectedAItrendImages([]);
      alert(`成功匯入 ${newProducts.length} 張圖片`);
    } catch (error) {
      console.error('Error importing from AItrend:', error);
      alert('匯入失敗');
    } finally {
      setLoadingAItrend(false);
    }
  };
  
  // 開啟 AItrend modal 時載入資料夾
  useEffect(() => {
    if (showAItrendModal && aitrendFolders.length === 0) {
      loadAItrendFolders();
    }
  }, [showAItrendModal]);

  // AI 分析單張圖片（使用新的維度架構）
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
      formData.append("userHint", product.customHint || aiHint);

      const res = await fetch("/api/admin/products-v2/analyze-v3", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "分析失敗");
      }

      // 從 API 回傳的維度樹中建立 slug -> tag 的映射
      const slugMap = new Map<string, Tag>();
      const dimensions: Dimension[] = data.dimensions || [];
      
      dimensions.forEach((dim) => {
        dim.tags.forEach((tag) => {
          if (tag.slug) {
            slugMap.set(tag.slug.toLowerCase(), tag);
          }
        });
      });

      // 處理 AI 偵測到的標籤（按維度分組）
      const detectedTagMap: Record<string, string[]> = data.detectedTagMap || {};
      const matchedTags: Tag[] = [];
      const unmatchedTagHints: Set<string> = new Set();

      // 從每個維度中收集匹配的標籤（AI 偵測到的標籤自動勾選）
      Object.values(detectedTagMap).forEach((tagSlugs: string[]) => {
        if (Array.isArray(tagSlugs)) {
          tagSlugs.forEach((slug) => {
            const found = slugMap.get(slug.toLowerCase());
            if (found) {
              // 確保標籤被加入到 selectedTags（自動勾選）
              if (!matchedTags.some((t) => t.id === found.id)) {
                matchedTags.push(found);
              }
            } else {
              unmatchedTagHints.add(slug.replace(/-/g, " "));
            }
          });
        }
      });
      
      // 額外處理 analysis 中的 selectedTags（確保 Step 2/3 的選中項也被勾選）
      if (data.analysis) {
        // Step 2 的 selectedTags（可能是維度 slug，也可能是標籤 slug）
        const step2Selected = data.analysis.step2?.selectedTags || [];
        step2Selected.forEach((slug: string) => {
          // 先嘗試從 step2.dimension.tags 中找
          const step2Tag = data.analysis.step2?.dimension?.tags?.find(
            (t: Tag) => t.slug === slug
          );
          if (step2Tag && !matchedTags.some((t) => t.id === step2Tag.id)) {
            matchedTags.push(step2Tag);
          }
        });
        
        // Step 3 的 selectedTags
        const step3Selected = data.analysis.step3?.selectedTags || [];
        step3Selected.forEach((slug: string) => {
          const step3Tag = data.analysis.step3?.dimension?.tags?.find(
            (t: Tag) => t.slug === slug
          );
          if (step3Tag && !matchedTags.some((t) => t.id === step3Tag.id)) {
            matchedTags.push(step3Tag);
          }
        });
        
        // Step 4 的 selectedMap
        const step4Map = data.analysis.step4?.selectedMap || {};
        Object.entries(step4Map).forEach(([dimSlug, tagSlugs]) => {
          const dim = data.analysis.step4?.dimensions?.find((d: Dimension) => d.slug === dimSlug);
          if (dim && Array.isArray(tagSlugs)) {
            (tagSlugs as string[]).forEach((slug) => {
              const tag = dim.tags?.find((t: Tag) => t.slug === slug);
              if (tag && !matchedTags.some((t) => t.id === tag.id)) {
                matchedTags.push(tag);
              }
            });
          }
        });
      }

      // 加入 AI 建議的新標籤
      const suggestedNewTags: string[] = data.suggestedNewTags || [];
      suggestedNewTags.forEach((name) => {
        if (name) {
          unmatchedTagHints.add(name);
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
                newTags: Array.from(unmatchedTagHints),
                detectedCategory: data.detectedCategory,
                dimensions: dimensions,
                detectedTagMap: detectedTagMap,
                analysis: data.analysis, // 新增分層分析結果
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

  // 壓縮圖片到適合網頁的大小
  const compressImage = async (
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1920,
    quality: number = 0.85
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        let { width, height } = img;

        // 計算縮放比例
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          reject(new Error("無法建立 canvas context"));
          return;
        }

        // 繪製壓縮後的圖片
        ctx.drawImage(img, 0, 0, width, height);

        // 轉換為 Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("圖片壓縮失敗"));
              return;
            }

            // 建立新的 File 物件
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            console.log(
              `圖片壓縮: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% 減少)`
            );

            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("無法載入圖片"));
      img.src = URL.createObjectURL(file);
    });
  };

  // 上傳圖片到 R2（含壓縮）
  const uploadImageToR2 = async (file: File): Promise<string> => {
    // 先壓縮圖片
    let fileToUpload = file;
    
    // 只壓縮超過 500KB 的圖片
    if (file.size > 500 * 1024) {
      try {
        fileToUpload = await compressImage(file);
      } catch (err) {
        console.warn("圖片壓縮失敗，使用原圖上傳:", err);
      }
    }
    
    const formData = new FormData();
    formData.append("file", fileToUpload);

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

  // 建立新標籤（可選擇性地關聯到維度）
  const createNewTag = async (name_zh: string, name_en: string, color?: string, dimensionId?: string | null): Promise<Tag> => {
    const baseSlug = name_en
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || 'tag';
    
    const slug = baseSlug;

    const res = await fetch("/api/admin/tags-v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name_zh, name_zh, name_en, slug, color, dimensionId }),
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

      // 2. 建立新標籤（如果有）並收集所有 tagIds
      const allTagIds: string[] = [];
      
      // 從已選擇的標籤收集 id（確保是有效字串）
      for (const t of product.selectedTags) {
        if (t.id && typeof t.id === 'string' && t.id.trim()) {
          allTagIds.push(t.id);
        }
      }
      
      // 建立新標籤
      for (const newTagName of product.newTags) {
        if (!newTagName || !newTagName.trim()) continue;
        try {
          const newTag = await createNewTag(newTagName, newTagName);
          if (newTag && newTag.id) {
            allTagIds.push(String(newTag.id));
            setExistingTags((prev) => [...prev, newTag]);
          }
        } catch (tagError) {
          console.warn(`建立標籤「${newTagName}」失敗:`, tagError);
        }
      }

      // 3. 上傳額外子圖片（不包含封面圖）
      const extraImageUrls: string[] = [];
      if (product.extraImages && product.extraImages.length > 0) {
        for (const extra of product.extraImages) {
          try {
            const extraUrl = await uploadImageToR2(extra.file);
            extraImageUrls.push(extraUrl);
          } catch (err) {
            console.warn("額外圖片上傳失敗:", err);
          }
        }
      }

      // 4. 建立產品 - 使用更精確的唯一識別碼
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const sku = `MB-${timestamp.toString(36).toUpperCase()}-${randomSuffix}`;
      
      const {
        suggestedTags,
        imageUrl: _imgUrl,
        mainImage: _mainImg,
        images: _images,
        ...cleanProductData
      } = product.productData || {};
      
      // 確保 slug 唯一：使用毫秒時間戳 + 隨機字串
      const baseSlug = (cleanProductData.slug || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '-')  // 保留中文、英文、數字、連字號
        .replace(/-+/g, '-')  // 移除多餘連字號
        .replace(/^-|-$/g, ''); // 移除首尾連字號
      const uniqueSlug = `${baseSlug}-${timestamp.toString(36)}-${randomSuffix.toLowerCase()}`;
      
      const productPayload = {
        name: cleanProductData.name_zh || cleanProductData.name_en || "未命名產品",
        slug: uniqueSlug,
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
        images: extraImageUrls, // 只包含額外子圖片，不包含封面圖
        
        sku: sku,
        
        // 過濾並確保 tagIds 為有效字串陣列
        tagIds: allTagIds.filter(id => id && typeof id === 'string' && id.trim()),
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
    
    // 停止計時並顯示完成提示
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const totalTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const successCount = products.filter(p => p.status === "done").length + readyProducts.length;
    const errorCount = products.filter(p => p.status === "error").length;
    
    alert(
      `🎉 批次上架完成！\n\n` +
      `⏱️ 總耗時：${formatTime(totalTime)}\n` +
      `✅ 成功：${successCount} 個產品\n` +
      (errorCount > 0 ? `❌ 失敗：${errorCount} 個產品\n` : '') +
      `\n平均每個產品：${successCount > 0 ? formatTime(Math.round(totalTime / successCount)) : '0 秒'}`
    );
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

  // 禮品類別專用：切換 Step 2 的品項類型，Step 3 跟著變
  const switchGiftItemType = (productId: string, newItemSlug: string) => {
    console.log('switchGiftItemType called:', productId, newItemSlug);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId || !p.analysis) return p;
        if (p.detectedCategory !== 'gift') return p;
        
        // 從 dimensions 中找到新的品項維度（例如 gift-home, gift-drinkware 等）
        const newItemDimension = p.dimensions?.find(d => d.slug === newItemSlug);
        console.log('newItemDimension:', newItemSlug, newItemDimension);
        
        if (!newItemDimension) {
          console.warn('找不到維度:', newItemSlug, '可用維度:', p.dimensions?.map(d => d.slug));
          return p;
        }
        
        // Step2 的 tags 是品項類型列表（如 gift-home, gift-drinkware 等維度作為 tag 顯示）
        // 找到對應的 Step2 tag
        const step2Tag = p.analysis.step2.dimension?.tags.find(t => t.slug === newItemSlug);
        
        // 移除舊的 Step3 的標籤（不移除 Step2 的，因為那是維度選擇器）
        const oldStep3Slugs = p.analysis.step3.dimension?.tags.map(t => t.slug) || [];
        
        const filteredTags = p.selectedTags.filter(t => 
          !oldStep3Slugs.includes(t.slug)
        );
        
        // Step2 的 displayName 從新維度取得
        const newDisplayName = newItemDimension.name_zh || newItemDimension.name_en || newItemSlug;
        
        return {
          ...p,
          selectedTags: filteredTags,
          analysis: {
            ...p.analysis,
            step2: {
              ...p.analysis.step2,
              result: newItemSlug,
              displayName: newDisplayName,
              selectedTags: [newItemSlug],
            },
            step3: {
              ...p.analysis.step3,
              dimension: newItemDimension, // 更新為新選擇的維度
              result: '',
              displayName: '',
              selectedTags: [],
            },
          },
        };
      })
    );
  };

  // 新增標籤
  const handleAddNewTag = async () => {
    if (!newTagInput.name_zh || !currentProductForTag) return;

    // 檢查是否有重複的標籤名稱
    const duplicateTag = existingTags.find(
      (t) => 
        t.name?.toLowerCase() === newTagInput.name_zh.toLowerCase() ||
        t.name_zh?.toLowerCase() === newTagInput.name_zh.toLowerCase() ||
        (newTagInput.name_en && t.name_en?.toLowerCase() === newTagInput.name_en.toLowerCase())
    );

    if (duplicateTag) {
      setDuplicateWarning(`標籤「${duplicateTag.name || duplicateTag.name_zh}」已存在！請使用現有標籤或更改名稱。`);
      return;
    }

    try {
      // 找到維度的真實 ID（如果有指定維度的話）
      let dimensionId: string | null = null;
      if (currentDimensionForTag && currentProductForTag) {
        const product = products.find(p => p.id === currentProductForTag);
        if (product?.analysis) {
          const analysis = product.analysis;
          // 從 Step 2 找
          if (analysis.step2?.dimension?.slug === currentDimensionForTag) {
            dimensionId = analysis.step2.dimension.id;
          }
          // 從 Step 3 找
          else if (analysis.step3?.dimension?.slug === currentDimensionForTag) {
            dimensionId = analysis.step3.dimension.id;
          }
          // 從 Step 4 找
          else if (analysis.step4?.dimensions) {
            const dim = analysis.step4.dimensions.find(d => d.slug === currentDimensionForTag);
            if (dim) {
              dimensionId = dim.id;
            }
          }
        }
        // fallback: 從 product.dimensions 找
        if (!dimensionId && product?.dimensions) {
          const dim = product.dimensions.find(d => d.slug === currentDimensionForTag);
          if (dim) {
            dimensionId = dim.id;
          }
        }
        console.log('找到的 dimensionId:', dimensionId, 'for slug:', currentDimensionForTag);
      }

      const newTag = await createNewTag(
        newTagInput.name_zh,
        newTagInput.name_en || newTagInput.name_zh,
        newTagInput.color,
        dimensionId
      );
      
      // 更新 existingTags，讓所有產品都可以選擇這個新標籤
      setExistingTags((prev) => [...prev, newTag]);
      
      // 更新產品狀態
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === currentProductForTag) {
            // 將新標籤加入到 selectedTags
            let updatedProduct = {
              ...p,
              selectedTags: [...p.selectedTags, newTag],
              newTags: p.newTags.filter((t) => t !== newTagInput.name_zh),
            };
            
            // 如果有指定維度，也更新 analysis 中該維度的 tags 列表
            if (currentDimensionForTag && updatedProduct.analysis) {
              const analysis = { ...updatedProduct.analysis };
              
              // 檢查是否是 Step 2 的維度
              if (analysis.step2?.dimension?.slug === currentDimensionForTag) {
                analysis.step2 = {
                  ...analysis.step2,
                  dimension: {
                    ...analysis.step2.dimension,
                    tags: [...analysis.step2.dimension.tags, newTag],
                  },
                };
              }
              // 檢查是否是 Step 3 的維度
              else if (analysis.step3?.dimension?.slug === currentDimensionForTag) {
                analysis.step3 = {
                  ...analysis.step3,
                  dimension: {
                    ...analysis.step3.dimension,
                    tags: [...analysis.step3.dimension.tags, newTag],
                  },
                };
              }
              // 檢查是否是 Step 4 的維度
              else if (analysis.step4?.dimensions) {
                const dimIndex = analysis.step4.dimensions.findIndex(
                  d => d.slug === currentDimensionForTag
                );
                if (dimIndex >= 0) {
                  const updatedDims = [...analysis.step4.dimensions];
                  updatedDims[dimIndex] = {
                    ...updatedDims[dimIndex],
                    tags: [...updatedDims[dimIndex].tags, newTag],
                  };
                  analysis.step4 = {
                    ...analysis.step4,
                    dimensions: updatedDims,
                  };
                }
              }
              
              updatedProduct = { ...updatedProduct, analysis };
            }
            
            return updatedProduct;
          }
          // 清除其他產品的 newTags 中相同名稱的項目（因為已建立為正式標籤）
          return {
            ...p,
            newTags: p.newTags.filter((t) => t !== newTagInput.name_zh),
          };
        })
      );

      setShowNewTagModal(false);
      setNewTagInput({ name_zh: "", name_en: "", color: "#3B82F6" });
      setCurrentProductForTag(null);
      setCurrentDimensionForTag(null);
      setDuplicateWarning(null);
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
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 批次產品上架</h1>
          <p className="text-gray-500 mt-1">
            使用 Google Gemini AI 自動分析產品圖片，產生中英文產品資訊
          </p>
        </div>
        
        {/* 計時器顯示 */}
        {startTime && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-right">
            <div className="text-xs text-blue-600 font-medium">⏱️ 作業時間</div>
            <div className="text-xl font-bold text-blue-700">{formatTime(elapsedTime)}</div>
            <button
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setStartTime(null);
                setElapsedTime(0);
              }}
              className="text-xs text-blue-500 hover:text-blue-700 mt-1"
            >
              重新計時
            </button>
          </div>
        )}
      </div>

      {/* API Key 設定 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">🔑 API Key 設定</h2>
        
        {/* Gemini API Key */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 font-medium mb-1 block">Google Gemini API Key（圖片分析用）</label>
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
        </div>
        
        {/* GPT API Key */}
        <div>
          <label className="text-sm text-gray-600 font-medium mb-1 block">OpenAI GPT API Key（翻譯同步用）</label>
          <div className="flex gap-3">
            <input
              type="password"
              value={gptApiKey}
              onChange={(e) => setGptApiKey(e.target.value)}
              placeholder="輸入您的 OpenAI API Key（選填，用於編輯時自動翻譯）"
              className="flex-1 border rounded-lg px-4 py-2 text-sm"
            />
            <button
              onClick={handleSaveGptApiKey}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              儲存
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {gptApiKey ? "✅ 已設定 GPT Key，編輯欄位時會自動同步翻譯" : "💡 設定後，編輯中文會自動翻譯成英文，反之亦然"}
          </p>
        </div>
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
        <div className="flex gap-3 mt-4">
          {products.length > 0 ? (
            <>
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
            </>
          ) : (
            <button
              onClick={() => setShowAItrendModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
            >
              📁 從 AItrend 圖庫選擇
            </button>
          )}
        </div>
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
                      {/* 單獨上架按鈕 */}
                      {product.status === "ready" && (
                        <button
                          onClick={async () => {
                            await uploadProduct(product);
                            const updated = products.find(p => p.id === product.id);
                            if (updated?.status === "done") {
                              alert(`✅ 「${product.productData?.name_zh || product.productData?.name}」上架成功！`);
                            }
                          }}
                          disabled={isUploading}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                        >
                          🚀 上架
                        </button>
                      )}
                      {product.status === "done" && (
                        <span className="text-green-600 text-sm font-medium">✓ 已上架</span>
                      )}
                      {product.status === "uploading" && (
                        <span className="text-yellow-600 text-sm">上架中...</span>
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
                      {/* 翻譯狀態提示 */}
                      {isTranslating === product.id && (
                        <div className="flex items-center gap-2 text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          翻譯中...
                        </div>
                      )}
                      
                      {/* 產品名稱 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-500">中文名稱</label>
                            {gptApiKey && (
                              <button
                                onClick={() => syncTranslate(product.id, "name_zh", product.productData.name_zh, "zh")}
                                disabled={isTranslating === product.id}
                                className="text-xs text-blue-500 hover:text-blue-700"
                                title="翻譯成英文"
                              >
                                → EN
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={product.productData.name_zh || ""}
                            onChange={(e) =>
                              updateProductData(product.id, "name_zh", e.target.value)
                            }
                            onBlur={(e) => gptApiKey && e.target.value && syncTranslate(product.id, "name_zh", e.target.value, "zh")}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-500">英文名稱</label>
                            {gptApiKey && (
                              <button
                                onClick={() => syncTranslate(product.id, "name_en", product.productData.name_en, "en")}
                                disabled={isTranslating === product.id}
                                className="text-xs text-blue-500 hover:text-blue-700"
                                title="翻譯成中文"
                              >
                                → 中
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={product.productData.name_en || ""}
                            onChange={(e) =>
                              updateProductData(product.id, "name_en", e.target.value)
                            }
                            onBlur={(e) => gptApiKey && e.target.value && syncTranslate(product.id, "name_en", e.target.value, "en")}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>

                      {/* 簡短描述 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-500">中文簡述</label>
                            {gptApiKey && (
                              <button
                                onClick={() => syncTranslate(product.id, "shortDesc_zh", product.productData.shortDesc_zh, "zh")}
                                disabled={isTranslating === product.id}
                                className="text-xs text-blue-500 hover:text-blue-700"
                                title="翻譯成英文"
                              >
                                → EN
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={product.productData.shortDesc_zh || ""}
                            onChange={(e) =>
                              updateProductData(product.id, "shortDesc_zh", e.target.value)
                            }
                            onBlur={(e) => gptApiKey && e.target.value && syncTranslate(product.id, "shortDesc_zh", e.target.value, "zh")}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-500">英文簡述</label>
                            {gptApiKey && (
                              <button
                                onClick={() => syncTranslate(product.id, "shortDesc_en", product.productData.shortDesc_en, "en")}
                                disabled={isTranslating === product.id}
                                className="text-xs text-blue-500 hover:text-blue-700"
                                title="翻譯成中文"
                              >
                                → 中
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={product.productData.shortDesc_en || ""}
                            onChange={(e) =>
                              updateProductData(product.id, "shortDesc_en", e.target.value)
                            }
                            onBlur={(e) => gptApiKey && e.target.value && syncTranslate(product.id, "shortDesc_en", e.target.value, "en")}
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

                      {/* 新增子圖片 */}
                      <div className="py-2">
                        <label className="text-xs text-gray-500 mb-2 block">
                          📸 子圖片（可選）
                        </label>
                        <div className="flex flex-wrap gap-2 items-center">
                          {/* 已添加的子圖片預覽 */}
                          {(product.extraImages || []).map((extra, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={extra.previewUrl}
                                alt={`子圖 ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded border"
                              />
                              <button
                                onClick={() => {
                                  URL.revokeObjectURL(extra.previewUrl);
                                  setProducts((prev) =>
                                    prev.map((p) =>
                                      p.id === product.id
                                        ? {
                                            ...p,
                                            extraImages: (p.extraImages || []).filter(
                                              (_, i) => i !== idx
                                            ),
                                          }
                                        : p
                                    )
                                  );
                                }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          {/* 添加子圖片按鈕 */}
                          <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                const newExtras = files.map((file) => ({
                                  file,
                                  previewUrl: URL.createObjectURL(file),
                                }));
                                setProducts((prev) =>
                                  prev.map((p) =>
                                    p.id === product.id
                                      ? {
                                          ...p,
                                          extraImages: [
                                            ...(p.extraImages || []),
                                            ...newExtras,
                                          ],
                                        }
                                      : p
                                  )
                                );
                                e.target.value = "";
                              }}
                            />
                            <span className="text-2xl text-gray-400">+</span>
                          </label>
                        </div>
                        {(product.extraImages?.length || 0) > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            已新增 {product.extraImages?.length} 張子圖片
                          </p>
                        )}
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

                      {/* 標籤（維度樹狀結構） */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-gray-500 font-medium">
                            產品標籤 {product.detectedCategory && (
                              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                {product.detectedCategory === 'print-packaging' ? '盒' : 
                                 product.detectedCategory === 'bag' ? '袋' : '禮品'}
                              </span>
                            )}
                          </label>
                          <button
                            onClick={() => {
                              setCurrentProductForTag(product.id);
                              setNewTagInput({ name_zh: "", name_en: "", color: "#3B82F6" });
                              setShowNewTagModal(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            + 新增標籤
                          </button>
                        </div>

                        {/* 已選標籤摘要 */}
                        <div className="flex flex-wrap gap-1 mb-2">
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
                                setNewTagInput({ name_zh: tagName, name_en: tagName, color: "#3B82F6" });
                                setShowNewTagModal(true);
                              }}
                              className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-yellow-200"
                            >
                              {tagName} (新增)
                            </span>
                          ))}
                        </div>

                        {/* 分層標籤選擇器 - 使用 analysis 結構 */}
                        {product.analysis && (
                          <div className="space-y-3 bg-gray-50 rounded-lg p-3">
                            {/* Step 1: 類別判斷（不可編輯） */}
                            {product.analysis.step1 && (
                              <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                <div className="bg-gray-100 px-3 py-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-600 font-bold text-xs">Step 1</span>
                                      <span className="text-sm font-medium text-gray-700">
                                        {product.analysis.step1.label}
                                      </span>
                                      <span className="text-xs text-gray-400">(自動判斷)</span>
                                    </div>
                                    {product.analysis.step1.displayName && (
                                      <span className="text-sm text-gray-700 font-medium bg-gray-200 px-2 py-0.5 rounded">
                                        {product.analysis.step1.displayName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Step 2: 材質/家庭/項目偵測 */}
                            {product.analysis.step2 && product.analysis.step2.dimension && (
                              <div className="border border-blue-200 rounded-lg bg-white overflow-hidden">
                                <div className="bg-blue-50 px-3 py-2 border-b border-blue-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-blue-600 font-bold text-xs">Step 2</span>
                                      <span className="text-sm font-medium text-gray-700">
                                        {product.analysis.step2.label}
                                      </span>
                                      {product.detectedCategory === 'gift' && (
                                        <span className="text-xs text-orange-500">(單選，切換後 Step3 會更新)</span>
                                      )}
                                    </div>
                                    {product.analysis.step2.displayName && (
                                      <span className="text-sm text-blue-600 font-medium">
                                        → {product.analysis.step2.displayName}
                                      </span>
                                    )}
                                  </div>
                                  {product.analysis.step2.suggestions && product.analysis.step2.suggestions.length > 0 && (
                                    <div className="mt-1 text-xs text-gray-500">
                                      💡 AI 建議: {product.analysis.step2.suggestions.map((s, i) => (
                                        <span
                                          key={i}
                                          onClick={() => {
                                            setCurrentProductForTag(product.id);
                                            setCurrentDimensionForTag(product.analysis?.step2.dimension?.slug || null);
                                            setNewTagInput({ name_zh: s, name_en: '', color: '#3B82F6' });
                                            setShowNewTagModal(true);
                                          }}
                                          className="ml-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded cursor-pointer hover:bg-yellow-200 inline-block"
                                        >
                                          {s} +
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="px-3 py-2">
                                  <div className="flex flex-wrap gap-1 items-center">
                                    {product.analysis.step2.dimension.tags.map((tag) => {
                                      const detectedTags = product.analysis?.step2.selectedTags || [];
                                      const isDetected = detectedTags.includes(tag.slug);
                                      
                                      // 禮品類別：檢查是否為當前選中的品項類型
                                      const isGiftSelected = product.detectedCategory === 'gift' && 
                                        product.analysis?.step2.selectedTags?.includes(tag.slug);
                                      // 非禮品類別：正常檢查 selectedTags
                                      const isNormalSelected = product.detectedCategory !== 'gift' && 
                                        product.selectedTags.some(t => t.id === tag.id);
                                      const isSelected = isGiftSelected || isNormalSelected;
                                      
                                      return (
                                        <span
                                          key={tag.id}
                                          onClick={() => {
                                            if (product.detectedCategory === 'gift') {
                                              // 禮品類別：切換品項類型，Step3 跟著變
                                              switchGiftItemType(product.id, tag.slug);
                                            } else {
                                              toggleTag(product.id, tag);
                                            }
                                          }}
                                          className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                                            isSelected
                                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                                              : isDetected
                                              ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          }`}
                                        >
                                          {tag.name_zh} {isSelected && '✓'} {isDetected && !isSelected && '🤖'}
                                        </span>
                                      );
                                    })}
                                    {/* Step 2 新增標籤按鈕 */}
                                    <span
                                      onClick={() => {
                                        setCurrentProductForTag(product.id);
                                        setCurrentDimensionForTag(product.analysis?.step2.dimension?.slug || null);
                                        setNewTagInput({ name_zh: '', name_en: '', color: '#3B82F6' });
                                        setShowNewTagModal(true);
                                      }}
                                      className="px-2 py-1 rounded text-xs cursor-pointer border-2 border-dashed border-blue-300 text-blue-500 hover:bg-blue-50"
                                    >
                                      + 新增
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Step 3: 產品名稱偵測 */}
                            {product.analysis.step3 && product.analysis.step3.dimension && (
                              <div className="border border-purple-200 rounded-lg bg-white overflow-hidden">
                                <div className="bg-purple-50 px-3 py-2 border-b border-purple-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-purple-600 font-bold text-xs">Step 3</span>
                                      <span className="text-sm font-medium text-gray-700">
                                        {product.analysis.step3.label}
                                      </span>
                                    </div>
                                    {product.analysis.step3.displayName && (
                                      <span className="text-sm text-purple-600 font-medium">
                                        → {product.analysis.step3.displayName}
                                      </span>
                                    )}
                                  </div>
                                  {product.analysis.step3.suggestions && product.analysis.step3.suggestions.length > 0 && (
                                    <div className="mt-1 text-xs text-gray-500">
                                      💡 AI 建議: {product.analysis.step3.suggestions.map((s, i) => (
                                        <span
                                          key={i}
                                          onClick={() => {
                                            setCurrentProductForTag(product.id);
                                            setCurrentDimensionForTag(product.analysis?.step3.dimension?.slug || null);
                                            setNewTagInput({ name_zh: s, name_en: '', color: '#8B5CF6' });
                                            setShowNewTagModal(true);
                                          }}
                                          className="ml-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded cursor-pointer hover:bg-yellow-200 inline-block"
                                        >
                                          {s} +
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="px-3 py-2">
                                  <div className="flex flex-wrap gap-1 items-center">
                                    {product.analysis.step3.dimension.tags.map((tag) => {
                                      const isSelected = product.selectedTags.some(t => t.id === tag.id);
                                      const detectedTags = product.analysis?.step3.selectedTags || [];
                                      const isDetected = detectedTags.includes(tag.slug);
                                      
                                      return (
                                        <span
                                          key={tag.id}
                                          onClick={() => toggleTag(product.id, tag)}
                                          className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                                            isSelected
                                              ? 'bg-purple-500 text-white hover:bg-purple-600'
                                              : isDetected
                                              ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          }`}
                                        >
                                          {tag.name_zh} {isSelected && '✓'} {isDetected && !isSelected && '🤖'}
                                        </span>
                                      );
                                    })}
                                    {/* Step 3 新增標籤按鈕 */}
                                    <span
                                      onClick={() => {
                                        setCurrentProductForTag(product.id);
                                        setCurrentDimensionForTag(product.analysis?.step3.dimension?.slug || null);
                                        setNewTagInput({ name_zh: '', name_en: '', color: '#8B5CF6' });
                                        setShowNewTagModal(true);
                                      }}
                                      className="px-2 py-1 rounded text-xs cursor-pointer border-2 border-dashed border-purple-300 text-purple-500 hover:bg-purple-50"
                                    >
                                      + 新增
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Step 4: 其他標籤偵測 */}
                            {product.analysis.step4 && product.analysis.step4.dimensions && product.analysis.step4.dimensions.length > 0 && (
                              <div className="border border-orange-200 rounded-lg bg-white overflow-hidden">
                                <div className="bg-orange-50 px-3 py-2 border-b border-orange-100">
                                  <div className="flex items-center gap-2">
                                    <span className="text-orange-600 font-bold text-xs">Step 4</span>
                                    <span className="text-sm font-medium text-gray-700">
                                      {product.analysis.step4.label}
                                    </span>
                                    <span className="text-xs text-gray-400">(非必填)</span>
                                  </div>
                                  {product.analysis.step4.suggestions && product.analysis.step4.suggestions.length > 0 && (
                                    <div className="mt-1 text-xs text-gray-500">
                                      💡 AI 建議: {product.analysis.step4.suggestions.map((s, i) => (
                                        <span
                                          key={i}
                                          onClick={() => {
                                            setCurrentProductForTag(product.id);
                                            setCurrentDimensionForTag(null); // Step4 建議不指定維度
                                            setNewTagInput({ name_zh: s, name_en: '', color: '#F59E0B' });
                                            setShowNewTagModal(true);
                                          }}
                                          className="ml-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded cursor-pointer hover:bg-yellow-200 inline-block"
                                        >
                                          {s} +
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="px-3 py-2 space-y-2">
                                  {product.analysis.step4.dimensions.map((dimension) => {
                                    const prodExpandedDims = expandedDimensions[product.id] || new Set();
                                    const isExpanded = prodExpandedDims.has(dimension.slug);
                                    const selectedMap = product.analysis?.step4.selectedMap || {};
                                    const detectedInThisDim = selectedMap[dimension.slug] || [];

                                    return (
                                      <div key={dimension.id} className="border border-gray-200 rounded bg-gray-50">
                                        <button
                                          onClick={() => {
                                            setExpandedDimensions(prev => {
                                              const prodDims = new Set(prev[product.id] || new Set());
                                              if (prodDims.has(dimension.slug)) {
                                                prodDims.delete(dimension.slug);
                                              } else {
                                                prodDims.add(dimension.slug);
                                              }
                                              return { ...prev, [product.id]: prodDims };
                                            });
                                          }}
                                          className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
                                            <span className="text-xs font-medium text-gray-600">
                                              {dimension.name_zh}
                                            </span>
                                            {detectedInThisDim.length > 0 && (
                                              <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                                🤖 {detectedInThisDim.length}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">
                                              {dimension.tags.length} 標籤
                                            </span>
                                            {/* 每個 Step4 維度的新增按鈕 */}
                                            <span
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentProductForTag(product.id);
                                                setCurrentDimensionForTag(dimension.slug);
                                                setNewTagInput({ name_zh: '', name_en: '', color: '#F59E0B' });
                                                setShowNewTagModal(true);
                                              }}
                                              className="px-1.5 py-0.5 rounded text-xs cursor-pointer border border-dashed border-orange-300 text-orange-500 hover:bg-orange-50"
                                            >
                                              +
                                            </span>
                                          </div>
                                        </button>
                                        {isExpanded && (
                                          <div className="px-2 pb-2 pt-1 border-t border-gray-200">
                                            <div className="flex flex-wrap gap-1 items-center">
                                              {dimension.tags.map((tag) => {
                                                const isSelected = product.selectedTags.some(t => t.id === tag.id);
                                                const isDetected = detectedInThisDim.includes(tag.slug);
                                                
                                                return (
                                                  <span
                                                    key={tag.id}
                                                    onClick={() => toggleTag(product.id, tag)}
                                                    className={`px-2 py-0.5 rounded text-xs cursor-pointer transition-colors ${
                                                      isSelected
                                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                        : isDetected
                                                        ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                                  >
                                                    {tag.name_zh} {isSelected && '✓'} {isDetected && !isSelected && '🤖'}
                                                  </span>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 後備：如果沒有 analysis 但有 dimensions，仍顯示舊版維度 */}
                        {!product.analysis && product.dimensions && product.dimensions.length > 0 && (
                          <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                            {product.dimensions.map((dimension) => {
                              const prodExpandedDims = expandedDimensions[product.id] || new Set();
                              const isExpanded = prodExpandedDims.has(dimension.slug);
                              const detectedInThisDim = product.detectedTagMap?.[dimension.slug] || [];

                              return (
                                <div key={dimension.id} className="border border-gray-200 rounded-lg bg-white">
                                  <button
                                    onClick={() => {
                                      setExpandedDimensions(prev => {
                                        const prodDims = new Set(prev[product.id] || new Set());
                                        if (prodDims.has(dimension.slug)) {
                                          prodDims.delete(dimension.slug);
                                        } else {
                                          prodDims.add(dimension.slug);
                                        }
                                        return { ...prev, [product.id]: prodDims };
                                      });
                                    }}
                                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
                                      <span className="text-sm font-medium text-gray-700">
                                        {dimension.name_zh}
                                      </span>
                                      {detectedInThisDim.length > 0 && (
                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                          AI 偵測 {detectedInThisDim.length}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      {dimension.tags.length} 個標籤
                                    </span>
                                  </button>
                                  {isExpanded && (
                                    <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                                      <div className="flex flex-wrap gap-1">
                                        {dimension.tags.map((tag) => {
                                          const isSelected = product.selectedTags.some(t => t.id === tag.id);
                                          const isDetected = detectedInThisDim.includes(tag.slug);
                                          
                                          return (
                                            <span
                                              key={tag.id}
                                              onClick={() => toggleTag(product.id, tag)}
                                              className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                                                isSelected
                                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                  : isDetected
                                                  ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                              }`}
                                            >
                                              {tag.name_zh} {isSelected && '✓'} {isDetected && !isSelected && '🤖'}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
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
            <h3 className="text-lg font-semibold mb-2">新增標籤</h3>
            
            {/* 目標維度資訊 */}
            {currentDimensionForTag && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
                📁 將加入到維度: <span className="font-medium">{currentDimensionForTag}</span>
              </div>
            )}
            
            {/* 重複警告 */}
            {duplicateWarning && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                ⚠️ {duplicateWarning}
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">中文名稱 *</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={newTagInput.name_zh}
                    onChange={(e) => {
                      setNewTagInput((prev) => ({ ...prev, name_zh: e.target.value }));
                      setDuplicateWarning(null);
                    }}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="輸入中文名稱"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!gptApiKey || !newTagInput.name_zh) return;
                      try {
                        const res = await fetch("https://api.openai.com/v1/chat/completions", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${gptApiKey}`,
                          },
                          body: JSON.stringify({
                            model: "gpt-3.5-turbo",
                            messages: [{ 
                              role: "user", 
                              content: `Translate this Chinese tag name to English (keep it short, 1-3 words): ${newTagInput.name_zh}` 
                            }],
                            temperature: 0.3,
                          }),
                        });
                        const data = await res.json();
                        const translated = data.choices?.[0]?.message?.content?.trim() || "";
                        if (translated) {
                          setNewTagInput(prev => ({ ...prev, name_en: translated }));
                        }
                      } catch (err) {
                        console.error("翻譯失敗:", err);
                      }
                    }}
                    disabled={!gptApiKey || !newTagInput.name_zh}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 text-sm whitespace-nowrap"
                    title="使用 GPT 翻譯成英文"
                  >
                    → EN
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">英文名稱</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={newTagInput.name_en}
                    onChange={(e) => {
                      setNewTagInput((prev) => ({ ...prev, name_en: e.target.value }));
                      setDuplicateWarning(null);
                    }}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="輸入英文名稱"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!gptApiKey || !newTagInput.name_en) return;
                      try {
                        const res = await fetch("https://api.openai.com/v1/chat/completions", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${gptApiKey}`,
                          },
                          body: JSON.stringify({
                            model: "gpt-3.5-turbo",
                            messages: [{ 
                              role: "user", 
                              content: `Translate this English tag name to Traditional Chinese (keep it short, 1-4 characters): ${newTagInput.name_en}` 
                            }],
                            temperature: 0.3,
                          }),
                        });
                        const data = await res.json();
                        const translated = data.choices?.[0]?.message?.content?.trim() || "";
                        if (translated) {
                          setNewTagInput(prev => ({ ...prev, name_zh: translated }));
                        }
                      } catch (err) {
                        console.error("翻譯失敗:", err);
                      }
                    }}
                    disabled={!gptApiKey || !newTagInput.name_en}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 text-sm whitespace-nowrap"
                    title="使用 GPT 翻譯成中文"
                  >
                    → 中
                  </button>
                </div>
              </div>
              
              {/* Slug 預覽 */}
              <div>
                <label className="text-sm text-gray-600">Slug（自動生成，需唯一）</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 border rounded text-sm text-gray-600 font-mono">
                  {(newTagInput.name_en || newTagInput.name_zh || 'tag')
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim() || 'tag'}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">標籤顏色</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={newTagInput.color}
                    onChange={(e) =>
                      setNewTagInput((prev) => ({ ...prev, color: e.target.value }))
                    }
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <div className="flex gap-2">
                    {["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6B7280"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewTagInput((prev) => ({ ...prev, color: c }))}
                        className={`w-8 h-8 rounded-full border-2 ${newTagInput.color === c ? "border-gray-800" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewTagModal(false);
                  setNewTagInput({ name_zh: "", name_en: "", color: "#3B82F6" });
                  setCurrentProductForTag(null);
                  setCurrentDimensionForTag(null);
                  setDuplicateWarning(null);
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

      {/* AItrend 圖庫 Modal */}
      {showAItrendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4">📁 從 AItrend 圖庫選擇</h3>
              
              {/* Folder Selection */}
              <div className="flex gap-3">
                <select
                  value={selectedAItrendFolder}
                  onChange={(e) => setSelectedAItrendFolder(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">請選擇日期資料夾</option>
                  {aitrendFolders.map(folder => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
                <button
                  onClick={loadAItrendImages}
                  disabled={loadingAItrend || !selectedAItrendFolder}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loadingAItrend ? '載入中...' : '載入圖片'}
                </button>
              </div>
              
              {aitrendImages.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    找到 {aitrendImages.length} 張圖片
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const allSelected = selectedAItrendImages.length === aitrendImages.length;
                        setSelectedAItrendImages(allSelected ? [] : [...aitrendImages]);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {selectedAItrendImages.length === aitrendImages.length ? '取消全選' : '全選'}
                    </button>
                    <span className="text-sm text-gray-600">
                      已選擇: {selectedAItrendImages.length} 張
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Image Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {aitrendImages.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {aitrendImages.map((imageUrl, index) => {
                    const isSelected = selectedAItrendImages.includes(imageUrl);
                    return (
                      <div
                        key={index}
                        className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleAItrendImage(imageUrl)}
                      >
                        <div className="aspect-square relative">
                          <img
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  請選擇資料夾並載入圖片
                </div>
              )}
            </div>
            
            {/* Footer Actions */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAItrendModal(false);
                    setSelectedAItrendImages([]);
                    setAitrendImages([]);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={importFromAItrend}
                  disabled={selectedAItrendImages.length === 0 || loadingAItrend}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loadingAItrend ? '匯入中...' : `匯入選中的圖片 (${selectedAItrendImages.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
