import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 找到「企業禮贈品」標籤
  const tag = await prisma.tag.findFirst({
    where: {
      OR: [
        { slug: 'corporate-gift' },
        { name_zh: '企業禮贈品' },
      ],
    },
  });

  if (!tag) {
    console.log('找不到「企業禮贈品」標籤');
    return;
  }

  console.log('找到標籤:', tag.id, tag.slug, tag.name_zh);

  // 從所有維度中移除這個標籤的映射
  const deleted = await prisma.dimensionTagMapping.deleteMany({
    where: { tagId: tag.id },
  });

  console.log('已從維度中移除', deleted.count, '個映射');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
