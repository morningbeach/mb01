// app/api/ai/analyze-packaging/route.ts
// 包裝圖片分析 API - 使用 Gemini 2.5 分析包裝結構並生成工廠專業術語
import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 中文專業提示詞
const PROMPT_ZH = `你是一位擁有20年經驗的包裝結構工程師。你的任務是根據圖片，產出一份專業的工廠生產工藝單。

首先判斷這張圖片是否為包裝盒/包裝袋相關產品。如果不是（例如是動物、人物、風景等），請直接回傳：
{ "error": true, "message": "此圖片不是包裝產品，無法進行分析" }

如果是包裝產品，請使用繁體中文，依照以下格式輸出專業分析：

## 📦 結構分析
- **盒型/袋型**: (例如：天地蓋盒、飛機盒、手提袋、夾鏈袋等)
- **結構特點**: (開口方式、折疊方式、加固設計等)
- **建議刀模**: (專業刀模編號或描述)

## 🎨 材質建議
- **主體材質**: (例如：350g 白卡紙、牛皮紙、灰板紙等)
- **表面處理**: (例如：霧膜、亮膜、觸感膜等)
- **內襯建議**: (如有需要)

## ⚙️ 印刷工藝
- **印刷方式**: (例如：四色印刷、專色印刷等)
- **特殊工藝**: (例如：燙金、UV、壓紋、局部上光等)
- **建議色數**: (CMYK + 專色數量)

## 💡 生產建議
- **最小起訂量**: (根據結構複雜度建議)
- **生產週期**: (預估天數)
- **注意事項**: (品質控制要點)

請確保輸出專業、精緻，適合提供給工廠作為生產參考。`;

// 英文專業提示詞
const PROMPT_EN = `You are a packaging structural engineer with 20 years of experience. Your task is to produce a professional factory production specification sheet based on the image.

First, determine if this image shows a packaging box/bag product. If not (e.g., animals, people, landscapes), please return:
{ "error": true, "message": "This image is not a packaging product and cannot be analyzed" }

If it is a packaging product, please output a professional analysis in English following this format:

## 📦 Structure Analysis
- **Box/Bag Type**: (e.g., Rigid Box, Mailer Box, Tote Bag, Zipper Pouch, etc.)
- **Structural Features**: (Opening method, folding method, reinforcement design, etc.)
- **Recommended Die-cut**: (Professional die-cut number or description)

## 🎨 Material Recommendations
- **Primary Material**: (e.g., 350gsm C1S, Kraft Paper, Grey Board, etc.)
- **Surface Finish**: (e.g., Matte Lamination, Gloss Lamination, Soft Touch, etc.)
- **Lining Suggestions**: (If applicable)

## ⚙️ Printing Process
- **Printing Method**: (e.g., CMYK Offset, Spot Color, etc.)
- **Special Finishes**: (e.g., Hot Foil Stamping, UV Coating, Embossing, Spot UV, etc.)
- **Recommended Colors**: (CMYK + Spot colors)

## 💡 Production Recommendations
- **Minimum Order Quantity**: (Based on structural complexity)
- **Production Lead Time**: (Estimated days)
- **Quality Notes**: (Quality control key points)

Please ensure the output is professional and refined, suitable for factory production reference.`;

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, lang = 'zh' } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "缺少圖片 URL" },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API Key 未設定" },
        { status: 500 }
      );
    }

    // 下載圖片並轉換為 base64
    console.log("[Analyze] Downloading image:", imageUrl);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("無法下載圖片");
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/png";

    // 選擇提示詞
    const prompt = lang === 'en' ? PROMPT_EN : PROMPT_ZH;

    // 使用 Gemini 2.0 Flash (支援圖片分析的最新模型)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                    mimeType,
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
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error("[Analyze] Gemini API error:", errorData);
      throw new Error("Gemini API 呼叫失敗");
    }

    const geminiData = await geminiResponse.json();
    console.log("[Analyze] Gemini response received");

    // 解析回應
    const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error("無法取得分析結果");
    }

    // 檢查是否為錯誤回應（不是包裝產品）
    if (textContent.includes('"error": true') || textContent.includes('"error":true')) {
      try {
        const errorJson = JSON.parse(textContent);
        return NextResponse.json({
          success: false,
          error: errorJson.message || "此圖片無法分析",
        });
      } catch {
        // 不是 JSON 格式，繼續處理
      }
    }

    return NextResponse.json({
      success: true,
      analysis: textContent,
    });

  } catch (error: any) {
    console.error("[Analyze] Error:", error);
    return NextResponse.json(
      { error: error.message || "分析失敗" },
      { status: 500 }
    );
  }
}
