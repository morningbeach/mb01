const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyze() {
  const sources = await prisma.researchSource.findMany({
    where: { sessionId: 'cmj61ih4o0000wyik24ada2gp' },
    orderBy: { authorityScore: 'desc' }
  });
  
  console.log('=== 完整來源資料 ===\n');
  
  for (const s of sources) {
    console.log(`[${s.authorityScore}] ${new URL(s.url).hostname}`);
    console.log(`  isExcluded: ${s.isExcluded}`);
    console.log(`  isMarketing: ${s.isMarketing}`);
    console.log(`  excludeReason: ${s.excludeReason || '(空)'}`);
    console.log(`  authorityScore: ${s.authorityScore}`);
    
    // 檢查排除邏輯
    const shouldBeExcluded = s.isMarketing || s.authorityScore < 40;
    console.log(`  根據邏輯應排除?: ${shouldBeExcluded}`);
    console.log(`  實際排除?: ${s.isExcluded}`);
    console.log(`  匹配?: ${shouldBeExcluded === s.isExcluded ? '✓' : '✗ 不一致!'}`);
    console.log();
  }
  
  await prisma.$disconnect();
}

analyze().catch(console.error);
