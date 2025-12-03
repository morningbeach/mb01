const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

/**
 * 修復 bag 維度的標籤映射
 * 將產品實際使用的標籤加入到對應的維度
 */

// 材質標籤映射：產品使用的 slug → 應該加入的維度
const materialTagMappings = {
  'canvas-bag': 'bag-material',         // 帆布袋 → 材質
  'cotton-canvas': 'bag-material',      // 純棉帆布 → 材質
  'pvc-bag': 'bag-material',            // PVC袋 → 材質
  'tyvek-bag': 'bag-material',          // 杜邦紙袋 → 材質
  'nonwoven-bag': 'bag-material',       // 不織布袋 → 材質
  'denim-1764278911774': 'bag-material', // 牛仔布 → 材質
  'gunnybag-1764278867794': 'bag-material', // 麻布袋 → 材質
  'woven-bag': 'bag-material',          // 編織袋 → 材質
};

// 袋形標籤映射
const styleTagMappings = {
  'cosmetic-pouch': 'bag-style',        // 化妝包 → 袋形
  'coolerbag-1764280414779': 'bag-style', // 保冷袋 → 袋形
  'insulationbag-1764280384176': 'bag-style', // 保溫袋 → 袋形
  'vest-typebag-1764281280937': 'bag-style', // 背心袋 → 袋形
  'vest-typebag-1764281282158': 'bag-style', // 背心袋(重複) → 袋形
};

// 印刷工藝標籤映射
const printTagMappings = {
  'heattransfer-1764279445771': 'bag-print', // 熱轉印 → 印刷
  'screen-printing': 'bag-print',       // 網版印刷 → 印刷
  'sublimation-1764279640473': 'bag-print', // 熱昇華 → 印刷
  'laminatedprinting-1764279492031': 'bag-print', // 覆膜印刷 → 印刷
};

// 特色功能標籤映射
const featureTagMappings = {
  'eco-friendly': 'bag-eco',            // 環保 → 環保認證
  'iridescent-1764280694411': 'bag-feature', // 幻彩 → 特色
  'iridescent-1764280695680': 'bag-feature', // 幻彩 → 特色
  'travelstorage-1764280316443': 'bag-application', // 旅行收納 → 應用場景
};

// 應用場景標籤映射
const applicationTagMappings = {
  'event-merch': 'bag-application',     // 活動周邊 → 應用場景
  'promotional': 'bag-application',     // 宣傳推廣 → 應用場景
  'fashion-1764279610187': 'bag-application', // 時尚 → 應用場景
};

async function main() {
  console.log('=== 開始修復 bag 維度標籤映射 ===\n');
  
  // 合併所有映射
  const allMappings = {
    ...materialTagMappings,
    ...styleTagMappings,
    ...printTagMappings,
    ...featureTagMappings,
    ...applicationTagMappings,
  };
  
  // 取得所有維度
  const dimensions = await p.filterDimension.findMany({
    where: { category: 'bag' },
    include: { tagMappings: true }
  });
  const dimBySlug = Object.fromEntries(dimensions.map(d => [d.slug, d]));
  
  // 取得所有標籤
  const tags = await p.tag.findMany();
  const tagBySlug = Object.fromEntries(tags.map(t => [t.slug, t]));
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const [tagSlug, dimSlug] of Object.entries(allMappings)) {
    const tag = tagBySlug[tagSlug];
    const dim = dimBySlug[dimSlug];
    
    if (!tag) {
      console.log(`❌ 找不到標籤: ${tagSlug}`);
      continue;
    }
    
    if (!dim) {
      console.log(`❌ 找不到維度: ${dimSlug}`);
      continue;
    }
    
    // 檢查是否已存在映射
    const exists = dim.tagMappings.some(m => m.tagId === tag.id);
    if (exists) {
      console.log(`⏭️  已存在: ${tag.name_zh || tagSlug} → ${dim.name_zh}`);
      skippedCount++;
      continue;
    }
    
    // 建立映射
    await p.dimensionTagMapping.create({
      data: {
        dimensionId: dim.id,
        tagId: tag.id,
        order: dim.tagMappings.length + 1
      }
    });
    
    console.log(`✅ 新增: ${tag.name_zh || tagSlug} → ${dim.name_zh}`);
    addedCount++;
  }
  
  console.log(`\n=== 完成 ===`);
  console.log(`新增: ${addedCount} 個映射`);
  console.log(`跳過: ${skippedCount} 個（已存在）`);
  
  // 驗證結果
  console.log('\n=== 驗證結果 ===\n');
  
  const updatedDims = await p.filterDimension.findMany({
    where: { category: 'bag' },
    include: { 
      tagMappings: { 
        include: { tag: true },
        orderBy: { order: 'asc' }
      } 
    },
    orderBy: { order: 'asc' }
  });
  
  for (const dim of updatedDims) {
    // 計算每個標籤的產品數
    console.log(`${dim.name_zh} (${dim.tagMappings.length} 個標籤):`);
    for (const m of dim.tagMappings) {
      const count = await p.productTag.count({ where: { tagId: m.tag.id } });
      if (count > 0) {
        console.log(`  ✓ ${m.tag.name_zh || m.tag.slug}: ${count}`);
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => p.$disconnect());
