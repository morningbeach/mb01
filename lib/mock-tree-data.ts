// 樹狀 Tag 假資料 - 4+ 層結構（支援隱藏根節點）
export const mockTreeData = {
  id: "root",
  name_zh: "所有商品",
  name_en: "All Products",
  slug: "all",
  level: 0,
  depth: 0,
  displayMode: "root", // root 不顯示，只作為容器
  isHidden: false, // 當前根節點顯示
  showInMenu: false, // 不顯示在選單
  children: [
    {
      id: "cat-1",
      name_zh: "企業禮品",
      name_en: "Corporate Gifts",
      slug: "corporate-gifts",
      level: 1,
      displayMode: "hero-cards", // Hero + 子分類卡片
      heroImage: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800",
      description_zh: "為企業客戶打造的專業禮贈品解決方案",
      description_en: "Professional gifting solutions for corporate clients",
      children: [
        {
          id: "cat-1-1",
          name_zh: "環保系列",
          name_en: "Eco-Friendly Series",
          slug: "eco-friendly",
          level: 2,
          displayMode: "grid", // 網格展示
          heroImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
          description_zh: "永續環保材質，符合 ESG 採購標準",
          description_en: "Sustainable materials meeting ESG standards",
          children: [
            {
              id: "cat-1-1-1",
              name_zh: "竹製品",
              name_en: "Bamboo Products",
              slug: "bamboo",
              level: 3,
              displayMode: "masonry", // 瀑布流
              heroImage: "https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=800",
              description_zh: "天然竹材，輕盈耐用",
              description_en: "Natural bamboo, lightweight and durable",
              children: [
                {
                  id: "prod-1",
                  name_zh: "竹製餐具組",
                  name_en: "Bamboo Cutlery Set",
                  slug: "bamboo-cutlery-set",
                  level: 4,
                  displayMode: "product-detail",
                  coverImage: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600",
                  price: "NT$ 380",
                  minQty: 100,
                  description_zh: "環保竹製餐具，包含筷子、湯匙、叉子，附收納袋",
                  description_en: "Eco-friendly bamboo cutlery set with chopsticks, spoon, fork, and storage bag",
                  gallery: [
                    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600",
                    "https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=600",
                  ],
                },
                {
                  id: "prod-2",
                  name_zh: "竹纖維毛巾",
                  name_en: "Bamboo Fiber Towel",
                  slug: "bamboo-towel",
                  level: 4,
                  displayMode: "product-detail",
                  coverImage: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600",
                  price: "NT$ 250",
                  minQty: 200,
                  description_zh: "柔軟吸水，天然抗菌",
                  description_en: "Soft, absorbent, and naturally antibacterial",
                  gallery: [
                    "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600",
                  ],
                },
              ],
            },
            {
              id: "cat-1-1-2",
              name_zh: "再生紙品",
              name_en: "Recycled Paper",
              slug: "recycled-paper",
              level: 3,
              displayMode: "waterfall",
              heroImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
              description_zh: "100% 再生紙張，減少環境負擔",
              description_en: "100% recycled paper, reducing environmental impact",
              children: [
                {
                  id: "prod-3",
                  name_zh: "再生紙筆記本",
                  name_en: "Recycled Notebook",
                  slug: "recycled-notebook",
                  level: 4,
                  displayMode: "product-detail",
                  coverImage: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600",
                  price: "NT$ 150",
                  minQty: 300,
                  description_zh: "A5 尺寸，80 頁，環保印刷",
                  description_en: "A5 size, 80 pages, eco-friendly printing",
                  gallery: [
                    "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600",
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "cat-1-2",
          name_zh: "科技配件",
          name_en: "Tech Accessories",
          slug: "tech-accessories",
          level: 2,
          displayMode: "carousel",
          heroImage: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800",
          description_zh: "實用的科技周邊產品",
          description_en: "Practical tech accessories",
          children: [
            {
              id: "cat-1-2-1",
              name_zh: "無線充電",
              name_en: "Wireless Charging",
              slug: "wireless-charging",
              level: 3,
              displayMode: "grid",
              heroImage: "https://images.unsplash.com/photo-1591290619762-a14ae4a76c1c?w=800",
              description_zh: "便利的無線充電解決方案",
              description_en: "Convenient wireless charging solutions",
              children: [
                {
                  id: "prod-4",
                  name_zh: "木質無線充電盤",
                  name_en: "Wooden Wireless Charger",
                  slug: "wooden-wireless-charger",
                  level: 4,
                  displayMode: "product-detail",
                  coverImage: "https://images.unsplash.com/photo-1591290619762-a14ae4a76c1c?w=600",
                  price: "NT$ 680",
                  minQty: 50,
                  description_zh: "胡桃木外殼，支援 15W 快充",
                  description_en: "Walnut shell, supports 15W fast charging",
                  gallery: [
                    "https://images.unsplash.com/photo-1591290619762-a14ae4a76c1c?w=600",
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "cat-2",
      name_zh: "節慶禮盒",
      name_en: "Festival Gift Boxes",
      slug: "festival-gifts",
      level: 1,
      displayMode: "hero-cards",
      heroImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
      description_zh: "節慶專屬禮盒，傳遞心意",
      description_en: "Special festival gift boxes to convey your sentiments",
      children: [
        {
          id: "cat-2-1",
          name_zh: "中秋禮盒",
          name_en: "Mid-Autumn Gift Box",
          slug: "mid-autumn",
          level: 2,
          displayMode: "grid",
          heroImage: "https://images.unsplash.com/photo-1565299543923-37dd37887442?w=800",
          description_zh: "月餅、茶葉精選組合",
          description_en: "Mooncake and tea selection",
          children: [
            {
              id: "cat-2-1-1",
              name_zh: "經典月餅禮盒",
              name_en: "Classic Mooncake Box",
              slug: "classic-mooncake",
              level: 3,
              displayMode: "masonry",
              heroImage: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800",
              description_zh: "傳統口味，精美包裝",
              description_en: "Traditional flavors, exquisite packaging",
              children: [
                {
                  id: "prod-5",
                  name_zh: "豪華月餅禮盒 (8 入)",
                  name_en: "Luxury Mooncake Box (8 pcs)",
                  slug: "luxury-mooncake-8",
                  level: 4,
                  displayMode: "product-detail",
                  coverImage: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600",
                  price: "NT$ 1,280",
                  minQty: 20,
                  description_zh: "8 種口味，附提袋",
                  description_en: "8 flavors, with carrying bag",
                  gallery: [
                    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600",
                    "https://images.unsplash.com/photo-1565299543923-37dd37887442?w=600",
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// 展示模式配置
export const displayModeConfig = {
  "hero-cards": {
    name_zh: "英雄區 + 卡片",
    name_en: "Hero + Cards",
    description_zh: "大圖 Banner + 子分類卡片網格",
    description_en: "Large banner + subcategory card grid",
  },
  grid: {
    name_zh: "網格展示",
    name_en: "Grid Layout",
    description_zh: "標準網格排列",
    description_en: "Standard grid arrangement",
  },
  masonry: {
    name_zh: "瀑布流",
    name_en: "Masonry",
    description_zh: "不規則高度的瀑布流佈局",
    description_en: "Irregular height waterfall layout",
  },
  waterfall: {
    name_zh: "多列瀑布",
    name_en: "Waterfall",
    description_zh: "多列瀑布流展示",
    description_en: "Multi-column waterfall display",
  },
  carousel: {
    name_zh: "輪播展示",
    name_en: "Carousel",
    description_zh: "橫向輪播瀏覽",
    description_en: "Horizontal carousel browsing",
  },
  "product-detail": {
    name_zh: "商品詳情",
    name_en: "Product Detail",
    description_zh: "完整商品資訊頁",
    description_en: "Complete product information page",
  },
};

// 輔助函數：遍歷樹
export function traverseTree(node: any, callback: (node: any, depth: number) => void, depth = 0) {
  callback(node, depth);
  if (node.children) {
    node.children.forEach((child: any) => traverseTree(child, callback, depth + 1));
  }
}

// 輔助函數：根據 slug 查找節點
export function findNodeBySlug(tree: any, slug: string): any {
  if (tree.slug === slug) return tree;
  if (tree.children) {
    for (const child of tree.children) {
      const found = findNodeBySlug(child, slug);
      if (found) return found;
    }
  }
  return null;
}

// 輔助函數：取得麵包屑路徑
export function getBreadcrumbs(tree: any, targetSlug: string): any[] {
  const path: any[] = [];
  
  function findPath(node: any): boolean {
    path.push(node);
    if (node.slug === targetSlug) return true;
    
    if (node.children) {
      for (const child of node.children) {
        if (findPath(child)) return true;
      }
    }
    
    path.pop();
    return false;
  }
  
  findPath(tree);
  return path.filter(n => n.level > 0); // 排除 root
}
