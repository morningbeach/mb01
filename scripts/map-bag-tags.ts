import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 提袋相關的舊標籤 -> 新維度標籤的對應
const tagMappings: Record<string, string[]> = {
  // 袋形 (bag-style)
  '托特袋': ['tote-bag'],
  '帆布袋': ['tote-bag'],
  '束口袋': ['drawstring-bag'],
  '保冷袋': ['cooler-bag'],
  '保溫袋': ['cooler-bag'],
  '便當袋': ['lunch-bag'],
  '化妝包': ['pouch'],
  '後背包': ['backpack'],
  '手提袋': ['tote-bag'],
  '購物袋': ['eco-bag'],
  '禮品袋': ['gift-bag'],
  '五面袋': ['gusset-bag'],
  '背心袋': ['eco-bag'],
  '飲料提袋': ['bottle-bag'],
  
  // 材質 (bag-material)
  '帆布': ['canvas'],
  '棉布': ['cotton'],
  '不織布': ['non-woven'],
  '不織布袋': ['non-woven'],
  '牛津布': ['oxford'],
  '杜邦紙袋': ['tyvek'],
  '麻布袋': ['jute'],
  'PVC袋': ['pvc'],
  '編織袋': ['pp-woven'],
  '純棉帆布': ['cotton', 'canvas'],
  
  // 印刷工藝 (bag-print)
  '熱轉印': ['heat-transfer'],
  '熱昇華': ['sublimation'],
  '網版印刷': ['screen-print'],
  '覆膜印刷': ['laminated-print'],
  '刺繡': ['embroidery'],
  
  // 特色功能 (bag-feature)
  '防水': ['waterproof'],
  '環保': ['recycled-material'],
  '幻彩': ['transparent-window'],
  '透明': ['transparent-window'],
  
  // 應用場景 (bag-application)
  '旅行收納': ['travel-outdoor'],
  '活動周邊': ['trade-show'],
  '宣傳推廣': ['trade-show'],
  '禮品包裝': ['corporate-gift-bag'],
  '食品包裝': ['food-delivery'],
};

async function main() {
  console.log('🔍 分析現有提袋相關標籤...\n');

  // 1. 取得所有有產品的標籤
  const allTags = await prisma.tag.findMany({
    include: { ProductTag: { select: { productId: true } } }
  });

  const tagsWithProducts = allTags.filter(t => t.ProductTag.length > 0);
  
  // 2. 找出可能是提袋相關的標籤
  const bagKeywords = ['袋', '包', '帆布', '棉', '布', '保冷', '保溫', 'PVC', '編織', '杜邦', '麻', '牛津'];
  const bagRelatedTags = tagsWithProducts.filter(t => 
    bagKeywords.some(k => (t.name_zh || t.name || '').includes(k))
  );

  console.log('=== 提袋相關的現有標籤 ===\n');
  bagRelatedTags.forEach(t => {
    console.log(`${t.name_zh || t.name} (${t.slug}): ${t.ProductTag.length}個產品`);
  });

  // 3. 取得新維度的標籤
  const newDimTags = await prisma.dimensionTagMapping.findMany({
    where: { dimension: { category: 'bag' } },
    include: { tag: true }
  });
  const newTagSlugs = new Set(newDimTags.map(m => m.tag.slug));

  console.log('\n=== 開始關聯產品到新維度標籤 ===\n');

  let totalMapped = 0;

  for (const oldTag of bagRelatedTags) {
    const oldTagName = oldTag.name_zh || oldTag.name || '';
    const mappingKeys = Object.keys(tagMappings).filter(k => oldTagName.includes(k));
    
    if (mappingKeys.length === 0) {
      console.log(`⚠️ ${oldTagName}: 無對應規則`);
      continue;
    }

    // 收集所有對應的新標籤 slug
    const newSlugs = new Set<string>();
    mappingKeys.forEach(k => tagMappings[k].forEach(s => newSlugs.add(s)));

    // 取得這些新標籤
    const targetTags = await prisma.tag.findMany({
      where: { slug: { in: Array.from(newSlugs) } }
    });

    if (targetTags.length === 0) {
      console.log(`⚠️ ${oldTagName}: 找不到對應的新標籤`);
      continue;
    }

    // 為每個有此舊標籤的產品加上新標籤
    const productIds = oldTag.ProductTag.map(pt => pt.productId);
    let addedCount = 0;

    for (const productId of productIds) {
      for (const newTag of targetTags) {
        // 檢查是否已存在
        const exists = await prisma.productTag.findFirst({
          where: { productId, tagId: newTag.id }
        });

        if (!exists) {
          await prisma.productTag.create({
            data: { productId, tagId: newTag.id }
          });
          addedCount++;
        }
      }
    }

    if (addedCount > 0) {
      console.log(`✅ ${oldTagName} → ${targetTags.map(t => t.name_zh).join(', ')}: +${addedCount}`);
      totalMapped += addedCount;
    }
  }

  console.log(`\n==========================================`);
  console.log(`✅ 完成！共新增 ${totalMapped} 個產品標籤關聯`);
  console.log(`==========================================\n`);

  await prisma.$disconnect();
}

main().catch(console.error);
