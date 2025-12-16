// scripts/create-research-admin.js
// 創建只能訪問 /admin/research 的管理員帳號

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'wellytest1@mbpack.co';
  const password = '1234';
  const name = 'Welly Test';
  const role = 'research_admin'; // 特殊角色：只能訪問 research

  // 檢查是否已存在
  const existing = await prisma.adminUser.findUnique({
    where: { email }
  });

  if (existing) {
    console.log('⚠️ 用戶已存在:', email);
    console.log('   ID:', existing.id);
    console.log('   Role:', existing.role);
    
    // 更新角色為 research_admin
    const updated = await prisma.adminUser.update({
      where: { email },
      data: { role: 'research_admin' }
    });
    console.log('✅ 已更新角色為:', updated.role);
    return;
  }

  // 加密密碼
  const hashedPassword = await bcrypt.hash(password, 10);

  // 創建用戶
  const user = await prisma.adminUser.create({
    data: {
      id: `research_admin_${Date.now()}`,
      email,
      name,
      password: hashedPassword,
      role
    }
  });

  console.log('✅ 新管理員創建成功！');
  console.log('   Email:', user.email);
  console.log('   Name:', user.name);
  console.log('   Role:', user.role);
  console.log('   ID:', user.id);
  console.log('');
  console.log('🔐 登入資訊:');
  console.log('   Email: wellytest1@mbpack.co');
  console.log('   Password: 1234');
  console.log('   可訪問區域: /admin/research/ 及其子頁面');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
