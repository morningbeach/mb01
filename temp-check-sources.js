const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  const sources = await p.researchSource.findMany({
    where: { sessionId: 'cmj61ih4o0000wyik24ada2gp' },
    select: {
      title: true,
      domain: true,
      authorityScore: true,
      relevanceScore: true,
      sourceType: true,
      isExcluded: true
    },
    orderBy: { authorityScore: 'desc' }
  });
  
  console.log('=== 來源品質分析 ===\n');
  console.log(`總來源數: ${sources.length}`);
  console.log(`高品質 (>=60): ${sources.filter(s => s.authorityScore >= 60).length}`);
  console.log(`中等 (40-60): ${sources.filter(s => s.authorityScore >= 40 && s.authorityScore < 60).length}`);
  console.log(`低品質 (<40): ${sources.filter(s => s.authorityScore < 40).length}`);
  console.log(`被排除: ${sources.filter(s => s.isExcluded).length}`);
  console.log('\n=== 詳細列表 ===\n');
  
  sources.forEach((s, i) => {
    console.log(`${i+1}. [${s.authorityScore.toFixed(0)}] ${s.domain}`);
    console.log(`   ${s.title.substring(0, 50)}...`);
    console.log(`   類型: ${s.sourceType} | 相關: ${s.relevanceScore.toFixed(0)} | 排除: ${s.isExcluded}`);
    console.log('');
  });
  
  await p.$disconnect();
}

check().catch(console.error);
