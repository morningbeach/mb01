import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// 禮品產品資料 (Gift Products)
// ==========================================

interface GiftProduct {
  slug: string;
  name_zh: string;
  name_en: string;
  category: string; // gift-type tag slug
}

interface GiftCategory {
  slug: string;
  name_zh: string;
  name_en: string;
  products: Omit<GiftProduct, 'category'>[];
}

const giftCategories: GiftCategory[] = [
  // ==========================================
  // 一、杯具類 (Drinkware) - 15項
  // ==========================================
  {
    slug: 'drinkware',
    name_zh: '杯具類',
    name_en: 'Drinkware',
    products: [
      { slug: 'ceramic-mug', name_zh: '馬克杯', name_en: 'Ceramic Mug' },
      { slug: 'insulated-tumbler', name_zh: '保溫杯', name_en: 'Insulated Tumbler' },
      { slug: 'glass-cup', name_zh: '玻璃杯', name_en: 'Glass Cup' },
      { slug: 'travel-mug', name_zh: '隨行杯', name_en: 'Travel Mug' },
      { slug: 'beer-glass', name_zh: '啤酒杯', name_en: 'Beer Glass' },
      { slug: 'wine-glass', name_zh: '紅酒杯', name_en: 'Wine Glass' },
      { slug: 'coffee-cup-set', name_zh: '咖啡杯組', name_en: 'Coffee Cup Set' },
      { slug: 'stainless-steel-straw-set', name_zh: '不鏽鋼吸管組', name_en: 'Stainless Steel Straw Set' },
      { slug: 'collapsible-silicone-cup', name_zh: '矽膠摺疊杯', name_en: 'Collapsible Silicone Cup' },
      { slug: 'sports-water-bottle', name_zh: '運動水壺', name_en: 'Sports Water Bottle' },
      { slug: 'kids-water-bottle', name_zh: '兒童水壺', name_en: 'Kids Water Bottle' },
      { slug: 'ice-keeper-tumbler', name_zh: '冰霸杯', name_en: 'Ice Keeper Tumbler' },
      { slug: 'enamel-mug', name_zh: '琺瑯杯', name_en: 'Enamel Mug' },
      { slug: 'double-wall-glass', name_zh: '雙層玻璃杯', name_en: 'Double Wall Glass' },
      { slug: 'ceramic-tea-cup', name_zh: '陶瓷茶杯', name_en: 'Ceramic Tea Cup' },
    ],
  },
  // ==========================================
  // 二、袋類 (Bags) - 15項
  // ==========================================
  {
    slug: 'gift-bags',
    name_zh: '袋類',
    name_en: 'Bags',
    products: [
      { slug: 'gift-tote-bag', name_zh: '環保袋', name_en: 'Tote Bag' },
      { slug: 'gift-canvas-bag', name_zh: '帆布袋', name_en: 'Canvas Bag' },
      { slug: 'gift-drawstring-bag', name_zh: '束口袋', name_en: 'Drawstring Bag' },
      { slug: 'gift-shopping-bag', name_zh: '購物袋', name_en: 'Shopping Bag' },
      { slug: 'gift-cosmetic-bag', name_zh: '化妝包', name_en: 'Cosmetic Bag' },
      { slug: 'gift-pencil-case', name_zh: '筆袋', name_en: 'Pencil Case' },
      { slug: 'gift-storage-pouch', name_zh: '收納袋', name_en: 'Storage Pouch' },
      { slug: 'gift-travel-organizer', name_zh: '旅行收納包', name_en: 'Travel Organizer' },
      { slug: 'gift-backpack', name_zh: '後背包', name_en: 'Backpack' },
      { slug: 'gift-fanny-pack', name_zh: '腰包', name_en: 'Fanny Pack' },
      { slug: 'gift-crossbody-bag', name_zh: '斜背包', name_en: 'Crossbody Bag' },
      { slug: 'gift-handbag', name_zh: '手提袋', name_en: 'Handbag' },
      { slug: 'gift-laptop-bag', name_zh: '電腦包', name_en: 'Laptop Bag' },
      { slug: 'gift-cooler-bag', name_zh: '保冷袋', name_en: 'Cooler Bag' },
      { slug: 'gift-waterproof-bag', name_zh: '防水袋', name_en: 'Waterproof Bag' },
    ],
  },
  // ==========================================
  // 三、文具類 (Stationery) - 10項
  // ==========================================
  {
    slug: 'stationery',
    name_zh: '文具類',
    name_en: 'Stationery',
    products: [
      { slug: 'notebook', name_zh: '筆記本', name_en: 'Notebook' },
      { slug: 'ballpoint-pen', name_zh: '原子筆', name_en: 'Ballpoint Pen' },
      { slug: 'highlighter', name_zh: '螢光筆', name_en: 'Highlighter' },
      { slug: 'sticky-notes', name_zh: '便條紙', name_en: 'Sticky Notes' },
      { slug: 'folder', name_zh: '文件夾', name_en: 'Folder' },
      { slug: 'mouse-pad', name_zh: '滑鼠墊', name_en: 'Mouse Pad' },
      { slug: 'bookmark', name_zh: '書籤', name_en: 'Bookmark' },
      { slug: 'business-card-holder', name_zh: '名片夾', name_en: 'Business Card Holder' },
      { slug: 'gift-desk-calendar', name_zh: '桌曆', name_en: 'Desk Calendar' },
      { slug: 'planner', name_zh: '手帳', name_en: 'Planner' },
    ],
  },
  // ==========================================
  // 四、3C配件類 (Tech Accessories) - 15項
  // ==========================================
  {
    slug: 'tech-accessories',
    name_zh: '3C配件類',
    name_en: 'Tech Accessories',
    products: [
      { slug: 'phone-stand', name_zh: '手機支架', name_en: 'Phone Stand' },
      { slug: 'power-bank', name_zh: '行動電源', name_en: 'Power Bank' },
      { slug: 'usb-flash-drive', name_zh: 'USB隨身碟', name_en: 'USB Flash Drive' },
      { slug: 'earphones', name_zh: '耳機', name_en: 'Earphones' },
      { slug: 'charging-cable', name_zh: '充電線', name_en: 'Charging Cable' },
      { slug: 'wireless-charger', name_zh: '無線充電盤', name_en: 'Wireless Charger' },
      { slug: 'phone-case', name_zh: '手機殼', name_en: 'Phone Case' },
      { slug: 'bluetooth-speaker', name_zh: '藍牙喇叭', name_en: 'Bluetooth Speaker' },
      { slug: 'bluetooth-earbuds', name_zh: '藍牙耳機', name_en: 'Bluetooth Earbuds' },
      { slug: 'cable-organizer', name_zh: '集線器', name_en: 'Cable Organizer' },
      { slug: 'phone-ring-holder', name_zh: '手機指環', name_en: 'Phone Ring Holder' },
      { slug: 'car-phone-mount', name_zh: '車用手機架', name_en: 'Car Phone Mount' },
      { slug: 'waterproof-phone-pouch', name_zh: '手機防水袋', name_en: 'Waterproof Phone Pouch' },
      { slug: 'usb-fan', name_zh: 'USB風扇', name_en: 'USB Fan' },
      { slug: 'led-night-light', name_zh: 'LED小夜燈', name_en: 'LED Night Light' },
    ],
  },
  // ==========================================
  // 五、證件/卡套類 (ID & Card Holders) - 10項
  // ==========================================
  {
    slug: 'card-holders',
    name_zh: '證件/卡套類',
    name_en: 'ID & Card Holders',
    products: [
      { slug: 'id-card-holder', name_zh: '證件套', name_en: 'ID Card Holder' },
      { slug: 'lanyard', name_zh: '證件掛繩', name_en: 'Lanyard' },
      { slug: 'transit-card-holder', name_zh: '悠遊卡套', name_en: 'Transit Card Holder' },
      { slug: 'credit-card-holder', name_zh: '信用卡夾', name_en: 'Credit Card Holder' },
      { slug: 'passport-holder', name_zh: '護照套', name_en: 'Passport Holder' },
      { slug: 'luggage-tag', name_zh: '行李吊牌', name_en: 'Luggage Tag' },
      { slug: 'badge-holder', name_zh: '工作證套', name_en: 'Badge Holder' },
      { slug: 'retractable-badge-reel', name_zh: '伸縮證件夾', name_en: 'Retractable Badge Reel' },
      { slug: 'card-wallet', name_zh: '票卡夾', name_en: 'Card Wallet' },
      { slug: 'rfid-blocking-sleeve', name_zh: 'RFID防盜卡套', name_en: 'RFID Blocking Card Sleeve' },
    ],
  },
  // ==========================================
  // 六、服飾配件類 (Apparel & Accessories) - 20項
  // ==========================================
  {
    slug: 'apparel-accessories',
    name_zh: '服飾配件類',
    name_en: 'Apparel & Accessories',
    products: [
      { slug: 't-shirt', name_zh: 'T恤', name_en: 'T-Shirt' },
      { slug: 'polo-shirt', name_zh: 'POLO衫', name_en: 'Polo Shirt' },
      { slug: 'cap', name_zh: '帽子', name_en: 'Cap' },
      { slug: 'bucket-hat', name_zh: '漁夫帽', name_en: 'Bucket Hat' },
      { slug: 'scarf', name_zh: '圍巾', name_en: 'Scarf' },
      { slug: 'necktie', name_zh: '領帶', name_en: 'Necktie' },
      { slug: 'bow-tie', name_zh: '領結', name_en: 'Bow Tie' },
      { slug: 'socks', name_zh: '襪子', name_en: 'Socks' },
      { slug: 'gloves', name_zh: '手套', name_en: 'Gloves' },
      { slug: 'cufflinks', name_zh: '袖扣', name_en: 'Cufflinks' },
      { slug: 'belt', name_zh: '皮帶', name_en: 'Belt' },
      { slug: 'wristband', name_zh: '手環', name_en: 'Wristband' },
      { slug: 'silicone-wristband', name_zh: '矽膠手環', name_en: 'Silicone Wristband' },
      { slug: 'hair-tie', name_zh: '髮圈', name_en: 'Hair Tie' },
      { slug: 'hair-clip', name_zh: '髮夾', name_en: 'Hair Clip' },
      { slug: 'face-mask', name_zh: '口罩', name_en: 'Face Mask' },
      { slug: 'eye-mask', name_zh: '眼罩', name_en: 'Eye Mask' },
      { slug: 'apron', name_zh: '圍裙', name_en: 'Apron' },
      { slug: 'sports-headband', name_zh: '運動頭帶', name_en: 'Sports Headband' },
      { slug: 'wrist-guard', name_zh: '護腕', name_en: 'Wrist Guard' },
    ],
  },
  // ==========================================
  // 七、鑰匙圈/飾品類 (Keychains & Accessories) - 15項
  // ==========================================
  {
    slug: 'keychains-accessories',
    name_zh: '鑰匙圈/飾品類',
    name_en: 'Keychains & Accessories',
    products: [
      { slug: 'keychain', name_zh: '鑰匙圈', name_en: 'Keychain' },
      { slug: 'metal-keychain', name_zh: '金屬鑰匙圈', name_en: 'Metal Keychain' },
      { slug: 'leather-keychain', name_zh: '皮革鑰匙圈', name_en: 'Leather Keychain' },
      { slug: 'acrylic-keychain', name_zh: '壓克力鑰匙圈', name_en: 'Acrylic Keychain' },
      { slug: 'bottle-opener-keychain', name_zh: '開瓶器鑰匙圈', name_en: 'Bottle Opener Keychain' },
      { slug: 'led-keychain', name_zh: 'LED鑰匙圈', name_en: 'LED Keychain' },
      { slug: 'pin-badge', name_zh: '徽章', name_en: 'Pin Badge' },
      { slug: 'button-badge', name_zh: '胸章', name_en: 'Button Badge' },
      { slug: 'lapel-pin', name_zh: '別針', name_en: 'Lapel Pin' },
      { slug: 'medal', name_zh: '獎章', name_en: 'Medal' },
      { slug: 'commemorative-coin', name_zh: '紀念幣', name_en: 'Commemorative Coin' },
      { slug: 'fridge-magnet', name_zh: '冰箱磁鐵', name_en: 'Fridge Magnet' },
      { slug: 'book-clip', name_zh: '書夾', name_en: 'Book Clip' },
      { slug: 'charm', name_zh: '吊飾', name_en: 'Charm' },
      { slug: 'phone-charm', name_zh: '手機吊飾', name_en: 'Phone Charm' },
    ],
  },
  // ==========================================
  // 八、居家用品類 (Home & Living) - 10項
  // ==========================================
  {
    slug: 'home-living',
    name_zh: '居家用品類',
    name_en: 'Home & Living',
    products: [
      { slug: 'coaster', name_zh: '杯墊', name_en: 'Coaster' },
      { slug: 'placemat', name_zh: '餐墊', name_en: 'Placemat' },
      { slug: 'bottle-opener', name_zh: '開瓶器', name_en: 'Bottle Opener' },
      { slug: 'cutlery-set', name_zh: '餐具組', name_en: 'Cutlery Set' },
      { slug: 'chopsticks-set', name_zh: '筷子組', name_en: 'Chopsticks Set' },
      { slug: 'lunch-box', name_zh: '便當盒', name_en: 'Lunch Box' },
      { slug: 'food-container', name_zh: '保鮮盒', name_en: 'Food Container' },
      { slug: 'teapot', name_zh: '茶壺', name_en: 'Teapot' },
      { slug: 'blanket', name_zh: '毛毯', name_en: 'Blanket' },
      { slug: 'throw-pillow', name_zh: '抱枕', name_en: 'Throw Pillow' },
    ],
  },
  // ==========================================
  // 九、香氛類 (Fragrance) - 10項
  // ==========================================
  {
    slug: 'fragrance',
    name_zh: '香氛類',
    name_en: 'Fragrance',
    products: [
      { slug: 'scented-candle', name_zh: '香氛蠟燭', name_en: 'Scented Candle' },
      { slug: 'reed-diffuser', name_zh: '擴香瓶', name_en: 'Reed Diffuser' },
      { slug: 'sachet', name_zh: '香氛袋', name_en: 'Sachet' },
      { slug: 'essential-oil', name_zh: '精油', name_en: 'Essential Oil' },
      { slug: 'room-spray', name_zh: '香氛噴霧', name_en: 'Room Spray' },
      { slug: 'car-air-freshener', name_zh: '車用香氛', name_en: 'Car Air Freshener' },
      { slug: 'aroma-diffuser', name_zh: '香薰機', name_en: 'Aroma Diffuser' },
      { slug: 'incense-sticks', name_zh: '線香', name_en: 'Incense Sticks' },
      { slug: 'incense-cones', name_zh: '香塔', name_en: 'Incense Cones' },
      { slug: 'wax-melts', name_zh: '香氛蠟片', name_en: 'Wax Melts' },
    ],
  },
  // ==========================================
  // 十、戶外/運動類 (Outdoor & Sports) - 15項
  // ==========================================
  {
    slug: 'outdoor-sports',
    name_zh: '戶外/運動類',
    name_en: 'Outdoor & Sports',
    products: [
      { slug: 'umbrella', name_zh: '雨傘', name_en: 'Umbrella' },
      { slug: 'folding-umbrella', name_zh: '摺疊傘', name_en: 'Folding Umbrella' },
      { slug: 'uv-protection-umbrella', name_zh: '防曬傘', name_en: 'UV Protection Umbrella' },
      { slug: 'picnic-mat', name_zh: '野餐墊', name_en: 'Picnic Mat' },
      { slug: 'camping-lantern', name_zh: '露營燈', name_en: 'Camping Lantern' },
      { slug: 'flashlight', name_zh: '手電筒', name_en: 'Flashlight' },
      { slug: 'compass', name_zh: '指南針', name_en: 'Compass' },
      { slug: 'pedometer', name_zh: '計步器', name_en: 'Pedometer' },
      { slug: 'jump-rope', name_zh: '跳繩', name_en: 'Jump Rope' },
      { slug: 'yoga-mat', name_zh: '瑜伽墊', name_en: 'Yoga Mat' },
      { slug: 'sports-towel', name_zh: '運動毛巾', name_en: 'Sports Towel' },
      { slug: 'knee-pad', name_zh: '護膝', name_en: 'Knee Pad' },
      { slug: 'golf-ball', name_zh: '高爾夫球', name_en: 'Golf Ball' },
      { slug: 'frisbee', name_zh: '飛盤', name_en: 'Frisbee' },
      { slug: 'beach-ball', name_zh: '沙灘球', name_en: 'Beach Ball' },
    ],
  },
  // ==========================================
  // 十一、玩具/遊戲類 (Toys & Games) - 10項
  // ==========================================
  {
    slug: 'toys-games',
    name_zh: '玩具/遊戲類',
    name_en: 'Toys & Games',
    products: [
      { slug: 'playing-cards', name_zh: '撲克牌', name_en: 'Playing Cards' },
      { slug: 'puzzle', name_zh: '拼圖', name_en: 'Puzzle' },
      { slug: 'rubiks-cube', name_zh: '魔術方塊', name_en: "Rubik's Cube" },
      { slug: 'board-game', name_zh: '桌遊', name_en: 'Board Game' },
      { slug: 'coloring-book', name_zh: '填色本', name_en: 'Coloring Book' },
      { slug: 'building-blocks', name_zh: '積木', name_en: 'Building Blocks' },
      { slug: 'plush-toy', name_zh: '絨毛玩偶', name_en: 'Plush Toy' },
      { slug: 'fidget-toy', name_zh: '解壓玩具', name_en: 'Fidget Toy' },
      { slug: 'pull-back-car', name_zh: '迴力車', name_en: 'Pull-back Car' },
      { slug: 'kite', name_zh: '風箏', name_en: 'Kite' },
    ],
  },
  // ==========================================
  // 十二、辦公/商務類 (Office & Business) - 20項
  // ==========================================
  {
    slug: 'office-business',
    name_zh: '辦公/商務類',
    name_en: 'Office & Business',
    products: [
      { slug: 'business-card-case', name_zh: '名片盒', name_en: 'Business Card Case' },
      { slug: 'briefcase', name_zh: '公事包', name_en: 'Briefcase' },
      { slug: 'calculator', name_zh: '計算機', name_en: 'Calculator' },
      { slug: 'whiteboard', name_zh: '白板', name_en: 'Whiteboard' },
      { slug: 'trophy', name_zh: '獎杯', name_en: 'Trophy' },
      { slug: 'award-plaque', name_zh: '獎牌', name_en: 'Award Plaque' },
      { slug: 'crystal-paperweight', name_zh: '水晶紙鎮', name_en: 'Crystal Paperweight' },
      { slug: 'hourglass', name_zh: '沙漏', name_en: 'Hourglass' },
      { slug: 'globe', name_zh: '地球儀', name_en: 'Globe' },
      { slug: 'photo-frame', name_zh: '相框', name_en: 'Photo Frame' },
      { slug: 'desk-organizer', name_zh: '桌上收納盒', name_en: 'Desk Organizer' },
      { slug: 'document-tray', name_zh: '文件架', name_en: 'Document Tray' },
      { slug: 'memo-holder', name_zh: '便簽座', name_en: 'Memo Holder' },
      { slug: 'name-plate', name_zh: '名牌座', name_en: 'Name Plate' },
      { slug: 'leather-desk-pad', name_zh: '皮革桌墊', name_en: 'Leather Desk Pad' },
      { slug: 'signature-pen-set', name_zh: '簽字筆禮盒', name_en: 'Signature Pen Set' },
      { slug: 'corporate-seal', name_zh: '公司印章', name_en: 'Corporate Seal' },
      { slug: 'conference-folder', name_zh: '會議資料夾', name_en: 'Conference Folder' },
      { slug: 'certificate-frame', name_zh: '證書框', name_en: 'Certificate Frame' },
      { slug: 'memorial-award', name_zh: '紀念獎座', name_en: 'Memorial Award' },
    ],
  },
];

// ==========================================
// 禮品維度資料
// ==========================================
const giftDimension = {
  slug: 'gift-type',
  category: 'gift',
  name_zh: '產品類型',
  name_en: 'Product Type',
  icon: 'Gift',
  order: 1,
  allow_multiple: false,
};

async function main() {
  console.log('🎁 開始建立禮品產品資料...\n');

  let totalTagsCreated = 0;
  let totalProductsCreated = 0;
  let totalProductTags = 0;

  // 1. 建立禮品維度
  console.log('📦 建立禮品維度: 產品類型 (gift-type)');
  const dimension = await prisma.filterDimension.upsert({
    where: { slug: giftDimension.slug },
    create: {
      slug: giftDimension.slug,
      category: giftDimension.category,
      name_zh: giftDimension.name_zh,
      name_en: giftDimension.name_en,
      icon: giftDimension.icon,
      order: giftDimension.order,
      is_active: true,
      allow_multiple: giftDimension.allow_multiple,
    },
    update: {
      name_zh: giftDimension.name_zh,
      name_en: giftDimension.name_en,
      icon: giftDimension.icon,
      order: giftDimension.order,
      allow_multiple: giftDimension.allow_multiple,
    },
  });

  // 2. 建立分類標籤並關聯到維度
  for (let i = 0; i < giftCategories.length; i++) {
    const category = giftCategories[i];
    console.log(`\n📂 處理分類: ${category.name_zh} (${category.slug})`);

    // 建立或取得分類標籤
    let categoryTag = await prisma.tag.findUnique({
      where: { slug: category.slug },
    });

    if (!categoryTag) {
      categoryTag = await prisma.tag.create({
        data: {
          id: `tag-gift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          slug: category.slug,
          name: category.name_zh,
          name_zh: category.name_zh,
          name_en: category.name_en,
        },
      });
      console.log(`  🆕 建立分類標籤: ${category.name_zh}`);
      totalTagsCreated++;
    } else {
      await prisma.tag.update({
        where: { id: categoryTag.id },
        data: {
          name_zh: category.name_zh,
          name_en: category.name_en,
        },
      });
      console.log(`  ✅ 更新分類標籤: ${category.name_zh}`);
    }

    // 關聯分類標籤到維度
    await prisma.dimensionTagMapping.upsert({
      where: {
        dimensionId_tagId: {
          dimensionId: dimension.id,
          tagId: categoryTag.id,
        },
      },
      create: {
        dimensionId: dimension.id,
        tagId: categoryTag.id,
        order: i,
      },
      update: {
        order: i,
      },
    });

    // 3. 建立該分類下的所有產品
    for (const product of category.products) {
      // 檢查產品是否已存在
      let existingProduct = await prisma.product.findUnique({
        where: { slug: product.slug },
      });

      if (!existingProduct) {
        existingProduct = await prisma.product.create({
          data: {
            id: `prod-gift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            slug: product.slug,
            name: product.name_zh,
            name_zh: product.name_zh,
            name_en: product.name_en,
            category: 'GIFT',
            status: 'ACTIVE',
            shortDesc: product.name_zh,
            shortDesc_zh: product.name_zh,
            shortDesc_en: product.name_en,
            updatedAt: new Date(),
          },
        });
        console.log(`    🆕 建立產品: ${product.name_zh}`);
        totalProductsCreated++;
      } else {
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            name_zh: product.name_zh,
            name_en: product.name_en,
            shortDesc_zh: product.name_zh,
            shortDesc_en: product.name_en,
            updatedAt: new Date(),
          },
        });
        console.log(`    ✅ 更新產品: ${product.name_zh}`);
      }

      // 關聯產品到分類標籤
      await prisma.productTag.upsert({
        where: {
          productId_tagId: {
            productId: existingProduct.id,
            tagId: categoryTag.id,
          },
        },
        create: {
          productId: existingProduct.id,
          tagId: categoryTag.id,
        },
        update: {},
      });
      totalProductTags++;
    }
  }

  console.log('\n==========================================');
  console.log('✅ 禮品產品建立完成！');
  console.log(`📊 統計：`);
  console.log(`   - 維度數量: 1`);
  console.log(`   - 分類標籤: ${giftCategories.length}`);
  console.log(`   - 新增標籤: ${totalTagsCreated}`);
  console.log(`   - 新增產品: ${totalProductsCreated}`);
  console.log(`   - 產品標籤關聯: ${totalProductTags}`);
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ 錯誤:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
