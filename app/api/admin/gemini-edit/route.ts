// app/api/admin/gemini-edit/route.ts
// Gemini 圖片編輯 API - 使用 Gemini 2.0 Flash (支援圖片生成)
import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, imageUrl, prompt, model } = await request.json();

    if (!apiKey) {
      console.error("[Gemini Edit] Missing API key");
      return NextResponse.json(
        { success: false, error: "請提供 Gemini API Key" },
        { status: 400 }
      );
    }

    if (!imageUrl || !prompt) {
      console.error("[Gemini Edit] Missing imageUrl or prompt");
      return NextResponse.json(
        { success: false, error: "請提供圖片網址和提示詞" },
        { status: 400 }
      );
    }

    // 下載原始圖片
    console.log("[Gemini Edit] Fetching image:", imageUrl);
    const imageResponse = await fetch(imageUrl, {
      signal: AbortSignal.timeout(30000), // 30 second timeout for image download
    });
    if (!imageResponse.ok) {
      console.error("[Gemini Edit] Image fetch failed:", imageResponse.status, imageResponse.statusText);
      throw new Error(`無法下載原始圖片 (HTTP ${imageResponse.status})`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // 支援的模型列表（可從前端選擇）
    // gemini-2.0-flash-exp - 支援圖片生成，地區限制較少
    // gemini-3-pro-preview - 最新但有地區限制
    // imagen-3.0-generate-002 - 專門的圖片生成模型
    const selectedModel = model || "gemini-2.0-flash-exp";
    
    console.log("[Gemini Edit] Using model:", selectedModel);

    // 調用 Gemini API
    console.log("[Gemini Edit] Calling Gemini API...");
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
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
                {
                  text: `Edit this image according to the following instructions: ${prompt}

Generate the edited image directly.`,
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
        signal: AbortSignal.timeout(90000), // 90 second timeout for Gemini API
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("[Gemini Edit] API Error:", geminiResponse.status, errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`Gemini API 錯誤 (HTTP ${geminiResponse.status}): ${errorText.substring(0, 200)}`);
      }
      throw new Error(errorData.error?.message || `Gemini API 呼叫失敗 (HTTP ${geminiResponse.status})`);
    }

    const geminiData = await geminiResponse.json();
    console.log("[Gemini Edit] Response received");

    // 檢查回應是否包含圖片
    const candidate = geminiData.candidates?.[0];
    if (!candidate) {
      throw new Error("Gemini 沒有返回結果");
    }

    // 查找圖片內容
    const parts = candidate.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
    
    if (imagePart && imagePart.inlineData) {
      // Gemini 返回了編輯後的圖片
      const editedImageData = imagePart.inlineData.data;
      const editedMimeType = imagePart.inlineData.mimeType;
      
      // 上傳到 R2
      const today = new Date().toISOString().split("T")[0];
      const ext = editedMimeType.split("/")[1] || "png";
      const filename = `AItrend/${today}/edited_${Date.now()}.${ext}`;
      
      const editedBuffer = Buffer.from(editedImageData, "base64");
      const uploadedUrl = await uploadToR2(filename, editedBuffer, editedMimeType);
      
      return NextResponse.json({
        success: true,
        editedUrl: uploadedUrl,
        message: "圖片編輯成功",
      });
    } else {
      // 檢查是否有 inline_data（不同的命名格式）
      const imagePart2 = parts.find((p: any) => p.inline_data?.mime_type?.startsWith("image/"));
      
      if (imagePart2 && imagePart2.inline_data) {
        const editedImageData = imagePart2.inline_data.data;
        const editedMimeType = imagePart2.inline_data.mime_type;
        
        const today = new Date().toISOString().split("T")[0];
        const ext = editedMimeType.split("/")[1] || "png";
        const filename = `AItrend/${today}/edited_${Date.now()}.${ext}`;
        
        const editedBuffer = Buffer.from(editedImageData, "base64");
        const uploadedUrl = await uploadToR2(filename, editedBuffer, editedMimeType);
        
        return NextResponse.json({
          success: true,
          editedUrl: uploadedUrl,
          message: "圖片編輯成功",
        });
      }
      
      // Gemini 只返回了文字描述
      const textPart = parts.find((p: any) => p.text);
      const description = textPart?.text || "無法編輯此圖片";
      
      return NextResponse.json({
        success: false,
        error: `Gemini 無法直接編輯圖片。AI 回應：${description.substring(0, 300)}...`,
      });
    }
  } catch (error: any) {
    console.error("[Gemini Edit] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "處理失敗" },
      { status: 500 }
    );
  }
}
