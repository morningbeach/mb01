// app/api/admin/gemini-models/route.ts
// 獲取可用的 Gemini 模型列表
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "請提供 Gemini API Key" },
        { status: 400 }
      );
    }

    // 調用 Gemini API 獲取模型列表
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "無法獲取模型列表");
    }

    const data = await response.json();
    
    // 篩選支持圖片生成的模型
    const models = data.models || [];
    const imageGenerationModels = models.filter((model: any) => {
      const supportedMethods = model.supportedGenerationMethods || [];
      return supportedMethods.includes("generateContent");
    }).map((model: any) => ({
      name: model.name.replace("models/", ""),
      displayName: model.displayName || model.name,
      description: model.description || "",
      supportedMethods: model.supportedGenerationMethods || [],
      inputTokenLimit: model.inputTokenLimit || 0,
      outputTokenLimit: model.outputTokenLimit || 0,
    }));

    return NextResponse.json({
      success: true,
      models: imageGenerationModels,
      totalCount: imageGenerationModels.length,
    });
  } catch (error: any) {
    console.error("[Gemini Models] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "獲取模型列表失敗" },
      { status: 500 }
    );
  }
}
