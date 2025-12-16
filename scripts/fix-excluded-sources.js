// 修復被錯誤排除的來源
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixExcludedSources() {
  const sessionId = 'cmj61ih4o0000wyik24ada2gp';
  
  // 找出所有不應該被排除的來源 (authorityScore >= 40 且沒有 excludeReason)
  const sources = await prisma.researchSource.findMany({
    where: {
      sessionId,
      isExcluded: true,
      authorityScore: { gte: 40 },
      excludeReason: null
    }
  });
  
  console.log(`找到 ${sources.length} 個被錯誤排除的來源\n`);
  
  // 修復
  for (const source of sources) {
    await prisma.researchSource.update({
      where: { id: source.id },
      data: { isExcluded: false }
    });
    console.log(`✓ 已恢復: [${source.authorityScore}] ${new URL(source.url).hostname}`);
  }
  
  console.log(`\n完成！已恢復 ${sources.length} 個來源`);
  
  // 顯示當前可用來源數
  const available = await prisma.researchSource.count({
    where: { sessionId, isExcluded: false }
  });
  console.log(`\n目前可用來源數: ${available}`);
  
  await prisma.$disconnect();
}

fixExcludedSources().catch(console.error);
