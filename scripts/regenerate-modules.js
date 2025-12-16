// 直接使用 TypeScript 模組需要 tsx
// 執行: npx tsx scripts/regenerate-modules.js

import { prisma } from '../lib/prisma';
import { analysisEngine } from '../lib/research/engines/analysis-engine';
import { calculateCitationScore } from '../lib/research/core/citation-scorer';

async function regenerateModules() {
  const sessionId = 'cmj61ih4o0000wyik24ada2gp';
  
  console.log('開始重新生成模組...\n');
  
  // 1. 獲取 session 資訊
  const session = await prisma.researchSession.findUnique({
    where: { id: sessionId }
  });
  
  if (!session) {
    console.log('找不到 session');
    return;
  }
  
  console.log('Session:', session.topic);
  
  // 2. 刪除現有模組
  const deleted = await prisma.researchModule.deleteMany({
    where: { sessionId }
  });
  console.log(`已刪除 ${deleted.count} 個舊模組`);
  
  // 3. 獲取可用來源
  const sources = await prisma.researchSource.findMany({
    where: { sessionId, isExcluded: false }
  });
  
  console.log(`可用來源: ${sources.length} 個`);
  
  if (sources.length === 0) {
    console.log('沒有可用來源');
    return;
  }
  
  // 4. 轉換格式
  const sourceAnalyses = sources.map(s => ({
    url: s.url,
    title: s.title,
    authorityScore: s.authorityScore,
    originalityScore: s.originalityScore,
    relevanceScore: s.relevanceScore,
    isMarketing: false,
    sourceType: s.sourceType,
    summary: s.summary || '',
    keyPoints: s.keyPoints || [],
    facts: [],
    language: s.language,
    region: s.region
  }));
  
  // 5. 使用 AI 生成模組
  console.log('\n正在使用 AI 生成模組...');
  const modules = await analysisEngine.generateModules(
    sourceAnalyses,
    session.topic || '',
    session.focusAreas || []
  );
  
  console.log(`\nAI 生成了 ${modules.length} 個模組`);
  
  // 6. 儲存模組並連結所有來源（附帶引用分數）
  for (const moduleData of modules) {
    const created = await prisma.researchModule.create({
      data: {
        sessionId,
        moduleType: moduleData.moduleType,
        title_zh: moduleData.title_zh,
        title_en: moduleData.title_en,
        conclusion_zh: moduleData.conclusion_zh,
        conclusion_en: moduleData.conclusion_en,
        insight_zh: moduleData.insight_zh,
        insight_en: moduleData.insight_en,
        tags: moduleData.tags
      }
    });
    
    // 連結所有來源並計算引用分數
    for (const source of sources) {
      const citationInfo = calculateCitationScore(
        {
          id: source.id,
          url: source.url,
          title: source.title,
          authorityScore: source.authorityScore,
          originalityScore: source.originalityScore,
          relevanceScore: source.relevanceScore,
          sourceType: source.sourceType,
          region: source.region,
          language: source.language,
          keyPoints: source.keyPoints || [],
          summary: source.summary
        },
        moduleData.moduleType,
        moduleData.tags
      );
      
      await prisma.researchModuleSource.create({
        data: {
          moduleId: created.id,
          sourceId: source.id,
          relevance: citationInfo.citationPriority,
          citationScore: citationInfo.citationScore,
          citationReason: citationInfo.citationReason
        }
      });
    }
    
    console.log(`  ✓ ${created.title_zh} (${sources.length} 個來源，含引用分數)`);
  }
  
  console.log('\n完成！');
  await prisma.$disconnect();
}

regenerateModules().catch(console.error);
