const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  // 1. 檢查設定
  const config = await p.siteSetting.findUnique({ where: { key: 'landing-v2-config' } });
  const cfg = config?.value || {};
  console.log('featuredProductCategory:', cfg.featuredProductCategory);
  
  // 2. 檢查 gift 類別的維度標籤
  const dimensionTags = await p.dimensionTagMapping.findMany({
    where: { dimension: { category: 'gift' } },
    select: { tagId: true },
    take: 10
  });
  console.log('\ngift 類別維度標籤數量:', dimensionTags.length);
  
  // 3. 查詢符合 gift 類別的產品
  if (dimensionTags.length > 0) {
    const tagIds = dimensionTags.map(dt => dt.tagId);
    const products = await p.product.findMany({
      where: {
        status: 'ACTIVE',
        version: 2,
        ProductTag: {
          some: { tagId: { in: tagIds } }
        }
      },
      select: { id: true, name_zh: true, coverImage: true },
      take: 5
    });
    console.log('\n符合條件的產品:', products.length);
    products.forEach(pr => console.log('  -', pr.name_zh, '|', pr.coverImage ? 'has image' : 'no image'));
  }
  
  // 4. 直接查詢所有 V2 產品
  const allV2 = await p.product.count({
    where: { status: 'ACTIVE', version: 2 }
  });
  console.log('\n所有 V2 ACTIVE 產品數量:', allV2);
}
check().catch(console.error).finally(() => p.$disconnect());
