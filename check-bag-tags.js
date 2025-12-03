const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // 先取得 bag 類別的所有維度標籤 IDs
  const bagDimTags = await p.dimensionTagMapping.findMany({
    where: { dimension: { category: 'bag' } },
    select: { tagId: true }
  });
  const bagTagIds = bagDimTags.map(t => t.tagId);
  
  // 找出所有有 bag 類別標籤的產品
  const products = await p.product.findMany({
    where: {
      ProductTag: { some: { tagId: { in: bagTagIds } } }
    },
    include: { ProductTag: { include: { Tag: true } } }
  });
  
  console.log('=== Bag 產品總數:', products.length, '===\n');
  
  const allTags = new Map();
  products.forEach(prod => {
    prod.ProductTag.forEach(pt => {
      const key = pt.Tag.slug;
      if (!allTags.has(key)) {
        allTags.set(key, { slug: pt.Tag.slug, name_zh: pt.Tag.name_zh, count: 0 });
      }
      allTags.get(key).count++;
    });
  });
  
  console.log('所有 bag 產品使用的標籤 (按使用次數排序):');
  Array.from(allTags.values())
    .sort((a, b) => b.count - a.count)
    .forEach(t => console.log(`  ${t.slug} | ${t.name_zh} | ${t.count}個產品`));
  
  // 檢查 bag-material 維度的標籤
  console.log('\n=== bag-material 維度的標籤 (有使用次數的) ===');
  const bagMaterialDim = await p.filterDimension.findFirst({
    where: { slug: 'bag-material' },
    include: { tagMappings: { include: { tag: true } } }
  });
  
  if (bagMaterialDim) {
    bagMaterialDim.tagMappings.forEach(m => {
      const usedCount = allTags.get(m.tag.slug)?.count || 0;
      if (usedCount > 0) {
        console.log(`  ✓ ${m.tag.slug} | ${m.tag.name_zh} | 使用: ${usedCount}`);
      }
    });
    console.log('\n=== bag-material 沒有使用的標籤 ===');
    bagMaterialDim.tagMappings.forEach(m => {
      const usedCount = allTags.get(m.tag.slug)?.count || 0;
      if (usedCount === 0) {
        console.log(`  ✗ ${m.tag.slug} | ${m.tag.name_zh}`);
      }
    });
  }
  
  // 檢查 bag-style 維度的標籤
  console.log('\n=== bag-style 維度的標籤 (有使用次數的) ===');
  const bagStyleDim = await p.filterDimension.findFirst({
    where: { slug: 'bag-style' },
    include: { tagMappings: { include: { tag: true } } }
  });
  
  if (bagStyleDim) {
    bagStyleDim.tagMappings.forEach(m => {
      const usedCount = allTags.get(m.tag.slug)?.count || 0;
      if (usedCount > 0) {
        console.log(`  ✓ ${m.tag.slug} | ${m.tag.name_zh} | 使用: ${usedCount}`);
      }
    });
    console.log('\n=== bag-style 沒有使用的標籤 ===');
    bagStyleDim.tagMappings.forEach(m => {
      const usedCount = allTags.get(m.tag.slug)?.count || 0;
      if (usedCount === 0) {
        console.log(`  ✗ ${m.tag.slug} | ${m.tag.name_zh}`);
      }
    });
  }
  
  // 列出產品用的標籤但不在維度中的
  console.log('\n=== 產品使用但不在任何 bag 維度中的標籤 ===');
  const allDimTagSlugs = new Set();
  const bagDims = await p.filterDimension.findMany({
    where: { category: 'bag' },
    include: { tagMappings: { include: { tag: true } } }
  });
  bagDims.forEach(d => d.tagMappings.forEach(m => allDimTagSlugs.add(m.tag.slug)));
  
  Array.from(allTags.values())
    .filter(t => !allDimTagSlugs.has(t.slug))
    .sort((a, b) => b.count - a.count)
    .forEach(t => console.log(`  ${t.slug} | ${t.name_zh} | ${t.count}個產品`));
}

main().finally(() => p.$disconnect());
