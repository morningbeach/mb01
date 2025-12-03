const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const pages = await prisma.sitePage.findMany({ orderBy: { order: 'asc' } });
  console.log('SitePage 配置:');
  pages.forEach(x => console.log(`  ${x.slug} | ${x.navLabel_zh} | showInNav: ${x.showInNav}`));
  await prisma.$disconnect();
}

main();
