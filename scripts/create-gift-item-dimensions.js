const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 品項對應的子維度結構
const giftItemDimensions = {
  'drinkware': {
    name_zh: '杯具類型',
    name_en: 'Drinkware Type',
    slug: 'gift-drinkware',
    tags: [
      { slug: 'mug', name_zh: '馬克杯', name_en: 'Mug' },
      { slug: 'tumbler', name_zh: '隨行杯', name_en: 'Tumbler' },
      { slug: 'thermos', name_zh: '保溫杯', name_en: 'Thermos' },
      { slug: 'water-bottle', name_zh: '水瓶', name_en: 'Water Bottle' },
      { slug: 'wine-glass', name_zh: '酒杯', name_en: 'Wine Glass' },
      { slug: 'beer-mug', name_zh: '啤酒杯', name_en: 'Beer Mug' },
      { slug: 'coffee-cup', name_zh: '咖啡杯', name_en: 'Coffee Cup' },
      { slug: 'tea-cup', name_zh: '茶杯', name_en: 'Tea Cup' },
      { slug: 'travel-mug', name_zh: '旅行杯', name_en: 'Travel Mug' },
      { slug: 'sports-bottle', name_zh: '運動水壺', name_en: 'Sports Bottle' },
    ]
  },
  'gift-bags': {
    name_zh: '袋類類型',
    name_en: 'Gift Bag Type',
    slug: 'gift-bag-type',
    tags: [
      { slug: 'gift-tote', name_zh: '禮品提袋', name_en: 'Gift Tote' },
      { slug: 'gift-pouch', name_zh: '禮品束口袋', name_en: 'Gift Pouch' },
      { slug: 'gift-drawstring', name_zh: '禮品束繩袋', name_en: 'Gift Drawstring' },
      { slug: 'gift-paper-bag', name_zh: '禮品紙袋', name_en: 'Gift Paper Bag' },
      { slug: 'gift-fabric-bag', name_zh: '禮品布袋', name_en: 'Gift Fabric Bag' },
    ]
  },
  'stationery': {
    name_zh: '文具類型',
    name_en: 'Stationery Type',
    slug: 'gift-stationery',
    tags: [
      { slug: 'notebook', name_zh: '筆記本', name_en: 'Notebook' },
      { slug: 'pen', name_zh: '原子筆', name_en: 'Pen' },
      { slug: 'pencil-set', name_zh: '鉛筆組', name_en: 'Pencil Set' },
      { slug: 'sticky-notes', name_zh: '便利貼', name_en: 'Sticky Notes' },
      { slug: 'desk-organizer', name_zh: '桌面收納', name_en: 'Desk Organizer' },
      { slug: 'bookmark', name_zh: '書籤', name_en: 'Bookmark' },
      { slug: 'ruler', name_zh: '尺', name_en: 'Ruler' },
      { slug: 'eraser', name_zh: '橡皮擦', name_en: 'Eraser' },
    ]
  },
  'tech-accessories': {
    name_zh: '3C配件類型',
    name_en: 'Tech Accessories Type',
    slug: 'gift-tech',
    tags: [
      { slug: 'phone-stand', name_zh: '手機架', name_en: 'Phone Stand' },
      { slug: 'phone-case', name_zh: '手機殼', name_en: 'Phone Case' },
      { slug: 'power-bank', name_zh: '行動電源', name_en: 'Power Bank' },
      { slug: 'usb-cable', name_zh: 'USB線', name_en: 'USB Cable' },
      { slug: 'earphone-case', name_zh: '耳機盒', name_en: 'Earphone Case' },
      { slug: 'mouse-pad', name_zh: '滑鼠墊', name_en: 'Mouse Pad' },
      { slug: 'webcam-cover', name_zh: '鏡頭蓋', name_en: 'Webcam Cover' },
      { slug: 'screen-cleaner', name_zh: '螢幕清潔組', name_en: 'Screen Cleaner' },
    ]
  },
  'card-holders': {
    name_zh: '證件卡套類型',
    name_en: 'Card Holder Type',
    slug: 'gift-card-holder',
    tags: [
      { slug: 'id-card-holder', name_zh: '證件套', name_en: 'ID Card Holder' },
      { slug: 'badge-holder', name_zh: '識別證套', name_en: 'Badge Holder' },
      { slug: 'card-wallet', name_zh: '卡夾', name_en: 'Card Wallet' },
      { slug: 'passport-holder', name_zh: '護照套', name_en: 'Passport Holder' },
      { slug: 'lanyard-card', name_zh: '掛繩證件套', name_en: 'Lanyard Card Holder' },
    ]
  },
  'apparel-accessories': {
    name_zh: '服飾配件類型',
    name_en: 'Apparel Accessories Type',
    slug: 'gift-apparel',
    tags: [
      { slug: 'cap', name_zh: '帽子', name_en: 'Cap' },
      { slug: 'scarf', name_zh: '圍巾', name_en: 'Scarf' },
      { slug: 'gloves', name_zh: '手套', name_en: 'Gloves' },
      { slug: 'socks', name_zh: '襪子', name_en: 'Socks' },
      { slug: 'belt', name_zh: '皮帶', name_en: 'Belt' },
      { slug: 'tie', name_zh: '領帶', name_en: 'Tie' },
      { slug: 'bandana', name_zh: '頭巾', name_en: 'Bandana' },
    ]
  },
  'keychains-accessories': {
    name_zh: '鑰匙圈飾品類型',
    name_en: 'Keychain Type',
    slug: 'gift-keychain',
    tags: [
      { slug: 'metal-keychain', name_zh: '金屬鑰匙圈', name_en: 'Metal Keychain' },
      { slug: 'leather-keychain', name_zh: '皮革鑰匙圈', name_en: 'Leather Keychain' },
      { slug: 'acrylic-keychain', name_zh: '壓克力鑰匙圈', name_en: 'Acrylic Keychain' },
      { slug: 'rubber-keychain', name_zh: '橡膠鑰匙圈', name_en: 'Rubber Keychain' },
      { slug: 'charm', name_zh: '吊飾', name_en: 'Charm' },
      { slug: 'pin-badge', name_zh: '徽章', name_en: 'Pin Badge' },
    ]
  },
  'home-living': {
    name_zh: '居家用品類型',
    name_en: 'Home Living Type',
    slug: 'gift-home',
    tags: [
      { slug: 'coaster', name_zh: '杯墊', name_en: 'Coaster' },
      { slug: 'cushion', name_zh: '抱枕', name_en: 'Cushion' },
      { slug: 'blanket', name_zh: '毛毯', name_en: 'Blanket' },
      { slug: 'towel', name_zh: '毛巾', name_en: 'Towel' },
      { slug: 'candle-holder', name_zh: '燭台', name_en: 'Candle Holder' },
      { slug: 'photo-frame', name_zh: '相框', name_en: 'Photo Frame' },
      { slug: 'clock', name_zh: '時鐘', name_en: 'Clock' },
    ]
  },
  'fragrance': {
    name_zh: '香氛類型',
    name_en: 'Fragrance Type',
    slug: 'gift-fragrance',
    tags: [
      { slug: 'scented-candle', name_zh: '香氛蠟燭', name_en: 'Scented Candle' },
      { slug: 'diffuser', name_zh: '擴香', name_en: 'Diffuser' },
      { slug: 'sachet', name_zh: '香包', name_en: 'Sachet' },
      { slug: 'essential-oil', name_zh: '精油', name_en: 'Essential Oil' },
      { slug: 'room-spray', name_zh: '室內噴霧', name_en: 'Room Spray' },
    ]
  },
  'outdoor-sports': {
    name_zh: '戶外運動類型',
    name_en: 'Outdoor Sports Type',
    slug: 'gift-outdoor',
    tags: [
      { slug: 'umbrella', name_zh: '雨傘', name_en: 'Umbrella' },
      { slug: 'fan', name_zh: '扇子', name_en: 'Fan' },
      { slug: 'fitness-band', name_zh: '運動手環', name_en: 'Fitness Band' },
      { slug: 'yoga-mat', name_zh: '瑜伽墊', name_en: 'Yoga Mat' },
      { slug: 'jump-rope', name_zh: '跳繩', name_en: 'Jump Rope' },
      { slug: 'frisbee', name_zh: '飛盤', name_en: 'Frisbee' },
    ]
  },
  'toys-games': {
    name_zh: '玩具遊戲類型',
    name_en: 'Toys Games Type',
    slug: 'gift-toys',
    tags: [
      { slug: 'puzzle', name_zh: '拼圖', name_en: 'Puzzle' },
      { slug: 'plush-toy', name_zh: '絨毛玩偶', name_en: 'Plush Toy' },
      { slug: 'card-game', name_zh: '撲克牌', name_en: 'Card Game' },
      { slug: 'stress-ball', name_zh: '紓壓球', name_en: 'Stress Ball' },
      { slug: 'fidget-toy', name_zh: '減壓玩具', name_en: 'Fidget Toy' },
    ]
  },
  'office-business': {
    name_zh: '辦公商務類型',
    name_en: 'Office Business Type',
    slug: 'gift-office',
    tags: [
      { slug: 'business-card-case', name_zh: '名片夾', name_en: 'Business Card Case' },
      { slug: 'desk-clock', name_zh: '桌上時鐘', name_en: 'Desk Clock' },
      { slug: 'paper-weight', name_zh: '紙鎮', name_en: 'Paper Weight' },
      { slug: 'letter-opener', name_zh: '拆信刀', name_en: 'Letter Opener' },
      { slug: 'desk-calendar', name_zh: '桌曆', name_en: 'Desk Calendar' },
      { slug: 'pen-holder', name_zh: '筆筒', name_en: 'Pen Holder' },
    ]
  },
};

async function main() {
  console.log('=== 開始建立禮品品項子維度 ===\n');

  let dimensionOrder = 100; // 從 100 開始，避免與現有衝突

  for (const [parentSlug, dimConfig] of Object.entries(giftItemDimensions)) {
    console.log(`\n建立維度: ${dimConfig.name_zh} (${dimConfig.slug})`);
    
    // 檢查維度是否已存在
    let dimension = await prisma.filterDimension.findFirst({
      where: { slug: dimConfig.slug }
    });

    if (!dimension) {
      // 建立新維度
      dimension = await prisma.filterDimension.create({
        data: {
          slug: dimConfig.slug,
          name_zh: dimConfig.name_zh,
          name_en: dimConfig.name_en,
          category: 'gift',
          icon: 'Package',
          order: dimensionOrder++,
          is_active: true,
          allow_multiple: true,
        }
      });
      console.log(`  ✓ 維度已建立: ${dimension.id}`);
    } else {
      console.log(`  - 維度已存在: ${dimension.id}`);
    }

    // 建立標籤
    for (const tagConfig of dimConfig.tags) {
      // 檢查標籤是否已存在
      let tag = await prisma.tag.findFirst({
        where: { slug: tagConfig.slug }
      });

      if (!tag) {
        // 建立新標籤
        tag = await prisma.tag.create({
          data: {
            id: `tag-gift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            slug: tagConfig.slug,
            name: tagConfig.name_zh,
            name_zh: tagConfig.name_zh,
            name_en: tagConfig.name_en,
            version: 2,
          }
        });
        console.log(`    ✓ 標籤已建立: ${tagConfig.name_zh}`);
      } else {
        console.log(`    - 標籤已存在: ${tagConfig.name_zh}`);
      }

      // 建立維度-標籤映射
      const existingMapping = await prisma.dimensionTagMapping.findFirst({
        where: {
          dimensionId: dimension.id,
          tagId: tag.id,
        }
      });

      if (!existingMapping) {
        await prisma.dimensionTagMapping.create({
          data: {
            dimensionId: dimension.id,
            tagId: tag.id,
          }
        });
        console.log(`    ✓ 映射已建立: ${dimConfig.slug} → ${tagConfig.slug}`);
      }
    }
  }

  console.log('\n\n=== 建立品項到子維度的對應表 ===\n');
  
  // 輸出對應關係供前端使用
  const mapping = {};
  for (const [parentSlug, dimConfig] of Object.entries(giftItemDimensions)) {
    mapping[parentSlug] = dimConfig.slug;
  }
  console.log('giftItemToDimensionMap:', JSON.stringify(mapping, null, 2));

  console.log('\n\n=== 完成！===');
}

main().catch(console.error).finally(() => prisma.$disconnect());
