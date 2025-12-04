import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PrismaDimensionBase = Awaited<ReturnType<typeof prisma.filterDimension.findMany>>[number];
type PrismaDimension = PrismaDimensionBase & {
  tagMappings: Array<{
    tag: {
      id: string;
      slug: string;
      name: string;
      name_zh: string;
      name_en: string;
      color: string | null;
    };
  }>;
};

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const BAG_DIMENSIONS = {
  material: "bag-material",
  style: "bag-style",
  extras: ["bag-print", "bag-feature", "bag-eco", "bag-application"],
};
const BOX_DIMENSIONS = {
  families: ["folding-carton", "rigid-box", "other-print"],
  extras: ["application", "material", "finishing"],
};

function formatOptions(dimension?: PrismaDimension) {
  if (!dimension) return "";
  return dimension.tagMappings
    .map((m) => `- ${m.tag.slug}: ${m.tag.name_zh || m.tag.slug}${m.tag.name_en ? ` / ${m.tag.name_en}` : ""}`)
    .join("\n");
}

function extractJson(text?: string) {
  if (!text) return null;
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (err) {
    return null;
  }
}

async function callGemini({
  apiKey,
  prompt,
  base64Image,
  mimeType,
  temperature = 0.1,
  maxOutputTokens = 400,
}: {
  apiKey: string;
  prompt: string;
  base64Image: string;
  mimeType: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt },
        ],
      }],
      generationConfig: { temperature, maxOutputTokens },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || "Gemini 呼叫失敗";
    throw new Error(message);
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

function normalizeSlugs(slugs: unknown, allowed: Set<string>, fallback: string[]): string[] {
  if (!Array.isArray(slugs)) return fallback;
  const result: string[] = [];
  slugs.forEach((slug) => {
    if (typeof slug === "string") {
      const lowered = slug.trim().toLowerCase();
      if (allowed.has(lowered) && !result.includes(lowered)) {
        result.push(lowered);
      }
    }
  });
  return result.length > 0 ? result : fallback;
}

function pushSuggestions(rawSuggestions: any, collector: string[]) {
  if (!Array.isArray(rawSuggestions)) return;
  rawSuggestions.forEach((item: any) => {
    if (item && typeof item === "object") {
      const dimension = item.dimension || item.dim || "unknown-dimension";
      const nameZh = item.name_zh || item.name || "未命名";
      const nameEn = item.name_en || "";
      const reason = item.reason || item.note || "";
      collector.push(`${dimension}: ${nameZh}${nameEn ? ` / ${nameEn}` : ""}${reason ? `（${reason}）` : ""}`);
    } else if (typeof item === "string") {
      collector.push(item);
    }
  });
}

/**
 * 提示詞測試 API - 用於優化 AI 標籤偵測提示詞
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const apiKey = formData.get("apiKey") as string;
    const image = formData.get("image") as File;
    const userHint = formData.get("userHint") as string;
    const customPrompt = formData.get("customPrompt") as string;

    if (!apiKey) {
      return NextResponse.json(
        { error: "請提供 Google API Key" },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { error: "請上傳圖片" },
        { status: 400 }
      );
    }

    // 將圖片轉換為 base64
    const bytes = await image.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const userHintSection = userHint ? `\n\n【用戶提示】${userHint}` : "";

    // ===== 第一步：AI 判斷產品類型 =====
    const categoryPrompt = `你是一個專業的禮品包裝產品專家。請分析這張產品圖片，判斷這是什麼類型的產品。${userHintSection}

請只回覆以下三種之一（英文大寫，不要其他文字）：
- BOX：紙質包裝盒、紙盒、禮盒、摺疊盒、瓦楞盒、精裝盒等紙盒
- BAG：提袋、購物袋、環保袋、帆布袋、不織布袋等袋類產品
- GIFT：禮品、贈品、3C產品、家居用品、非紙質盒（例如鐵盒、木盒、塑膠盒等）

如果外觀像盒子但材質不是紙，請判斷為 GIFT。`;

    const categoryText = await callGemini({
      apiKey,
      prompt: categoryPrompt,
      base64Image,
      mimeType,
      temperature: 0.1,
      maxOutputTokens: 10,
    });

    const categoryMap: Record<string, string> = {
      "BOX": "print-packaging",
      "BAG": "bag",
      "GIFT": "gift",
    };
    const detectedCategory = categoryMap[categoryText.trim().toUpperCase()] || "print-packaging";
    const categoryLabel = { "print-packaging": "盒", "bag": "袋", "gift": "禮品" }[detectedCategory] || "盒";

    // ===== 載入維度 =====
    const rawDimensions = (await prisma.filterDimension.findMany({
      where: { category: detectedCategory, is_active: true },
      include: {
        tagMappings: {
          include: { tag: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    })) as PrismaDimension[];

    const dimensionMap = new Map(rawDimensions.map((dim) => [dim.slug, dim]));

    const dimensionTree = rawDimensions.map((dim) => ({
      id: dim.id,
      slug: dim.slug,
      name_zh: dim.name_zh,
      name_en: dim.name_en,
      icon: dim.icon,
      allow_multiple: dim.allow_multiple,
      tags: dim.tagMappings.map((m) => ({
        id: m.tag.id,
        slug: m.tag.slug,
        name_zh: m.tag.name_zh || m.tag.name,
        name_en: m.tag.name_en || m.tag.name,
        color: m.tag.color,
      })),
    }));

    const detectedTagMap: Record<string, string[]> = {};
    const suggestedNewTags: string[] = [];
    let detectedMainCategory = "";
    let detectedMainCategoryName = "";
    let detectedItemSlug = "";
    let detectedItemName = "";

    // ===== 分類別偵測 =====
    if (detectedCategory === "bag") {
      // ===== 提袋流程 =====
      // Step 2: 材質
      const materialDim = dimensionMap.get(BAG_DIMENSIONS.material);
      const materialOptions = formatOptions(materialDim);
      if (materialDim && materialOptions) {
        const materialPrompt = `你正在分類一個提袋產品。請根據圖片判斷袋子主要材質。${userHintSection}

材質選項：
${materialOptions}

請以 JSON 回覆：
{
  "isMixed": true 或 false,
  "materials": ["slug1", "slug2"...],
  "suggestedNewTags": [
    { "dimension": "bag-material", "name_zh": "中文", "name_en": "English", "reason": "原因" }
  ]
}

規則：
- 如果材質很明確，materials 只選 1 個 slug。
- 如果是混和材質（例如帆布 + 皮革），請設定 isMixed: true 並選 2~3 個最主要的 slug。
- 只允許使用上述 slug，若沒有可用，選最接近的並在 suggestedNewTags 建議新標籤。
- 不可以空白。`;
        const materialAnswer = await callGemini({
          apiKey,
          prompt: materialPrompt,
          base64Image,
          mimeType,
          temperature: 0.2,
          maxOutputTokens: 200,
        });
        const parsed = extractJson(materialAnswer) || {};
        const allowed = new Set(materialDim.tagMappings.map((m) => m.tag.slug));
        const materialFallback: string[] = materialDim.tagMappings[0]?.tag.slug
          ? [materialDim.tagMappings[0]?.tag.slug]
          : [];
        let materials = normalizeSlugs(parsed.materials, allowed, materialFallback);
        if (!parsed.isMixed && materials.length > 1) {
          materials = materials.slice(0, 1);
        }
        detectedTagMap[BAG_DIMENSIONS.material] = materials;
        pushSuggestions(parsed.suggestedNewTags, suggestedNewTags);
      }

      // Step 3: 袋形 (強制單一)
      const styleDim = dimensionMap.get(BAG_DIMENSIONS.style);
      const styleOptions = formatOptions(styleDim);
      if (styleDim && styleOptions) {
        const stylePrompt = `請判斷這個提袋屬於哪一種袋形。${userHintSection}

袋形選項：
${styleOptions}

只回覆 JSON：{"style": "slug"}
- 只能選一個 slug。
- 如果沒有完全符合，選最接近的並在 suggestion 中描述原因。`;
        const styleAnswer = await callGemini({
          apiKey,
          prompt: stylePrompt,
          base64Image,
          mimeType,
          temperature: 0.2,
          maxOutputTokens: 80,
        });
        const parsed = extractJson(styleAnswer) || {};
        const allowed = new Set(styleDim.tagMappings.map((m) => m.tag.slug));
        const styleFallback: string[] = styleDim.tagMappings[0]?.tag.slug
          ? [styleDim.tagMappings[0]?.tag.slug]
          : [];
        const styleSlug = normalizeSlugs(parsed.style ? [parsed.style] : [], allowed, styleFallback);
        detectedTagMap[BAG_DIMENSIONS.style] = styleSlug;
        detectedItemSlug = styleSlug[0] || "";
        const matchedTag = styleDim.tagMappings.find((m) => m.tag.slug === detectedItemSlug);
        detectedItemName = matchedTag ? `${matchedTag.tag.name_zh || ""}${matchedTag.tag.name_en ? ` / ${matchedTag.tag.name_en}` : ""}` : "";
        pushSuggestions(parsed.suggestedNewTags, suggestedNewTags);
      }

      // Step 4: 其餘維度（非強制）
      const extrasPromptParts = BAG_DIMENSIONS.extras.map((slug) => {
        const dim = dimensionMap.get(slug);
        if (!dim) return "";
        return `【${dim.name_zh}】(slug: ${slug})\n${formatOptions(dim)}`;
      }).join("\n\n");

      const extrasPrompt = `針對此提袋，請為以下維度挑選最適合的 slug。${userHintSection}

${extrasPromptParts}

回覆 JSON：
{
  "bag-print": ["slug"],
  "bag-feature": ["slug"],
  "bag-eco": ["slug"],
  "bag-application": ["slug"],
  "suggestedNewTags": [ { "dimension": "bag-feature", "name_zh": "中文", "name_en": "English", "reason": "原因" } ]
}

規則：
- 每個維度可選可不選，可複選
- 如果圖片看不出相關資訊，可以留空 []
- 如果沒有完全符合，選最接近的並在 suggestedNewTags 建議`;

      const extrasAnswer = await callGemini({
        apiKey,
        prompt: extrasPrompt,
        base64Image,
        mimeType,
        temperature: 0.25,
        maxOutputTokens: 300,
      });
      const extrasJson = extractJson(extrasAnswer) || {};
      BAG_DIMENSIONS.extras.forEach((slug) => {
        const dim = dimensionMap.get(slug);
        if (!dim) return;
        const allowed = new Set(dim.tagMappings.map((m) => m.tag.slug));
        // 不強制選擇，允許空陣列
        const result = normalizeSlugs(extrasJson[slug], allowed, []);
        if (result.length > 0) {
          detectedTagMap[slug] = result;
        }
      });
      pushSuggestions(extrasJson.suggestedNewTags, suggestedNewTags);
    } else if (detectedCategory === "print-packaging") {
      // ===== 盒子流程 =====
      // Step 2: 判斷盒型家族（強制選擇）
      const familyPrompt = `請判斷這個包裝產品屬於以下哪一種：
- folding-carton：一般紙盒（摺疊盒、插底盒等）
- rigid-box：精緻硬盒（天地盒、抽屜盒等）
- other-print：其他印刷品（卡片、貼紙、信封等）

${userHintSection}

只回覆一個 slug：folding-carton / rigid-box / other-print
不可留空，必須選擇一個。`;
      
      const familyAnswer = await callGemini({
        apiKey,
        prompt: familyPrompt,
        base64Image,
        mimeType,
        temperature: 0.15,
        maxOutputTokens: 20,
      });
      
      const selectedFamily = BOX_DIMENSIONS.families.includes(familyAnswer.trim())
        ? familyAnswer.trim()
        : "folding-carton"; // 預設為一般紙盒

      detectedMainCategory = selectedFamily;
      const familyDim = dimensionMap.get(selectedFamily);
      
      if (familyDim) {
        detectedMainCategoryName = `${familyDim.name_zh}${familyDim.name_en ? ` / ${familyDim.name_en}` : ""}`;
        
        // Step 3: 從選中的家族中選擇具體盒型（1-2個）
        const options = formatOptions(familyDim);
        const familyTagPrompt = `這是一個「${familyDim.name_zh}」。以下是可用的具體盒型選項：

${options}

請根據圖片選擇 1~2 個最貼近的盒型 slug。${userHintSection}

回覆 JSON：
{
  "selectedSlugs": ["slug1", "slug2"],
  "suggestedNewTags": [
    { "dimension": "${selectedFamily}", "name_zh": "中文", "name_en": "English", "reason": "原因" }
  ]
}

規則：
- 至少選 1 個 slug，最多 2 個
- 如果沒有完全符合，選最接近的並在 suggestedNewTags 建議新盒型`;
        
        const tagAnswer = await callGemini({
          apiKey,
          prompt: familyTagPrompt,
          base64Image,
          mimeType,
          temperature: 0.2,
          maxOutputTokens: 200,
        });
        
        const parsed = extractJson(tagAnswer) || {};
        const allowed = new Set(familyDim.tagMappings.map((m) => m.tag.slug));
        const fallback: string[] = familyDim.tagMappings[0]?.tag.slug
          ? [familyDim.tagMappings[0]?.tag.slug]
          : [];
        
        let selectedSlugs = normalizeSlugs(parsed.selectedSlugs, allowed, fallback);
        // 限制最多2個
        if (selectedSlugs.length > 2) {
          selectedSlugs = selectedSlugs.slice(0, 2);
        }
        
        detectedTagMap[selectedFamily] = selectedSlugs;
        detectedItemSlug = selectedSlugs[0] || "";
        const match = familyDim.tagMappings.find((m) => m.tag.slug === detectedItemSlug);
        detectedItemName = match ? `${match.tag.name_zh || ""}${match.tag.name_en ? ` / ${match.tag.name_en}` : ""}` : "";
        pushSuggestions(parsed.suggestedNewTags, suggestedNewTags);
      }

      // Step 4: 應用場景 / 材質 / 加工工藝（非強制）
      const extrasPromptParts = BOX_DIMENSIONS.extras.map((slug) => {
        const dim = dimensionMap.get(slug);
        if (!dim) return "";
        return `【${dim.name_zh}】(slug: ${slug})\n${formatOptions(dim)}`;
      }).join("\n\n");

      const boxExtrasPrompt = `這是一個「${detectedMainCategoryName}」的「${detectedItemName}」盒子。請為以下維度挑選最適合的 slug。${userHintSection}

${extrasPromptParts}

回覆 JSON：
{
  "application": ["slug"],
  "material": ["slug"],
  "finishing": ["slug"],
  "suggestedNewTags": [
    { "dimension": "material", "name_zh": "中文", "name_en": "English", "reason": "原因" }
  ]
}

規則：
- 每個維度可選可不選，可複選
- 如果圖片看不出相關資訊，可以留空 []
- 如果沒有完全符合，選最接近的並在 suggestedNewTags 建議`;

      const boxExtrasAnswer = await callGemini({
        apiKey,
        prompt: boxExtrasPrompt,
        base64Image,
        mimeType,
        temperature: 0.25,
        maxOutputTokens: 400,
      });
      
      const boxExtrasJson = extractJson(boxExtrasAnswer) || {};
      BOX_DIMENSIONS.extras.forEach((slug) => {
        const dim = dimensionMap.get(slug);
        if (!dim) return;
        const allowed = new Set(dim.tagMappings.map((m) => m.tag.slug));
        // 不強制選擇，允許空陣列
        const result = normalizeSlugs(boxExtrasJson[slug], allowed, []);
        if (result.length > 0) {
          detectedTagMap[slug] = result;
        }
      });
      pushSuggestions(boxExtrasJson.suggestedNewTags, suggestedNewTags);
    } else {
      // ===== 禮品流程 =====
      // Step 2: 品項維度偵測（12個品項維度選一個）
      const GIFT_ITEM_DIMENSIONS = [
        'gift-drinkware',
        'gift-bag-type',
        'gift-stationery',
        'gift-tech',
        'gift-card-holder',
        'gift-apparel',
        'gift-keychain',
        'gift-home',
        'gift-fragrance',
        'gift-outdoor',
        'gift-toys',
        'gift-office',
      ];

      // 建立維度選項列表
      const itemDimensionsPromptParts = GIFT_ITEM_DIMENSIONS.map((slug) => {
        const dim = dimensionMap.get(slug);
        if (!dim) return "";
        return `- ${slug}: ${dim.name_zh}${dim.name_en ? ` / ${dim.name_en}` : ""}`;
      }).filter(Boolean).join("\n");

      const itemDimensionPrompt = `請判斷這個禮品屬於哪一種品項類型。${userHintSection}

可用的品項類型：
${itemDimensionsPromptParts}

回覆 JSON：
{
  "selectedDimension": "slug"
}

只能選一個 slug，不可留空。`;

      const itemDimensionAnswer = await callGemini({
        apiKey,
        prompt: itemDimensionPrompt,
        base64Image,
        mimeType,
        temperature: 0.15,
        maxOutputTokens: 50,
      });

      const parsed = extractJson(itemDimensionAnswer) || {};
      const selectedDimensionSlug = GIFT_ITEM_DIMENSIONS.includes(parsed.selectedDimension)
        ? parsed.selectedDimension
        : GIFT_ITEM_DIMENSIONS[0]; // 預設第一個

      const selectedDimension = dimensionMap.get(selectedDimensionSlug);
      if (selectedDimension) {
        detectedMainCategory = selectedDimensionSlug;
        detectedMainCategoryName = `${selectedDimension.name_zh}${selectedDimension.name_en ? ` / ${selectedDimension.name_en}` : ""}`;

        // Step 3: 從選中的品項維度中，選擇具體產品名稱作為標籤（1-2個）
        const itemOptions = formatOptions(selectedDimension);
        const itemPrompt = `這是一個「${detectedMainCategoryName}」禮品。請從以下選項中選擇 1-2 個最符合的產品名稱。${userHintSection}

${itemOptions}

回覆 JSON：
{
  "selectedSlugs": ["slug1", "slug2"],
  "suggestedNewTags": [
    { "dimension": "${selectedDimensionSlug}", "name_zh": "中文", "name_en": "English", "reason": "原因" }
  ]
}

規則：
- 至少選 1 個 slug，最多 2 個
- 如果沒有完全符合，選最接近的並在 suggestedNewTags 建議`;

        const itemAnswer = await callGemini({
          apiKey,
          prompt: itemPrompt,
          base64Image,
          mimeType,
          temperature: 0.2,
          maxOutputTokens: 150,
        });

        const itemParsed = extractJson(itemAnswer) || {};
        const allowed = new Set(selectedDimension.tagMappings.map((m) => m.tag.slug));
        const fallback: string[] = selectedDimension.tagMappings[0]?.tag.slug
          ? [selectedDimension.tagMappings[0]?.tag.slug]
          : [];
        
        let selectedSlugs = normalizeSlugs(itemParsed.selectedSlugs, allowed, fallback);
        // 限制最多2個
        if (selectedSlugs.length > 2) {
          selectedSlugs = selectedSlugs.slice(0, 2);
        }
        
        detectedTagMap[selectedDimensionSlug] = selectedSlugs;
        detectedItemSlug = selectedSlugs[0] || "";
        const match = selectedDimension.tagMappings.find((m) => m.tag.slug === detectedItemSlug);
        detectedItemName = match ? `${match.tag.name_zh || ""}${match.tag.name_en ? ` / ${match.tag.name_en}` : ""}` : "";
        pushSuggestions(itemParsed.suggestedNewTags, suggestedNewTags);
      }

      // Step 4: 其他標籤偵測（非強制，可選）
      const GIFT_EXTRA_DIMENSIONS = [
        'gift-application',
        'gift-material',
        'gift-print',
        'gift-feature',
        'gift-eco',
      ];

      const giftExtraDimensions = GIFT_EXTRA_DIMENSIONS
        .map(slug => dimensionMap.get(slug))
        .filter(Boolean) as PrismaDimension[];

      if (giftExtraDimensions.length > 0) {
        const extrasPromptParts = giftExtraDimensions.map((dim) => {
          return `【${dim.name_zh}】(slug: ${dim.slug})\n${formatOptions(dim)}`;
        }).join("\n\n");

        const giftExtrasPrompt = `這是一個「${detectedMainCategoryName}」的「${detectedItemName}」禮品。請為以下維度挑選最適合的 slug。${userHintSection}

${extrasPromptParts}

回覆 JSON：
{
  "gift-application": ["slug"],
  "gift-material": ["slug"],
  "gift-print": ["slug"],
  "gift-feature": ["slug"],
  "gift-eco": ["slug"],
  "suggestedNewTags": [
    { "dimension": "gift-material", "name_zh": "中文", "name_en": "English", "reason": "原因" }
  ]
}

規則：
- 每個維度可選可不選，可複選
- 如果圖片看不出相關資訊，可以留空 []
- 如果沒有完全符合，選最接近的並在 suggestedNewTags 建議`;

        const giftExtrasAnswer = await callGemini({
          apiKey,
          prompt: giftExtrasPrompt,
          base64Image,
          mimeType,
          temperature: 0.25,
          maxOutputTokens: 500,
        });
        const giftExtrasJson = extractJson(giftExtrasAnswer) || {};
        giftExtraDimensions.forEach((dim) => {
          const allowed = new Set(dim.tagMappings.map((m) => m.tag.slug));
          // 不強制選擇，允許空陣列
          const result = normalizeSlugs(giftExtrasJson[dim.slug], allowed, []);
          if (result.length > 0) {
            detectedTagMap[dim.slug] = result;
          }
        });
        pushSuggestions(giftExtrasJson.suggestedNewTags, suggestedNewTags);
      }
    }

    // ===== 產品資訊描述（簡化版）=====
    const productInfoPrompt = `你是一個專業的禮品包裝產品文案專家。請為這張圖片中的產品撰寫商品資訊。${userHintSection}

這是一個「${categoryLabel}」類別產品。

請回覆 JSON：
{
  "name_en": "英文名稱（20字以內）",
  "name_zh": "中文名稱（10字以內）",
  "slug": "url-friendly slug（小寫英文字母與連字號）",
  "shortDesc_en": "英文一句話描述",
  "shortDesc_zh": "中文一句話描述"
}

只回覆 JSON，不要額外文字。`;

    const productInfoAnswer = await callGemini({
      apiKey,
      prompt: productInfoPrompt,
      base64Image,
      mimeType,
      temperature: 0.35,
      maxOutputTokens: 400,
    });
    const productData = extractJson(productInfoAnswer) || {};

    return NextResponse.json({
      success: true,
      detectedCategory,
      categoryLabel,
      detectedMainCategory,
      detectedMainCategoryName,
      detectedItemSlug,
      detectedItemName,
      dimensions: dimensionTree,
      detectedTagMap,
      suggestedNewTags,
      productData,
      rawResponse: productInfoAnswer,
    });


  } catch (error: any) {
    console.error("分析錯誤:", error);
    return NextResponse.json(
      { error: error.message || "分析失敗" },
      { status: 500 }
    );
  }
}
