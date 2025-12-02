const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 找出 bag 應用場景維度中不應該存在的標籤
  const bagAppDim = await prisma.filterDimension.findFirst({
    where: { category: 'bag', slug: 'bag-application' }
  });
  
  if (bagAppDim) {
    // 列出所有 bag-application 維度的標籤
    const mappings = await prisma.dimensionTagMapping.findMany({
      where: { dimensionId: bagAppDim.id },
      include: { tag: true }
    });
    
    console.log('bag-application 維度的標籤:');
    mappings.forEach(m => console.log(' -', m.tag.name_zh, '|', m.tag.slug));
    
    // 刪除「企業禮贈品」這個映射（它應該屬於 print-packaging）
    const toRemove = mappings.filter(m => 
      m.tag.name_zh.includes('禮贈品') || 
      m.tag.name_zh.includes('禮品包裝') ||
      m.tag.name_zh.includes('禮品盒')
    );
    
    if (toRemove.length > 0) {
      console.log('\n將移除的映射:');
      toRemove.forEach(m => console.log(' -', m.tag.name_zh));
      
      await prisma.dimensionTagMapping.deleteMany({
        where: { id: { in: toRemove.map(m => m.id) } }
      });
      console.log('\n已移除', toRemove.length, '個不正確的映射');
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
