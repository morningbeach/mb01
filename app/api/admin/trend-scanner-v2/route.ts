import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Apify 爬蟲搜尋 API v2
// 使用 Apify 作為爬蟲基礎

interface SearchRequest {
  apifyKey: string;
  keywords: string;
  sites: string[];
  limit: number;
}

interface SearchResult {
  id: string;
  title: string;
  imageUrl: string;
  sourceUrl: string;
  source: string;
  selected?: boolean;
}

// 網站配置
const SITE_CONFIG: Record<string, { name: string; category: string; actorId: string }> = {
  pinterest: {
    name: "Pinterest",
    category: "design",
    actorId: "apify/pinterest-scraper",
  },
  behance: {
    name: "Behance",
    category: "design",
    actorId: "apify/web-scraper", // 使用通用爬蟲
  },
  dribbble: {
    name: "Dribbble",
    category: "design",
    actorId: "apify/web-scraper",
  },
  artstation: {
    name: "ArtStation",
    category: "design",
    actorId: "apify/web-scraper",
  },
  amazon: {
    name: "Amazon B2B",
    category: "factory",
    actorId: "apify/amazon-product-scraper",
  },
  alibaba: {
    name: "Alibaba",
    category: "factory",
    actorId: "apify/web-scraper",
  },
  "1688": {
    name: "1688",
    category: "factory",
    actorId: "apify/web-scraper",
  },
};

// R2 客戶端
function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
  });
}

// 使用 Apify 搜尋
async function searchWithApify(
  apifyKey: string,
  site: string,
  keywords: string,
  limit: number
): Promise<SearchResult[]> {
  const config = SITE_CONFIG[site];
  if (!config) return [];

  try {
    // 根據不同網站建立不同的搜尋任務
    let searchUrl = "";
    let startUrls: { url: string }[] = [];

    switch (site) {
      case "pinterest":
        searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(keywords + " packaging box design")}`;
        startUrls = [{ url: searchUrl }];
        break;
      case "behance":
        searchUrl = `https://www.behance.net/search/projects?search=${encodeURIComponent(keywords + " packaging")}`;
        startUrls = [{ url: searchUrl }];
        break;
      case "dribbble":
        searchUrl = `https://dribbble.com/search/${encodeURIComponent(keywords + " packaging")}`;
        startUrls = [{ url: searchUrl }];
        break;
      case "artstation":
        searchUrl = `https://www.artstation.com/search?query=${encodeURIComponent(keywords + " packaging")}`;
        startUrls = [{ url: searchUrl }];
        break;
      case "amazon":
        searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keywords + " gift box packaging")}`;
        startUrls = [{ url: searchUrl }];
        break;
      case "alibaba":
        searchUrl = `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(keywords + " packaging box")}`;
        startUrls = [{ url: searchUrl }];
        break;
      case "1688":
        searchUrl = `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(keywords + " 包装盒")}`;
        startUrls = [{ url: searchUrl }];
        break;
    }

    // 呼叫 Apify Actor
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${encodeURIComponent(config.actorId)}/runs?token=${apifyKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startUrls,
          maxItems: limit,
          proxyConfiguration: {
            useApifyProxy: true,
          },
        }),
      }
    );

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error(`Apify run error for ${site}:`, error);
      return [];
    }

    const runData = await runResponse.json();
    const runId = runData.data?.id;

    if (!runId) {
      console.error(`No run ID for ${site}`);
      return [];
    }

    // 等待任務完成（最多等 60 秒）
    let attempts = 0;
    let status = "RUNNING";
    
    while (status === "RUNNING" && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyKey}`
      );
      const statusData = await statusResponse.json();
      status = statusData.data?.status;
      attempts++;
    }

    if (status !== "SUCCEEDED") {
      console.error(`Apify task ${site} did not succeed: ${status}`);
      return [];
    }

    // 取得結果
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyKey}`
    );
    const items = await datasetResponse.json();

    // 解析結果
    return parseApifyResults(items, site, limit);
  } catch (error) {
    console.error(`Apify search error for ${site}:`, error);
    return [];
  }
}

// 解析 Apify 結果
function parseApifyResults(items: any[], site: string, limit: number): SearchResult[] {
  const results: SearchResult[] = [];

  for (const item of items) {
    if (results.length >= limit) break;

    let imageUrl = "";
    let title = "";
    let sourceUrl = "";

    // 根據不同網站解析數據
    switch (site) {
      case "pinterest":
        imageUrl = item.image || item.images?.[0] || "";
        title = item.title || item.description || "Pinterest";
        sourceUrl = item.url || item.link || "";
        break;
      case "amazon":
        imageUrl = item.thumbnailImage || item.image || "";
        title = item.title || "Amazon Product";
        sourceUrl = item.url || "";
        break;
      default:
        // 通用解析
        imageUrl = item.image || item.imageUrl || item.thumbnail || item.src || "";
        title = item.title || item.name || item.description || site;
        sourceUrl = item.url || item.link || item.href || "";
    }

    if (imageUrl) {
      results.push({
        id: `${site}-${Date.now()}-${results.length}`,
        title: title.substring(0, 100),
        imageUrl,
        sourceUrl,
        source: SITE_CONFIG[site]?.name || site,
      });
    }
  }

  return results;
}

// 儲存圖片到 R2
async function saveImageToR2(imageUrl: string, folder: string): Promise<string | null> {
  try {
    // 下載圖片
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    
    // 生成檔名
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const key = `${folder}/${filename}`;

    // 上傳到 R2
    const r2 = getR2Client();
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: contentType,
      })
    );

    // 返回圖片 URL
    return `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`;
  } catch (error) {
    console.error("Save to R2 error:", error);
    return null;
  }
}

// POST - 搜尋
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "search") {
      // 執行搜尋
      const { apifyKey, keywords, sites, limit } = body as SearchRequest & { action: string };

      if (!apifyKey) {
        return NextResponse.json({ success: false, message: "請提供 Apify API Key" }, { status: 400 });
      }

      if (!keywords?.trim()) {
        return NextResponse.json({ success: false, message: "請輸入搜尋關鍵字" }, { status: 400 });
      }

      if (!sites || sites.length === 0) {
        return NextResponse.json({ success: false, message: "請選擇至少一個搜尋網站" }, { status: 400 });
      }

      const allResults: SearchResult[] = [];
      const perSiteLimit = Math.ceil(limit / sites.length);

      // 並行搜尋各網站
      const searchPromises = sites.map((site: string) =>
        searchWithApify(apifyKey, site, keywords, perSiteLimit)
      );

      const results = await Promise.all(searchPromises);
      results.forEach((siteResults) => {
        allResults.push(...siteResults);
      });

      return NextResponse.json({
        success: true,
        results: allResults.slice(0, limit),
        timestamp: new Date().toISOString(),
      });
    } else if (action === "save") {
      // 儲存選中的圖片到 R2
      const { images } = body as { action: string; images: SearchResult[] };

      if (!images || images.length === 0) {
        return NextResponse.json({ success: false, message: "沒有選擇圖片" }, { status: 400 });
      }

      // 生成資料夾名稱 /AItrend/日期
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const folder = `AItrend/${today}`;

      const savedImages: { original: string; saved: string }[] = [];
      const errors: string[] = [];

      for (const image of images) {
        const savedUrl = await saveImageToR2(image.imageUrl, folder);
        if (savedUrl) {
          savedImages.push({ original: image.imageUrl, saved: savedUrl });
        } else {
          errors.push(image.imageUrl);
        }
      }

      return NextResponse.json({
        success: true,
        saved: savedImages,
        errors,
        folder,
        message: `成功儲存 ${savedImages.length} 張圖片到 ${folder}`,
      });
    }

    return NextResponse.json({ success: false, message: "未知操作" }, { status: 400 });
  } catch (error: any) {
    console.error("Trend scanner v2 error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "搜尋失敗" },
      { status: 500 }
    );
  }
}

// GET - 取得網站列表
export async function GET() {
  const designSites = Object.entries(SITE_CONFIG)
    .filter(([, config]) => config.category === "design")
    .map(([id, config]) => ({ id, name: config.name }));

  const factorySites = Object.entries(SITE_CONFIG)
    .filter(([, config]) => config.category === "factory")
    .map(([id, config]) => ({ id, name: config.name }));

  return NextResponse.json({
    success: true,
    sites: {
      design: designSites,
      factory: factorySites,
    },
  });
}
