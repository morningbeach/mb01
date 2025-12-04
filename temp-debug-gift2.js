const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 取得禮品維度下所有標籤
  const giftDimensions = await prisma.filterDimension.findMany({
    where: { category: 'gift' },
    include: {
      tagMappings: {
        include: {
          tag: true
        }
      }
    }
  });
  
  console.log('禮品維度:');
  const allGiftTagIds = [];
  
  for (const dim of giftDimensions) {
    console.log(`\n維度: ${dim.slug} (${dim.name})`);
    for (const mapping of dim.tagMappings) {
      allGiftTagIds.push(mapping.tagId);
      const count = await prisma.productTag.count({
        where: {
          tagId: mapping.tagId,
          Product: { status: 'ACTIVE', version: 2 }
        }
      });
      if (count > 0) {
        console.log(`  ${mapping.tag.slug}: ${count} 個產品`);
      }
    }
  }
  
  console.log('\n\n禮品維度標籤 ID 總數:', allGiftTagIds.length);
  
  // 用所有禮品標籤查詢
  const total = await prisma.product.count({
    where: {
      status: 'ACTIVE',
      version: 2,
      ProductTag: {
        some: {
          tagId: { in: allGiftTagIds }
        }
      }
    }
  });
  console.log('用禮品維度標籤查詢的總產品數:', total);
  
  // 取得 10 個範例產品
  const examples = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      version: 2,
      ProductTag: {
        some: {
          tagId: { in: allGiftTagIds }
        }
      }
    },
    take: 10,
    select: { name_zh: true, name: true }
  });
  
  console.log('\n範例產品:');
  examples.forEach(p => console.log('-', p.name_zh || p.name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
