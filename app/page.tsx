// app/page.tsx - Landing Page V2
import { prisma } from "@/lib/prisma";
import LandingPageClient from "./landing-v2/LandingPageClient";

// Default config matching the one in Admin Editor
const DEFAULT_CONFIG = {
  heroStyle: "style1",
  heroData: {
    headline: { en: "AI-First Packaging Production Center", zh: "AI 驅動的國際包裝生產中心" },
    subheadline: {
      en: "Global packaging manufacturing powered by AI-driven workflows, unified material intelligence, and cross-regional production networks.",
      zh: "由 AI 工作流、材料資料庫、跨區製造網絡所驅動的全球包裝生產體系。",
    },
    support: {
      en: "From material decisions to sampling, from mass production to cross-border delivery — MBPACK integrates Taiwan service teams with Shenzhen/Wenzhou/Guangzhou factories into a single AI-accelerated production chain.",
      zh: "從材料選擇、打樣，到量產與跨境出貨 —— MBPACK 以 AI 串聯台灣服務團隊與深圳、溫州、廣州生產工廠，打造一條完整、快速的跨國供應鏈。",
    },
    videoUrl: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
    backgroundImage: "",
    galleryImages: [],
  },
  selectedCaseIds: [],
  trustedBy: { text: { zh: "", en: "" }, images: [] },
  selectedBlogIds: [],
  solutions: [],
  aiSettings: { openaiKey: "", geminiKey: "" },
};

export const dynamic = "force-dynamic"; // Always fetch fresh data
export const revalidate = 0; // Disable caching

export default async function Home() {
  // Fetch Config
  const configRecord = await prisma.siteSetting.findUnique({
    where: { key: "landing-v2-config" },
  });

  const config = configRecord?.value 
    ? { ...DEFAULT_CONFIG, ...(configRecord.value as any) } 
    : DEFAULT_CONFIG;

  // Fetch Cases
  const cases = await prisma.caseProject.findMany({
    where: { isPublished: true },
    select: { id: true, title_zh: true, coverImage: true, slug: true },
    orderBy: { createdAt: "desc" },
  });

  // Fetch Blogs
  const blogs = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { id: true, title: true, coverImage: true, slug: true },
    orderBy: { createdAt: "desc" },
  });

  // Fetch random products for each category directly using Prisma
  let categoryProducts: Record<string, any[]> = {
    "print-packaging": [],
    "bag": [],
    "gift": []
  };
  
  try {
    // 取得各類別的標籤 IDs（使用特定維度）
    const getDimensionTagIds = async (dimensionSlug: string) => {
      const dimensionTags = await prisma.dimensionTagMapping.findMany({
        where: {
          dimension: { slug: dimensionSlug },
        },
        select: { tagId: true },
      });
      return dimensionTags.map(dt => dt.tagId);
    };

    // 取得 print-packaging 類別標籤（使用 folding-carton + rigid-box + other-print 維度）
    const getPrintPackagingTagIds = async () => {
      const dimensionTags = await prisma.dimensionTagMapping.findMany({
        where: {
          dimension: { 
            slug: { in: ['folding-carton', 'rigid-box', 'other-print'] }
          },
        },
        select: { tagId: true },
      });
      return [...new Set(dimensionTags.map(dt => dt.tagId))];
    };

    // 提袋白名單 slugs（與 API 完全一致）
    const BAG_WHITELIST_SLUGS = [
      // 袋形
      'tote-bag', 'flat-bag', 'gusset-bag', 'drawstring-bag', 'drawstring-backpack',
      'shoulder-bag', 'crossbody-bag', 'messenger-bag', 'backpack', 'cooler-bag',
      'lunch-bag', 'wine-bag', 'bottle-bag', 'pouch', 'pencil-case', 'laptop-sleeve',
      'document-bag', 'foldable-bag', 'eco-bag', 'ita-bag', 'paper-shopping-bag',
      'gift-bag', 'other-bag-style', 'cosmetic-pouch',
      // 材質袋
      'canvas-bag', 'cotton-canvas', 'pvc-bag', 'tyvek-bag', 'nonwoven-bag',
      'woven-bag',
      // 其他袋相關
      'coolerbag-1764280414779', 'insulationbag-1764280384176',
      'vest-typebag-1764281280937', 'vest-typebag-1764281282158',
      'gunnybag-1764278867794',
    ];

    // 取得提袋白名單 tag IDs
    const bagWhitelistTags = await prisma.tag.findMany({
      where: { slug: { in: BAG_WHITELIST_SLUGS } },
      select: { id: true },
    });
    const bagWhitelistIds = bagWhitelistTags.map(t => t.id);

    // 查詢各類別產品
    const fetchCategoryProducts = async (cat: string, tagIds: string[], limit: number, excludeBagProducts: boolean = false) => {
      // 取得符合條件的產品 IDs
      const productIds = await prisma.productTag.findMany({
        where: { tagId: { in: tagIds } },
        select: { productId: true },
        distinct: ['productId'],
      });
      
      const uniqueIds = productIds.map(p => p.productId);
      if (uniqueIds.length === 0) return [];

      // 隨機取 limit 個
      const shuffled = uniqueIds.sort(() => Math.random() - 0.5);
      const selectedIds = shuffled.slice(0, limit * 2); // 取多一點，因為可能有些會被排除

      // 查詢完整產品資料
      const whereCondition: any = {
        id: { in: selectedIds },
        status: 'ACTIVE',
        version: 2,
      };

      // 排除提袋產品（用於 print-packaging 和 gift）
      if (excludeBagProducts && bagWhitelistIds.length > 0) {
        whereCondition.NOT = {
          ProductTag: {
            some: { tagId: { in: bagWhitelistIds } }
          }
        };
      }

      const products = await prisma.product.findMany({
        where: whereCondition,
        select: {
          id: true,
          name_zh: true,
          name_en: true,
          coverImage: true,
          slug: true,
          ProductTag: {
            select: {
              Tag: {
                select: { id: true, slug: true, name_zh: true, name_en: true }
              }
            }
          }
        },
        take: limit, // 限制最終結果數量
      });

      return products;
    };

    // 並行查詢三個類別的標籤 IDs
    // print-packaging: 使用品項維度 (folding-carton, rigid-box, other-print)
    // bag: 使用白名單
    // gift: 使用 gift-type 維度下的品項標籤
    const [printPackagingTagIds, giftTagIds] = await Promise.all([
      getPrintPackagingTagIds(),
      getDimensionTagIds('gift-type'),
    ]);

    const [printPackagingProducts, bagProducts, giftProducts] = await Promise.all([
      fetchCategoryProducts('print-packaging', printPackagingTagIds, 21, true),  // 排除提袋
      fetchCategoryProducts('bag', bagWhitelistIds, 21, false),
      fetchCategoryProducts('gift', giftTagIds, 21, false),  // gift-type 維度不會有袋類，不需排除
    ]);

    categoryProducts = {
      "print-packaging": printPackagingProducts,
      "bag": bagProducts,
      "gift": giftProducts,
    };
    
    console.log('[Home] Category products loaded:', {
      'print-packaging': printPackagingProducts.length,
      'bag': bagProducts.length,
      'gift': giftProducts.length,
    });
  } catch (error) {
    console.error('[Home] Failed to fetch category products:', error);
  }

  return <LandingPageClient config={config} cases={cases} blogs={blogs} categoryProducts={categoryProducts} />;
}
