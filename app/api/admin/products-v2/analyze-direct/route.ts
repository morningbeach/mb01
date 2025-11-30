import { NextRequest, NextResponse } from "next/server";

// 將 ArrayBuffer 轉為 base64 (Web 標準方法)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 直接分析產品圖片（不需要上傳到 R2）
 * POST /api/admin/products-v2/analyze-direct
 * 支援兩種方式：
 * 1. image: base64 編碼的圖片
 * 2. imageUrl: 圖片網址（伺服器端下載）
 * 
 * 欄位與 /api/admin/products-v2/analyze 完全一致
 */
export async function POST(request: NextRequest) {
  try {
    const { apiKey, image, imageUrl, title, existingTags, userHint } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "缺少 API Key" },
        { status: 400 }
      );
    }

    let base64Image = image;
    let mimeType = "image/jpeg";

    // 如果沒有提供 base64 圖片，嘗試從 URL 下載
    if (!base64Image && imageUrl) {
      try {
        console.log("[Analyze Direct] Downloading image from URL:", imageUrl);
        const imgResponse = await fetch(imageUrl);
        if (!imgResponse.ok) {
          throw new Error(`HTTP ${imgResponse.status}`);
        }
        const imgBuffer = await imgResponse.arrayBuffer();
        base64Image = arrayBufferToBase64(imgBuffer);
        mimeType = imgResponse.headers.get("content-type") || "image/jpeg";
        console.log("[Analyze Direct] Image downloaded, size:", imgBuffer.byteLength);
      } catch (downloadError: any) {
        console.error("[Analyze Direct] Failed to download image:", downloadError);
        return NextResponse.json(
          { success: false, error: `無法下載圖片: ${downloadError.message}` },
          { status: 400 }
        );
      }
    }

    if (!base64Image) {
      return NextResponse.json(
        { success: false, error: "缺少圖片（base64 或 URL）" },
        { status: 400 }
      );
    }

    // 解析現有標籤
    const tags = existingTags || [];
    const tagList = tags.map((t: any) => `${t.name_zh || t.name} (${t.name_en || t.name})`).join(", ");

    // 用戶提示區塊
    const userHintSection = userHint 
      ? `\n\n【用戶提示】用戶告訴你這批產品可能是：${userHint}\n請根據這個提示來分析圖片，確保產品資訊符合用戶的描述。\n`
      : "";

    // 原始標題參考
    const titleSection = title ? `\n原始標題參考：${title}` : "";

    // 建立 Gemini API 請求 - 與 /products-v2/analyze 完全一致
    const prompt = `你是一個專業的禮品包裝產品專家。請分析這張產品圖片，並為這個產品生成完整的上架資訊。${userHintSection}${titleSection}

請以 JSON 格式回覆，包含以下欄位（所有文字欄位都需要中英文版本）：

{
  "name_en": "英文產品名稱（簡潔專業，20字以內）",
  "name_zh": "中文產品名稱（簡潔專業，10字以內）",
  "slug": "url-friendly-slug（小寫英文、連字號分隔）",
  "shortDesc_en": "英文簡短描述（一句話，50字以內）",
  "shortDesc_zh": "中文簡短描述（一句話，30字以內）",
  "description_en": "英文詳細描述（100-200字，描述產品特色、用途、優點）",
  "description_zh": "中文詳細描述（50-100字，描述產品特色、用途、優點）",
  "category": "產品分類（只能是：GIFT、GIFT_BOX、GIFT_SET 其中之一）",
  "dimensions_en": "英文尺寸描述（如：20 × 15 × 8 cm）",
  "dimensions_zh": "中文尺寸描述（如：20 × 15 × 8 公分）",
  "materials_en": "英文材質描述",
  "materials_zh": "中文材質描述",
  "suggestedTags": ["建議的標籤名稱陣列（中文）"],
  "priceHint_en": "英文價格提示（如：From $5.00/pc）",
  "priceHint_zh": "中文價格提示（如：每個 $5.00 起）",
  "minQty": 最小訂購量數字,
  "leadTime_en": "英文交期（如：15-20 business days）",
  "leadTime_zh": "中文交期（如：15-20 個工作天）",
  "seoTitle_en": "英文 SEO 標題（60字以內）",
  "seoTitle_zh": "中文 SEO 標題（30字以內）",
  "seoDescription_en": "英文 SEO 描述（160字以內）",
  "seoDescription_zh": "中文 SEO 描述（80字以內）"
}

現有可用標籤：${tagList || "無"}

請優先從現有標籤中選擇適合的標籤放入 suggestedTags。如果沒有合適的現有標籤，可以建議新標籤。

請根據圖片內容準確判斷產品類型。如果是：
- 單一禮品/贈品/3C產品/日用品 → GIFT
- 包裝盒/禮盒/紙盒 → GIFT_BOX
- 禮品組合/禮籃/套組 → GIFT_SET

只回覆 JSON，不要其他說明文字。`;

    // 呼叫 Gemini 2.0 Flash API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Image,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error("[Analyze Direct] Gemini API error:", errorData);
      throw new Error(errorData.error?.message || "Gemini API 呼叫失敗");
    }

    const geminiData = await geminiResponse.json();
    
    // 解析回應
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error("[Analyze Direct] Gemini 回覆結構:", JSON.stringify(geminiData, null, 2));
      throw new Error("Gemini 未返回有效回覆，可能是模型過載，請稍後重試");
    }

    // 嘗試解析 JSON（移除可能的 markdown 標記）
    let productData;
    try {
      // 清理 markdown 標記
      let cleanedText = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("無法找到 JSON");
      }
    } catch (parseError) {
      console.error("[Analyze Direct] JSON 解析錯誤:", responseText);
      throw new Error("無法解析 AI 回覆，請重試");
    }

    return NextResponse.json({
      success: true,
      productData,
      rawResponse: responseText,
    });
  } catch (error: any) {
    console.error("[Analyze Direct] 分析錯誤:", error);
    return NextResponse.json(
      { success: false, error: error.message || "分析失敗" },
      { status: 500 }
    );
  }
}
