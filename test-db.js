// 簡單測試連線
const { PrismaClient } = require('@prisma/client');

async function test() {
  const p = new PrismaClient();
  try {
    const r = await p.product.count();
    console.log('Products count:', r);
  } catch(e) {
    console.log('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
}

test();
