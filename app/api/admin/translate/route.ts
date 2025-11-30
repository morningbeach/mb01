import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * 使用 Google Gemini API 翻譯文字
 * POST /api/admin/translate
 * Body: { text: string, targetLanguage: string, apiKey: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, apiKey } = await request.json();

    if (!text || !targetLanguage || !apiKey) {
      return NextResponse.json(
        { success: false, error: "缺少必要參數" },
        { status: 400 }
      );
    }

    // 語言對應表
    const languageMap: { [key: string]: string } = {
      asia: "繁體中文",
      japan: "日文",
      korea: "韓文",
      europe: "英文",
      america: "英文",
    };

    const targetLang = languageMap[targetLanguage] || "英文";

    // 使用 Gemini Flash 模型（便宜且快速）
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `請將以下文字翻譯成${targetLang}，只需返回翻譯結果，不要加任何額外說明：\n\n${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    const translatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || text;

    return NextResponse.json({
      success: true,
      translatedText: translatedText.trim(),
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
