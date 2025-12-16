const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkModule() {
  const moduleId = 'cmj61uhsf001iwyik3pfctjzl';
  const sessionId = 'cmj61ih4o0000wyik24ada2gp';
  
  // 查看模組
  const module = await prisma.researchModule.findUnique({
    where: { id: moduleId },
    include: { sources: true }
  });
  
  console.log('=== 模組資訊 ===');
  console.log('標題:', module.title_zh);
  console.log('關聯來源數:', module.sources.length);
  module.sources.forEach(s => console.log('  -', s.title));
  
  // 查看 session 所有可用來源
  const availableSources = await prisma.researchSource.findMany({
    where: { sessionId, isExcluded: false }
  });
  
  console.log('\n=== Session 可用來源 ===');
  console.log('總數:', availableSources.length);
  availableSources.forEach(s => console.log(`  [${s.authorityScore}] ${s.title.substring(0, 50)}`));
  
  // 查看所有模組
  const allModules = await prisma.researchModule.findMany({
    where: { sessionId },
    include: { _count: { select: { sources: true } } }
  });
  
  console.log('\n=== 所有模組 ===');
  allModules.forEach(m => console.log(`  ${m.title_zh} - ${m._count.sources} 個來源`));
  
  await prisma.$disconnect();
}

checkModule().catch(console.error);
