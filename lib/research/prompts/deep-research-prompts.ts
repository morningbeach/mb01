// lib/research/prompts/deep-research-prompts.ts
// 深度研究提示模板庫

export interface ResearchPrompt {
  id: string;
  name: string;
  description: string;
  category: 'trend' | 'material' | 'design' | 'sustainability' | 'technology' | 'market' | 'custom';
  questions: string[];           // 引導研究的問題
  searchKeywords: string[];      // 額外搜尋關鍵字
  analysisPoints: string[];      // 分析時關注的要點
  writingGuidelines: string[];   // 寫作時的指引
  expertLevel: 'basic' | 'intermediate' | 'expert';
}

// 預設深度研究提示模板
export const defaultPrompts: ResearchPrompt[] = [
  // ===== 趨勢類 =====
  {
    id: 'trend-2025',
    name: '2025 包裝趨勢深度分析',
    description: '探索 2025 年包裝產業的關鍵趨勢、驅動因素和市場預測',
    category: 'trend',
    expertLevel: 'expert',
    questions: [
      '2025 年包裝產業的 Top 5 趨勢是什麼？背後的驅動因素？',
      '消費者行為如何影響包裝設計趨勢？',
      '哪些品牌正在引領這些趨勢？具體案例？',
      '這些趨勢對成本結構有什麼影響？',
      '預計這些趨勢的持續時間和演變方向？'
    ],
    searchKeywords: [
      'packaging trends 2025', '包裝趨勢預測',
      'consumer packaging preferences', 'brand packaging innovation',
      'packaging industry forecast', 'emerging packaging technologies'
    ],
    analysisPoints: [
      '量化數據：市場規模、增長率、採用率',
      '品牌案例：具體的設計變化和商業成效',
      '消費者研究：調查數據、行為分析',
      '專家預測：產業分析師的觀點',
      '地區差異：不同市場的趨勢差異'
    ],
    writingGuidelines: [
      '以數據驅動的方式呈現趨勢，避免空泛描述',
      '每個趨勢至少提供 2-3 個具體品牌案例',
      '分析趨勢的商業價值和實施成本',
      '提供可操作的建議給品牌商和設計師',
      '註明資料來源和研究方法'
    ]
  },
  {
    id: 'trend-regional',
    name: '區域市場趨勢比較',
    description: '比較亞太、歐美市場的包裝趨勢差異',
    category: 'trend',
    expertLevel: 'intermediate',
    questions: [
      '亞太市場與歐美市場的包裝趨勢有何不同？',
      '文化因素如何影響包裝設計偏好？',
      '法規要求的差異如何影響包裝策略？',
      '跨國品牌如何調整其包裝策略以適應不同市場？'
    ],
    searchKeywords: [
      'Asia packaging trends', 'European packaging regulations',
      'US packaging market', '亞太包裝市場', '跨境包裝策略'
    ],
    analysisPoints: [
      '市場規模比較',
      '消費者偏好差異',
      '法規環境分析',
      '成功的本地化案例'
    ],
    writingGuidelines: [
      '使用對比表格呈現區域差異',
      '提供具體的市場進入策略建議',
      '注意文化敏感性的描述'
    ]
  },

  // ===== 材料類 =====
  {
    id: 'material-sustainable',
    name: '永續材料深度研究',
    description: '深入分析可生物降解、可回收、可再生包裝材料',
    category: 'material',
    expertLevel: 'expert',
    questions: [
      '目前市場上有哪些主流永續包裝材料？各自的優缺點？',
      '這些材料的成本結構如何？與傳統材料相比？',
      '實際的環保效益如何量化？有哪些認證標準？',
      '供應鏈成熟度如何？有哪些主要供應商？',
      '哪些產品類別最適合使用這些材料？'
    ],
    searchKeywords: [
      'biodegradable packaging materials', 'sustainable packaging solutions',
      'recyclable packaging innovation', 'bio-based plastics',
      'packaging LCA analysis', '可降解包材', '永續包裝認證'
    ],
    analysisPoints: [
      '材料特性：強度、阻隔性、印刷適性',
      '成本分析：原料成本、加工成本、總體擁有成本',
      '環境影響：碳足跡、生命週期分析',
      '法規合規：食品接觸安全、回收標準',
      '供應商評估：產能、品質穩定性、價格競爭力'
    ],
    writingGuidelines: [
      '提供材料比較表格',
      '包含實際應用案例和效果數據',
      '分析「漂綠」風險和如何避免',
      '給出選材決策框架'
    ]
  },
  {
    id: 'material-innovation',
    name: '創新包裝材料探索',
    description: '探索前沿包裝材料技術：智能材料、奈米技術、食用包裝等',
    category: 'material',
    expertLevel: 'expert',
    questions: [
      '哪些創新材料技術正在改變包裝產業？',
      '智能包裝材料（如時間溫度指示器）的應用現狀？',
      '奈米技術在包裝中的應用前景？',
      '這些創新技術的商業化時間表？',
      '主要的技術瓶頸和解決方案？'
    ],
    searchKeywords: [
      'smart packaging materials', 'nano packaging technology',
      'edible packaging', 'active packaging', 'intelligent packaging',
      '智能包裝', '主動包裝技術'
    ],
    analysisPoints: [
      '技術成熟度評估',
      '專利分析和技術壁壘',
      '商業應用案例',
      '投資和研發動態'
    ],
    writingGuidelines: [
      '平衡技術細節和可讀性',
      '區分實驗室技術和商業化產品',
      '提供技術採用路線圖'
    ]
  },

  // ===== 設計類 =====
  {
    id: 'design-premium',
    name: '高端包裝設計策略',
    description: '探索奢侈品和高端品牌的包裝設計哲學與技術',
    category: 'design',
    expertLevel: 'expert',
    questions: [
      '高端品牌如何通過包裝傳達品牌價值？',
      '哪些設計元素和工藝能提升感知價值？',
      '開箱體驗如何設計以最大化品牌記憶？',
      '高端與永續如何平衡？',
      '成本投入與品牌價值提升的 ROI？'
    ],
    searchKeywords: [
      'luxury packaging design', 'premium unboxing experience',
      'luxury brand packaging case study', '高端包裝設計',
      'packaging and brand perception', 'tactile packaging design'
    ],
    analysisPoints: [
      '設計語言分析：色彩、材質、結構',
      '工藝技術：燙金、浮雕、特殊印刷',
      '五感體驗設計',
      '品牌一致性維護',
      '成本結構分析'
    ],
    writingGuidelines: [
      '使用視覺化描述（需配合圖片）',
      '分析成功案例的設計邏輯',
      '提供設計決策框架',
      '平衡美學與功能性討論'
    ]
  },
  {
    id: 'design-minimalist',
    name: '極簡包裝設計趨勢',
    description: '分析極簡主義在包裝設計中的應用與商業價值',
    category: 'design',
    expertLevel: 'intermediate',
    questions: [
      '極簡包裝設計的核心原則是什麼？',
      '哪些品牌成功實施了極簡包裝？效果如何？',
      '極簡設計如何影響貨架可見度和購買決策？',
      '極簡與資訊充分性如何平衡？'
    ],
    searchKeywords: [
      'minimalist packaging design', 'simple packaging',
      'packaging reduction', '極簡包裝', '減法設計'
    ],
    analysisPoints: [
      '設計原則和方法論',
      '消費者反應研究',
      '品牌案例分析',
      '實施挑戰和解決方案'
    ],
    writingGuidelines: [
      '對比「前後」案例',
      '量化設計變化的商業影響',
      '提供實施檢核表'
    ]
  },

  // ===== 永續類 =====
  {
    id: 'sustainability-circular',
    name: '循環經濟包裝策略',
    description: '深入探討包裝產業的循環經濟模式和實踐',
    category: 'sustainability',
    expertLevel: 'expert',
    questions: [
      '包裝產業如何實現循環經濟？現有模式有哪些？',
      '回收、再利用、減量的實際效益比較？',
      '品牌如何建立包裝回收體系？成本效益分析？',
      '消費者參與度如何提升？',
      '政策法規如何推動循環包裝？'
    ],
    searchKeywords: [
      'circular economy packaging', 'packaging recycling systems',
      'reusable packaging models', 'extended producer responsibility',
      '循環經濟包裝', '包裝回收體系', 'EPR 包裝'
    ],
    analysisPoints: [
      '循環模式分類和比較',
      '經濟可行性分析',
      '環境效益量化',
      '利益相關者分析',
      '政策環境掃描'
    ],
    writingGuidelines: [
      '使用循環經濟框架進行分析',
      '提供商業模式畫布',
      '分析成功和失敗案例',
      '給出階段性實施建議'
    ]
  },
  {
    id: 'sustainability-carbon',
    name: '包裝碳足跡分析',
    description: '分析包裝產品的碳足跡計算方法和減碳策略',
    category: 'sustainability',
    expertLevel: 'expert',
    questions: [
      '如何計算包裝產品的碳足跡？有哪些標準方法？',
      '包裝生命週期中哪個階段碳排放最高？',
      '有效的減碳策略有哪些？成本效益如何？',
      '如何進行碳足跡認證和溝通？',
      '產業減碳目標和進展如何？'
    ],
    searchKeywords: [
      'packaging carbon footprint', 'LCA packaging',
      'carbon neutral packaging', 'packaging emissions reduction',
      '包裝碳足跡', '包裝生命週期分析'
    ],
    analysisPoints: [
      'LCA 方法論',
      '碳熱點分析',
      '減碳技術評估',
      '認證標準比較',
      '產業基準數據'
    ],
    writingGuidelines: [
      '使用科學數據支持論點',
      '提供計算工具和資源',
      '避免過度技術化',
      '提供實用的減碳行動清單'
    ]
  },

  // ===== 技術類 =====
  {
    id: 'tech-digital-printing',
    name: '數位印刷技術革新',
    description: '探索數位印刷在包裝產業的應用和趨勢',
    category: 'technology',
    expertLevel: 'intermediate',
    questions: [
      '數位印刷技術的最新發展是什麼？',
      '數位印刷與傳統印刷的成本平衡點在哪裡？',
      '個性化包裝的商業模式和案例？',
      '短版印刷如何改變包裝供應鏈？',
      '色彩一致性和品質控制的挑戰？'
    ],
    searchKeywords: [
      'digital packaging printing', 'personalized packaging',
      'short run packaging', 'variable data printing packaging',
      '數位包裝印刷', '個性化包裝'
    ],
    analysisPoints: [
      '技術比較：HP、Xeikon、Landa 等',
      '成本模型分析',
      '應用場景分類',
      '品質標準和控制',
      '供應商生態系統'
    ],
    writingGuidelines: [
      '提供技術選型指南',
      '包含實際印刷效果比較',
      '分析 TCO（總擁有成本）',
      '給出決策流程圖'
    ]
  },
  {
    id: 'tech-smart-packaging',
    name: '智能包裝技術應用',
    description: '分析 RFID、NFC、QR 碼等智能包裝技術的應用',
    category: 'technology',
    expertLevel: 'intermediate',
    questions: [
      '智能包裝技術有哪些類型？各自適用場景？',
      '實施智能包裝的成本和 ROI？',
      '消費者對智能包裝的接受度如何？',
      '智能包裝如何整合到品牌營銷策略？',
      '數據隱私和安全考量？'
    ],
    searchKeywords: [
      'smart packaging technology', 'NFC packaging',
      'connected packaging', 'interactive packaging',
      '智能包裝', '互動式包裝'
    ],
    analysisPoints: [
      '技術類型比較',
      '實施複雜度評估',
      '消費者互動數據',
      '品牌案例研究',
      '安全合規要求'
    ],
    writingGuidelines: [
      '區分技術能力和商業價值',
      '提供技術選型矩陣',
      '包含實施路線圖',
      '討論失敗案例和教訓'
    ]
  },

  // ===== 市場類 =====
  {
    id: 'market-segment',
    name: '包裝市場細分分析',
    description: '深入分析特定產品類別的包裝市場（如食品、美妝、電子等）',
    category: 'market',
    expertLevel: 'expert',
    questions: [
      '該細分市場的規模和增長預測是什麼？',
      '主要競爭者和市場份額分佈？',
      '該市場的包裝需求特點是什麼？',
      '影響市場的關鍵驅動因素和阻礙因素？',
      '未來 3-5 年的市場演變趨勢？'
    ],
    searchKeywords: [
      'packaging market analysis', 'packaging industry report',
      'market share packaging', 'packaging demand forecast'
    ],
    analysisPoints: [
      '市場規模和預測',
      '競爭格局分析',
      '價值鏈分析',
      'SWOT 分析',
      '進入障礙評估'
    ],
    writingGuidelines: [
      '使用可靠的市場數據來源',
      '提供視覺化的市場地圖',
      '區分事實和預測',
      '給出戰略建議'
    ]
  },
  {
    id: 'market-ecommerce',
    name: '電商包裝策略分析',
    description: '探索電商物流包裝的最佳實踐和創新',
    category: 'market',
    expertLevel: 'intermediate',
    questions: [
      '電商包裝與零售包裝的核心差異？',
      '如何平衡保護性、成本和開箱體驗？',
      '退貨率與包裝設計的關係？',
      '永續電商包裝的實踐案例？',
      '最後一哩物流對包裝的影響？'
    ],
    searchKeywords: [
      'ecommerce packaging', 'shipping packaging optimization',
      'unboxing experience ecommerce', 'sustainable ecommerce packaging',
      '電商包裝', '物流包裝優化'
    ],
    analysisPoints: [
      '包裝類型和材料選擇',
      '成本結構分析',
      '用戶體驗設計',
      '物流效率優化',
      '品牌體驗延伸'
    ],
    writingGuidelines: [
      '提供包裝尺寸優化指南',
      '分析成本/體驗權衡',
      '包含 DTC 品牌案例',
      '給出包裝測試方法'
    ]
  }
];

// 根據主題推薦適合的提示
export function recommendPrompts(topic: string, focusAreas: string[]): ResearchPrompt[] {
  const lowerTopic = topic.toLowerCase();
  const scores: { prompt: ResearchPrompt; score: number }[] = [];

  for (const prompt of defaultPrompts) {
    let score = 0;

    // 關鍵字匹配
    const keywords = [...prompt.searchKeywords, prompt.name, prompt.description];
    for (const keyword of keywords) {
      if (lowerTopic.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(lowerTopic)) {
        score += 10;
      }
    }

    // 焦點領域匹配
    for (const area of focusAreas) {
      if (prompt.category.toUpperCase() === area || 
          prompt.category === area.toLowerCase()) {
        score += 20;
      }
    }

    // 類別相關性
    if (lowerTopic.includes('趨勢') || lowerTopic.includes('trend')) {
      if (prompt.category === 'trend') score += 15;
    }
    if (lowerTopic.includes('材料') || lowerTopic.includes('material')) {
      if (prompt.category === 'material') score += 15;
    }
    if (lowerTopic.includes('設計') || lowerTopic.includes('design')) {
      if (prompt.category === 'design') score += 15;
    }
    if (lowerTopic.includes('永續') || lowerTopic.includes('環保') || lowerTopic.includes('sustain')) {
      if (prompt.category === 'sustainability') score += 15;
    }
    if (lowerTopic.includes('電商') || lowerTopic.includes('ecommerce')) {
      if (prompt.id === 'market-ecommerce') score += 25;
    }

    if (score > 0) {
      scores.push({ prompt, score });
    }
  }

  // 排序並返回前 5 個
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 5).map(s => s.prompt);
}

// 將提示轉換為搜尋查詢
export function promptToSearchQueries(prompt: ResearchPrompt, baseTopic: string): string[] {
  const queries: string[] = [];
  
  // 基礎查詢 + 提示關鍵字
  for (const keyword of prompt.searchKeywords.slice(0, 5)) {
    queries.push(`${baseTopic} ${keyword}`);
  }

  // 問題轉換為查詢
  for (const question of prompt.questions.slice(0, 3)) {
    // 簡化問題為關鍵詞
    const simplified = question
      .replace(/[？?。，,]/g, '')
      .replace(/哪些|什麼|如何|為什麼|是什麼/g, '')
      .trim();
    if (simplified.length > 5 && simplified.length < 50) {
      queries.push(`${baseTopic} ${simplified.slice(0, 30)}`);
    }
  }

  return queries;
}

// 生成分析提示
export function generateAnalysisPrompt(prompt: ResearchPrompt, topic: string): string {
  return `
你正在分析關於「${topic}」的研究資料。

請特別關注以下分析要點：
${prompt.analysisPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

回答以下研究問題：
${prompt.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

確保你的分析：
- 基於具體數據和事實
- 包含可驗證的來源引用
- 提供可操作的見解
- 區分確認的事實和推測
`;
}

// 生成寫作提示
export function generateWritingPrompt(prompt: ResearchPrompt, topic: string): string {
  return `
你正在撰寫關於「${topic}」的專業文章。

寫作指引：
${prompt.writingGuidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}

文章應該回答以下核心問題：
${prompt.questions.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join('\n')}

確保文章：
- 符合包裝產業專業標準
- 提供實用的行動建議
- 保持客觀和數據驅動
- 適合目標讀者（品牌商、設計師、包材供應商）
`;
}

// 獲取所有提示分類
export function getPromptCategories(): { id: string; name: string; count: number }[] {
  const categories = new Map<string, number>();
  
  for (const prompt of defaultPrompts) {
    categories.set(prompt.category, (categories.get(prompt.category) || 0) + 1);
  }

  const categoryNames: Record<string, string> = {
    trend: '趨勢分析',
    material: '材料研究',
    design: '設計策略',
    sustainability: '永續發展',
    technology: '技術應用',
    market: '市場分析',
    custom: '自定義'
  };

  return Array.from(categories.entries()).map(([id, count]) => ({
    id,
    name: categoryNames[id] || id,
    count
  }));
}
