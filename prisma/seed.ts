// prisma/seed.ts
import { PrismaClient, Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding (EN baseline)...");

  // Clean existing data in the right order
  await prisma.giftSetItem.deleteMany();
  await prisma.giftSet.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.blogTag.deleteMany();
  await prisma.blogPost.deleteMany();

  // 新增：先清掉前台分類相關資料
  await prisma.frontCategoryTagGroup.deleteMany();
  await prisma.frontCategory.deleteMany();

  await prisma.tag.deleteMany();
  await prisma.page.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.product.deleteMany();

  console.log("✅ Cleared existing data");
  console.log("✅ Admin user seeded");

  // --- FRONT CATEGORIES (for /products & /catalog) ---

  console.log("🌱 Seeding front categories...");

  // 先建立 4 個大分類
  const giftsCategory = await prisma.frontCategory.create({
    data: {
      slug: "gifts",
      name: "Gifts",
      heroTitle: "Curated corporate gifts, ready to be packed.",
      heroSubtitle:
        "Single items that can stand alone or be combined into a gift set: snacks, daily-use items and long-life carriers.",
      cardTitle: "Curated corporate gifts, ready to be packed.",
      cardDescription:
        "Single gifts which can be used on their own or as part of a full gift set. Ideal for corporate and seasonal campaigns.",
      cardImage: "/cdn/categories/gifts.jpg",
      baseCategory: Category.GIFT,
      order: 1,
      isActive: true,
    },
  });

  const giftBoxesCategory = await prisma.frontCategory.create({
    data: {
      slug: "gift-boxes",
      name: "Gift Boxes",
      heroTitle: "Rigid & specialty boxes engineered for mass production.",
      heroSubtitle:
        "From classic lid & base structures to magnetic and drawer boxes, built for repeatable campaigns.",
      cardTitle: "Rigid & specialty boxes for gifting.",
      cardDescription:
        "Magnetic, drawer, book-style and lid & base boxes tailored to your product size and positioning.",
      cardImage: "/cdn/categories/giftbox.jpg",
      baseCategory: Category.GIFT_BOX,
      order: 2,
      isActive: true,
    },
  });

  const giftSetsCategory = await prisma.frontCategory.create({
    data: {
      slug: "gift-sets",
      name: "Gift Sets",
      heroTitle: "Complete gift set packaging, from content to logistics.",
      heroSubtitle:
        "We handle content, structure, artwork and mass production as one coherent project.",
      cardTitle: "Complete gift set packaging solutions.",
      cardDescription:
        "Box, insert, bag and outer carton designed as one system, tagged by festival or program type.",
      cardImage: "/cdn/categories/giftset.jpg",
      baseCategory: Category.GIFT_SET,
      order: 3,
      isActive: true,
    },
  });

  const servicesCategory = await prisma.frontCategory.create({
    data: {
      slug: "services",
      name: "Services & Solutions",
      heroTitle: "Structural design, sampling and project execution.",
      heroSubtitle:
        "For teams who need support from structure and sampling, all the way to a full gift set solution.",
      cardTitle: "Packaging services & solutions.",
      cardDescription:
        "Structure development, sampling and end-to-end gift set solutions built around your internal process.",
      cardImage: "/cdn/categories/services.jpg",
      baseCategory: null,
      order: 4,
      isActive: true,
    },
  });

  // 建立 Tag 分組（用你原本 seed 的 tag slug）
  await prisma.frontCategoryTagGroup.createMany({
    data: [
      // Gifts
      {
        frontCategoryId: giftsCategory.id,
        label: "ESG & sustainable gifts",
        description: "Gifts that help you tell a credible ESG story.",
        tagSlug: "esg",
        order: 1,
      },
      {
        frontCategoryId: giftsCategory.id,
        label: "Corporate / VIP gifts",
        description: "Suitable for VIP lists, clients and internal leaders.",
        tagSlug: "corporate",
        order: 2,
      },
      {
        frontCategoryId: giftsCategory.id,
        label: "Festival gifts",
        description: "Seasonal gifting items for campaigns.",
        tagSlug: "new-year",
        order: 3,
      },

      // Gift boxes
      {
        frontCategoryId: giftBoxesCategory.id,
        label: "Core rigid structures",
        description: "Lid & base, magnetic and drawer boxes.",
        tagSlug: "gift-box",
        order: 1,
      },
      {
        frontCategoryId: giftBoxesCategory.id,
        label: "Premium & limited edition",
        description: "For collaborations and higher-tier programs.",
        tagSlug: "premium",
        order: 2,
      },
      {
        frontCategoryId: giftBoxesCategory.id,
        label: "Corporate programs",
        description: "Boxes designed for larger corporate runs.",
        tagSlug: "corporate",
        order: 3,
      },

      // Gift sets
      {
        frontCategoryId: giftSetsCategory.id,
        label: "Mid-Autumn gift sets",
        description: "Full solutions centered around mooncakes and seasonal content.",
        tagSlug: "mid-autumn",
        order: 1,
      },
      {
        frontCategoryId: giftSetsCategory.id,
        label: "Lunar New Year gift sets",
        description: "Snack boxes and gifts built for New Year campaigns.",
        tagSlug: "new-year",
        order: 2,
      },
      {
        frontCategoryId: giftSetsCategory.id,
        label: "Corporate gift programs",
        description: "Annual and ad-hoc gifting programs for companies.",
        tagSlug: "corporate",
        order: 3,
      },
      {
        frontCategoryId: giftSetsCategory.id,
        label: "Gift set structures",
        description: "Projects positioned specifically as gift sets.",
        tagSlug: "gift-set",
        order: 4,
      },

      // Services
      {
        frontCategoryId: servicesCategory.id,
        label: "ESG packaging consulting",
        description: "Support for building ESG into your packaging.",
        tagSlug: "esg",
        order: 1,
      },
      {
        frontCategoryId: servicesCategory.id,
        label: "Corporate projects",
        description: "End-to-end support for corporate gifting projects.",
        tagSlug: "corporate",
        order: 2,
      },
    ],
  });

  console.log("✅ Front categories & tag groups seeded");

  // --- TAGS (EN) ---
  await prisma.tag.createMany({
    data: [
      { slug: "mid-autumn", name: "Mid-Autumn Festival" },
      { slug: "esg", name: "ESG / Sustainability" },
      { slug: "premium", name: "Premium" },
      { slug: "gift-bag", name: "Gift Bag" },
      { slug: "gift-box", name: "Gift Box" },
      { slug: "gift-set", name: "Gift Set" },
      { slug: "corporate", name: "Corporate Gifting" },
      { slug: "new-year", name: "Lunar New Year" },
    ],
    skipDuplicates: true,
  });

  const allTags = await prisma.tag.findMany();
  const findTag = (slug: string) => {
    const tag = allTags.find((t) => t.slug === slug);
    if (!tag) throw new Error(`Tag not found: ${slug}`);
    return tag;
  };

  // --- INDIVIDUAL PRODUCTS ---
  const artisanMooncake = await prisma.product.create({
    data: {
      slug: "artisan-mooncake",
      name: "Artisan French-Style Mooncake Gift",
      category: Category.GIFT,
      shortDesc:
        "Small-batch baked mooncakes combining French pastry techniques with local ingredients.",
      description:
        "Handcrafted in small batches, featuring fillings made with seasonal fruits and nuts. The crust is inspired by classic French butter pastry. Ideal as a VIP or premium client gift for Mid-Autumn campaigns.",
      coverImage: "/images/demo/artisan-mooncake.jpg",
      images: [],
      sku: "GIFT-001",
      minQty: 50,
      priceHint: "Project-based quotation by volume and configuration.",
      currency: "TWD",
      tags: {
        create: [
          { tag: { connect: { id: findTag("mid-autumn").id } } },
          { tag: { connect: { id: findTag("premium").id } } },
          { tag: { connect: { id: findTag("corporate").id } } },
        ],
      },
    },
  });

  const rpetTote = await prisma.product.create({
    data: {
      slug: "rpet-woven-tote-bag",
      name: "rPET Woven Tote Bag",
      category: Category.GIFT,
      shortDesc:
        "High-quality woven bag made from recycled PET bottles, designed for long-term brand exposure.",
      description:
        "Body is made from 100% rPET woven fabric, with options for custom woven labels and full-print artwork. Suitable for trade shows, loyalty programs, corporate welcome kits, and ESG campaigns.",
      coverImage: "/images/demo/rpet-tote.jpg",
      images: [],
      sku: "BAG-001",
      minQty: 300,
      priceHint: "Depends on size, printing method, and accessories.",
      currency: "TWD",
      tags: {
        create: [
          { tag: { connect: { id: findTag("gift-bag").id } } },
          { tag: { connect: { id: findTag("esg").id } } },
          { tag: { connect: { id: findTag("corporate").id } } },
        ],
      },
    },
  });

  const magneticRigidBox = await prisma.product.create({
    data: {
      slug: "magnetic-rigid-gift-box",
      name: "Magnetic Closure Rigid Gift Box",
      category: Category.GIFT_BOX,
      shortDesc:
        "Classic magnetic closure rigid box structure, widely used for mid-to-high end products.",
      description:
        "Made with 2.5mm greyboard wrapped with printed art paper inside and outside. Supports hot-stamping, embossing, debossing, spot UV and specialty papers. Ideal for electronics, beauty, tea and premium gifts.",
      coverImage: "/images/demo/magnetic-rigid-box.jpg",
      images: [],
      sku: "BOX-001",
      minQty: 500,
      priceHint: "MOQ 500 sets; pricing depends on materials and finishes.",
      currency: "TWD",
      tags: {
        create: [
          { tag: { connect: { id: findTag("gift-box").id } } },
          { tag: { connect: { id: findTag("premium").id } } },
        ],
      },
    },
  });

  const drawerTeaBox = await prisma.product.create({
    data: {
      slug: "drawer-tea-gift-box",
      name: "Drawer-Style Tea Gift Box",
      category: Category.GIFT_BOX,
      shortDesc:
        "Drawer box structure designed for premium tea tins or nutraceutical products.",
      description:
        "Outer box uses a drawer structure with a custom insert (paper tray or EVA). Suitable for 2–3 tea tins or health supplement bottles. Smooth pulling experience and suitable for premium positioning.",
      coverImage: "/images/demo/drawer-tea-box.jpg",
      images: [],
      sku: "BOX-002",
      minQty: 500,
      priceHint: "Insert and size can be adjusted according to the content.",
      currency: "TWD",
      tags: {
        create: [
          { tag: { connect: { id: findTag("gift-box").id } } },
          { tag: { connect: { id: findTag("corporate").id } } },
        ],
      },
    },
  });

  const newYearSnacks = await prisma.product.create({
    data: {
      slug: "lunar-newyear-snack-gift",
      name: "Lunar New Year Assorted Snack Box",
      category: Category.GIFT,
      shortDesc:
        "A curated assortment of nuts, cookies and candies in a festive New Year gift box.",
      description:
        "Modern red-and-gold visual language with clean illustration style. Contents can be configured by budget. Ideal for employee appreciation gifts and client New Year campaigns.",
      coverImage: "/images/demo/newyear-snacks.jpg",
      images: [],
      sku: "GIFT-002",
      minQty: 100,
      priceHint: "Pricing depends on content combinations and volume.",
      currency: "TWD",
      tags: {
        create: [
          { tag: { connect: { id: findTag("new-year").id } } },
          { tag: { connect: { id: findTag("corporate").id } } },
        ],
      },
    },
  });

  // --- GIFT SET MASTER PRODUCTS ---
  const midAutumnSetProduct = await prisma.product.create({
    data: {
      slug: "mid-autumn-premium-gift-set",
      name: "Mid-Autumn Premium Gift Set Solution",
      category: Category.GIFT_SET,
      shortDesc:
        "A one-stop Mid-Autumn gifting solution combining mooncakes, premium packaging and an ESG-friendly tote.",
      description:
        "Designed for listed companies and brand owners. We handle everything from content selection, structural design, artwork and production, to final packing and logistics. You only need to confirm budget and direction.",
      coverImage: "/images/demo/mid-autumn-set.jpg",
      images: [],
      sku: "SET-001",
      minQty: 50,
      priceHint: "Project quotation based on configuration and volume.",
      currency: "TWD",
      tags: {
        create: [
          { tag: { connect: { id: findTag("mid-autumn").id } } },
          { tag: { connect: { id: findTag("gift-set").id } } },
          { tag: { connect: { id: findTag("premium").id } } },
          { tag: { connect: { id: findTag("corporate").id } } },
        ],
      },
    },
  });

  const newYearSetProduct = await prisma.product.create({
    data: {
      slug: "corporate-lunar-newyear-gift-set",
      name: "Corporate Lunar New Year Gift Set",
      category: Category.GIFT_SET,
      shortDesc:
        "A ready-to-run New Year gifting solution combining snacks and a reusable bag.",
      description:
        "New Year visual identity built with a balance of festive red/gold and modern muted tones. The set combines an assorted snack box with a long-life bag (paper bag or rPET tote) to extend brand exposure.",
      coverImage: "/images/demo/corporate-newyear-set.jpg",
      images: [],
      sku: "SET-002",
      minQty: 100,
      priceHint: "Recommended for 100+ sets corporate orders.",
      currency: "TWD",
      tags: {
        create: [
          { tag: { connect: { id: findTag("new-year").id } } },
          { tag: { connect: { id: findTag("gift-set").id } } },
          { tag: { connect: { id: findTag("corporate").id } } },
        ],
      },
    },
  });

  // --- GIFT SET STRUCTURE ---
  await prisma.giftSet.create({
    data: {
      product: { connect: { id: midAutumnSetProduct.id } },
      items: {
        create: [
          { product: { connect: { id: artisanMooncake.id } }, quantity: 1 },
          { product: { connect: { id: magneticRigidBox.id } }, quantity: 1 },
          { product: { connect: { id: rpetTote.id } }, quantity: 1 },
        ],
      },
    },
  });

  await prisma.giftSet.create({
    data: {
      product: { connect: { id: newYearSetProduct.id } },
      items: {
        create: [
          { product: { connect: { id: newYearSnacks.id } }, quantity: 1 },
          { product: { connect: { id: rpetTote.id } }, quantity: 1 },
        ],
      },
    },
  });

  console.log("✅ Products & gift sets seeded (EN)");

  // --- BLOG POSTS (EN) ---
  await prisma.blogPost.create({
    data: {
      slug: "esg-packaging-with-rpet-bags",
      title: "Building ESG Stories into Packaging with rPET Tote Bags",
      excerpt:
        "ESG should not live only in reports. When your gifts and packaging are genuinely sustainable, recipients can feel the brand’s intent instantly.",
      content:
        "This is placeholder content for the ESG packaging article. Later, we can replace it with full Markdown content and localized versions (e.g. zh-TW, ja-JP).",
      coverImage: "/images/demo/blog-esg.jpg",
      isPublished: true,
      publishedAt: new Date(),
      tags: {
        create: [
          { tag: { connect: { id: findTag("esg").id } } },
          { tag: { connect: { id: findTag("gift-bag").id } } },
        ],
      },
    },
  });

  await prisma.blogPost.create({
    data: {
      slug: "corporate-gift-strategy-101",
      title: "Corporate Gift Strategy 101: From “What to Give” to “How to Package”",
      excerpt:
        "The product itself is only the starting point. The unboxing experience, structure and story are what make a gift truly memorable.",
      content:
        "This is placeholder content for the corporate gift strategy article. We intentionally keep it in English for now so that future locales can be added via an i18n-aware content model.",
      coverImage: "/images/demo/blog-strategy.jpg",
      isPublished: true,
      publishedAt: new Date(),
      tags: {
        create: [
          { tag: { connect: { id: findTag("corporate").id } } },
          { tag: { connect: { id: findTag("premium").id } } },
        ],
      },
    },
  });

  console.log("✅ Blog posts seeded (EN)");

  // --- STATIC PAGES (EN BASELINE) ---
  await prisma.page.createMany({
    data: [
      {
        slug: "about",
        title: "About Us",
        content:
          "We are a packaging design and manufacturing team focused on premium gifting, presentation packaging and custom bags. From structural engineering and material selection to artwork, sampling and mass production, we help brands build complete gifting experiences.",
        heroImage: null,
        seoTitle: "About Us | Premium Gifting & Packaging Studio",
        seoDescription:
          "End-to-end packaging and gifting partner for brands and corporate clients: gift sets, rigid boxes, custom tote bags and more.",
      },
      {
        slug: "factory",
        title: "Factories & Production Capability",
        content:
          "We work with facilities in both Shenzhen and Taiwan, covering rigid boxes, folding cartons, paper bags, woven bags and composite materials. We support FSC-certified paper, rPET fabrics and international shipping for multi-region campaigns.",
        heroImage: null,
        seoTitle: "Factories | Gifting & Packaging Production Capabilities",
        seoDescription:
          "Paper boxes, paper bags, rPET tote bags and various specialty packaging with experience shipping to multiple markets.",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Pages seeded (EN)");

  // --- ADMIN USER (EN) ---  ⚠️  這裡改成 hashed password
  const rawPassword = "changeme123"; // 登入密碼（先用這個，之後你可以改）
  const hashed = await bcrypt.hash(rawPassword, 10);

  await prisma.adminUser.create({
    data: {
      email: "admin@example.com",
      name: "Demo Admin",
      password: hashed,
      role: "admin",
    },
  });

  console.log("✅ Admin user seeded (admin@example.com / changeme123)");

  console.log("🌱 Seeding finished (EN baseline).");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
