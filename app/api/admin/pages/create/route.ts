// app/api/admin/pages/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      slug,
      type,
      navLabel_zh,
      navLabel_en,
      label_zh,
      label_en,
      title_zh,
      title_en,
      desc_zh,
      desc_en,
      showInNav,
      isEnabled,
    } = body;

    if (!slug || !type) {
      return NextResponse.json({ error: "缺少必要欄位" }, { status: 400 });
    }

    // 檢查 slug 是否已存在
    const existing = await prisma.sitePage.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "此 slug 已被使用" }, { status: 400 });
    }

    // 根據類型初始化 pageData
    let initialPageData = {};

    if (type === "ABOUT") {
      initialPageData = {
        story_zh: "我們支援全球品牌、代理商和採購商的專案型包裝：從季節性禮品活動到長期零售線。我們的團隊閱讀您的簡報，與您的內部利害關係人保持一致，並將所有內容轉化為結構、材料和生產就緒的規格。\n\n我們不推銷標準目錄，而是從您的限制出發：數量、時間、運輸和品牌指南。從那裡我們提出結構方向、粗略的預算範圍和對您的專案有意義的打樣計劃。\n\n隨著時間推移，我們幫助品牌建立可重複使用的盒子和袋子的結構「語言」，因此每個新專案都感覺一致但從不重複。",
        story_en: "We support global brands, agencies and buyers with project-based packaging: from seasonal gifting campaigns to long-term retail lines. Our team reads your brief, aligns with your internal stakeholders, and translates everything into structures, materials and production-ready specs.\n\nInstead of pushing standard catalogs, we start from your constraints: quantities, timing, shipping, and brand guidelines. From there we propose structural directions, rough budget ranges and sampling plans that make sense for your project.\n\nOver time, we help brands build reusable structural language for boxes and bags, so each new project feels consistent but never repetitive.",
        storyImage: "/cdn/about/studio.jpg",
        values: [
          {
            title_zh: "清晰",
            title_en: "Clarity",
            body_zh: "我們讓選項、權衡和成本易於內部解釋。",
            body_en: "We make the options, trade-offs and costs easy to explain internally.",
          },
          {
            title_zh: "一致性",
            title_en: "Consistency",
            body_zh: "從打樣到量產，我們專注於可重複的結果。",
            body_en: "From sampling to mass production, we focus on repeatable results.",
          },
          {
            title_zh: "可靠性",
            title_en: "Reliability",
            body_zh: "實際的時間表、透明的更新和誠實的溝通。",
            body_en: "Realistic timelines, transparent updates and honest communication.",
          },
        ],
        stats: [
          { label_zh: "包裝經驗", label_en: "Years in packaging", value: "10+" },
          { label_zh: "年度專案", label_en: "Projects per year", value: "100+" },
          { label_zh: "服務區域", label_en: "Regions served", value: "Asia / EU / US" },
        ],
        experienceTitle_zh: "禮品包裝經驗",
        experienceTitle_en: "Experience in gifting",
        experience_zh:
          "・ FMCG 和零售品牌的季節性禮品套裝。\n・ 會員和 VIP 禮品計劃。\n・ 品牌包裝線的長期結構系統。",
        experience_en:
          "・ Seasonal gift sets for FMCG and retail brands.\n・ Membership and VIP gifting programs.\n・ Long-term structural systems for brand packaging lines.",
      };
    } else if (type === "FACTORY") {
      initialPageData = {
        stats: [
          { label_en: "Factory area", label_zh: "工廠面積", value: "10,000 m²" },
          { label_en: "People", label_zh: "員工", value: "120+" },
          { label_en: "Monthly capacity", label_zh: "月產能", value: "300,000+ boxes" },
          { label_en: "Certifications", label_zh: "認證", value: "ISO / audited" },
        ],
        images: [
          {
            url: "/cdn/factory/floor.jpg",
            caption_en: "Clean and organized production floor.",
            caption_zh: "清潔整齊的生產樓層。",
          },
          {
            url: "/cdn/factory/machines.jpg",
            caption_en: "Equipment for printing, die-cutting and rigid box forming.",
            caption_zh: "印刷、模切和硬盒成型設備。",
          },
          {
            url: "/cdn/factory/qc.jpg",
            caption_en: "QC teams checking structure, printing and finishing.",
            caption_zh: "QC 團隊檢查結構、印刷和整理。",
          },
        ],
        equipment_zh:
          "・ 4色和5色膠印\n・ 全自動和半自動硬盒生產線\n・ 模切和壓痕機\n・ 燙金和壓紋設備\n・ 覆膜和表面處理線",
        equipment_en:
          "・ 4-color and 5-color offset printing\n・ Automatic and semi-automatic rigid box lines\n・ Die-cutting and creasing machines\n・ Hot stamping and embossing equipment\n・ Lamination and surface finishing lines",
        qc_zh:
          "・ 內部結構工程師負責盒子設計和測試\n・ 生產前打樣和批准\n・ 量產期間的過程檢查\n・ 包裝和運輸前的最終檢驗",
        qc_en:
          "・ In-house structural engineers for box design and testing\n・ Pre-production sampling and approval\n・ In-process checks during mass production\n・ Final inspection before packing and shipping",
        workflow: [
          {
            step: "01",
            title_en: "Engineering",
            title_zh: "工程",
            body_en: "We confirm structure, materials and key tolerances.",
            body_zh: "我們確認結構、材料和關鍵公差。",
          },
          {
            step: "02",
            title_en: "Sampling",
            title_zh: "打樣",
            body_en: "White and printed samples for structure & finishing approval.",
            body_zh: "白樣和印刷樣品用於結構和整理批准。",
          },
          {
            step: "03",
            title_en: "Mass production",
            title_zh: "量產",
            body_en: "Production with in-line QC at critical stages.",
            body_zh: "在關鍵階段進行在線 QC 的生產。",
          },
          {
            step: "04",
            title_en: "Packing & shipping",
            title_zh: "包裝和運輸",
            body_en: "Final QC, packing and shipping arrangements to your location.",
            body_zh: "最終 QC、包裝和運輸安排到您的位置。",
          },
        ],
        workflowTitle_zh: "從需求到交付",
        workflowTitle_en: "From brief to shipment",
        ctaTitle_zh: "想要審核我們的工廠或查看更多詳情？",
        ctaTitle_en: "Want to audit our factory or see more details?",
        ctaDesc_zh: "我們可以分享更多關於設備、流程和以前的審核信息。",
        ctaDesc_en: "We can share more information on equipment, processes and previous audits.",
      };
    } else if (type === "CONTACT") {
      initialPageData = {
        formLabels: {
          name_zh: "姓名",
          name_en: "Name",
          email_zh: "電子郵件",
          email_en: "Email",
          company_zh: "公司",
          company_en: "Company",
          quantity_zh: "數量",
          quantity_en: "Quantity",
          timeline_zh: "時間表",
          timeline_en: "Timeline",
          details_zh: "專案詳情",
          details_en: "Project details",
          submit_zh: "提交",
          submit_en: "Submit",
          emailNote_zh: "或直接發送電子郵件至 info@mbpackaging.com",
          emailNote_en: "Or email us directly at info@mbpackaging.com",
        },
        contactDetails: {
          title_zh: "聯絡資訊",
          title_en: "Contact details",
          email: "info@mbpackaging.com",
          whatsapp: "+86 138 xxxx xxxx",
        },
        officeInfo: {
          title_zh: "辦公地址",
          title_en: "Office location",
          address_zh: "中國深圳市寶安區",
          address_en: "Bao'an District, Shenzhen, China",
          note_zh: "（僅限預約訪問）",
          note_en: "(By appointment only)",
        },
        businessHours: {
          title_zh: "營業時間",
          title_en: "Business hours",
          hours_zh: "週一至週五，上午 9:00 至下午 6:00（中國標準時間）",
          hours_en: "Mon–Fri, 9:00 AM – 6:00 PM (CST)",
          note_zh: "我們通常在 24 小時內回覆。",
          note_en: "We typically reply within 24 hours.",
        },
      };
    }

    const page = await prisma.sitePage.create({
      data: {
        slug,
        type,
        isDefault: false,
        isEnabled: isEnabled || false,
        showInNav: showInNav !== false,
        navLabel_zh,
        navLabel_en,
        label_zh,
        label_en,
        title_zh,
        title_en,
        desc_zh,
        desc_en,
        pageData: initialPageData,
        order: 100,
      },
    });

    return NextResponse.json({ id: page.id, slug: page.slug });
  } catch (error: any) {
    console.error("Error creating page:", error);
    return NextResponse.json({ error: error.message || "建立頁面失敗" }, { status: 500 });
  }
}
