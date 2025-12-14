// backup-relations.js - 備份關聯資料
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupRelations() {
  const date = new Date().toISOString().split('T')[0];
  const backupDir = path.join(__dirname, 'db_backups', date);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('備份關聯資料...');
  console.log('備份目錄:', backupDir);
  
  // 備份 Product 包含 ProductTag 關聯
  const products = await prisma.product.findMany({
    include: { 
      ProductTag: {
        include: { Tag: true }
      }
    }
  });
  
  const productTagRelations = [];
  for (const p of products) {
    for (const pt of p.ProductTag) {
      productTagRelations.push({ 
        productId: p.id, 
        tagId: pt.tagId, 
        tagSlug: pt.Tag?.slug,
        tagName: pt.Tag?.name
      });
    }
  }
  
  fs.writeFileSync(path.join(backupDir, 'product-tag-relations.json'), JSON.stringify(productTagRelations, null, 2));
  console.log('✅ Product-Tag relations:', productTagRelations.length);
  
  // 備份完整 products with tags
  fs.writeFileSync(path.join(backupDir, 'products-with-tags.json'), JSON.stringify(products, null, 2));
  console.log('✅ Products with tags saved:', products.length);

  // 備份 Tags
  const tags = await prisma.tag.findMany();
  fs.writeFileSync(path.join(backupDir, 'tags.json'), JSON.stringify(tags, null, 2));
  console.log('✅ Tags:', tags.length);

  // 備份 SiteSettings
  const settings = await prisma.siteSetting.findMany();
  fs.writeFileSync(path.join(backupDir, 'site-settings.json'), JSON.stringify(settings, null, 2));
  console.log('✅ Site Settings:', settings.length);

  // 備份 BlogPosts
  const blogs = await prisma.blogPost.findMany();
  fs.writeFileSync(path.join(backupDir, 'blog-posts.json'), JSON.stringify(blogs, null, 2));
  console.log('✅ Blog Posts:', blogs.length);

  // 備份 Images
  const images = await prisma.image.findMany();
  fs.writeFileSync(path.join(backupDir, 'images.json'), JSON.stringify(images, null, 2));
  console.log('✅ Images:', images.length);

  // 備份 ProductTag 直接
  const productTags = await prisma.productTag.findMany();
  fs.writeFileSync(path.join(backupDir, 'product-tags-raw.json'), JSON.stringify(productTags, null, 2));
  console.log('✅ ProductTag (raw):', productTags.length);

  console.log('\n✅ 關聯資料備份完成!');
  await prisma.$disconnect();
}

backupRelations().catch(console.error);
