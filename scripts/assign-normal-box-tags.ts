import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 分析一般紙盒標籤...\n');

  // 1. 查看成型紙盒維度
  const foldingCarton = await prisma.filterDimension.findFirst({
    where: { slug: 'folding-carton' },
    include: {
      tagMappings: { include: { tag: true } }
    }
  });

  console.log('=== 成型紙盒維度 ===');
  console.log('現有標籤:');
  foldingCarton?.tagMappings.forEach(m => {
    console.log(`  - ${m.tag.name_zh || m.tag.name} (${m.tag.slug})`);
  });

  // 2. 找到一般紙盒標籤
  const normalBoxTag = await prisma.tag.findFirst({
    where: { OR: [{ name_zh: '一般紙盒' }, { name: '一般紙盒' }] }
  });

  if (!normalBoxTag) {
    console.log('\n❌ 找不到「一般紙盒」標籤');
    return;
  }

  console.log(`\n✅ 找到一般紙盒標籤: ${normalBoxTag.id}`);

  // 3. 找到有一般紙盒標籤的產品
  const productsWithTag = await prisma.productTag.findMany({
    where: { tagId: normalBoxTag.id },
    include: { 
      Product: { select: { id: true, name_zh: true, slug: true } }
    }
  });

  console.log(`\n📦 有「一般紙盒」標籤的產品: ${productsWithTag.length} 個`);

  // 4. 檢查或建立「未分類」標籤
  let uncategorizedTag = await prisma.tag.findFirst({
    where: { slug: 'uncategorized-folding' }
  });

  if (!uncategorizedTag) {
    const newId = `tag_uncategorized_${Date.now()}`;
    uncategorizedTag = await prisma.tag.create({
      data: {
        id: newId,
        name: 'Uncategorized',
        name_zh: '未分類成型盒',
        name_en: 'Uncategorized',
        slug: 'uncategorized-folding',
        color: '#9ca3af',
        version: 2
      }
    });
    console.log('\n✅ 建立「未分類成型盒」標籤');

    // 加入成型紙盒維度
    if (foldingCarton) {
      await prisma.dimensionTagMapping.create({
        data: {
          dimensionId: foldingCarton.id,
          tagId: uncategorizedTag.id
        }
      });
      console.log('✅ 已加入成型紙盒維度');
    }
  }

  // 5. 為這些產品加入「未分類成型盒」標籤
  let added = 0;
  for (const pt of productsWithTag) {
    // 檢查是否已有此標籤
    const exists = await prisma.productTag.findFirst({
      where: { productId: pt.productId, tagId: uncategorizedTag.id }
    });

    if (!exists) {
      await prisma.productTag.create({
        data: { productId: pt.productId, tagId: uncategorizedTag.id }
      });
      added++;
      console.log(`  + ${pt.Product?.name_zh || pt.Product?.slug}`);
    }
  }

  console.log(`\n✅ 完成！新增了 ${added} 個產品的「未分類成型盒」標籤`);

  await prisma.$disconnect();
}

main().catch(console.error);
