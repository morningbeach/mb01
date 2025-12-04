const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 找出有 drinkware tag 的產品，看看它們還有什麼其他標籤
  const drinkwareTag = await prisma.tag.findFirst({ where: { slug: 'drinkware' } });
  
  if (!drinkwareTag) {
    console.log('找不到 drinkware tag');
    return;
  }

  console.log('=== 杯具類產品的標籤分析 ===\n');
  
  const products = await prisma.product.findMany({
    where: {
      version: 2,
      status: 'ACTIVE',
      ProductTag: { some: { tagId: drinkwareTag.id } }
    },
    include: {
      ProductTag: {
        include: { Tag: true }
      }
    },
    take: 20
  });

  console.log(`找到 ${products.length} 個杯具類產品\n`);

  // 收集所有標籤
  const tagMap = new Map();
  products.forEach(p => {
    p.ProductTag.forEach(pt => {
      const tag = pt.Tag;
      if (!tagMap.has(tag.slug)) {
        tagMap.set(tag.slug, { name_zh: tag.name_zh, count: 0 });
      }
      tagMap.get(tag.slug).count++;
    });
  });

  // 排序顯示
  const sortedTags = Array.from(tagMap.entries()).sort((a, b) => b[1].count - a[1].count);
  console.log('杯具類產品的所有標籤（按出現次數）：');
  sortedTags.forEach(([slug, info]) => {
    console.log(`  ${info.name_zh} (${slug}): ${info.count}次`);
  });

  // 顯示幾個產品的詳細標籤
  console.log('\n\n=== 產品範例 ===');
  products.slice(0, 5).forEach(p => {
    console.log(`\n【${p.name_zh}】`);
    console.log('  標籤:', p.ProductTag.map(pt => pt.Tag.name_zh).join(', '));
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
