// lib/apify-adapters.ts
// Apify 平台資料抓取 Adapters - 使用可靠的 Apify Store Actors
// 用於從各大設計平台與電商聚合資料

import { ApifyClient } from "apify-client";

// 支援的平台
export type TrendPlatform = 
  | "pinterest" 
  | "behance" 
  | "google" 
  | "amazon" 
  | "shopee"
  | "tiktok"
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

export interface GoogleImageFilters {
  whiteBackground?: boolean;      // 白背景模式（已棄用，使用 backgroundColor）
  highQuality?: boolean;           // 高品質模式
  recentOnly?: boolean;            // 僅最近內容
  commercialUse?: boolean;         // 商業用途授權
  productPhotography?: boolean;    // 產品攝影模式
  excludeLowQuality?: boolean;     // 排除低品質
  useApify?: boolean;              // 使用 Apify Actor 而非直接 API
  backgroundColor?: string;         // 背景顏色：'white' | 'black' | 'gray' | 'blue' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'purple' | 'pink' | 'brown' | 'any'
  productColor?: string;            // 商品主色：'any' | 'white' | 'black' | 'gray' | 'blue' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'purple' | 'pink' | 'brown'
}

export interface ApifySearchRequest {
  sources: TrendPlatform[];
  keywords: string[];
  region?: string;
  limit: number;
  googleFilters?: GoogleImageFilters; // Google 圖片進階篩選
}

// 初始化 Apify 客戶端
const getClient = () => {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error("APIFY_TOKEN is not configured");
  }
  return new ApifyClient({ token });
};

// 計算熱度分數（標準化各平台的互動指標）
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
      score += data.position ? Math.max(0, 20 - data.position) : 0;
      break;
    case "amazon":
      score += Math.log((data.reviewCount || data.reviewsCount || 0) + 1) * 8;
      score += (data.rating || data.stars || 0) * 8;
      break;
    case "alibaba1688":
      score += Math.log((data.transactionCount || data.orders || 0) + 1) * 6;
      break;
  }

  return Math.round(Math.max(0, Math.min(100, score)) * 100) / 100;
}

// ===== Pinterest Adapter =====
// 使用 Web Scraper 直接抓取 Pinterest 搜尋頁面和 Pin 圖片
async function fetchPinterestData(keywords: string[], limit: number): Promise<TrendAsset[]> {
  const assets: TrendAsset[] = [];
  const client = getClient();

  for (const keyword of keywords) {
    try {
      console.log(`[Apify] Pinterest search: "${keyword}"`);
      
      const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(keyword + ' gift box')}`;

      const run = await client.actor("apify/web-scraper").call({
        startUrls: [{ url: searchUrl }],
        waitUntil: ['networkidle2'],
        pageFunction: `async function pageFunction(context) {
          var log = context.log;
          
          await new Promise(function(resolve) { setTimeout(resolve, 5000); });
          
          // 增加捲動次數到 12 次，每次間隔 2 秒，以載入更多 pins
          for (var i = 0; i < 12; i++) {
            window.scrollTo(0, document.body.scrollHeight * (i + 1) / 12);
            await new Promise(function(resolve) { setTimeout(resolve, 2000); });
          }
          
          // 最後再捲動幾次確保載入完整
          for (var x = 0; x < 3; x++) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(function(resolve) { setTimeout(resolve, 2000); });
          }
          
          var pins = [];
          var selectors = ['[data-test-id="pin"]', '[data-grid-item="true"]', 'div[role="listitem"]', 'a[href*="/pin/"]'];
          
          var pinElements = [];
          for (var j = 0; j < selectors.length; j++) {
            pinElements = Array.from(document.querySelectorAll(selectors[j]));
            log.info('Selector found: ' + pinElements.length);
            if (pinElements.length > 30) break;
          }
          
          if (pinElements.length === 0) {
            log.error('No pins found');
            return { pins: [] };
          }
          
          log.info('Processing elements: ' + pinElements.length);
          
          // 增加抓取上限到 60 筆
          for (var k = 0; k < pinElements.length && pins.length < 60; k++) {
            var el = pinElements[k];
            var linkEl = el.href ? el : el.querySelector('a[href*="/pin/"]');
            var imgEl = el.querySelector('img');
            
            if (!linkEl || !imgEl) continue;
            
            var title = imgEl.alt || imgEl.getAttribute('aria-label') || '';
            if (!title || title === 'Image' || title.length < 3) {
              var h3 = el.querySelector('h3');
              if (h3) title = h3.textContent || '';
            }
            
            var url = linkEl.href || '';
            var imageUrl = imgEl.src || imgEl.dataset.src || '';
            
            if (imageUrl) {
              imageUrl = imageUrl.split('/236x/').join('/736x/').split('/474x/').join('/736x/');
            }
            
            var isValidUrl = url && url.indexOf('/pin/') !== -1;
            var isValidImage = imageUrl && imageUrl.indexOf('placeholder') === -1 && imageUrl.indexOf('data:image') === -1 && (imageUrl.indexOf('http') === 0 || imageUrl.indexOf('//') === 0);
            
            if (isValidUrl && isValidImage && title) {
              var finalUrl = url.indexOf('http') === 0 ? url : 'https://www.pinterest.com' + url;
              var finalImageUrl = imageUrl.indexOf('//') === 0 ? 'https:' + imageUrl : imageUrl;
              
              pins.push({
                url: finalUrl,
                imageUrl: finalImageUrl,
                title: title,
                saveCount: 1000 - (k * 10),
                position: k + 1
              });
              
              log.info('Pin added: ' + pins.length);
            }
          }
          
          log.info('Total pins: ' + pins.length);
          return { pins: pins };
        }`,
        maxRequestsPerCrawl: 10,
        maxConcurrency: 1,
      }, {
        waitSecs: 180,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      console.log(`[Apify] Pinterest Web Scraper got ${items.length} pages`);

      items.forEach((page: any, pageIdx: number) => {
        console.log(`[Apify] Pinterest page ${pageIdx + 1}: pins=${page.pins?.length || 0}`);
        if (page.pins && Array.isArray(page.pins)) {
          console.log(`[Apify] Processing ${page.pins.length} Pinterest pins...`);
          
          // Sort pins by save count (highest first)
          const sortedPins = page.pins.sort((a: any, b: any) => {
            return (b.saveCount || 0) - (a.saveCount || 0);
          });
          
          sortedPins.forEach((pin: any, idx: number) => {
            if (assets.length >= limit) return;
            
            const pinId = pin.url.match(/\/pin\/(\d+)/)?.[1] || idx;
            const saveCount = pin.saveCount || 0;
            const originalPosition = pin.position || idx + 1;
            
            console.log(`[Apify] Pinterest pin ${idx + 1} (orig pos: ${originalPosition}): engagement=${saveCount}, title="${pin.title?.substring(0, 40)}..."`);
            
            assets.push({
              id: `pinterest-${pinId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: pin.title || keyword,
              description: pin.title,
              imageUrl: pin.imageUrl,
              url: pin.url,
              platform: "pinterest",
              keyword,
              likeCount: saveCount,
              favoriteCount: saveCount,
              popularityScore: calculatePopularityScore({ repinCount: saveCount, saveCount: saveCount }, "pinterest"),
              capturedAt: new Date().toISOString(),
            });
          });
        }
      });
    } catch (error: any) {
      console.error(`[Apify] Pinterest error for "${keyword}":`, error.message);
      console.error(`[Apify] Pinterest error stack:`, error.stack);
    }
  }

  console.log(`[Apify] Pinterest total assets collected: ${assets.length}`);
  return assets;
}

// ===== Behance Adapter =====
// 使用 Web Scraper 直接抓取 Behance 搜尋頁面和專案圖片
async function fetchBehanceData(keywords: string[], limit: number): Promise<TrendAsset[]> {
  const assets: TrendAsset[] = [];
  const client = getClient();

  for (const keyword of keywords) {
    try {
      console.log(`[Apify] Behance search: "${keyword}"`);
      
      const searchUrl = `https://www.behance.net/search/projects?search=${encodeURIComponent(keyword + ' gift box packaging')}`;

      const run = await client.actor("apify/web-scraper").call({
        startUrls: [{ url: searchUrl }],
        waitUntil: ['networkidle2'],
        pageFunction: `async function pageFunction(context) {
          var log = context.log;
          
          await new Promise(function(resolve) { setTimeout(resolve, 6000); });
          
          log.info('Starting scroll loading...');
          for (var i = 0; i < 6; i++) {
            var scrollPosition = (document.body.scrollHeight * (i + 1)) / 6;
            window.scrollTo(0, scrollPosition);
            await new Promise(function(resolve) { setTimeout(resolve, 2500); });
          }
          
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise(function(resolve) { setTimeout(resolve, 3000); });
          
          var projects = [];
          var selectors = ['[class*="ProjectCover"]', '[data-project-id]', 'a[href*="/gallery/"]'];
          
          var projectElements = [];
          for (var j = 0; j < selectors.length; j++) {
            projectElements = Array.from(document.querySelectorAll(selectors[j]));
            log.info('Selector found: ' + projectElements.length);
            if (projectElements.length > 0) break;
          }
          
          if (projectElements.length === 0) {
            log.error('No projects found');
            return { projects: [] };
          }
          
          log.info('Processing elements: ' + projectElements.length);
          
          for (var k = 0; k < projectElements.length && projects.length < 30; k++) {
            var el = projectElements[k];
            var linkEl = el.querySelector('a[href*="/gallery/"]') || (el.tagName === 'A' ? el : null);
            var imgEl = el.querySelector('img');
            
            if (linkEl && imgEl) {
              var url = linkEl.href || '';
              var imageUrl = imgEl.src || imgEl.dataset.src || '';
              var titleEl = el.querySelector('h2') || el.querySelector('[title]');
              var title = titleEl ? (titleEl.textContent || titleEl.getAttribute('title') || '') : '';
              
              if (url && imageUrl && imageUrl.indexOf('data:image') === -1) {
                projects.push({
                  url: url.indexOf('http') === 0 ? url : 'https://www.behance.net' + url,
                  imageUrl: imageUrl,
                  title: title || 'Behance Project'
                });
                log.info('Project added: ' + projects.length);
              }
            }
          }
          
          log.info('Total projects: ' + projects.length);
          return { projects: projects };
        }`,
        maxRequestsPerCrawl: 5,
        maxConcurrency: 1,
      }, {
        waitSecs: 240,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      console.log(`[Apify] Behance Web Scraper got ${items.length} pages`);

      items.forEach((page: any, pageIdx: number) => {
        console.log(`[Apify] Behance page ${pageIdx + 1}: projects=${page.projects?.length || 0}`);
        if (page.projects && Array.isArray(page.projects)) {
          console.log(`[Apify] Processing ${page.projects.length} Behance projects...`);
          page.projects.forEach((project: any, idx: number) => {
            if (assets.length >= limit) return;
            
            const projectId = project.url.match(/\/gallery\/(\d+)/)?.[1] || idx;
            
            assets.push({
              id: `behance-${projectId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: project.title || keyword,
              description: project.title,
              imageUrl: project.imageUrl,
              url: project.url,
              platform: "behance",
              keyword,
              popularityScore: calculatePopularityScore({ position: idx + 1 }, "behance"),
              capturedAt: new Date().toISOString(),
            });
          });
        }
      });
    } catch (error: any) {
      console.error(`[Apify] Behance error for "${keyword}":`, error.message);
      console.error(`[Apify] Behance error stack:`, error.stack);
    }
  }

  console.log(`[Apify] Behance total assets collected: ${assets.length}`);
  return assets;
}

// ===== Google Images via Apify Actor =====
async function fetchGoogleDataViaApify(
  keywords: string[], 
  limit: number, 
  region: string = "US",
  filters?: GoogleImageFilters
): Promise<TrendAsset[]> {
  const assets: TrendAsset[] = [];
  const apifyToken = process.env.APIFY_TOKEN;

  if (!apifyToken) {
    console.log(`[Apify] APIFY_TOKEN not configured, falling back to direct API`);
    return fetchGoogleData(keywords, limit, region, { ...filters, useApify: false });
  }

  const client = new ApifyClient({ token: apifyToken });

  // 使用 Apify Store 中的 Google Images Scraper
  // 推薦：voyager/google-images-scraper 或 alexey/google-images-scraper
  const GOOGLE_SCRAPER_ID = "voyager/google-images-scraper";

  for (const keyword of keywords) {
    try {
      console.log(`[Apify] Google Images (via Apify) search: "${keyword}"`);

      // 建構搜尋查詢（支援背景色和商品色）
      let searchQuery = keyword;
      const bgColor = filters?.backgroundColor || (filters?.whiteBackground ? 'white' : undefined);
      const prodColor = filters?.productColor;
      
      if (bgColor && bgColor !== 'any') {
        searchQuery += ` ${bgColor} background`;
      }
      
      if (prodColor && prodColor !== 'any') {
        searchQuery += ` ${prodColor} product`;
      } else if (bgColor === 'white') {
        // 白背景時，預設搜尋彩色商品
        searchQuery += ` colorful vibrant -"white ${keyword.split(' ')[0]}"`;
      }

      const input = {
        query: searchQuery,
        maxResults: Math.min(limit, 200), // Apify scraper 通常支援更多結果
        countryCode: region.toLowerCase(),
        resultsType: 'photos',
        safeSearch: false,
      };

      console.log(`[Apify] Running Google Images Scraper...`);
      const run = await client.actor(GOOGLE_SCRAPER_ID).call(input, {
        timeout: 180, // 3 分鐘超時
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      console.log(`[Apify] Google (Apify) returned ${items.length} images`);

      items.forEach((item: any, idx: number) => {
        if (assets.length >= limit) return;

        const imageUrl = item.imageUrl || item.url || item.link;
        const sourceUrl = item.sourceUrl || item.pageUrl || item.contextLink || '';
        const title = item.title || item.name || keyword;

        if (!imageUrl || !imageUrl.startsWith('http')) return;

        console.log(`[Apify] Google (Apify) image ${assets.length + 1}: "${title.substring(0, 40)}..."`);

        assets.push({
          id: `google-apify-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title,
          description: item.description || item.snippet,
          imageUrl: imageUrl,
          url: sourceUrl || imageUrl,
          platform: "google",
          keyword,
          region,
          popularityScore: calculatePopularityScore({ position: idx + 1 }, "google"),
          capturedAt: new Date().toISOString(),
        });
      });
    } catch (error: any) {
      console.error(`[Apify] Google Images (Apify) error for "${keyword}":`, error.message);
      console.error(`[Apify] Falling back to direct API...`);
      // 發生錯誤時回退到直接 API
      const fallbackAssets = await fetchGoogleData([keyword], limit - assets.length, region, { ...filters, useApify: false });
      assets.push(...fallbackAssets);
    }
  }

  console.log(`[Apify] Google Images (Apify) total assets collected: ${assets.length}`);
  return assets;
}

// ===== Google Images Adapter =====
// 支援兩種模式：
// 1. Google Custom Search JSON API（官方 API，最穩定）
// 2. Apify Google Images Scraper（更多結果，但需要 Apify token）
async function fetchGoogleData(
  keywords: string[], 
  limit: number, 
  region: string = "US",
  filters?: GoogleImageFilters
): Promise<TrendAsset[]> {
  // 如果啟用 Apify 模式，使用 Apify Actor
  if (filters?.useApify) {
    return fetchGoogleDataViaApify(keywords, limit, region, filters);
  }

  // 否則使用官方 Google Custom Search API
  const assets: TrendAsset[] = [];
  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCx = process.env.GOOGLE_CX; // Custom Search Engine ID

  if (!googleApiKey || !googleCx) {
    console.log(`[Apify] Google Custom Search API not configured (GOOGLE_API_KEY or GOOGLE_CX missing)`);
    console.log(`[Apify] Get API Key: https://developers.google.com/custom-search/v1/introduction`);
    console.log(`[Apify] Get CX: https://programmablesearchengine.google.com/`);
    return assets;
  }

  // 預設啟用所有篩選器
  const enabledFilters: GoogleImageFilters = {
    whiteBackground: true,
    highQuality: true,
    recentOnly: true,
    commercialUse: true,
    productPhotography: false,
    excludeLowQuality: true,
    ...filters, // 覆蓋自訂設定
  };

  for (const keyword of keywords) {
    try {
      console.log(`[Apify] Google Images search: "${keyword}"`);
      
      const searchQuery = keyword; // 直接使用關鍵字，不加後綴
      
      // Google API 每次最多 10 筆，需要多次呼叫來取得更多結果
      // 最多可以取得 100 筆（start 參數最大為 91）
      const maxPages = Math.min(Math.ceil(limit / 10), 10); // 最多 10 頁
      
      for (let page = 0; page < maxPages && assets.length < limit; page++) {
        const startIndex = page * 10 + 1; // Google API 的 start 是 1-based
        
        // Google Custom Search JSON API - 基礎參數
        const params: Record<string, string> = {
          key: googleApiKey,
          cx: googleCx,
          q: searchQuery,
          searchType: 'image',
          num: '10',
          start: String(startIndex),
          gl: region.toLowerCase(),
          safe: 'off',
          hl: 'en',
        };

        // 高品質模式
        if (enabledFilters.highQuality) {
          params.imgSize = 'xlarge';     // 超大圖
          params.imgType = 'photo';      // 照片類型
          params.imgColorType = 'color'; // 彩色
          params.fileType = 'jpg';       // JPG 格式
          params.filter = '1';           // 過濾重複
        }

        // 背景顏色設定（優先使用 backgroundColor，回退到 whiteBackground）
        const bgColor = enabledFilters.backgroundColor || (enabledFilters.whiteBackground ? 'white' : undefined);
        const prodColor = enabledFilters.productColor;
        
        if (bgColor && bgColor !== 'any') {
          // Google API 支援的顏色：black, blue, brown, gray, green, orange, pink, purple, red, teal, white, yellow
          params.imgDominantColor = bgColor;
        }
        
        // 查詢字串增強（根據背景色和商品色）
        let enhancedQuery = searchQuery;
        
        if (prodColor && prodColor !== 'any') {
          // 指定商品顏色
          enhancedQuery = `${searchQuery} ${prodColor} product`;
        } else if (bgColor === 'white') {
          // 白背景時，預設搜尋彩色商品
          enhancedQuery = `${searchQuery} colorful product vibrant -"white ${searchQuery.split(' ')[0]}"`;
        }
        
        params.q = enhancedQuery;

        // 最近內容
        if (enabledFilters.recentOnly) {
          params.dateRestrict = 'y2'; // 最近2年
        }

        // 商業授權
        if (enabledFilters.commercialUse) {
          params.rights = 'cc_publicdomain,cc_attribute,cc_sharealike,cc_noncommercial,cc_nonderived';
        }

        // 產品攝影模式
        if (enabledFilters.productPhotography) {
          params.exactTerms = 'product photography';
          params.siteSearch = 'amazon.com,shopify.com,etsy.com,alibaba.com';
          params.siteSearchFilter = 'i'; // 包含這些網站
        }

        // 排除低品質
        if (enabledFilters.excludeLowQuality) {
          const excludeList = ['diy', 'handmade', 'cheap', 'lowres', 'screenshot'];
          
          // 根據背景色和商品色，智慧排除單色組合
          const bgColor = enabledFilters.backgroundColor || (enabledFilters.whiteBackground ? 'white' : undefined);
          const prodColor = enabledFilters.productColor;
          
          if (bgColor === 'white' && (!prodColor || prodColor === 'any')) {
            // 白背景但未指定商品色，排除全白
            excludeList.push('monochrome', 'all white', 'plain white');
          } else if (bgColor === 'black' && (!prodColor || prodColor === 'any')) {
            // 黑背景但未指定商品色，排除全黑
            excludeList.push('monochrome', 'all black', 'plain black');
          } else if (bgColor && prodColor && bgColor === prodColor) {
            // 背景色和商品色相同，排除單色
            excludeList.push('monochrome', `all ${bgColor}`);
          }
          
          params.excludeTerms = excludeList.join(' ');
        }

        const urlParams = new URLSearchParams(params);
        
        console.log(`[Apify] Google page ${page + 1}, start=${startIndex}`);
        console.log(`[Apify] Filters:`, enabledFilters);
        
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?${urlParams}`);
      
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Apify] Google API error ${response.status}:`, errorText);
          continue;
        }
        
        const data = await response.json();
        
        if (data.error) {
          console.error(`[Apify] Google API error:`, data.error.message);
          continue;
        }
        
        const items = data.items || [];
        console.log(`[Apify] Google API returned ${items.length} images`);
        
        items.forEach((item: any, idx: number) => {
          if (assets.length >= limit) return;
          
          // Google Custom Search 回傳的結構
          const imageUrl = item.link; // 圖片URL
          const sourceUrl = item.image?.contextLink || item.displayLink || ''; // 來源網站
          const title = item.title || item.snippet || keyword;
          
          // 驗證
          if (!imageUrl || !imageUrl.startsWith('http')) return;
          if (!sourceUrl || !sourceUrl.startsWith('http')) return;
          
          console.log(`[Apify] Google image ${assets.length + 1}: "${title.substring(0, 40)}..."`);
          
          assets.push({
            id: `google-${startIndex + idx}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            description: item.snippet,
            imageUrl: imageUrl,
            url: sourceUrl,
            platform: "google",
            keyword,
            region,
            popularityScore: calculatePopularityScore({ position: startIndex + idx }, "google"),
            capturedAt: new Date().toISOString(),
          });
        });
        
        // 如果沒有更多結果，跳出迴圈
        if (items.length < 10) {
          console.log(`[Apify] Google: No more results, stopping at page ${page + 1}`);
          break;
        }
        
        // 避免 API rate limit
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error: any) {
      console.error(`[Apify] Google Images error for "${keyword}":`, error.message);
      console.error(`[Apify] Google Images error stack:`, error.stack);
    }
  }

  console.log(`[Apify] Google Images total assets collected: ${assets.length}`);
  return assets;
}

// ===== Amazon Adapter =====
// 使用 Web Scraper 直接抓取 Amazon 搜尋頁面和商品圖片
async function fetchAmazonData(keywords: string[], limit: number, region: string = "US"): Promise<TrendAsset[]> {
  const assets: TrendAsset[] = [];
  const client = getClient();

  for (const keyword of keywords) {
    try {
      console.log(`[Apify] Amazon search: "${keyword}"`);
      
      const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword + ' gift box')}`;

      const run = await client.actor("apify/web-scraper").call({
        startUrls: [{ url: searchUrl }],
        waitUntil: ['networkidle2'],
        pageFunction: `async function pageFunction({ request, log }) {
          // Wait for page load
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Scroll page
          window.scrollTo(0, document.body.scrollHeight / 2);
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const products = [];
          
          // Try multiple selectors
          const selectors = [
            '[data-component-type="s-search-result"]',
            '.s-result-item[data-asin]',
            'div[data-asin]:not([data-asin=""])'
          ];
          
          let productElements = [];
          for (const selector of selectors) {
            productElements = Array.from(document.querySelectorAll(selector));
            if (productElements.length > 0) {
              console.log('Found ' + productElements.length + ' products using selector: ' + selector);
              break;
            }
          }
          
          if (productElements.length === 0) {
            console.log('No product elements found with any selector');
            return { products: [] };
          }
          
          productElements.forEach((el, idx) => {
            if (products.length >= 30) return;
            
            const linkEl = el.querySelector('a.a-link-normal[href*="/dp/"]') || el.querySelector('a[href*="/dp/"]');
            const imgEl = el.querySelector('img.s-image') || el.querySelector('img[data-image-latency="s-product-image"]');
            const titleEl = el.querySelector('h2 span') || el.querySelector('.a-text-normal') || el.querySelector('h2 a span');
            const priceEl = el.querySelector('.a-price .a-offscreen');
            const ratingEl = el.querySelector('.a-icon-star-small span') || el.querySelector('[aria-label*="out of"]');
            
            if (linkEl && imgEl) {
              const url = linkEl.href || '';
              let imageUrl = imgEl.src || imgEl.dataset.src || '';
              const title = titleEl ? titleEl.textContent.trim() : '';
              const priceText = priceEl ? priceEl.textContent.replace(/[^0-9.]/g, '') : '';
              const ratingText = ratingEl ? (ratingEl.textContent.match(/[0-9.]+/)?.[0] || '') : '';
              
              // Amazon image size upgrade
              if (imageUrl) {
                imageUrl = imageUrl.replace(/_AC_.*?\\.jpg/g, '_AC_SL800_.jpg');
              }
              
              if (url && imageUrl && !imageUrl.includes('transparent-pixel') && !imageUrl.includes('data:image')) {
                products.push({
                  url: url.startsWith('http') ? url : 'https://www.amazon.com' + url,
                  imageUrl: imageUrl,
                  title: title || 'Amazon Product',
                  price: parseFloat(priceText) || 0,
                  rating: parseFloat(ratingText) || 0
                });
              }
            }
          });
          
          console.log('Extracted ' + products.length + ' valid products');
          return { products };
        }`,
        maxRequestsPerCrawl: 5,
        maxConcurrency: 1,
      }, {
        waitSecs: 120,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      console.log(`[Apify] Amazon Web Scraper got ${items.length} pages`);

      items.forEach((page: any, pageIdx: number) => {
        console.log(`[Apify] Amazon page ${pageIdx + 1}: products=${page.products?.length || 0}`);
        if (page.products && Array.isArray(page.products)) {
          console.log(`[Apify] Processing ${page.products.length} Amazon products...`);
          page.products.forEach((product: any, idx: number) => {
            if (assets.length >= limit) return;
            
            const asin = product.url.match(/\/dp\/([A-Z0-9]{10})/)?.[1] || `temp-${idx}`;
            
            assets.push({
              id: `amazon-${asin}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: product.title || keyword,
              description: product.title,
              imageUrl: product.imageUrl,
              url: product.url,
              platform: "amazon",
              keyword,
              region,
              price: product.price,
              currency: "USD",
              rating: product.rating,
              popularityScore: calculatePopularityScore({ rating: product.rating }, "amazon"),
              capturedAt: new Date().toISOString(),
            });
          });
        }
      });
    } catch (error: any) {
      console.error(`[Apify] Amazon error for "${keyword}":`, error.message);
    }
  }

  return assets;
}

// ===== Shopee Adapter =====
// 使用 Apify Store: epctex/shopee-scraper
async function fetchShopeeData(keywords: string[], limit: number): Promise<TrendAsset[]> {
  const assets: TrendAsset[] = [];
  const client = getClient();

  for (const keyword of keywords) {
    try {
      console.log(`[Apify] Shopee search: "${keyword}"`);
      
      const runInput = {
        keyword: keyword + " gift box",
        maxItems: Math.min(limit, 100),
      };

      const run = await client.actor("epctex/shopee-scraper").call(runInput, {
        waitSecs: 120,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      console.log(`[Apify] Shopee got ${items.length} items`);

      items.forEach((item: any, idx: number) => {
        const imageUrl = item.image || item.images?.[0] || "";
        if (!imageUrl) return;

        let price: number | undefined;
        if (item.price) {
          const priceStr = String(item.price).replace(/[^\d.]/g, "");
          price = parseFloat(priceStr) || undefined;
        }

        assets.push({
          id: `shopee-${item.itemId || idx}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title || item.name || keyword,
          description: item.description,
          imageUrl,
          url: item.url || "",
          platform: "shopee",
          keyword,
          price,
          currency: item.currency || "USD",
          rating: item.rating,
          reviewCount: item.sold || item.historicalSold,
          popularityScore: calculatePopularityScore({ soldCount: item.sold }, "alibaba1688"),
          capturedAt: new Date().toISOString(),
        });
      });
    } catch (error: any) {
      console.error(`[Apify] Shopee error for "${keyword}":`, error.message);
    }
  }

  return assets;
}

// ===== TikTok Adapter =====
// 使用 Apify Store: clockworks/tiktok-scraper
async function fetchTikTokData(keywords: string[], limit: number): Promise<TrendAsset[]> {
  const assets: TrendAsset[] = [];
  const client = getClient();

  for (const keyword of keywords) {
    try {
      console.log(`[Apify] TikTok search: "${keyword}"`);
      
      const runInput = {
        keyword: keyword + " gift box",
        maxItems: Math.min(limit, 100),
      };

      const run = await client.actor("clockworks/tiktok-scraper").call(runInput, {
        waitSecs: 120,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      console.log(`[Apify] TikTok got ${items.length} items`);

      items.forEach((item: any, idx: number) => {
        const imageUrl = item.cover || item.thumbnail || item.videoMeta?.coverUrl || "";
        if (!imageUrl) return;

        assets.push({
          id: `tiktok-${item.id || idx}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: item.text || item.desc || keyword,
          description: item.text || item.desc,
          imageUrl,
          url: item.url || item.webVideoUrl || "",
          platform: "tiktok",
          keyword,
          likeCount: item.diggCount || item.likes || 0,
          shareCount: item.shareCount || 0,
          viewCount: item.playCount || item.views || 0,
          popularityScore: calculatePopularityScore({ views: item.playCount, likes: item.diggCount }, "tiktok"),
          capturedAt: new Date().toISOString(),
        });
      });
    } catch (error: any) {
      console.error(`[Apify] TikTok error for "${keyword}":`, error.message);
      console.error(`[Apify] TikTok error stack:`, error.stack);
    }
  }

  console.log(`[Apify] TikTok total assets collected: ${assets.length}`);
  return assets;
}

// ===== Alibaba 1688 Adapter =====
// 目前保留 Google Search 方案（因為沒有提供專門的 1688 scraper）
async function fetchAlibaba1688Data(keywords: string[], limit: number): Promise<TrendAsset[]> {
  const assets: TrendAsset[] = [];
  const client = getClient();

  for (const keyword of keywords) {
    try {
      console.log(`[Apify] Alibaba search via Google: "${keyword}"`);
      
      const runInput = {
        queries: `site:1688.com ${keyword} 礼盒`,
        maxPagesPerQuery: 1,
        resultsPerPage: Math.min(limit, 50),
        mobileResults: false,
      };

      const run = await client.actor("apify/google-search-scraper").call(runInput, {
        waitSecs: 60,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      console.log(`[Apify] Alibaba got ${items.length} pages`);

      items.forEach((page: any) => {
        const results = page.organicResults || [];
        results.forEach((item: any, idx: number) => {
          if (!item.url?.includes("1688.com")) return;

          const imageUrl = item.thumbnailUrl || item.image || "https://via.placeholder.com/400x400?text=1688";

          assets.push({
            id: `alibaba-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: item.title || keyword,
            description: item.description || item.snippet,
            imageUrl,
            url: item.url,
            platform: "alibaba1688",
            keyword,
            region: "CN",
            popularityScore: calculatePopularityScore({ position: idx + 1 }, "alibaba1688"),
            capturedAt: new Date().toISOString(),
          });
        });
      });
    } catch (error: any) {
      console.error(`[Apify] Alibaba error for "${keyword}":`, error.message);
    }
  }

  return assets;
}

// ===== 主搜尋函數 =====
export async function searchGiftBoxTrends(request: ApifySearchRequest): Promise<TrendAsset[]> {
  const allAssets: TrendAsset[] = [];
  const seenUrls = new Set<string>();

  console.log(`[Gift Box Radar] Starting Apify search for sources: ${request.sources.join(", ")}`);

  for (const source of request.sources) {
    let sourceAssets: TrendAsset[] = [];

    try {
      switch (source) {
        case "pinterest":
          sourceAssets = await fetchPinterestData(request.keywords, request.limit);
          break;
        case "behance":
          sourceAssets = await fetchBehanceData(request.keywords, request.limit);
          break;
        case "google":
          sourceAssets = await fetchGoogleData(request.keywords, request.limit, request.region || "US", request.googleFilters);
          break;
        case "amazon":
          sourceAssets = await fetchAmazonData(request.keywords, request.limit, request.region || "US");
          break;
        case "shopee":
          sourceAssets = await fetchShopeeData(request.keywords, request.limit);
          break;
        case "tiktok":
          sourceAssets = await fetchTikTokData(request.keywords, request.limit);
          break;
        case "alibaba1688":
          sourceAssets = await fetchAlibaba1688Data(request.keywords, request.limit);
          break;
      }
    } catch (error: any) {
      console.error(`[Gift Box Radar] Error fetching from ${source}:`, error.message);
    }

    sourceAssets.forEach((asset) => {
      // 使用 URL 作為唯一鍵（不使用 imageUrl，因為可能是 placeholder）
      const key = asset.url;
      if (key && !seenUrls.has(key)) {
        seenUrls.add(key);
        allAssets.push(asset);
      }
    });
  }

  allAssets.sort((a, b) => b.popularityScore - a.popularityScore);

  console.log(`[Gift Box Radar] Total ${allAssets.length} unique assets found`);
  return allAssets.slice(0, request.limit);
}

// ===== 串流版本的搜尋函數 =====
export async function searchGiftBoxTrendsStream(
  request: ApifySearchRequest,
  onResults: (platform: string, assets: TrendAsset[]) => void,
  onPlatformStart?: (platform: string) => void
): Promise<void> {
  const seenUrls = new Set<string>();

  console.log(`[Gift Box Radar Stream] Starting search for sources: ${request.sources.join(", ")}`);

  for (const source of request.sources) {
    if (onPlatformStart) {
      onPlatformStart(source);
    }
    
    let sourceAssets: TrendAsset[] = [];

    try {
      switch (source) {
        case "pinterest":
          sourceAssets = await fetchPinterestData(request.keywords, request.limit);
          break;
        case "behance":
          sourceAssets = await fetchBehanceData(request.keywords, request.limit);
          break;
        case "google":
          sourceAssets = await fetchGoogleData(request.keywords, request.limit, request.region || "US", request.googleFilters);
          break;
        case "amazon":
          sourceAssets = await fetchAmazonData(request.keywords, request.limit, request.region || "US");
          break;
        case "shopee":
          sourceAssets = await fetchShopeeData(request.keywords, request.limit);
          break;
        case "tiktok":
          sourceAssets = await fetchTikTokData(request.keywords, request.limit);
          break;
        case "alibaba1688":
          sourceAssets = await fetchAlibaba1688Data(request.keywords, request.limit);
          break;
      }
    } catch (error: any) {
      console.error(`[Gift Box Radar Stream] Error fetching from ${source}:`, error.message);
    }

    // 過濾重複並立即發送結果
    const uniqueAssets: TrendAsset[] = [];
    sourceAssets.forEach((asset) => {
      const key = asset.url;
      if (key && !seenUrls.has(key)) {
        seenUrls.add(key);
        uniqueAssets.push(asset);
      }
    });

    if (uniqueAssets.length > 0) {
      // 按熱度排序
      uniqueAssets.sort((a, b) => b.popularityScore - a.popularityScore);
      onResults(source, uniqueAssets);
    }
  }

  console.log(`[Gift Box Radar Stream] Completed, total unique URLs: ${seenUrls.size}`);
}
