import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 找出提袋類別的所有標籤 ID
  const bagDimTags = await prisma.dimensionTagMapping.findMany({
    where: { dimension: { category: 'bag' } },
    select: { tagId: true },
  });
  const bagTagIds = bagDimTags.map(t => t.tagId);
  console.log('提袋類別標籤數量:', bagTagIds.length);

  // 找出有「禮品包裝」標籤的產品
  const giftPackagingProducts = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      version: 2,
      ProductTag: {
        some: {
          Tag: { slug: 'tag-1764169657523' }
        }
      }
    },
    select: {
      id: true,
      name_zh: true,
      ProductTag: {
        include: {
          Tag: { select: { id: true, slug: true, name_zh: true } }
        }
      }
    },
    take: 10
  });

  console.log('\n有禮品包裝標籤的產品:');
  for (const p of giftPackagingProducts) {
    const matchingBagTags = p.ProductTag.filter(pt => bagTagIds.includes(pt.tagId));
    console.log(`\n${p.name_zh}:`);
    console.log('  所有標籤:', p.ProductTag.map(pt => pt.Tag.name_zh).join(', '));
    if (matchingBagTags.length > 0) {
      console.log('  提袋標籤:', matchingBagTags.map(pt => pt.Tag.name_zh).join(', '));
    } else {
      console.log('  提袋標籤: 無');
    }
  }

  // 檢查跨類別標籤是否被正確排除
  const excludedSlugs = [
    'corporate-gift',
    'tag-1764169657523', // 禮品包裝
    'paper-bag',
  ];

  console.log('\n\n檢查排除的標籤:');
  for (const slug of excludedSlugs) {
    const tag = await prisma.tag.findFirst({
      where: { slug },
      select: { id: true, slug: true, name_zh: true }
    });
    if (tag) {
      const inBag = bagTagIds.includes(tag.id);
      console.log(`${tag.name_zh} (${tag.slug}): ${inBag ? '在提袋類別中' : '不在提袋類別中'}`);
    }
  }

  await prisma.$disconnect();
}

main();
