// lib/research/engines/search-engine.ts
// 真實搜尋引擎 - Serper API 整合

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
  domain: string;
  date?: string;
}

export interface SearchOptions {
  query: string;
  num?: number;          // 結果數量 (預設 10)
  gl?: string;           // 國家 (tw, cn, us, etc.)
  hl?: string;           // 語言 (zh-TW, en, etc.)
  type?: 'search' | 'news' | 'images';
  tbs?: string;          // 時間範圍 (qdr:m = 過去一個月)
}

export interface SerperResponse {
  organic: Array<{
    title: string;
    link: string;
    snippet: string;
    position: number;
    date?: string;
  }>;
  news?: Array<{
    title: string;
    link: string;
    snippet: string;
    date: string;
    source: string;
  }>;
  searchParameters: {
    q: string;
    gl: string;
    hl: string;
  };
}

export class SearchEngine {
  private apiKey: string;
  private baseUrl = 'https://google.serper.dev';

  constructor() {
    this.apiKey = process.env.SERPER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[SearchEngine] SERPER_API_KEY not configured');
    }
  }

  // 執行 Google 搜尋
  async search(options: SearchOptions): Promise<SearchResult[]> {
    if (!this.apiKey) {
      throw new Error('SERPER_API_KEY is not configured');
    }

    const endpoint = options.type === 'news' 
      ? `${this.baseUrl}/news` 
      : `${this.baseUrl}/search`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: options.query,
          num: options.num || 10,
          gl: options.gl || 'tw',
          hl: options.hl || 'zh-TW',
          ...(options.tbs && { tbs: options.tbs })
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Serper API error: ${response.status} - ${error}`);
      }

      const data: SerperResponse = await response.json();
      
      // 整理結果
      const results: SearchResult[] = [];
      
      if (data.organic) {
        for (const item of data.organic) {
          results.push({
            title: item.title,
            url: item.link,
            snippet: item.snippet,
            position: item.position,
            domain: this.extractDomain(item.link),
            date: item.date
          });
        }
      }
      
      if (data.news) {
        for (const item of data.news) {
          results.push({
            title: item.title,
            url: item.link,
            snippet: item.snippet,
            position: results.length + 1,
            domain: item.source || this.extractDomain(item.link),
            date: item.date
          });
        }
      }

      console.log(`[SearchEngine] Found ${results.length} results for "${options.query}"`);
      return results;

    } catch (error) {
      console.error('[SearchEngine] Search error:', error);
      throw error;
    }
  }

  // 執行多個查詢並彙整結果
  async multiSearch(queries: string[], options: Omit<SearchOptions, 'query'> = {}): Promise<SearchResult[]> {
    const allResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    for (const query of queries) {
      try {
        const results = await this.search({ ...options, query });
        
        for (const result of results) {
          if (!seenUrls.has(result.url)) {
            seenUrls.add(result.url);
            allResults.push(result);
          }
        }
        
        // 避免 API 限速
        await this.delay(500);
      } catch (error) {
        console.error(`[SearchEngine] Error searching "${query}":`, error);
      }
    }

    return allResults;
  }

  // 搜尋包裝產業相關內容
  async searchPackaging(topic: string, options: {
    regions?: string[];
    languages?: string[];
    focusAreas?: string[];
    timeRange?: 'month' | 'quarter' | 'year';
    marketType?: 'all' | 'consumer' | 'b2b' | 'design';
    targetAudience?: string[];
    industryTags?: string[];
  } = {}): Promise<SearchResult[]> {
    const queries: string[] = [];
    const { 
      regions = ['tw'], 
      languages = ['zh-TW'], 
      focusAreas = [], 
      timeRange = 'year',
      marketType = 'all',
      targetAudience = [],
      industryTags = []
    } = options;

    // 建立搜尋查詢
    const baseQueries = [
      topic,
      `${topic} 趨勢`,
      `${topic} 設計`,
      `${topic} 材料`,
    ];

    // 根據市場類型調整搜尋關鍵字
    const marketKeywords = this.getMarketKeywords(marketType);
    const audienceKeywords = this.getAudienceKeywords(targetAudience);
    const industryKeywords = this.getIndustryKeywords(industryTags);

    // 根據焦點領域擴展查詢
    const focusKeywords: Record<string, string[]> = {
      TREND: ['趨勢', '流行', 'trend', '2024', '2025'],
      MATERIAL: ['材料', '材質', 'material', '環保', '永續'],
      TECHNOLOGY: ['技術', '工藝', '印刷', 'printing', '加工'],
      SUSTAINABILITY: ['永續', '環保', 'sustainable', 'eco-friendly', '可回收'],
      DESIGN: ['設計', 'design', '結構', '外觀'],
      MARKET: ['市場', 'market', '產業', '報告']
    };

    for (const query of baseQueries) {
      queries.push(query);
      
      // 添加市場類型關鍵字
      for (const keyword of marketKeywords) {
        queries.push(`${topic} ${keyword}`);
      }
      
      // 添加產業領域關鍵字
      for (const keyword of industryKeywords.slice(0, 3)) {
        queries.push(`${topic} ${keyword}`);
      }
      
      for (const area of focusAreas) {
        const keywords = focusKeywords[area] || [];
        for (const keyword of keywords.slice(0, 2)) {
          queries.push(`${topic} ${keyword}`);
        }
      }
    }

    // 添加受眾特定查詢
    for (const keyword of audienceKeywords.slice(0, 2)) {
      queries.push(`${topic} ${keyword}`);
    }

    // 時間範圍
    const tbsMap: Record<string, string> = {
      month: 'qdr:m',
      quarter: 'qdr:m3',
      year: 'qdr:y'
    };

    const allResults: SearchResult[] = [];
    
    for (const region of regions) {
      const gl = this.regionToGl(region);
      const hl = languages[0] || 'zh-TW';
      
      // 限制查詢數量以避免過多 API 調用
      const results = await this.multiSearch(queries.slice(0, 12), {
        gl,
        hl,
        num: 10,
        tbs: tbsMap[timeRange]
      });
      
      allResults.push(...results);
    }

    // 去重並排序
    const uniqueResults = this.deduplicateResults(allResults);
    return uniqueResults.slice(0, 40); // 最多返回 40 個結果
  }

  // 根據市場類型獲取關鍵字
  private getMarketKeywords(marketType: string): string[] {
    const keywords: Record<string, string[]> = {
      all: [],
      consumer: ['消費品', '零售', 'retail', '品牌', '消費者', 'consumer', 'B2C'],
      b2b: ['企業', '工業', 'industrial', '批發', 'B2B', '商用', '企業包裝'],
      design: ['設計師', '創意', 'creative', 'design', '設計案例', '品牌設計']
    };
    return keywords[marketType] || [];
  }

  // 根據目標受眾獲取關鍵字
  private getAudienceKeywords(audience: string[]): string[] {
    const keywordMap: Record<string, string[]> = {
      brand_owner: ['品牌商', '品牌經理', '品牌策略'],
      designer: ['設計師', '包裝設計', '結構設計'],
      manufacturer: ['生產商', '製造商', '包材廠'],
      retailer: ['零售商', '通路', '賣場'],
      importer: ['進口商', '貿易商', '代理商'],
      marketer: ['行銷', '行銷人員', 'marketing']
    };
    
    const result: string[] = [];
    for (const a of audience) {
      if (keywordMap[a]) {
        result.push(...keywordMap[a].slice(0, 2));
      }
    }
    return result;
  }

  // 根據產業標籤獲取關鍵字
  private getIndustryKeywords(tags: string[]): string[] {
    const keywordMap: Record<string, string[]> = {
      food: ['食品', '食品包裝', 'food packaging'],
      beverage: ['飲料', '飲料包裝', 'beverage'],
      cosmetics: ['化妝品', '美妝', 'cosmetics packaging'],
      pharma: ['藥品', '醫藥', '藥品包裝'],
      electronics: ['電子產品', '3C', 'electronics packaging'],
      luxury: ['精品', '奢侈品', 'luxury packaging'],
      gift: ['禮品', '禮盒', 'gift box'],
      ecommerce: ['電商', '網購', 'e-commerce packaging']
    };
    
    const result: string[] = [];
    for (const tag of tags) {
      if (keywordMap[tag]) {
        result.push(...keywordMap[tag].slice(0, 2));
      }
    }
    return result;
  }

  // 搜尋特定網站
  async searchSite(site: string, query: string): Promise<SearchResult[]> {
    return this.search({
      query: `site:${site} ${query}`,
      num: 10
    });
  }

  // 輔助函數
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  private regionToGl(region: string): string {
    const map: Record<string, string> = {
      tw: 'tw',
      taiwan: 'tw',
      cn: 'cn',
      china: 'cn',
      us: 'us',
      usa: 'us',
      global: 'us',
      asia: 'tw',
      europe: 'de',
      americas: 'us'
    };
    return map[region.toLowerCase()] || 'tw';
  }

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const searchEngine = new SearchEngine();
