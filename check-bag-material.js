// 直接查資料庫檢查 bag-material 維度的標籤
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  const dims = await prisma.filterDimension.findMany({
    where: { slug: 'bag-material' },
    include: { 
      tagMappings: { 
        include: { tag: true },
        orderBy: { order: 'asc' }
      } 
    }
  });
  
  if (dims.length === 0) {
    console.log('❌ 找不到 bag-material 維度');
    await prisma.$disconnect();
    return;
  }
  
  const tags = dims[0].tagMappings.map(m => ({
    slug: m.tag.slug,
    name: m.tag.name_zh || m.tag.name
  }));
  
  console.log('=== bag-material 維度包含的標籤 ===\n');
  tags.forEach(t => console.log(`  - ${t.name} (${t.slug})`));
  
  console.log('\n=== 檢查 canvas 和 cotton ===');
  const hasCanvas = tags.some(t => t.slug === 'canvas');
  const hasCotton = tags.some(t => t.slug === 'cotton');
  
  console.log('帆布 (canvas):', hasCanvas ? '✅ 存在於 DimensionTagMapping' : '❌ 不存在');
  console.log('棉布 (cotton):', hasCotton ? '✅ 存在於 DimensionTagMapping' : '❌ 不存在');
  
  await prisma.$disconnect();
}

main().catch(console.error);
