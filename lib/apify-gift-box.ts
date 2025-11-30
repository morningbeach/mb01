// lib/apify-gift-box.ts
// Gift Box Radar 資料抓取工具
// 使用 SerpAPI 搜尋各平台 + Apify 作為備選

import { ApifyClient } from "apify-client";

export type TrendPlatform = 
  | "pinterest" 
  | "behance" 
  | "google" 
  | "amazon" 
  | "alibaba1688";

export interface TrendAsset {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  url: string;
  platform: TrendPlatform;
  keyword: string;
  region?: string;
  price?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  likeCount?: number;
  favoriteCount?: number;
  viewCount?: number;
  shareCount?: number;
  popularityScore: number;
  capturedAt: string;
}

export interface GiftBoxSearchRequest {
  sources: TrendPlatform[];
  keywords: string[];
  region?: string;
  limit: number;
}

// Apify client
const apifyClient = process.env.APIFY_TOKEN 
  ? new ApifyClient({ token: process.env.APIFY_TOKEN })
  : null;

// 計算熱度分數
function calculatePopularityScore(data: any, platform: TrendPlatform): number {
  let score = 50; // 基礎分數

  switch (platform) {
    case "pinterest":
      score += Math.log((data.repinCount || data.saveCount || 0) + 1) * 8;
      score += Math.log((data.commentCount || 0) + 1) * 4;
      break;
    case "behance":
      score += Math.log((data.views || 0) + 1) * 6;
      score += Math.log((data.appreciations || data.likes || 0) + 1) * 10;
      break;
    case "google":
      score += (data.position ? Math.max(0, 20 - data.position) : 0);
      break;
    case "amazon":
      score += Math.log((data.reviewCount || 0) + 1) * 8;
      score += (data.rating || 0) * 8;
      break;
    case "alibaba1688":
      score += Math.log((data.transactionCount || data.orders || 0) + 1) * 6;
      break;
  }

  return Math.round(Math.max(0, Math.min(100, score)) * 100) / 100;
}

// ===== SerpAPI 搜尋（穩定可靠）=====
async function searchWithSerpAPI(
  keyword: string, 
  platform: TrendPlatform,
  limit: number,
  region: string = "US"
): Promise<TrendAsset[]> {
  const serpApiKey = process.env.SERPAPI_KEY;
  if (!serpApiKey) {
    console.log(`[Gift Box Radar] No SerpAPI key, skipping ${platform}`);
    return [];
  }

  const assets: TrendAsset[] = [];
  
  // 根據平台構建搜尋查詢
  let siteFilter = "";
  let searchQuery = keyword;
  
  switch (platform) {
    case "pinterest":
      siteFilter = "site:pinterest.com";
      searchQuery = `${keyword} gift box packaging ${siteFilter}`;
      break;
    case "behance":
      siteFilter = "site:behance.net";
      searchQuery = `${keyword} packaging design ${siteFilter}`;
      break;
    case "google":
      searchQuery = `${keyword} gift box packaging`;
      break;
    case "amazon":
      siteFilter = "site:amazon.com";
      searchQuery = `${keyword} gift box ${siteFilter}`;
      break;
    case "alibaba1688":
      siteFilter = "site:alibaba.com OR site:1688.com";
      searchQuery = `${keyword} gift box packaging (${siteFilter})`;
      break;
  }

  try {
    const params = new URLSearchParams({
      q: searchQuery,
      api_key: serpApiKey,
      engine: "google_images",
      google_domain: "google.com",
      gl: region.toLowerCase(),
      hl: "en",
      num: String(limit * 2), // 多抓一些以防過濾
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();

    if (data.error) {
      console.error(`[Gift Box Radar] SerpAPI error for ${platform}:`, data.error);
      return [];
    }

    const imageResults = data.images_results || [];
    
    imageResults.slice(0, limit).forEach((item: any, idx: number) => {
      // 過濾掉不相關的結果
      const url = item.link || "";
      const thumbnail = item.original || item.thumbnail || "";
      
      if (!thumbnail) return;

      assets.push({
        id: `${platform}-${Date.now()}-${idx}`,
        title: item.title || keyword,
        description: item.snippet,
        imageUrl: thumbnail,
        url: url,
        platform,
        keyword,
        region,
        price: undefined,
        currency: undefined,
        rating: undefined,
        reviewCount: undefined,
        likeCount: undefined,
        favoriteCount: undefined,
        viewCount: undefined,
        shareCount: undefined,
        popularityScore: calculatePopularityScore({ position: idx + 1 }, platform),
        capturedAt: new Date().toISOString(),
      });
    });

    console.log(`[Gift Box Radar] Got ${assets.length} results from ${platform} via SerpAPI`);
  } catch (error) {
    console.error(`[Gift Box Radar] Error searching ${platform}:`, error);
  }

  return assets;
}

// ===== Apify Actor 搜尋（備選）=====
async function searchWithApify(
  keyword: string,
  platform: TrendPlatform,
  limit: number
): Promise<TrendAsset[]> {
  if (!apifyClient) {
    console.log(`[Gift Box Radar] No Apify token, skipping ${platform}`);
    return [];
  }

  const assets: TrendAsset[] = [];

  // Apify Store actor IDs（這些可能需要根據實際可用的 actor 調整）
  const actorMap: Record<string, { actorId: string; inputKey: string }> = {
    pinterest: { actorId: "alexey/pinterest-crawler", inputKey: "search" },
    behance: { actorId: "curious_coder/behance-scraper", inputKey: "searchQuery" },
    amazon: { actorId: "junglee/amazon-product-scraper", inputKey: "keyword" },
    alibaba1688: { actorId: "epctex/alibaba-scraper", inputKey: "keyword" },
  };

  const actorConfig = actorMap[platform];
  if (!actorConfig) {
    return [];
  }

  try {
    console.log(`[Gift Box Radar] Searching ${platform} with ${actorConfig.actorId}`);
    
    const runInput: any = {
      [actorConfig.inputKey]: keyword + " gift box",
      maxItems: limit,
    };

    const run = await apifyClient.actor(actorConfig.actorId).call(runInput, {
      waitSecs: 60, // 最多等 60 秒
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    items.forEach((item: any, idx: number) => {
      const imageUrl = item.image || item.imageUrl || item.thumbnail || item.coverImage || "";
      if (!imageUrl) return;

      assets.push({
        id: `${platform}-apify-${Date.now()}-${idx}`,
        title: item.title || item.name || keyword,
        description: item.description,
        imageUrl,
        url: item.url || item.link || "",
        platform,
        keyword,
        price: item.price ? parseFloat(String(item.price).replace(/[^\d.]/g, "")) : undefined,
        currency: item.currency,
        rating: item.rating ? parseFloat(item.rating) : undefined,
        reviewCount: item.reviewCount || item.reviews,
        likeCount: item.likes || item.likeCount,
        viewCount: item.views || item.viewCount,
        popularityScore: calculatePopularityScore(item, platform),
        capturedAt: new Date().toISOString(),
      });
    });

    console.log(`[Gift Box Radar] Got ${assets.length} results from ${platform} via Apify`);
  } catch (error: any) {
    console.error(`[Gift Box Radar] Error with ${platform}:`, error.message || error);
  }

  return assets;
}

// ===== 生成模擬數據（無 API 時）=====
function generateMockData(keyword: string, platform: TrendPlatform, limit: number): TrendAsset[] {
  const mockImages = [
    "https://via.placeholder.com/400x400/f8e1e1?text=Gift+Box+1",
    "https://via.placeholder.com/400x400/e1f8e1?text=Gift+Box+2",
    "https://via.placeholder.com/400x400/e1e1f8?text=Gift+Box+3",
    "https://via.placeholder.com/400x400/f8f8e1?text=Gift+Box+4",
    "https://via.placeholder.com/400x400/e1f8f8?text=Gift+Box+5",
  ];

  const platformNames: Record<TrendPlatform, string> = {
    pinterest: "Pinterest",
    behance: "Behance",
    google: "Google",
    amazon: "Amazon",
    alibaba1688: "Alibaba/1688",
  };

  return Array.from({ length: Math.min(limit, 5) }, (_, idx) => ({
    id: `mock-${platform}-${idx}`,
    title: `${platformNames[platform]} - ${keyword} Gift Box Design #${idx + 1}`,
    description: `Sample gift box packaging design from ${platformNames[platform]}`,
    imageUrl: mockImages[idx % mockImages.length],
    url: `https://${platform}.com/sample/${idx}`,
    platform,
    keyword,
    region: "US",
    price: platform === "amazon" || platform === "alibaba1688" ? 5 + Math.random() * 20 : undefined,
    currency: platform === "amazon" ? "USD" : platform === "alibaba1688" ? "CNY" : undefined,
    rating: platform === "amazon" ? 3.5 + Math.random() * 1.5 : undefined,
    reviewCount: platform === "amazon" ? Math.floor(Math.random() * 500) : undefined,
    likeCount: platform === "pinterest" || platform === "behance" ? Math.floor(Math.random() * 1000) : undefined,
    popularityScore: 50 + Math.random() * 50,
    capturedAt: new Date().toISOString(),
  }));
}

// ===== 主搜尋函數 =====
export async function searchGiftBoxTrends(request: GiftBoxSearchRequest): Promise<TrendAsset[]> {
  const allAssets: TrendAsset[] = [];
  const seenUrls = new Set<string>();
  const hasSerpApi = !!process.env.SERPAPI_KEY;
  const hasApify = !!process.env.APIFY_TOKEN;

  console.log(`[Gift Box Radar] Starting search with SerpAPI: ${hasSerpApi}, Apify: ${hasApify}`);

  for (const source of request.sources) {
    for (const keyword of request.keywords) {
      let sourceAssets: TrendAsset[] = [];

      // 優先使用 SerpAPI（更穩定）
      if (hasSerpApi) {
        sourceAssets = await searchWithSerpAPI(keyword, source, request.limit, request.region || "US");
      }

      // 如果 SerpAPI 沒結果，嘗試 Apify
      if (sourceAssets.length === 0 && hasApify && source !== "google") {
        sourceAssets = await searchWithApify(keyword, source, request.limit);
      }

      // 如果都沒有，使用模擬數據
      if (sourceAssets.length === 0) {
        console.log(`[Gift Box Radar] Using mock data for ${source}`);
        sourceAssets = generateMockData(keyword, source, Math.min(5, request.limit));
      }

      // 去重並添加
      sourceAssets.forEach((asset) => {
        const key = asset.imageUrl || asset.url;
        if (!seenUrls.has(key)) {
          seenUrls.add(key);
          allAssets.push(asset);
        }
      });
    }
  }

  // 按熱度分數排序
  allAssets.sort((a, b) => b.popularityScore - a.popularityScore);

  return allAssets.slice(0, request.limit);
}
