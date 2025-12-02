const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查詢這些標籤屬於哪些維度
  const tags = await prisma.tag.findMany({
    where: {
      OR: [
        { name_zh: { contains: '禮品' } },
        { name_zh: { contains: '企業' } }
      ]
    },
    include: {
      DimensionTagMapping: {
        include: { dimension: true }
      }
    }
  });
  
  tags.forEach(t => {
    const dims = t.DimensionTagMapping.map(d => d.dimension.category + ':' + d.dimension.name_zh).join(', ');
    console.log(t.name_zh, '|', dims || '無維度');
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
