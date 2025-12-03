// 檢查 API 回傳的 productCount
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  // 模擬 API 的查詢邏輯
  const dims = await prisma.filterDimension.findMany({
    where: { category: 'bag', slug: 'bag-material' },
    include: {
      tagMappings: {
        include: {
          tag: {
            include: {
              ProductTag: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });
  
  console.log('=== bag-material 標籤的 productCount ===\n');
  
  dims[0].tagMappings.forEach(mapping => {
    const count = mapping.tag.ProductTag?.length || 0;
    const name = mapping.tag.name_zh || mapping.tag.name;
    const slug = mapping.tag.slug;
    const status = count > 0 ? '✅' : '❌ (會被前端過濾)';
    console.log(`${status} ${name} (${slug}): ${count} 個產品`);
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);
