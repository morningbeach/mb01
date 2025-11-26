import { NextRequest, NextResponse } from "next/server";

// Gemini API 分析圖片
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const apiKey = formData.get("apiKey") as string;
    const image = formData.get("image") as File;
    const existingTags = formData.get("existingTags") as string;
    const userHint = formData.get("userHint") as string; // 用戶的 AI 提示

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

    // 解析現有標籤
    const tags = existingTags ? JSON.parse(existingTags) : [];
    const tagList = tags.map((t: any) => `${t.name_zh || t.name} (${t.name_en || t.name})`).join(", ");

    // 用戶提示區塊
    const userHintSection = userHint 
      ? `\n\n【用戶提示】用戶告訴你這批產品可能是：${userHint}\n請根據這個提示來分析圖片，確保產品資訊符合用戶的描述。\n`
      : "";

    // 建立 Gemini API 請求
    const prompt = `你是一個專業的禮品包裝產品專家。請分析這張產品圖片，並為這個產品生成完整的上架資訊。${userHintSection}

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

    // 呼叫 Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        { error: `Gemini API 錯誤: ${errorData.error?.message || "未知錯誤"}` },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    
    // 解析 Gemini 回覆
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      return NextResponse.json(
        { error: "Gemini 未返回有效回覆" },
        { status: 500 }
      );
    }

    // 嘗試解析 JSON（移除可能的 markdown 標記）
    let productData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("無法找到 JSON");
      }
    } catch (parseError) {
      console.error("JSON 解析錯誤:", responseText);
      return NextResponse.json(
        { error: "無法解析 AI 回覆，請重試" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      productData,
      rawResponse: responseText,
    });
  } catch (error: any) {
    console.error("分析圖片失敗:", error);
    return NextResponse.json(
      { error: error.message || "分析失敗" },
      { status: 500 }
    );
  }
}
