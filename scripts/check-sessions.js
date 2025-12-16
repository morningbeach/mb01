// scripts/check-sessions.js
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const sessions = await p.researchSession.findMany({
    select: {
      id: true,
      topic: true,
      status: true,
      createdAt: true,
      marketType: true,
      _count: {
        select: {
          sources: true,
          modules: true,
          logs: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  console.log('現有研究 Sessions:\n');
  sessions.forEach(s => {
    console.log(`ID: ${s.id}`);
    console.log(`  主題: ${s.topic || '(無)'}`);
    console.log(`  狀態: ${s.status}`);
    console.log(`  市場: ${s.marketType || '(未設定)'}`);
    console.log(`  來源: ${s._count.sources} | 模組: ${s._count.modules} | 日誌: ${s._count.logs}`);
    console.log(`  建立: ${s.createdAt}`);
    console.log('');
  });
}

main().finally(() => p.$disconnect());
