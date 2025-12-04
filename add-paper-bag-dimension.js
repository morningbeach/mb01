const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== 新增紙袋維度到 bag 類別 ===\n');

  // 1. 建立「紙袋材質」維度
  const paperBagDim = await prisma.filterDimension.create({
    data: {
      slug: 'paper-bag-material',
      category: 'bag',
      name_zh: '紙袋材質',
      name_en: 'Paper Bag Material',
      icon: 'FileText',
      order: 2, // 放在材質後面
      is_active: true,
      allow_multiple: true,
    }
  });
  console.log(`✅ 建立維度: ${paperBagDim.name_zh} (${paperBagDim.slug})`);

  // 2. 找出紙袋相關的標籤
  const paperTags = await prisma.tag.findMany({
    where: {
      slug: {
        in: [
          'kraft-paper',      // 牛皮紙
          'kraft-bag',        // 牛皮紙袋
          'art-paper-bag',    // 銅版紙袋
          'paper-bag',        // 紙袋
          'paper-shopping-bag', // 紙提袋
          'gift-paper-bag',   // 禮品紙袋
          'tyvek',            // 杜邦紙
          'tyvek-bag',        // 杜邦紙袋
          'washed-leather-paper', // 水洗牛皮紙
          'coated-paper',     // 銅版紙
          'special-paper',    // 特種紙
          'white-cardboard',  // 白卡紙
          'art-paper',        // 美術紙
          'pearl-paper',      // 珠光紙
          'stardream-paper',  // 星幻紙
          'fsc-paper',        // FSC認證紙
        ]
      }
    }
  });

  console.log(`\n找到 ${paperTags.length} 個紙袋相關標籤:`);
  
  // 3. 建立維度標籤映射
  for (let i = 0; i < paperTags.length; i++) {
    const tag = paperTags[i];
    await prisma.dimensionTagMapping.create({
      data: {
        dimensionId: paperBagDim.id,
        tagId: tag.id,
        order: i + 1,
      }
    });
    console.log(`  - ${tag.name_zh || tag.name} (${tag.slug})`);
  }

  // 4. 更新其他維度的順序
  await prisma.filterDimension.updateMany({
    where: { 
      category: 'bag',
      order: { gte: 2 },
      NOT: { id: paperBagDim.id }
    },
    data: {
      order: { increment: 1 }
    }
  });

  console.log('\n✅ 紙袋維度新增完成！');

  // 顯示更新後的維度列表
  const allDims = await prisma.filterDimension.findMany({
    where: { category: 'bag' },
    orderBy: { order: 'asc' }
  });
  console.log('\n=== 更新後的 Bag 維度列表 ===');
  for (const dim of allDims) {
    console.log(`${dim.order}. ${dim.name_zh} (${dim.slug})`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
