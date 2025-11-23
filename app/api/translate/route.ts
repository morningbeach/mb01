// app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, from, to } = await request.json();

    if (!text || !from || !to) {
      return NextResponse.json(
        { success: false, error: "缺少必要參數" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // 如果沒有 API key，回傳 fallback
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        translatedText: `翻譯功能需要申請 - ${text}`,
      });
    }

    // 呼叫 OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text from ${from} to ${to}. Only return the translated text, nothing else.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error("無法取得翻譯結果");
    }

    return NextResponse.json({
      success: true,
      translatedText,
    });
  } catch (error) {
    console.error("翻譯錯誤:", error);
    return NextResponse.json(
      { success: false, error: "翻譯失敗" },
      { status: 500 }
    );
  }
}
