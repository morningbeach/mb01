import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Batch V2 - AI 產品分析 API
 * 1. AI 先自動判斷產品類型（盒/袋/禮品）
 * 2. 根據類型載入對應的 FilterDimension 維度架構
 * 3. AI 從維度中偵測適合的標籤（可複選）
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const apiKey = formData.get("apiKey") as string;
    const image = formData.get("image") as File;
    const userHint = formData.get("userHint") as string;

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

    // ===== 第一步：AI 判斷產品類型 =====
    const categoryPrompt = `你是一個專業的禮品包裝產品專家。請分析這張產品圖片，判斷這是什麼類型的產品。

請只回覆以下三種類型之一（只回覆英文單字，不要其他文字）：
- BOX：如果是包裝盒、紙盒、禮盒、摺疊盒、瓦楞盒、精裝盒等盒類產品
- BAG：如果是提袋、手提袋、購物袋、環保袋、帆布袋、不織布袋等袋類產品
- GIFT：如果是禮品、贈品、3C產品、日用品、文具、杯子、保溫瓶等非盒非袋的產品

${userHint ? `用戶提示：${userHint}` : ""}

只回覆 BOX、BAG 或 GIFT 其中一個單字。`;

    const categoryResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: base64Image } },
              { text: categoryPrompt },
            ],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 10 },
        }),
      }
    );

    if (!categoryResponse.ok) {
      const errorData = await categoryResponse.json();
      return NextResponse.json(
        { error: `類型判斷失敗: ${errorData.error?.message || "未知錯誤"}` },
        { status: 500 }
      );
    }

    const categoryData = await categoryResponse.json();
    const categoryText = categoryData.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || "BOX";
    
    // 映射到 FilterDimension 的 category
    const categoryMap: Record<string, string> = {
      "BOX": "print-packaging",
      "BAG": "bag",
      "GIFT": "gift",
    };
    const detectedCategory = categoryMap[categoryText] || "print-packaging";
    const categoryLabel = { "print-packaging": "盒", "bag": "袋", "gift": "禮品" }[detectedCategory] || "盒";

    // ===== 第二步：載入該類別的所有維度和標籤 =====
    const dimensions = await prisma.filterDimension.findMany({
      where: {
        category: detectedCategory,
        is_active: true,
      },
      include: {
        tagMappings: {
          include: {
            tag: true,
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    // 構建維度->標籤的結構（供前端樹狀顯示）
    const dimensionTree = dimensions.map((dim) => ({
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
      })),
    }));

    // 構建標籤列表給 AI（用於偵測）
    const tagListForPrompt = dimensionTree
      .map((dim) => {
        const tagNames = dim.tags.map((t) => `${t.name_zh}(${t.slug})`).join(", ");
        return `【${dim.name_zh}】: ${tagNames}`;
      })
      .join("\n");

    // 用戶提示區塊
    const userHintSection = userHint
      ? `\n\n【用戶提示】用戶告訴你這批產品可能是：${userHint}\n請根據這個提示來分析圖片。\n`
      : "";

    // ===== 第三步：AI 分析產品資訊 + 標籤偵測 =====
    const analysisPrompt = `你是一個專業的禮品包裝產品專家。請分析這張產品圖片，並為這個產品生成完整的上架資訊。${userHintSection}

這是一個「${categoryLabel}」類別的產品。

請以 JSON 格式回覆，包含以下欄位：

{
  "name_en": "英文產品名稱（簡潔專業，20字以內）",
  "name_zh": "中文產品名稱（簡潔專業，10字以內）",
  "slug": "url-friendly-slug（小寫英文、連字號分隔）",
  "shortDesc_en": "英文簡短描述（一句話，50字以內）",
  "shortDesc_zh": "中文簡短描述（一句話，30字以內）",
  "description_en": "英文詳細描述（100-200字，描述產品特色、用途、優點）",
  "description_zh": "中文詳細描述（50-100字，描述產品特色、用途、優點）",
  "dimensions_en": "英文尺寸描述（如：20 × 15 × 8 cm）",
  "dimensions_zh": "中文尺寸描述（如：20 × 15 × 8 公分）",
  "materials_en": "英文材質描述",
  "materials_zh": "中文材質描述",
  "priceHint_en": "英文價格提示（如：From $5.00/pc）",
  "priceHint_zh": "中文價格提示（如：每個 $5.00 起）",
  "minQty": 最小訂購量數字,
  "leadTime_en": "英文交期（如：15-20 business days）",
  "leadTime_zh": "中文交期（如：15-20 個工作天）",
  "seoTitle_en": "英文 SEO 標題（60字以內）",
  "seoTitle_zh": "中文 SEO 標題（30字以內）",
  "seoDescription_en": "英文 SEO 描述（160字以內）",
  "seoDescription_zh": "中文 SEO 描述（80字以內）",
  "suggestedNewTags": ["如果現有標籤都不適合，可以建議新標籤名稱（中文）"],
  "detectedTags": {
    "維度slug": ["標籤slug1", "標籤slug2"]
  }
}

【重要：標籤偵測規則】
以下是這個類別可用的維度和標籤。請根據圖片內容，從每個維度中選擇最適合的標籤 slug 填入 detectedTags：

${tagListForPrompt}

detectedTags 格式範例：
{
  "box-type": ["folding-carton"],
  "box-material": ["cardboard", "kraft"],
  "box-finish": ["matte-lamination", "spot-uv"],
  "box-application": ["cosmetics"]
}

規則：
- 請只從上述標籤中選擇，使用 slug（括號內的值）而非中文名稱
- 如果某個維度沒有適合的標籤，留空陣列 []
- 每個維度可選多個標籤
- 如果現有標籤都不足以描述產品，可以在 suggestedNewTags 中建議新標籤

只回覆 JSON，不要其他說明文字。`;

    const analysisResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: base64Image } },
              { text: analysisPrompt },
            ],
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json();
      return NextResponse.json(
        { error: `產品分析失敗: ${errorData.error?.message || "未知錯誤"}` },
        { status: 500 }
      );
    }

    const analysisData = await analysisResponse.json();
    const responseText = analysisData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return NextResponse.json(
        { error: "Gemini 未返回有效回覆，請稍後重試" },
        { status: 500 }
      );
    }

    // 解析 JSON
    let productData;
    try {
      let cleanedText = responseText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("無法找到 JSON");
      }
    } catch (parseError) {
      console.error("JSON 解析錯誤:", parseError);
      return NextResponse.json(
        { error: "AI 回覆格式錯誤，請重試" },
        { status: 500 }
      );
    }

    // ===== 第四步：處理偵測到的標籤 =====
    const detectedTags = productData.detectedTags || {};
    const suggestedNewTags = Array.isArray(productData.suggestedNewTags)
      ? productData.suggestedNewTags
      : [];
    const suggestedTagNames = Array.isArray(productData.suggestedTags)
      ? productData.suggestedTags
      : [];
    
    // 收集 AI 選中的 tag slugs（用於前端預選）
    const selectedTagSlugs: string[] = [];
    for (const tagSlugs of Object.values(detectedTags)) {
      if (Array.isArray(tagSlugs)) {
        for (const tagSlug of tagSlugs) {
          if (typeof tagSlug === "string" && tagSlug.trim()) {
            selectedTagSlugs.push(tagSlug.trim());
          }
        }
      }
    }

    // 返回結果
    return NextResponse.json({
      success: true,
      // AI 判斷的類別
      detectedCategory, // "print-packaging" | "bag" | "gift"
      categoryLabel,    // "盒" | "袋" | "禮品"
      // 產品資訊（移除 detectedTags 和 suggestedNewTags，這些另外傳）
      productData: {
        ...productData,
        detectedTags: undefined,
        suggestedNewTags: undefined,
        suggestedTags: suggestedTagNames,
        // 根據類別設定預設的 DB category
        category: detectedCategory === "print-packaging" ? "GIFT_BOX" : 
                  detectedCategory === "bag" ? "GIFT" : "GIFT",
      },
      // 維度樹結構（供前端樹狀顯示）
      dimensionTree,
      // AI 選中的 tag slugs（用於前端預選）
      selectedTagSlugs,
      // AI 建議的新標籤（不自動使用）
      suggestedNewTags,
      detectedTagMap: detectedTags,
    });
  } catch (error: any) {
    console.error("分析錯誤:", error);
    return NextResponse.json(
      { error: error.message || "分析失敗" },
      { status: 500 }
    );
  }
}
