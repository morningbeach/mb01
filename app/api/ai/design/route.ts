// app/api/ai/design/route.ts
// 公開 AI 設計 API - 使用 Gemini 3 Pro 進行圖片編輯
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import sharp from "sharp";
import { cookies } from "next/headers";

// 強制使用 Node.js runtime（sharp 需要 Node.js）
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 秒超時

// 每日使用限制
const DAILY_LIMIT = 10;

// 預先生成的浮水印圖片（上傳到 R2）
// 這個 PNG 是在本地用「微軟正黑體」生成的，包含中文 "mbpack.co | 清晨沙灘 AI包裝工廠"
// 加上版本號避免快取問題
const WATERMARK_PNG_URL = "https://img.mbpack.co/watermark-cn.png?v=2";

// 快取浮水印圖片
let cachedWatermarkBuffer: Buffer | null = null;

// 下載浮水印圖片（帶快取）
async function getWatermarkBuffer(): Promise<Buffer | null> {
  if (cachedWatermarkBuffer) {
    return cachedWatermarkBuffer;
  }
  
  try {
    console.log("[AI Design] Downloading watermark PNG from R2:", WATERMARK_PNG_URL);
    const response = await fetch(WATERMARK_PNG_URL);
    
    if (!response.ok) {
      console.error("[AI Design] Failed to download watermark:", response.status);
      return null;
    }
    
    cachedWatermarkBuffer = Buffer.from(await response.arrayBuffer());
    console.log("[AI Design] Watermark downloaded, size:", cachedWatermarkBuffer.length);
    return cachedWatermarkBuffer;
  } catch (error: any) {
    console.error("[AI Design] Watermark download error:", error?.message || error);
    return null;
  }
}

// 檢查是否為 admin 登入狀態
async function checkAdminSession(request: NextRequest): Promise<boolean> {
  try {
    // 從 cookie 取得 session ID
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("admin_session")?.value;
    
    if (!sessionId) {
      return false;
    }
    
    // 檢查 session 是否有效且未過期
    const session = await prisma.adminSession.findUnique({
      where: { sessionId },
    });
    
    if (!session) {
      return false;
    }
    
    // 檢查是否過期
    if (session.expiresAt < new Date()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("[AI Design] Admin session check error:", error);
    return false;
  }
}

// 取得 UTC+8 的今日日期字串（YYYY-MM-DD）
function getTodayUTC8(): string {
  const now = new Date();
  // UTC+8
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return utc8.toISOString().split("T")[0];
}

// 取得 UTC+8 的今日開始時間
function getTodayStartUTC8(): Date {
  const todayStr = getTodayUTC8();
  // 當天 00:00 UTC+8 = 前一天 16:00 UTC
  const date = new Date(todayStr + "T00:00:00+08:00");
  return date;
}

// 取得客戶端 IP
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

// 生成隨機分享 Token
function generateShareToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// 添加浮水印到圖片（使用 R2 上的 PNG 浮水印）
async function addWatermark(imageBuffer: Buffer, mimeType: string): Promise<Buffer> {
  try {
    console.log("[AI Design] Adding watermark, buffer size:", imageBuffer.length);
    
    // 下載浮水印 PNG
    const watermarkBuffer = await getWatermarkBuffer();
    
    if (!watermarkBuffer) {
      console.error("[AI Design] Could not get watermark, returning original image");
      return imageBuffer;
    }
    
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 800;
    console.log("[AI Design] Image dimensions:", width, "x", height);
    
    // 根據圖片寬度調整浮水印大小（40% 寬度）
    const targetWidth = Math.floor(width * 0.4);
    
    // 調整浮水印大小（允許放大）
    const resizedWatermark = await sharp(watermarkBuffer)
      .resize(targetWidth, null, { 
        fit: 'inside',
        kernel: 'lanczos3', // 使用高品質縮放
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    // 計算位置
    const watermarkMeta = await sharp(resizedWatermark).metadata();
    const watermarkHeight = watermarkMeta.height || 0;
    const paddingRight = Math.floor(width * 0.05); // 右邊距離 5%
    const paddingBottom = Math.floor(height * 0.03); // 底部距離 3%
    
    console.log("[AI Design] Watermark resized to width:", targetWidth, "position: right", paddingRight, "bottom", paddingBottom);
    
    // 把浮水印蓋在右下角（往中間偏移）
    const result = await image
      .composite([
        {
          input: resizedWatermark,
          left: width - (watermarkMeta.width || 0) - paddingRight,
          top: height - watermarkHeight - paddingBottom,
          blend: "over"
        },
      ])
      .toBuffer();
    
    console.log("[AI Design] Watermark added successfully, result size:", result.length);
    return result;
  } catch (error: any) {
    console.error("[AI Design] Watermark error:", error?.message || error);
    return imageBuffer;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt, productId, productSlug } = await request.json();
    
    // 取得 API Key（僅伺服器端）
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("[AI Design] API Key exists:", !!apiKey, "Length:", apiKey?.length || 0);
    
    if (!apiKey) {
      console.error("[AI Design] Missing GEMINI_API_KEY - Please set it in Vercel Environment Variables");
      return NextResponse.json(
        { success: false, error: "服務暫時無法使用（API Key 未設定）" },
        { status: 503 }
      );
    }
    
    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { success: false, error: "請提供圖片和提示詞" },
        { status: 400 }
      );
    }
    
    // 取得客戶端 IP
    const ipAddress = getClientIP(request);
    
    // 檢查是否為 admin 登入狀態
    const isAdmin = await checkAdminSession(request);
    console.log("[AI Design] IP:", ipAddress, "isAdmin:", isAdmin);
    
    // 取得今日使用次數
    const todayStart = getTodayStartUTC8();
    const usageCount = await prisma.aiUsageLog.count({
      where: {
        ipAddress,
        createdAt: {
          gte: todayStart,
        },
      },
    });
    
    // 非 admin 用戶需要檢查今日使用次數限制
    if (!isAdmin && usageCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { 
          success: false, 
          error: "今日使用次數已達上限",
          limitReached: true,
          usageCount,
          dailyLimit: DAILY_LIMIT,
        },
        { status: 429 }
      );
    }
    
    // 下載原始圖片
    console.log("[AI Design] Fetching image:", imageUrl);
    const imageResponse = await fetch(imageUrl, {
      signal: AbortSignal.timeout(30000),
    });
    
    if (!imageResponse.ok) {
      throw new Error(`無法下載原始圖片 (HTTP ${imageResponse.status})`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";
    
    // 使用 Gemini 3 Pro Image Preview 模型（支援圖片生成與編輯）
    const selectedModel = "gemini-3-pro-image-preview";
    
    console.log("[AI Design] Using model:", selectedModel);
    console.log("[AI Design] Prompt:", prompt);
    
    // 調用 Gemini API
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
                  text: `請根據以下指示編輯這張包裝產品圖片：${prompt}

保持原本的構圖和風格，只進行指定的修改。直接生成編輯後的圖片。`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
            responseModalities: ["IMAGE", "TEXT"],
          },
        }),
        signal: AbortSignal.timeout(120000), // 120 秒超時
      }
    );
    
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("[AI Design] API Error:", geminiResponse.status, errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`Gemini API 錯誤 (HTTP ${geminiResponse.status})`);
      }
      throw new Error(errorData.error?.message || `Gemini API 呼叫失敗`);
    }
    
    const geminiData = await geminiResponse.json();
    console.log("[AI Design] Response received");
    
    // 檢查回應是否包含圖片
    const candidate = geminiData.candidates?.[0];
    if (!candidate) {
      throw new Error("AI 沒有返回結果");
    }
    
    // 查找圖片內容
    const parts = candidate.content?.parts || [];
    let imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
    
    // 嘗試其他命名格式
    if (!imagePart) {
      imagePart = parts.find((p: any) => p.inline_data?.mime_type?.startsWith("image/"));
    }
    
    if (!imagePart) {
      // 檢查是否有文字回應（可能是錯誤訊息）
      const textPart = parts.find((p: any) => p.text);
      if (textPart) {
        console.error("[AI Design] Model returned text:", textPart.text);
        throw new Error(`AI 未能生成圖片: ${textPart.text.substring(0, 100)}`);
      }
      throw new Error("AI 返回的結果中沒有圖片");
    }
    
    // 取得圖片資料
    const editedImageData = imagePart.inlineData?.data || imagePart.inline_data?.data;
    const editedMimeType = imagePart.inlineData?.mimeType || imagePart.inline_data?.mime_type;
    
    // 將 base64 轉換為 Buffer
    let editedBuffer = Buffer.from(editedImageData, "base64");
    
    // 添加浮水印
    editedBuffer = await addWatermark(editedBuffer, editedMimeType);
    
    // 生成分享 Token
    const shareToken = generateShareToken();
    
    // 上傳到 R2（uploads/USERAISHOW/{YYYYMMDD}/）
    const todayStr = getTodayUTC8().replace(/-/g, "");
    const ext = editedMimeType.split("/")[1] || "png";
    const filename = `uploads/USERAISHOW/${todayStr}/ai_${Date.now()}_${shareToken}.${ext}`;
    
    console.log("[AI Design] Uploading to R2:", filename);
    
    const uploadedUrl = await uploadToR2(filename, editedBuffer, editedMimeType);
    
    console.log("[AI Design] Upload success:", uploadedUrl);
    
    // 記錄使用
    await prisma.aiUsageLog.create({
      data: {
        ipAddress,
        productId: productId || null,
        productSlug: productSlug || null,
        resultUrl: uploadedUrl,
        prompt,
        shareToken,
      },
    });
    
    // 計算剩餘次數（admin 無限制）
    const remainingUses = isAdmin ? -1 : DAILY_LIMIT - usageCount - 1;
    
    return NextResponse.json({
      success: true,
      resultUrl: uploadedUrl,
      shareToken,
      shareUrl: `/ai-share/${shareToken}`,
      remainingUses,
      dailyLimit: isAdmin ? -1 : DAILY_LIMIT,
      isAdmin,
      message: "圖片生成成功",
    });
    
  } catch (error: any) {
    console.error("[AI Design] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "圖片生成失敗" 
      },
      { status: 500 }
    );
  }
}

// GET: 取得使用狀況
export async function GET(request: NextRequest) {
  try {
    const ipAddress = getClientIP(request);
    const todayStart = getTodayStartUTC8();
    
    // 檢查是否為 admin 登入狀態
    const isAdmin = await checkAdminSession(request);
    
    const usageCount = await prisma.aiUsageLog.count({
      where: {
        ipAddress,
        createdAt: {
          gte: todayStart,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      usageCount,
      remainingUses: isAdmin ? -1 : Math.max(0, DAILY_LIMIT - usageCount),
      dailyLimit: isAdmin ? -1 : DAILY_LIMIT,
      isAdmin,
    });
    
  } catch (error: any) {
    console.error("[AI Design] GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
