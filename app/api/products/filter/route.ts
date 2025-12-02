import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 跨類別的標籤（同時屬於多個類別，不應用於類別過濾）
const CROSS_CATEGORY_TAG_SLUGS = [
  'corporate-gift',
  'embossing',
  'laser-engraving',
  'canvas',
  'cotton',
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

    // 取得跨類別標籤的 IDs（這些標籤不用於類別過濾）
    const excludedTags = await prisma.tag.findMany({
      where: { slug: { in: CROSS_CATEGORY_TAG_SLUGS } },
      select: { id: true },
    });
    const excludedTagIds = excludedTags.map(t => t.id);

    // 如果有類別篩選，先取得該類別下的所有 tag IDs（排除跨類別標籤）
    let categoryTagIds: string[] = [];
    if (category) {
      const dimensionTags = await prisma.dimensionTagMapping.findMany({
        where: {
          dimension: {
            category: category,
          },
          tagId: {
            notIn: excludedTagIds,
          },
        },
        select: {
          tagId: true,
        },
      });
      categoryTagIds = dimensionTags.map(dt => dt.tagId);
    }

    // 建立查詢條件
    const where: any = {
      status: 'ACTIVE',
      version: 2,
    };

    // 類別篩選：產品必須有該類別的標籤
    if (category && categoryTagIds.length > 0) {
      where.ProductTag = {
        some: {
          tagId: { in: categoryTagIds },
        },
      };
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

    // 查詢產品
    const [products, total] = await Promise.all([
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

    // 提袋類別：紙袋產品排在後面（超過50個才顯示）
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
