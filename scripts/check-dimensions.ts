import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 檢查所有 Tags
  console.log('=== 所有現有 Tags ===\n');
  const allTags = await prisma.tag.findMany({
    orderBy: { slug: 'asc' }
  });
  
  console.log('Slug | 中文名稱 | 英文名稱');
  console.log('-----|---------|----------');
  allTags.forEach(t => {
    console.log(`${t.slug} | ${t.name_zh || '-'} | ${t.name_en || '-'}`);
  });

  console.log(`\n總共 ${allTags.length} 個 Tags\n`);

  // 檢查產品與 Tag 的關聯
  console.log('\n=== 產品 Tag 關聯統計 ===\n');
  const products = await prisma.product.findMany({
    include: {
      tags: {
        include: { tag: true }
      }
    }
  });

  const tagUsage: Record<string, { count: number; slug: string; name_en: string }> = {};
  products.forEach(p => {
    p.tags.forEach(pt => {
      const tagName = pt.tag.name_zh || pt.tag.slug;
      if (!tagUsage[tagName]) {
        tagUsage[tagName] = { count: 0, slug: pt.tag.slug, name_en: pt.tag.name_en || '' };
      }
      tagUsage[tagName].count++;
    });
  });

  console.log(`總產品數: ${products.length}`);
  console.log(`有 Tag 的產品數: ${products.filter(p => p.tags.length > 0).length}`);
  console.log('\nTag 使用次數 (按使用量排序):');
  console.log('中文 | 英文 | Slug | 使用次數');
  console.log('-----|------|------|--------');
  Object.entries(tagUsage)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([tag, info]) => {
      console.log(`${tag} | ${info.name_en} | ${info.slug} | ${info.count}`);
    });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
