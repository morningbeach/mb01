// app/api/admin/gemini-generate-image/route.ts
// Gemini 圖片生成 API - 使用 Gemini 3 Pro Image Preview
import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, prompt, model } = await request.json();

    if (!apiKey) {
      console.error("[Gemini Generate] Missing API key");
      return NextResponse.json(
        { success: false, error: "請提供 Gemini API Key" },
        { status: 400 }
      );
    }

    if (!prompt) {
      console.error("[Gemini Generate] Missing prompt");
      return NextResponse.json(
        { success: false, error: "請提供生成提示詞" },
        { status: 400 }
      );
    }

    // 使用 gemini-3-pro-image-preview 作為預設模型
    const selectedModel = model || "gemini-2.0-flash-exp-image-generation";
    
    console.log("[Gemini Generate] Using model:", selectedModel);
    console.log("[Gemini Generate] Prompt:", prompt.substring(0, 100));

    // 調用 Gemini API 生成圖片
    console.log("[Gemini Generate] Calling Gemini API...");
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
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
                  text: `Generate an image based on the following description: ${prompt}

Create a high-quality, professional image suitable for commercial use on a premium packaging website.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseModalities: ["image", "text"],
          },
        }),
        signal: AbortSignal.timeout(120000), // 120 second timeout
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("[Gemini Generate] API Error:", geminiResponse.status, errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`Gemini API 錯誤 (HTTP ${geminiResponse.status}): ${errorText.substring(0, 200)}`);
      }
      throw new Error(errorData.error?.message || `Gemini API 呼叫失敗 (HTTP ${geminiResponse.status})`);
    }

    const geminiData = await geminiResponse.json();
    console.log("[Gemini Generate] Response received");

    // 檢查回應是否包含圖片
    const candidate = geminiData.candidates?.[0];
    if (!candidate) {
      console.error("[Gemini Generate] No candidates in response");
      throw new Error("Gemini 沒有返回結果");
    }

    // 查找圖片內容
    const parts = candidate.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
    
    if (imagePart && imagePart.inlineData) {
      // Gemini 返回了圖片
      const generatedImageData = imagePart.inlineData.data;
      const generatedMimeType = imagePart.inlineData.mimeType;
      
      // 上傳到 R2
      const today = new Date().toISOString().split("T")[0];
      const ext = generatedMimeType.split("/")[1] || "png";
      const filename = `uploads/ai-generated/${today}/gemini_${Date.now()}.${ext}`;
      
      console.log("[Gemini Generate] Uploading to R2:", filename);
      
      // 將 base64 轉換為 Buffer
      const imageBuffer = Buffer.from(generatedImageData, "base64");
      
      // uploadToR2 參數順序: key, body, contentType
      const uploadedUrl = await uploadToR2(filename, imageBuffer, generatedMimeType);
      
      console.log("[Gemini Generate] Upload success:", uploadedUrl);
      
      return NextResponse.json({
        success: true,
        url: uploadedUrl,
        message: "圖片生成成功",
      });
    }

    // 如果沒有圖片，檢查是否有文字回應（可能是錯誤訊息）
    const textPart = parts.find((p: any) => p.text);
    if (textPart) {
      console.error("[Gemini Generate] Model returned text instead of image:", textPart.text);
      throw new Error(`模型未能生成圖片: ${textPart.text.substring(0, 100)}`);
    }

    throw new Error("Gemini 返回的結果中沒有圖片");
    
  } catch (error: any) {
    console.error("[Gemini Generate] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "圖片生成失敗" 
      },
      { status: 500 }
    );
  }
}
