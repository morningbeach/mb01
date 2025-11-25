// lib/seed-category-tree.ts - 產品樹狀結構種子資料
// 此檔案可直接執行寫入資料庫

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 完整產品樹狀結構資料
export const productTreeData = {
  // Level 0: 根目錄
  id: "root-products",
  slug: "products",
  name_zh: "產品",
  name_en: "Products",
  description_zh: "天玎包裝工廠完整產品目錄",
  description_en: "Complete product catalog of Morning Beach Packaging",
  displayMode: "hero-cards",
  depth: 0,
  order: 0,
  isHidden: false,
  showInMenu: true,
  heroImage: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=1200",
  coverImage: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800",
  icon: "📦",
  colorTheme: "#3b82f6",
  
  children: [
    // ==================== 紙器包裝 ====================
    {
      slug: "paper-packaging",
      name_zh: "紙器包裝",
      name_en: "Paper Packaging",
      description_zh: "精緻紙盒與印刷品製作",
      description_en: "Exquisite paper box and printing production",
      displayMode: "hero-cards",
      depth: 1,
      order: 1,
      heroImage: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1200",
      coverImage: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800",
      icon: "📄",
      colorTheme: "#f59e0b",
      
      children: [
        // 精裝紙盒
        {
          slug: "hardcover-boxes",
          name_zh: "精裝紙盒",
          name_en: "Hardcover Boxes",
          description_zh: "高級精裝禮盒，適合高端產品包裝",
          description_en: "Premium hardcover gift boxes for high-end product packaging",
          displayMode: "masonry",
          depth: 2,
          order: 1,
          heroImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200",
          coverImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
          icon: "🎁",
          
          children: [
            {
              slug: "heaven-earth-box-hardcover",
              name_zh: "天地盒",
              name_en: "Heaven & Earth Box",
              description_zh: "經典天地盒結構，上下分離設計，透過標籤篩選不同規格的天地盒產品",
              description_en: "Classic heaven & earth box structure with separable lid, filter products by tags",
              displayMode: "grid",
              depth: 3,
              order: 1,
              isLeaf: true,
              coverImage: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800",
              icon: "📦",
              tagSlugs: ["heaven-earth-box", "luxury-gift"], // 透過 TAG 篩選產品
            },
            {
              slug: "flip-lid-box-hardcover",
              name_zh: "掀蓋盒",
              name_en: "Flip Lid Box",
              description_zh: "翻蓋式設計，磁扣固定，透過標籤篩選不同規格的掀蓋盒產品",
              description_en: "Flip-top design with magnetic closure, filter products by tags",
              displayMode: "grid",
              depth: 3,
              order: 2,
              isLeaf: true,
              coverImage: "https://images.unsplash.com/photo-1565299543923-37dd37887442?w=800",
              icon: "🎀",
              tagSlugs: ["flip-lid-box", "magnetic-box"], // 透過 TAG 篩選產品
            },
            {
              slug: "tea-box-hardcover",
              name_zh: "茶盒",
              name_en: "Tea Box",
              description_zh: "專為茶葉設計的精裝包裝，透過標籤篩選不同規格的茶盒產品",
              description_en: "Premium packaging designed specifically for tea, filter products by tags",
              displayMode: "waterfall",
              depth: 3,
              order: 3,
              isLeaf: true,
              coverImage: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800",
              icon: "🍵",
              tagSlugs: ["tea-box", "tea-packaging"], // 透過 TAG 篩選產品
            },
            {
              slug: "wine-box-hardcover",
              name_zh: "酒盒",
              name_en: "Wine Box",
              description_zh: "紅酒、白酒專用禮盒 (透過 TAG 篩選產品)",
              description_en: "Gift boxes for wine and spirits (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 4,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
            },
            {
              slug: "cosmetic-box-hardcover",
              name_zh: "化妝品盒",
              name_en: "Cosmetic Box",
              description_zh: "適合保養品、彩妝品包裝 (透過 TAG 篩選產品)",
              description_en: "Perfect for skincare and makeup packaging (filtered by TAGs)",
              displayMode: "masonry",
              depth: 3,
              order: 5,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=800",
            },
            {
              slug: "perfume-box-hardcover",
              name_zh: "香水盒",
              name_en: "Perfume Box",
              description_zh: "香水專用精裝盒 (透過 TAG 篩選產品)",
              description_en: "Premium boxes for perfume (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 6,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
            },
          ],
        },
        
        // 平裝紙盒 (結構相同，簡化顯示)
        {
          slug: "softcover-boxes",
          name_zh: "平裝紙盒",
          name_en: "Softcover Boxes",
          description_zh: "經濟實惠的平裝紙盒解決方案",
          description_en: "Cost-effective softcover box solutions",
          displayMode: "grid",
          depth: 2,
          order: 2,
          coverImage: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
          icon: "📦",
          children: [
            {
              slug: "heaven-earth-box-softcover",
              name_zh: "天地盒",
              name_en: "Heaven & Earth Box",
              description_zh: "平裝天地盒，輕量化設計 (透過 TAG 篩選產品)",
              description_en: "Softcover heaven-earth box, lightweight design (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 1,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
            },
            // 其他平裝紙盒子分類（掀蓋盒、茶盒、酒盒等）省略，結構相同
          ],
        },
        
        // 其他印刷品
        {
          slug: "other-printing",
          name_zh: "其他印刷品",
          name_en: "Other Printing Products",
          description_zh: "各類印刷品製作服務",
          description_en: "Various printing product services",
          displayMode: "carousel",
          depth: 2,
          order: 3,
          coverImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
          icon: "🖨️",
          children: [
            {
              slug: "calendar",
              name_zh: "掛曆桌曆",
              name_en: "Calendars",
              description_zh: "客製化掛曆與桌曆印刷 (透過 TAG 篩選產品)",
              description_en: "Custom wall and desk calendar printing (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 1,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1506784926709-22f1ec395907?w=800",
            },
            {
              slug: "red-envelope",
              name_zh: "紅包",
              name_en: "Red Envelopes",
              description_zh: "節慶紅包印刷 (透過 TAG 篩選產品)",
              description_en: "Festival red envelope printing (filtered by TAGs)",
              displayMode: "waterfall",
              depth: 3,
              order: 2,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800",
            },
            {
              slug: "manual",
              name_zh: "產品說明書",
              name_en: "Product Manuals",
              description_zh: "產品使用說明書印刷 (透過 TAG 篩選產品)",
              description_en: "Product instruction manual printing (filtered by TAGs)",
              displayMode: "list",
              depth: 3,
              order: 3,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1554224311-beee415c201f?w=800",
            },
            {
              slug: "poster-book",
              name_zh: "海報與書籍印刷",
              name_en: "Poster & Book Printing",
              description_zh: "大型海報與書籍印刷服務 (透過 TAG 篩選產品)",
              description_en: "Large format poster and book printing services (filtered by TAGs)",
              displayMode: "masonry",
              depth: 3,
              order: 4,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
            },
          ],
        },
      ],
    },
    
    // ==================== 提袋 ====================
    {
      slug: "bags",
      name_zh: "提袋",
      name_en: "Bags",
      description_zh: "各式材質提袋製作",
      description_en: "Various material bag production",
      displayMode: "hero-cards",
      depth: 1,
      order: 2,
      heroImage: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=1200",
      coverImage: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800",
      icon: "👜",
      colorTheme: "#10b981",
      
      children: [
        {
          slug: "canvas-bags",
          name_zh: "帆布袋",
          name_en: "Canvas Bags",
          description_zh: "環保耐用的帆布提袋",
          description_en: "Eco-friendly and durable canvas bags",
          displayMode: "masonry",
          depth: 2,
          order: 1,
          coverImage: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
          icon: "🎒",
          children: [
            {
              slug: "canvas-flat-bag",
              name_zh: "平面袋",
              name_en: "Flat Bag",
              description_zh: "基本款平面帆布袋 (透過 TAG 篩選產品)",
              description_en: "Basic flat canvas bag (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 1,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
            },
            {
              slug: "canvas-gusset-bag",
              name_zh: "五面袋",
              name_en: "Gusseted Bag",
              description_zh: "有底有側，容量更大 (透過 TAG 篩選產品)",
              description_en: "With bottom and side gussets for larger capacity (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 2,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
            },
            {
              slug: "canvas-tote-bag",
              name_zh: "托特袋",
              name_en: "Tote Bag",
              description_zh: "時尚托特包款式 (透過 TAG 篩選產品)",
              description_en: "Fashionable tote bag style (filtered by TAGs)",
              displayMode: "waterfall",
              depth: 3,
              order: 3,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1543076659-9380cdf10613?w=800",
            },
            {
              slug: "canvas-cosmetic-bag",
              name_zh: "化妝包",
              name_en: "Cosmetic Bag",
              description_zh: "帆布化妝包，附拉鍊 (透過 TAG 篩選產品)",
              description_en: "Canvas cosmetic bag with zipper (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 4,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1584201762821-c2534df63d72?w=800",
            },
            {
              slug: "canvas-other",
              name_zh: "其他",
              name_en: "Others",
              description_zh: "其他客製化帆布袋款式 (透過 TAG 篩選產品)",
              description_en: "Other custom canvas bag styles (filtered by TAGs)",
              displayMode: "carousel",
              depth: 3,
              order: 5,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1585916420730-d7f95e942d43?w=800",
            },
          ],
        },
        {
          slug: "pvc-bags",
          name_zh: "PVC 提袋",
          name_en: "PVC Bags",
          description_zh: "透明防水 PVC 材質提袋",
          description_en: "Transparent waterproof PVC bags",
          displayMode: "grid",
          depth: 2,
          order: 2,
          coverImage: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800",
          icon: "💧",
          children: [
            {
              slug: "pvc-flat-bag",
              name_zh: "平面袋",
              name_en: "Flat Bag",
              description_zh: "透明 PVC 平面袋 (透過 TAG 篩選產品)",
              description_en: "Transparent PVC flat bag (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 1,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800",
            },
            // PVC 其他款式省略，結構相同
          ],
        },
        {
          slug: "woven-bags",
          name_zh: "編織袋",
          name_en: "Woven Bags",
          description_zh: "PP 編織環保購物袋",
          description_en: "PP woven eco-friendly shopping bags",
          displayMode: "masonry",
          depth: 2,
          order: 3,
          coverImage: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800",
          icon: "🧺",
          children: [
            {
              slug: "woven-flat-bag",
              name_zh: "平面袋",
              name_en: "Flat Bag",
              description_zh: "PP 編織平面袋 (透過 TAG 篩選產品)",
              description_en: "PP woven flat bag (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 1,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800",
            },
            // 編織袋其他款式省略
          ],
        },
        {
          slug: "nonwoven-bags",
          name_zh: "不織布",
          name_en: "Non-woven Bags",
          description_zh: "輕量環保不織布袋",
          description_en: "Lightweight eco-friendly non-woven bags",
          displayMode: "grid",
          depth: 2,
          order: 4,
          coverImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800",
          icon: "🌱",
          children: [
            {
              slug: "nonwoven-flat-bag",
              name_zh: "平面袋",
              name_en: "Flat Bag",
              description_zh: "不織布平面袋 (透過 TAG 篩選產品)",
              description_en: "Non-woven flat bag (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 1,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800",
            },
            // 不織布其他款式省略
          ],
        },
        {
          slug: "dupont-paper-bags",
          name_zh: "杜邦紙袋",
          name_en: "Tyvek Paper Bags",
          description_zh: "防水耐撕杜邦紙材質",
          description_en: "Waterproof and tear-resistant Tyvek material",
          displayMode: "waterfall",
          depth: 2,
          order: 5,
          coverImage: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
          icon: "📄",
          children: [
            {
              slug: "dupont-flat-bag",
              name_zh: "平面袋",
              name_en: "Flat Bag",
              description_zh: "杜邦紙平面袋 (透過 TAG 篩選產品)",
              description_en: "Tyvek flat bag (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 1,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
            },
            // 杜邦紙其他款式省略
          ],
        },
      ],
    },
    
    // ==================== 餐具 ====================
    {
      slug: "tableware",
      name_zh: "餐具",
      name_en: "Tableware",
      description_zh: "環保餐具系列",
      description_en: "Eco-friendly tableware series",
      displayMode: "hero-cards",
      depth: 1,
      order: 3,
      heroImage: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200",
      coverImage: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
      icon: "🍽️",
      colorTheme: "#8b5cf6",
      
      children: [
        {
          slug: "cups",
          name_zh: "杯具",
          name_en: "Cups & Mugs",
          description_zh: "各式杯具產品",
          description_en: "Various cup and mug products",
          displayMode: "masonry",
          depth: 2,
          order: 1,
          coverImage: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800",
          icon: "☕",
          children: [
            {
              slug: "ceramic-cup",
              name_zh: "陶瓷杯",
              name_en: "Ceramic Cup",
              description_zh: "高級陶瓷材質",
              description_en: "Premium ceramic material",
              displayMode: "product-detail",
              depth: 3,
              order: 1,
              isLeaf: true,
              coverImage: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
              productIds: ["prod-ceramic-cup"],
            },
            {
              slug: "glass-cup",
              name_zh: "玻璃杯",
              name_en: "Glass Cup",
              description_zh: "雙層玻璃設計",
              description_en: "Double-wall glass design",
              displayMode: "product-detail",
              depth: 3,
              order: 2,
              isLeaf: true,
              coverImage: "https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?w=600",
              productIds: ["prod-glass-cup"],
            },
          ],
        },
        {
          slug: "plates",
          name_zh: "盤",
          name_en: "Plates",
          description_zh: "餐盤系列",
          description_en: "Plate series",
          displayMode: "grid",
          depth: 2,
          order: 2,
          coverImage: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800",
          icon: "🍽️",
          children: [
            {
              slug: "ceramic-plate",
              name_zh: "陶瓷餐盤",
              name_en: "Ceramic Plate",
              description_zh: "8 吋陶瓷餐盤",
              description_en: "8-inch ceramic plate",
              displayMode: "product-detail",
              depth: 3,
              order: 1,
              isLeaf: true,
              coverImage: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600",
              productIds: ["prod-ceramic-plate"],
            },
          ],
        },
        {
          slug: "bowls",
          name_zh: "碗",
          name_en: "Bowls",
          description_zh: "碗具系列",
          description_en: "Bowl series",
          displayMode: "waterfall",
          depth: 2,
          order: 3,
          coverImage: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800",
          icon: "🥣",
          children: [
            {
              slug: "ceramic-bowl",
              name_zh: "陶瓷碗",
              name_en: "Ceramic Bowl",
              description_zh: "5 吋陶瓷碗",
              description_en: "5-inch ceramic bowl",
              displayMode: "product-detail",
              depth: 3,
              order: 1,
              isLeaf: true,
              coverImage: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=600",
              productIds: ["prod-ceramic-bowl"],
            },
          ],
        },
      ],
    },
    
    // ==================== 禮品/商品 ====================
    {
      slug: "gifts-merchandise",
      name_zh: "禮品/商品",
      name_en: "Gifts & Merchandise",
      description_zh: "企業禮品與客製化商品",
      description_en: "Corporate gifts and custom merchandise",
      displayMode: "hero-cards",
      depth: 1,
      order: 4,
      heroImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200",
      coverImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
      icon: "🎁",
      colorTheme: "#ec4899",
      
      children: [
        {
          slug: "3c-products",
          name_zh: "3C",
          name_en: "3C Products",
          description_zh: "3C 科技產品",
          description_en: "3C technology products",
          displayMode: "grid",
          depth: 2,
          order: 1,
          coverImage: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800",
          icon: "💻",
          children: [
            {
              slug: "chargers",
              name_zh: "充電器",
              name_en: "Chargers",
              description_zh: "各式充電器產品 (透過 TAG 篩選產品)",
              description_en: "Various charger products (filtered by TAGs)",
              displayMode: "masonry",
              depth: 3,
              order: 1,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1591290619762-a14ae4a76c1c?w=800",
            },
            {
              slug: "bluetooth-speakers",
              name_zh: "藍芽喇叭",
              name_en: "Bluetooth Speakers",
              description_zh: "攜帶型藍芽喇叭 (透過 TAG 篩選產品)",
              description_en: "Portable Bluetooth speakers (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 2,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
            },
            {
              slug: "bluetooth-soundbox",
              name_zh: "藍芽音箱",
              name_en: "Bluetooth Sound Box",
              description_zh: "重低音藍芽音箱 (透過 TAG 篩選產品)",
              description_en: "Bass-enhanced Bluetooth sound box (filtered by TAGs)",
              displayMode: "waterfall",
              depth: 3,
              order: 3,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800",
            },
            {
              slug: "keyboards",
              name_zh: "鍵盤",
              name_en: "Keyboards",
              description_zh: "無線鍵盤產品 (透過 TAG 篩選產品)",
              description_en: "Wireless keyboard products (filtered by TAGs)",
              displayMode: "carousel",
              depth: 3,
              order: 4,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
            },
            {
              slug: "phone-cases",
              name_zh: "手機殼",
              name_en: "Phone Cases",
              description_zh: "客製化手機保護殼 (透過 TAG 篩選產品)",
              description_en: "Custom phone protection cases (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 5,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800",
            },
          ],
        },
        {
          slug: "stationery-daily",
          name_zh: "文具與日常",
          name_en: "Stationery & Daily Items",
          description_zh: "辦公文具與日常用品",
          description_en: "Office stationery and daily items",
          displayMode: "masonry",
          depth: 2,
          order: 2,
          coverImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
          icon: "✏️",
          children: [
            {
              slug: "ceramic-coaster",
              name_zh: "陶瓷杯墊",
              name_en: "Ceramic Coaster",
              description_zh: "吸水陶瓷杯墊 (透過 TAG 篩選產品)",
              description_en: "Water-absorbing ceramic coaster (filtered by TAGs)",
              displayMode: "grid",
              depth: 3,
              order: 1,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1596480207006-7f56c3300d05?w=800",
            },
            {
              slug: "silicone-coaster",
              name_zh: "矽膠杯墊",
              name_en: "Silicone Coaster",
              description_zh: "防滑矽膠杯墊 (透過 TAG 篩選產品)",
              description_en: "Non-slip silicone coaster (filtered by TAGs)",
              displayMode: "waterfall",
              depth: 3,
              order: 2,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=800",
            },
            {
              slug: "makeup-mirror",
              name_zh: "化妝鏡",
              name_en: "Makeup Mirror",
              description_zh: "攜帶型化妝鏡 (透過 TAG 篩選產品)",
              description_en: "Portable makeup mirror (filtered by TAGs)",
              displayMode: "carousel",
              depth: 3,
              order: 3,
              isLeaf: true,
              tagIds: [],
              coverImage: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800",
            },
          ],
        },
      ],
    },
    
    // ==================== 禮品組 ====================
    {
      slug: "gift-sets",
      name_zh: "禮品組",
      name_en: "Gift Sets",
      description_zh: "精選禮品組合",
      description_en: "Curated gift set collections",
      displayMode: "grid", // 直接顯示產品
      depth: 1,
      order: 5,
      heroImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200",
      coverImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
      icon: "🎀",
      colorTheme: "#f43f5e",
      isLeaf: false, // 這層還有子節點
      
      children: [
        {
          slug: "corporate-gift-set-a",
          name_zh: "企業禮品組 A",
          name_en: "Corporate Gift Set A",
          description_zh: "筆記本 + 保溫杯 + 環保袋",
          description_en: "Notebook + Thermos + Eco Bag",
          displayMode: "product-detail",
          depth: 2,
          order: 1,
          isLeaf: true,
          coverImage: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600",
          productIds: ["prod-gift-set-a"],
        },
        {
          slug: "corporate-gift-set-b",
          name_zh: "企業禮品組 B",
          name_en: "Corporate Gift Set B",
          description_zh: "無線充電器 + 藍芽喇叭",
          description_en: "Wireless Charger + Bluetooth Speaker",
          displayMode: "product-detail",
          depth: 2,
          order: 2,
          isLeaf: true,
          coverImage: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600",
          productIds: ["prod-gift-set-b"],
        },
        {
          slug: "festival-gift-set",
          name_zh: "節慶禮品組",
          name_en: "Festival Gift Set",
          description_zh: "月餅 + 茶葉 + 精裝禮盒",
          description_en: "Mooncake + Tea + Premium Gift Box",
          displayMode: "product-detail",
          depth: 2,
          order: 3,
          isLeaf: true,
          coverImage: "https://images.unsplash.com/photo-1565299543923-37dd37887442?w=600",
          productIds: ["prod-festival-gift-set"],
        },
      ],
    },
  ],
};

// 遞迴函數：將樹狀資料寫入資料庫
async function seedNode(nodeData: any, parentId: string | null = null, tagMap?: Map<string, string>): Promise<void> {
  const {
    children,
    tagSlugs,
    ...data
  } = nodeData;

  // 如果有 tagSlugs，轉換為 tagIds
  let tagIds: string[] = [];
  if (tagSlugs && tagSlugs.length > 0 && tagMap) {
    tagIds = tagSlugs
      .map((slug: string) => tagMap.get(slug))
      .filter(Boolean) as string[];
  } else if (data.tagIds) {
    tagIds = data.tagIds;
  }

  // 建立當前節點
  const node = await prisma.categoryNode.create({
    data: {
      ...data,
      parentId,
      path: parentId ? [...(await getParentPath(parentId)), data.slug] : [data.slug],
      productIds: data.productIds || [],
      tagIds,
      isActive: true,
      isLeaf: data.isLeaf || false,
      isHidden: data.isHidden || false,
      showInMenu: data.showInMenu !== undefined ? data.showInMenu : true,
    },
  });

  console.log(`✓ Created: ${data.name_zh} (${data.slug})`);

  // 遞迴建立子節點
  if (children && children.length > 0) {
    for (const child of children) {
      await seedNode(child, node.id, tagMap);
    }
  }
}

// 取得父節點的完整路徑
async function getParentPath(parentId: string): Promise<string[]> {
  const parent = await prisma.categoryNode.findUnique({
    where: { id: parentId },
    select: { path: true },
  });
  return parent?.path || [];
}

// 主要種子函數
export async function seedCategoryTree() {
  console.log("🌱 Starting category tree seeding...\n");

  // 取得所有 TAG 的 slug -> id 映射
  const tags = await prisma.tag.findMany({ where: { version: 2 } });
  const tagMap = new Map(tags.map(t => [t.slug, t.id]));
  console.log(`📋 Loaded ${tags.length} TAGs\n`);

  // 清空現有資料
  await prisma.categoryNode.deleteMany({});
  console.log("🗑️  Cleared existing category nodes\n");

  // 寫入樹狀資料
  await seedNode(productTreeData, null, tagMap);

  console.log("\n✅ Category tree seeding completed!");
  
  // 統計
  const totalNodes = await prisma.categoryNode.count();
  const leafNodes = await prisma.categoryNode.count({ where: { isLeaf: true } });
  
  console.log(`\n📊 Statistics:`);
  console.log(`   Total nodes: ${totalNodes}`);
  console.log(`   Leaf nodes: ${leafNodes}`);
  console.log(`   Branch nodes: ${totalNodes - leafNodes}`);
}

// 如果直接執行此檔案
if (require.main === module) {
  seedCategoryTree()
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
