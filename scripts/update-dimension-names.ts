import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 更新成型紙盒 -> 一般紙盒
  await prisma.filterDimension.update({
    where: { slug: 'folding-carton' },
    data: { name_zh: '一般紙盒' },
  });
  console.log('已更新: 成型紙盒 -> 一般紙盒');

  // 更新硬紙盒 -> 精裝硬盒
  await prisma.filterDimension.update({
    where: { slug: 'rigid-box' },
    data: { name_zh: '精裝硬盒' },
  });
  console.log('已更新: 硬紙盒 -> 精裝硬盒');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
