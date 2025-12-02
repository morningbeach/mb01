import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 現有標籤 → [袋形, 材質...]
const mappingRules: Record<string, string[]> = {
  // 已存在的袋形標籤，只需確保在維度中
  'tote-bag': ['tote-bag'],
  'gusset-bag': ['gusset-bag'],
  'backpack': ['backpack'],
  
  // 帆布袋 → 托特 + 帆布材質
  'canvas-bag': ['tote-bag', 'canvas'],
  
  // 保冷/保溫袋
  'coolerbag-1764280414779': ['cooler-bag'],
  'insulationbag-1764280384176': ['cooler-bag'],
  
  // 不織布袋 → 托特 + 不織布材質
  'nonwoven-bag': ['tote-bag', 'non-woven'],
  
  // 杜邦紙袋 → 托特 + 杜邦紙材質
  'tyvek-bag': ['tote-bag', 'tyvek'],
  
  // 禮品袋
  'gift-bags': ['gift-bag'],
  
  // PVC袋 → 收納袋 + PVC材質
  'pvc-bag': ['pouch', 'pvc'],
  
  // 飲料提袋 → 杯袋
  'fabriccupsleeve--1764280939125': ['bottle-bag'],
  
  // 化妝包 → 收納袋
  'cosmetic-pouch': ['pouch'],
  
  // 純棉帆布 → 托特 + 棉 + 帆布
  'cotton-canvas': ['tote-bag', 'cotton', 'canvas'],
  
  // 紙袋 → 紙提袋 + 牛皮紙
  'paper-bag': ['paper-shopping-bag', 'kraft-bag'],
  
  // 酒類包裝 → 酒袋
  'wine-packaging': ['wine-bag'],
  
  // 麻布袋 → 托特 + 麻布
  'gunnybag-1764278867794': ['tote-bag', 'jute'],
  
  // 牛仔布 → 托特 + 棉
  'denim-1764278911774': ['tote-bag', 'cotton'],
  
  // 編織袋 → 托特 + PP編織
  'woven-bag': ['tote-bag', 'pp-woven'],
  
  // 束口袋
  'drawstringbag-1764279590387': ['drawstring-bag'],
  
  // 背心袋 → 環保購物袋
  'vest-typebag-1764281282158': ['eco-bag'],
  
  // 牛津布 → 只加材質
  'oxford-cloth': ['oxford'],
};

async function main() {
  console.log('🛍️ 開始將現有提袋標籤對應到新維度...\n');

  let totalAdded = 0;
  let errors: string[] = [];

  for (const [oldSlug, newSlugs] of Object.entries(mappingRules)) {
    // 1. 找到舊標籤
    const oldTag = await prisma.tag.findFirst({
      where: { slug: oldSlug },
      include: { ProductTag: { select: { productId: true } } }
    });

    if (!oldTag) {
      console.log(`⚠️ 找不到標籤: ${oldSlug}`);
      continue;
    }

    const productIds = oldTag.ProductTag.map(pt => pt.productId);
    if (productIds.length === 0) {
      console.log(`⏭️ ${oldSlug}: 無產品，跳過`);
      continue;
    }

    console.log(`\n📦 ${oldTag.name_zh || oldSlug} (${productIds.length}個產品)`);

    // 2. 為每個對應的新標籤處理
    for (const newSlug of newSlugs) {
      // 找到新標籤
      const newTag = await prisma.tag.findFirst({
        where: { slug: newSlug }
      });

      if (!newTag) {
        errors.push(`找不到新標籤: ${newSlug}`);
        console.log(`   ❌ 找不到: ${newSlug}`);
        continue;
      }

      // 為所有產品加上新標籤
      let addedCount = 0;
      for (const productId of productIds) {
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

      if (addedCount > 0) {
        console.log(`   ✅ → ${newTag.name_zh} (+${addedCount})`);
        totalAdded += addedCount;
      } else {
        console.log(`   ⏭️ → ${newTag.name_zh} (已存在)`);
      }
    }
  }

  console.log('\n==========================================');
  console.log(`✅ 完成！共新增 ${totalAdded} 個產品標籤關聯`);
  if (errors.length > 0) {
    console.log(`\n⚠️ 錯誤:`);
    errors.forEach(e => console.log(`   - ${e}`));
  }
  console.log('==========================================\n');

  await prisma.$disconnect();
}

main().catch(console.error);
