// scripts/fix-remaining-tags.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixRemaining() {
  const updates = [
    { slug: "corporate", name_zh: "企業禮贈" },
    { slug: "esg", name_zh: "ESG / 永續發展", name_en: "ESG / Sustainability" },
    { slug: "gift-bag", name_zh: "禮品袋" },
    { slug: "gift-set", name_zh: "禮盒組" },
    { slug: "mid-autumn", name_zh: "中秋節" },
  ];

  for (const u of updates) {
    const data = {};
    if (u.name_zh) data.name_zh = u.name_zh;
    if (u.name_en) data.name_en = u.name_en;

    try {
      await prisma.tag.update({
        where: { slug: u.slug },
        data,
      });
      console.log("✅ Updated:", u.slug, "->", JSON.stringify(data));
    } catch (err) {
      console.log("⚠️ Skipped:", u.slug, "-", err.message);
    }
  }

  await prisma.$disconnect();
}

fixRemaining();
