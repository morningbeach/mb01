import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 跨類別的標籤（同時屬於多個類別，不應用於類別過濾）
const CROSS_CATEGORY_TAG_SLUGS = [
  'corporate-gift',
  'embossing',
  'laser-engraving',
  'polyester',
  'nylon',
  'leather',
  'faux-leather',
  'cork',
  'screen-print',
  'heat-transfer',
  'sublimation',
  'dtg-print',
  'offset-print',
  'embroidery',
  'waterproof',
  'insulated',
  'foldable',
  'grs-certified',
  'recycled-material',
  'biodegradable',
  'organic-cotton',
  'oeko-tex',
  'fsc-paper',
  'fashion-apparel',
  'retail-shopping',
  'travel-outdoor',
  'sports-fitness',
  'baby-kids',
  'school-office',
  'tag-1764169657523', // 禮品包裝 - 跨類別
];

// 提袋白名單：只有包含這些「袋」tag 的產品才能進入提袋類別
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

// 快取：類別 → 標籤 IDs（5 分鐘過期）
const categoryTagCache: Record<string, { ids: string[], expiry: number }> = {};
// 快取：提袋白名單 tag IDs
let bagWhitelistTagIds: string[] | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 分鐘

// 取得提袋白名單 tag IDs
async function getBagWhitelistTagIds(): Promise<string[]> {
  if (bagWhitelistTagIds) return bagWhitelistTagIds;
  
  const tags = await prisma.tag.findMany({
    where: { slug: { in: BAG_WHITELIST_SLUGS } },
    select: { id: true },
  });
  bagWhitelistTagIds = tags.map(t => t.id);
  return bagWhitelistTagIds;
}

// 取得類別標籤 IDs（帶快取）
async function getCategoryTagIds(category: string): Promise<string[]> {
  const now = Date.now();
  const cached = categoryTagCache[category];
  
  if (cached && cached.expiry > now) {
    return cached.ids;
  }
  
  // 直接用 slug 過濾，不需要先查 excludedTagIds
  const dimensionTags = await prisma.dimensionTagMapping.findMany({
    where: {
      dimension: { category },
      tag: { slug: { notIn: CROSS_CATEGORY_TAG_SLUGS } },
    },
    select: { tagId: true },
  });
  
  const ids = dimensionTags.map(dt => dt.tagId);
  categoryTagCache[category] = { ids, expiry: now + CACHE_TTL };
  return ids;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 取得篩選參數
    const tagSlugs = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    // 篩選模式：'all' = AND (須符合所有標籤), 'any' = OR (符合任一標籤)
    const filterMode = searchParams.get('mode') || 'any';
    // 類別篩選
    const category = searchParams.get('category') || '';
    // 隨機產品模式
    const random = searchParams.get('random') === 'true';

    // 如果有類別篩選，取得該類別下的所有 tag IDs（使用快取）
    let categoryTagIds: string[] = [];
    if (category) {
      categoryTagIds = await getCategoryTagIds(category);
    }

    // 提袋類別：取得白名單 tag IDs
    let bagWhitelistIds: string[] = [];
    if (category === 'bag') {
      bagWhitelistIds = await getBagWhitelistTagIds();
    }

    // 建立查詢條件
    const where: any = {
      status: 'ACTIVE',
      version: 2,
    };

    // 類別篩選：產品必須有該類別的標籤
    if (category && categoryTagIds.length > 0) {
      if (category === 'bag') {
        // 提袋類別：必須有白名單中的「袋」tag
        where.ProductTag = {
          some: {
            tagId: { in: bagWhitelistIds },
          },
        };
      } else {
        // 其他類別（包含禮品）：使用維度下的所有標籤
        where.ProductTag = {
          some: {
            tagId: { in: categoryTagIds },
          },
        };
      }
    }

    // Tag 篩選（使用 ProductTag 關聯）
    if (tagSlugs.length > 0) {
      if (filterMode === 'all') {
        // AND 模式：產品必須擁有所有選中的標籤
        where.AND = tagSlugs.map(slug => ({
          ProductTag: {
            some: {
              Tag: {
                slug: slug,
              },
            },
          },
        }));
      } else {
        // OR 模式：產品只需擁有任一選中的標籤
        where.ProductTag = {
          some: {
            Tag: {
              slug: { in: tagSlugs },
            },
          },
        };
      }
    }

    // 關鍵字搜尋
    if (search) {
      where.OR = [
        { name_zh: { contains: search, mode: 'insensitive' } },
        { name_en: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { shortDesc_zh: { contains: search, mode: 'insensitive' } },
        { shortDesc_en: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 隨機產品模式：先取得所有符合條件的產品 ID，隨機抽取
    let products: any[];
    let total: number;
    
    if (random && category && tagSlugs.length === 0) {
      // 隨機模式（所有類別）：取得所有產品 ID，隨機抽取 limit 個
      const allProductIds = await prisma.product.findMany({
        where,
        select: { id: true },
      });
      total = allProductIds.length;
      
      // Fisher-Yates 洗牌取前 limit 個
      const shuffled = [...allProductIds].sort(() => Math.random() - 0.5);
      const selectedIds = shuffled.slice(0, limit).map(p => p.id);
      
      products = await prisma.product.findMany({
        where: { id: { in: selectedIds } },
        include: {
          ProductTag: {
            include: {
              Tag: true,
            },
          },
        },
      });
      // 再次打亂順序
      products = products.sort(() => Math.random() - 0.5);
    } else {
      // 正常模式
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            ProductTag: {
              include: {
                Tag: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);
    }

    // 轉換為前端格式
    let result = products.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name_zh: p.name_zh || p.name,
      name_en: p.name_en || p.name,
      shortDesc_zh: p.shortDesc_zh || p.shortDesc,
      shortDesc_en: p.shortDesc_en || p.shortDesc,
      coverImage: p.coverImage,
      images: p.images || p.gallery || [],
      material: p.material,
      specs: p.specs,
      moq: p.moq,
      ProductTag: p.ProductTag,
      tags: p.ProductTag.map((pt: any) => ({
        id: pt.Tag.id,
        slug: pt.Tag.slug,
        name_zh: pt.Tag.name_zh || pt.Tag.name,
        name_en: pt.Tag.name_en || pt.Tag.name,
        color: pt.Tag.color,
      })),
      // 標記是否為紙袋產品（用於排序）
      _hasPaperBag: p.ProductTag.some((pt: any) => pt.Tag.slug === 'paper-bag'),
    }));

    // 提袋類別：紙袋產品排在後面
    if (category === 'bag') {
      const nonPaperBag = result.filter((p: any) => !p._hasPaperBag);
      const paperBag = result.filter((p: any) => p._hasPaperBag);
      result = [...nonPaperBag, ...paperBag];
    }

    // 移除內部標記
    result = result.map(({ _hasPaperBag, ...rest }: any) => rest);

    return NextResponse.json({
      success: true,
      products: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error filtering products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to filter products' },
      { status: 500 }
    );
  }
}
