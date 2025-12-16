// lib/research/engines/scraper-engine.ts
// 網頁內容擷取引擎 - Jina Reader 整合

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;         // Markdown 格式
  wordCount: number;
  language: string;
  extractedAt: Date;
  success: boolean;
  error?: string;
}

export interface ScraperOptions {
  timeout?: number;        // 超時毫秒數 (預設 30000)
  maxLength?: number;      // 最大內容長度
  includeImages?: boolean; // 是否包含圖片連結
}

export class ScraperEngine {
  private jinaBaseUrl = 'https://r.jina.ai';
  
  // 使用 Jina Reader 擷取網頁內容 (免費，無需 API Key)
  async scrape(url: string, options: ScraperOptions = {}): Promise<ScrapedContent> {
    const { timeout = 30000, maxLength = 50000 } = options;
    
    try {
      const jinaUrl = `${this.jinaBaseUrl}/${url}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(jinaUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'X-Return-Format': 'markdown'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Jina Reader error: ${response.status}`);
      }
      
      let content = await response.text();
      
      // 限制內容長度
      if (content.length > maxLength) {
        content = content.substring(0, maxLength) + '\n\n[內容已截斷...]';
      }
      
      // 提取標題 (通常是第一行)
      const lines = content.split('\n');
      const title = this.extractTitle(lines) || this.extractDomainAsTitle(url);
      
      // 偵測語言
      const language = this.detectLanguage(content);
      
      // 計算字數
      const wordCount = this.countWords(content, language);
      
      console.log(`[ScraperEngine] Scraped ${url} - ${wordCount} words`);
      
      return {
        url,
        title,
        content,
        wordCount,
        language,
        extractedAt: new Date(),
        success: true
      };
      
    } catch (error: any) {
      console.error(`[ScraperEngine] Error scraping ${url}:`, error.message);
      
      return {
        url,
        title: '',
        content: '',
        wordCount: 0,
        language: 'unknown',
        extractedAt: new Date(),
        success: false,
        error: error.message
      };
    }
  }

  // 批次擷取多個網頁
  async scrapeMultiple(
    urls: string[], 
    options: ScraperOptions = {},
    onProgress?: (completed: number, total: number) => void
  ): Promise<ScrapedContent[]> {
    const results: ScrapedContent[] = [];
    const total = urls.length;
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const result = await this.scrape(url, options);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, total);
      }
      
      // 避免過快請求
      if (i < urls.length - 1) {
        await this.delay(1000); // Jina 免費版限制
      }
    }
    
    return results;
  }

  // 擷取並分析內容結構
  async scrapeAndAnalyze(url: string): Promise<{
    content: ScrapedContent;
    structure: ContentStructure;
  }> {
    const content = await this.scrape(url);
    
    if (!content.success) {
      return {
        content,
        structure: {
          headings: [],
          paragraphs: 0,
          lists: 0,
          links: [],
          images: [],
          keyPoints: []
        }
      };
    }
    
    const structure = this.analyzeStructure(content.content);
    
    return { content, structure };
  }

  // 分析內容結構
  private analyzeStructure(markdown: string): ContentStructure {
    const lines = markdown.split('\n');
    
    const headings: { level: number; text: string }[] = [];
    const links: string[] = [];
    const images: string[] = [];
    let paragraphs = 0;
    let lists = 0;
    
    for (const line of lines) {
      // 標題
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        headings.push({
          level: headingMatch[1].length,
          text: headingMatch[2]
        });
      }
      
      // 連結
      const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
      for (const match of linkMatches) {
        links.push(match[2]);
      }
      
      // 圖片
      const imageMatches = line.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g);
      for (const match of imageMatches) {
        images.push(match[2]);
      }
      
      // 段落 (非空行，非標題，非列表)
      if (line.trim() && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*') && !line.match(/^\d+\./)) {
        paragraphs++;
      }
      
      // 列表項
      if (line.match(/^[-*]\s+/) || line.match(/^\d+\.\s+/)) {
        lists++;
      }
    }
    
    // 提取關鍵點 (基於標題和重要段落)
    const keyPoints = headings
      .filter(h => h.level <= 3)
      .map(h => h.text)
      .slice(0, 10);
    
    return {
      headings,
      paragraphs,
      lists,
      links: [...new Set(links)].slice(0, 20),
      images: [...new Set(images)].slice(0, 10),
      keyPoints
    };
  }

  // 輔助函數
  private extractTitle(lines: string[]): string {
    for (const line of lines.slice(0, 10)) {
      // 尋找 H1 標題
      const h1Match = line.match(/^#\s+(.+)/);
      if (h1Match) return h1Match[1];
      
      // 尋找 Title: 格式
      const titleMatch = line.match(/^Title:\s*(.+)/i);
      if (titleMatch) return titleMatch[1];
    }
    return '';
  }

  private extractDomainAsTitle(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'Unknown';
    }
  }

  private detectLanguage(text: string): string {
    // 簡單的語言偵測
    const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
    const englishChars = text.match(/[a-zA-Z]/g) || [];
    
    if (chineseChars.length > englishChars.length * 0.5) {
      return 'zh';
    }
    return 'en';
  }

  private countWords(text: string, language: string): number {
    if (language === 'zh') {
      // 中文按字數計算
      const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
      const englishWords = text.match(/[a-zA-Z]+/g) || [];
      return chineseChars.length + englishWords.length;
    }
    
    // 英文按詞數計算
    const words = text.split(/\s+/).filter(w => w.length > 0);
    return words.length;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface ContentStructure {
  headings: { level: number; text: string }[];
  paragraphs: number;
  lists: number;
  links: string[];
  images: string[];
  keyPoints: string[];
}

export const scraperEngine = new ScraperEngine();
