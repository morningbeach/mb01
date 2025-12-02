import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 取得提袋類別的所有標籤
  const bagMappings = await prisma.dimensionTagMapping.findMany({
    where: { dimension: { category: 'bag' } },
    include: { tag: { select: { slug: true, name_zh: true } } }
  });
  const bagSlugs = bagMappings.map(x => x.tag.slug);

  // 檢查可疑的禮品相關標籤
  const suspicious = [
    'tag-1764169658327', // 禮品盒
    'luxury-gift',       // 高端禮品
    'corporate',         // 企業禮贈
    'gift-box',          // 禮盒
    'gift-set',          // 禮盒組
    'tag-1764169657523', // 禮品包裝
  ];

  console.log('檢查是否有禮品標籤被映射到提袋類別:\n');
  
  for (const s of suspicious) {
    if (bagSlugs.includes(s)) {
      const tag = bagMappings.find(x => x.tag.slug === s);
      console.log(`❌ 發現: ${tag?.tag.name_zh} (${s}) 在提袋類別中`);
    } else {
      const tag = await prisma.tag.findFirst({ where: { slug: s }, select: { name_zh: true } });
      console.log(`✓ ${tag?.name_zh || s} 不在提袋類別中`);
    }
  }

  // 查看那幾個禮品盒產品有什麼提袋標籤
  console.log('\n\n查看禮品盒產品的標籤映射:');
  
  const giftProducts = await prisma.product.findMany({
    where: {
      name_zh: { in: ['紅色手提禮盒', '秋夜六角禮品盒', '精緻禮品套裝'] }
    },
    select: {
      name_zh: true,
      ProductTag: {
        include: { Tag: { select: { slug: true, name_zh: true } } }
      }
    }
  });

  for (const p of giftProducts) {
    console.log(`\n${p.name_zh}:`);
    const matchingBag = p.ProductTag.filter(pt => bagSlugs.includes(pt.Tag.slug));
    if (matchingBag.length > 0) {
      console.log('  有提袋標籤:', matchingBag.map(t => `${t.Tag.name_zh}(${t.Tag.slug})`).join(', '));
    } else {
      console.log('  沒有提袋標籤');
    }
  }

  await prisma.$disconnect();
}

main();
