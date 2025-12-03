const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // 取得 bag 類別的標籤 IDs
  const bagDimTags = await p.dimensionTagMapping.findMany({
    where: { dimension: { category: 'bag' } },
    select: { tagId: true, tag: { select: { slug: true, name_zh: true } } }
  });
  const bagTagIds = bagDimTags.map(t => t.tagId);
  
  console.log('=== bag 維度的標籤數量:', bagTagIds.length, '===\n');
  
  // 找出有 bag 標籤的產品
  const products = await p.product.findMany({
    where: {
      ProductTag: { some: { tagId: { in: bagTagIds } } }
    },
    include: { ProductTag: { include: { Tag: true } } }
  });
  
  console.log('=== 提袋類別的產品總數:', products.length, '===\n');
  
  // 找出名稱含有「盒」的產品
  const boxProducts = products.filter(prod => 
    prod.name_zh?.includes('盒') || 
    prod.name?.includes('盒') ||
    prod.name_en?.includes('box') ||
    prod.name?.toLowerCase().includes('box')
  );
  
  console.log('=== 提袋類別中的「盒」產品 ===');
  console.log('總數:', boxProducts.length);
  
  boxProducts.forEach(prod => {
    const bagTags = prod.ProductTag
      .filter(pt => bagTagIds.includes(pt.tagId))
      .map(pt => `${pt.Tag.slug}(${pt.Tag.name_zh || pt.Tag.name_en})`);
    console.log(`\n${prod.name_zh || prod.name}`);
    console.log(`  bag 標籤: ${bagTags.join(', ')}`);
  });
  
  // 找出哪些標籤導致紙盒進入 bag 類別
  console.log('\n\n=== 分析：哪些標籤導致紙盒出現在提袋 ===');
  const problemTags = new Map();
  
  boxProducts.forEach(prod => {
    prod.ProductTag.forEach(pt => {
      if (bagTagIds.includes(pt.tagId)) {
        const key = pt.Tag.slug;
        if (!problemTags.has(key)) {
          problemTags.set(key, { tag: pt.Tag, products: [] });
        }
        problemTags.get(key).products.push(prod.name_zh || prod.name);
      }
    });
  });
  
  problemTags.forEach((v, k) => {
    console.log(`\n${v.tag.name_zh || k} (${v.products.length} 個紙盒):`);
    v.products.forEach(p => console.log(`  - ${p}`));
  });
}

main().finally(() => p.$disconnect());
