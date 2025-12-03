import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 跨類別的標籤（同時屬於多個類別，在篩選器中隱藏以避免混淆）
const CROSS_CATEGORY_TAG_SLUGS = new Set([
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
]);

// GET: 取得所有維度（帶產品數量）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};
    if (category) where.category = category;
    if (!includeInactive) where.is_active = true;

    const dimensions = await prisma.filterDimension.findMany({
      where,
      include: {
        tagMappings: {
          include: {
            tag: {
              include: {
                ProductTag: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // 轉換為前端需要的格式，並過濾掉跨類別的標籤
    const result = dimensions.map((dim: any) => ({
      id: dim.id,
      slug: dim.slug,
      category: dim.category,
      name_zh: dim.name_zh,
      name_en: dim.name_en,
      icon: dim.icon,
      order: dim.order,
      is_active: dim.is_active,
      allow_multiple: dim.allow_multiple,
      tags: dim.tagMappings
        .filter((mapping: any) => !CROSS_CATEGORY_TAG_SLUGS.has(mapping.tag.slug))
        .map((mapping: any) => ({
          id: mapping.tag.id,
          slug: mapping.tag.slug,
          name_zh: mapping.tag.name_zh || mapping.tag.name,
          name_en: mapping.tag.name_en || mapping.tag.name,
          productCount: mapping.tag.ProductTag?.length || 0,
        })),
    }));

    return NextResponse.json({
      success: true,
      data: result,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching dimensions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dimensions' },
      { status: 500 }
    );
  }
}
