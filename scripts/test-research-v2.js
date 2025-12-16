// scripts/test-research-v2.js
// 測試研究系統 v2 各個功能

const BASE_URL = 'http://localhost:3000';

async function testAPI(name, url, options = {}) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🧪 測試: ${name}`);
  console.log(`📍 URL: ${url}`);
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    console.log(`📊 狀態: ${res.status}`);
    
    if (res.ok) {
      console.log(`✅ 成功`);
      if (typeof data === 'object') {
        console.log(`📝 回應摘要:`, JSON.stringify(data, null, 2).substring(0, 500));
      }
    } else {
      console.log(`❌ 失敗`);
      console.log(`💥 錯誤:`, data);
    }
    
    return { success: res.ok, status: res.status, data };
  } catch (error) {
    console.log(`❌ 網路錯誤: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🔬 研究系統 v2 測試開始\n');
  console.log('=' .repeat(50));
  
  // 1. 測試獲取任務列表
  const listResult = await testAPI(
    '獲取研究任務列表',
    `${BASE_URL}/api/admin/research/v2/sessions`
  );
  
  // 2. 測試建立新任務
  const createResult = await testAPI(
    '建立新研究任務',
    `${BASE_URL}/api/admin/research/v2/sessions`,
    {
      method: 'POST',
      body: JSON.stringify({
        topic: '2025 環保包裝趨勢測試',
        focusAreas: ['TREND', 'SUSTAINABILITY'],
        autoResearch: false  // 不自動研究，只建立
      })
    }
  );
  
  if (!createResult.success || !createResult.data?.session?.id) {
    console.log('\n⚠️ 無法建立任務，使用現有 session 進行測試');
    
    // 使用現有 session
    if (listResult.success && listResult.data?.sessions?.length > 0) {
      const sessionId = listResult.data.sessions[0].id;
      console.log(`\n📌 使用現有 Session: ${sessionId}`);
      await testExistingSession(sessionId);
    }
    return;
  }
  
  const sessionId = createResult.data.session.id;
  console.log(`\n📌 新建 Session ID: ${sessionId}`);
  
  await testExistingSession(sessionId);
}

async function testExistingSession(sessionId) {
  // 3. 測試獲取任務詳情
  await testAPI(
    '獲取任務詳情',
    `${BASE_URL}/api/admin/research/v2/sessions/${sessionId}`
  );
  
  // 4. 測試搜尋功能
  const searchResult = await testAPI(
    '執行搜尋',
    `${BASE_URL}/api/admin/research/v2/sessions/${sessionId}/search`,
    { method: 'POST' }
  );
  
  // 5. 測試抓取功能 (如果搜尋成功)
  if (searchResult.success && searchResult.data?.results?.length > 0) {
    const selectedUrls = searchResult.data.results.slice(0, 2).map(r => ({
      url: r.url,
      title: r.title
    }));
    
    await testAPI(
      '抓取選定連結',
      `${BASE_URL}/api/admin/research/v2/sessions/${sessionId}/scrape`,
      {
        method: 'POST',
        body: JSON.stringify({ selectedUrls })
      }
    );
  }
  
  // 6. 測試獲取提示模板
  await testAPI(
    '獲取深度提示模板',
    `${BASE_URL}/api/admin/research/v2/prompts`
  );
  
  // 7. 測試獲取日誌
  await testAPI(
    '獲取操作日誌',
    `${BASE_URL}/api/admin/research/v2/sessions/${sessionId}/logs`
  );
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 測試完成');
}

runTests().catch(console.error);
