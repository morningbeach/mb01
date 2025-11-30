import { NextRequest, NextResponse } from "next/server";

// 包裝設計搜尋 API
// 搜尋 Behance, Dribbble, Pinterest, Packaging of the World 等設計平台
// 使用方式：POST /api/admin/trend-scanner

interface TrendRequest {
  regions: string[];
  category: "packaging" | "gifts" | "both";
  limit?: number;
  serpApiKey?: string;
  geminiKey?: string;
  keywords?: string; // 使用者自訂搜尋關鍵字
  source?: "design" | "b2b" | "all"; // 搜尋來源
}

interface ProductResult {
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
  products: ProductResult[];
}

// 設計網站白名單
const DESIGN_SITES = [
  "behance.net",
  "dribbble.com", 
  "pinterest.com",
  "packagingoftheworld.com",
  "thedieline.com",
  "designboom.com",
  "dezeen.com",
  "lovelypackage.com",
  "bpando.org",
  "packaging-gateway.com",
];

// B2B 電商平台白名單
const B2B_SITES = [
  "alibaba.com",
  "1688.com",
  "amazon.com",
  "made-in-china.com",
  "globalsources.com",
  "dhgate.com",
  "indiamart.com",
];

// 區域搜尋配置 - 專注於包裝設計
const REGION_CONFIG: Record<string, { name: string; domain: string; gl: string; hl: string; defaultTerms: Record<string, string[]> }> = {
  asia: {
    name: "亞洲",
    domain: "google.com",
    gl: "sg",
    hl: "en",
    defaultTerms: {
      packaging: [
        "luxury gift box packaging design",
        "magnetic box packaging design inspiration",
        "Asian packaging design trends",
        "minimalist box design",
      ],
      gifts: ["promotional gift design", "corporate gift packaging design"],
    },
  },
  china: {
    name: "中國/台灣",
    domain: "google.com",
    gl: "hk",
    hl: "zh-TW",
    defaultTerms: {
      packaging: [
        "禮盒包裝設計",
        "磁吸盒設計靈感",
        "中式包裝設計",
        "精品盒設計",
      ],
      gifts: ["禮品包裝設計", "企業禮品設計"],
    },
  },
  japan: {
    name: "日本",
    domain: "google.co.jp",
    gl: "jp",
    hl: "ja",
    defaultTerms: {
      packaging: [
        "パッケージデザイン",
        "ギフトボックス デザイン",
        "和風 パッケージ",
        "Japanese packaging design",
      ],
      gifts: ["ノベルティ デザイン", "販促品 パッケージ"],
    },
  },
  america: {
    name: "美洲",
    domain: "google.com",
    gl: "us",
    hl: "en",
    defaultTerms: {
      packaging: [
        "luxury packaging design",
        "gift box design inspiration",
        "minimalist packaging design",
        "sustainable packaging design",
      ],
      gifts: ["promotional product packaging", "corporate gift design"],
    },
  },
  europe: {
    name: "歐洲",
    domain: "google.co.uk",
    gl: "uk",
    hl: "en",
    defaultTerms: {
      packaging: [
        "European packaging design",
        "luxury box design UK",
        "sustainable packaging design Europe",
        "premium gift box design",
      ],
      gifts: ["eco-friendly gift packaging design", "corporate gift design EU"],
    },
  },
  "middle-east": {
    name: "中東",
    domain: "google.ae",
    gl: "ae",
    hl: "en",
    defaultTerms: {
      packaging: [
        "luxury Arabic packaging design",
        "gold foil box design Dubai",
        "premium gift box design Middle East",
        "Islamic pattern packaging",
      ],
      gifts: ["VIP gift packaging design", "luxury corporate gift design"],
    },
  },
};

// 使用 SerpAPI 進行 Google Images 搜尋（限定設計網站）
async function searchDesignImages(query: string, region: string, limit: number, customKey?: string): Promise<ProductResult[]> {
  const serpApiKey = customKey || process.env.SERPAPI_KEY;
  
  if (!serpApiKey) {
    console.log("SerpAPI key not configured");
    return [];
  }

  const config = REGION_CONFIG[region];
  if (!config) return [];

  // 加入設計網站限制
  const siteFilter = DESIGN_SITES.map(site => `site:${site}`).join(" OR ");
  const searchQuery = `${query} (${siteFilter})`;

  try {
    // Google Images 搜尋
    const params = new URLSearchParams({
      q: searchQuery,
      api_key: serpApiKey,
      engine: "google_images",
      google_domain: config.domain,
      gl: config.gl,
      hl: config.hl,
      num: String(limit * 2), // 多抓一些以防過濾後不夠
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("SerpAPI error:", data.error);
      return [];
    }

    // 解析圖片結果
    const imageResults = data.images_results || [];
    
    return imageResults.slice(0, limit).map((item: any, idx: number) => ({
      title: item.title || "包裝設計",
      link: item.link || "",
      source: extractSourceName(item.source || item.link || ""),
      thumbnail: item.original || item.thumbnail || "",
      price: "",
      position: idx + 1,
    }));
  } catch (error) {
    console.error("SerpAPI search error:", error);
    return [];
  }
}

// 從 URL 提取來源網站名稱
function extractSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const siteNames: Record<string, string> = {
      // 設計網站
      "behance.net": "Behance",
      "dribbble.com": "Dribbble",
      "pinterest.com": "Pinterest",
      "packagingoftheworld.com": "Packaging of the World",
      "thedieline.com": "The Dieline",
      "designboom.com": "Designboom",
      "dezeen.com": "Dezeen",
      "lovelypackage.com": "Lovely Package",
      "bpando.org": "BP&O",
      "packaging-gateway.com": "Packaging Gateway",
      // B2B 電商
      "alibaba.com": "Alibaba",
      "1688.com": "1688",
      "amazon.com": "Amazon",
      "made-in-china.com": "Made in China",
      "globalsources.com": "Global Sources",
      "dhgate.com": "DHgate",
      "indiamart.com": "IndiaMART",
    };
    return siteNames[hostname] || hostname;
  } catch {
    return url;
  }
}

// 搜尋 B2B 電商平台（Alibaba, 1688, Amazon 等）
async function searchB2BPlatforms(query: string, region: string, limit: number, customKey?: string): Promise<ProductResult[]> {
  const serpApiKey = customKey || process.env.SERPAPI_KEY;
  
  if (!serpApiKey) {
    console.log("SerpAPI key not configured");
    return [];
  }

  const config = REGION_CONFIG[region];
  if (!config) return [];

  // 加入 B2B 網站限制
  const siteFilter = B2B_SITES.map(site => `site:${site}`).join(" OR ");
  const searchQuery = `${query} packaging box (${siteFilter})`;

  try {
    const params = new URLSearchParams({
      q: searchQuery,
      api_key: serpApiKey,
      engine: "google_images",
      google_domain: config.domain,
      gl: config.gl,
      hl: config.hl,
      num: String(limit * 2),
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("SerpAPI B2B error:", data.error);
      return [];
    }

    const imageResults = data.images_results || [];
    
    return imageResults.slice(0, limit).map((item: any, idx: number) => ({
      title: item.title || "包裝盒產品",
      link: item.link || "",
      source: extractSourceName(item.source || item.link || ""),
      thumbnail: item.original || item.thumbnail || "",
      price: "",
      position: idx + 1,
    }));
  } catch (error) {
    console.error("SerpAPI B2B error:", error);
    return [];
  }
}

// 備用：不限網站的 Google Images 搜尋
async function searchGoogleImages(query: string, region: string, limit: number, customKey?: string): Promise<ProductResult[]> {
  const serpApiKey = customKey || process.env.SERPAPI_KEY;
  
  if (!serpApiKey) {
    return [];
  }

  const config = REGION_CONFIG[region];
  if (!config) return [];

  try {
    const params = new URLSearchParams({
      q: query,
      api_key: serpApiKey,
      engine: "google_images",
      google_domain: config.domain,
      gl: config.gl,
      hl: config.hl,
      num: String(limit),
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("SerpAPI Images error:", data.error);
      return [];
    }

    const imageResults = data.images_results || [];
    
    return imageResults.slice(0, limit).map((item: any, idx: number) => ({
      title: item.title || "未知圖片",
      link: item.link || "",
      source: item.source || "",
      thumbnail: item.original || item.thumbnail || "",
      price: "",
      position: idx + 1,
    }));
  } catch (error) {
    console.error("SerpAPI Images error:", error);
    return [];
  }
}

// 生成模擬數據（無 API Key 時）
function generateMockProducts(region: string, category: string, source: string = "all"): ProductResult[] {
  const designData: ProductResult[] = [
    { title: "極簡黑金磁吸禮盒設計 - 高端護膚品包裝", link: "https://www.behance.net/gallery/packaging-design", source: "Behance", thumbnail: "https://via.placeholder.com/300x300?text=Luxury+Box+Design", price: "", position: 1 },
    { title: "日式和風茶葉禮盒 - 天地蓋結構", link: "https://www.pinterest.com/pin/japanese-tea-box", source: "Pinterest", thumbnail: "https://via.placeholder.com/300x300?text=Japanese+Style", price: "", position: 2 },
    { title: "環保牛皮紙抽屜盒 - 有機產品包裝", link: "https://dribbble.com/shots/kraft-drawer-box", source: "Dribbble", thumbnail: "https://via.placeholder.com/300x300?text=Eco+Kraft+Box", price: "", position: 3 },
    { title: "聖誕限定禮盒設計 - 燙金壓紋工藝", link: "https://www.packagingoftheworld.com/christmas-box", source: "Packaging of the World", thumbnail: "https://via.placeholder.com/300x300?text=Christmas+Edition", price: "", position: 4 },
  ];

  const b2bData: ProductResult[] = [
    { title: "磁吸翻蓋禮盒 - 黑色燙金 500個起訂", link: "https://www.alibaba.com/product/magnetic-gift-box", source: "Alibaba", thumbnail: "https://via.placeholder.com/300x300?text=Alibaba+磁吸盒", price: "$1.50-3.00", position: 1 },
    { title: "天地蓋硬盒 - 白卡350g 可客製", link: "https://detail.1688.com/lid-base-box", source: "1688", thumbnail: "https://via.placeholder.com/300x300?text=1688+天地蓋", price: "¥2.80-5.50", position: 2 },
    { title: "抽屜式禮盒 - 牛皮紙環保材質 MOQ 200", link: "https://www.alibaba.com/product/drawer-box", source: "Alibaba", thumbnail: "https://via.placeholder.com/300x300?text=Alibaba+抽屜盒", price: "$1.20-2.50", position: 3 },
    { title: "摺疊禮盒 - 可折平運輸 節省運費", link: "https://www.amazon.com/dp/foldable-gift-box", source: "Amazon", thumbnail: "https://via.placeholder.com/300x300?text=Amazon+摺疊盒", price: "$12.99", position: 4 },
    { title: "精裝書型盒 - 磁吸開合 印刷訂製", link: "https://detail.1688.com/book-style-box", source: "1688", thumbnail: "https://via.placeholder.com/300x300?text=1688+書型盒", price: "¥4.50-8.00", position: 5 },
    { title: "開窗展示盒 - PET透明窗 食品級", link: "https://www.made-in-china.com/window-box", source: "Made in China", thumbnail: "https://via.placeholder.com/300x300?text=MIC+開窗盒", price: "$0.50-1.20", position: 6 },
  ];

  if (source === "design") {
    return designData;
  } else if (source === "b2b") {
    return b2bData;
  } else {
    // all - 混合
    return [...designData.slice(0, 3), ...b2bData.slice(0, 3)];
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: TrendRequest = await req.json();
    const { 
      regions = ["asia"], 
      category = "packaging", 
      limit = 10, 
      serpApiKey, 
      keywords,
      source = "all" // design | b2b | all
    } = body;

    const results: TrendResult[] = [];
    const hasApiKey = !!(serpApiKey || process.env.SERPAPI_KEY);

    for (const region of regions) {
      const config = REGION_CONFIG[region];
      if (!config) continue;

      // 決定搜尋關鍵字
      let searchQuery: string;
      if (keywords && keywords.trim()) {
        // 使用者自訂關鍵字
        searchQuery = keywords.trim();
      } else {
        // 使用預設關鍵字
        const defaultTerms = category === "both" 
          ? [...(config.defaultTerms.packaging || []), ...(config.defaultTerms.gifts || [])]
          : config.defaultTerms[category] || [];
        searchQuery = defaultTerms[0] || "gift box";
      }

      let products: ProductResult[] = [];

      if (hasApiKey) {
        if (source === "design") {
          // 只搜尋設計網站
          products = await searchDesignImages(searchQuery, region, limit, serpApiKey);
        } else if (source === "b2b") {
          // 只搜尋 B2B 電商平台
          products = await searchB2BPlatforms(searchQuery, region, limit, serpApiKey);
        } else {
          // 搜尋全部（設計 + B2B）
          const designResults = await searchDesignImages(searchQuery, region, Math.ceil(limit / 2), serpApiKey);
          const b2bResults = await searchB2BPlatforms(searchQuery, region, Math.ceil(limit / 2), serpApiKey);
          products = [...designResults, ...b2bResults];
        }
        
        // 如果都沒結果，嘗試一般圖片搜尋
        if (products.length === 0) {
          products = await searchGoogleImages(searchQuery + " packaging box", region, limit, serpApiKey);
        }
      }

      // 無 API 或無結果時使用模擬數據
      if (products.length === 0) {
        products = generateMockProducts(region, category === "both" ? "packaging" : category, source);
      }

      results.push({
        region,
        regionName: config.name,
        searchQuery,
        products: products.slice(0, limit),
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      hasRealData: hasApiKey,
      results,
    });
  } catch (error: any) {
    console.error("Product search error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "搜尋失敗" },
      { status: 500 }
    );
  }
}

// GET - 取得可用區域列表
export async function GET() {
  return NextResponse.json({
    success: true,
    regions: Object.entries(REGION_CONFIG).map(([key, value]) => ({
      id: key,
      name: value.name,
    })),
    categories: [
      { id: "packaging", name: "包裝盒" },
      { id: "gifts", name: "小禮品" },
      { id: "both", name: "全部" },
    ],
    sources: [
      { id: "all", name: "全部來源" },
      { id: "design", name: "設計網站 (Behance, Dribbble, Pinterest...)" },
      { id: "b2b", name: "B2B電商 (Alibaba, 1688, Amazon...)" },
    ],
    apiStatus: {
      serpapi: !!process.env.SERPAPI_KEY,
    },
  });
}
