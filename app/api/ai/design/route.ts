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

// 浮水印文字（使用英文避免 serverless 環境中文字體問題）
const WATERMARK_TEXT = "mbpack.co | AI Packaging Design";

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

// 添加浮水印到圖片（使用 Base64 編碼的字體路徑圖形）
async function addWatermark(imageBuffer: Buffer, mimeType: string): Promise<Buffer> {
  try {
    console.log("[AI Design] Adding watermark, buffer size:", imageBuffer.length);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 800;
    console.log("[AI Design] Image dimensions:", width, "x", height);
    
    // 計算浮水印尺寸
    const barHeight = Math.max(24, Math.floor(height / 28));
    const scale = barHeight / 24; // 基準縮放比例
    
    // 使用 SVG path 繪製 "mbpack.co" 文字（手繪路徑，不依賴字體）
    // 簡化版：M B P A C K . C O
    const textWidth = 180 * scale;
    const textHeight = 14 * scale;
    const textX = width - textWidth - 15;
    const textY = (barHeight - textHeight) / 2;
    
    const svgWatermark = Buffer.from(`
      <svg width="${width}" height="${barHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${barHeight}" fill="rgba(0,0,0,0.45)"/>
        <g transform="translate(${textX}, ${textY}) scale(${scale})">
          <!-- m -->
          <path d="M0,14 L0,4 L2,4 L2,5 C2.5,4.3 3.5,4 4.5,4 C5.5,4 6.3,4.5 6.8,5.2 C7.3,4.5 8.3,4 9.5,4 C11.5,4 12.5,5.5 12.5,7.5 L12.5,14 L10.5,14 L10.5,8 C10.5,6.5 10,5.8 8.8,5.8 C7.6,5.8 7,6.8 7,8 L7,14 L5,14 L5,8 C5,6.5 4.5,5.8 3.3,5.8 C2.1,5.8 1.8,6.8 1.8,8 L1.8,14 Z" fill="white"/>
          <!-- b -->
          <path d="M16,14 L16,0 L18,0 L18,5 C18.5,4.3 19.5,4 20.5,4 C23,4 25,6 25,9 C25,12 23,14 20.5,14 C19.5,14 18.5,13.7 18,13 L18,14 Z M20,12.2 C21.8,12.2 23,11 23,9 C23,7 21.8,5.8 20,5.8 C18.2,5.8 17.8,7 17.8,9 C17.8,11 18.2,12.2 20,12.2 Z" fill="white"/>
          <!-- p -->
          <path d="M28,18 L28,4 L30,4 L30,5 C30.5,4.3 31.5,4 32.5,4 C35,4 37,6 37,9 C37,12 35,14 32.5,14 C31.5,14 30.5,13.7 30,13 L30,18 Z M32,12.2 C33.8,12.2 35,11 35,9 C35,7 33.8,5.8 32,5.8 C30.2,5.8 29.8,7 29.8,9 C29.8,11 30.2,12.2 32,12.2 Z" fill="white"/>
          <!-- a -->
          <path d="M40,14 L40,12.8 C39.3,13.6 38.3,14 37,14 C35,14 43.5,13 43.5,11 C43.5,9.5 44.5,8.5 46.5,8.5 L48,8.5 L48,8 C48,6.5 47.3,5.8 45.8,5.8 C44.5,5.8 43.8,6.3 43.5,7.2 L41.8,6.5 C42.3,5 43.8,4 45.8,4 C48.5,4 50,5.5 50,8 L50,14 Z M48,10 L46.2,10 C45.2,10 44.7,10.4 44.7,11.2 C44.7,12 45.3,12.5 46.5,12.5 C47.8,12.5 48,11.5 48,10.5 Z" fill="white"/>
          <!-- c -->
          <path d="M53,9 C53,6 55,4 58,4 C60,4 61.5,5 62,6.8 L60,7.5 C59.7,6.5 59,5.8 58,5.8 C56.2,5.8 55,7 55,9 C55,11 56.2,12.2 58,12.2 C59,12.2 59.7,11.5 60,10.5 L62,11.2 C61.5,13 60,14 58,14 C55,14 53,12 53,9 Z" fill="white"/>
          <!-- k -->
          <path d="M65,14 L65,0 L67,0 L67,8 L71,4 L73.5,4 L69.5,8.5 L74,14 L71.5,14 L68,9.5 L67,10.5 L67,14 Z" fill="white"/>
          <!-- . -->
          <circle cx="78" cy="13" r="1.5" fill="white"/>
          <!-- c -->
          <path d="M83,9 C83,6 85,4 88,4 C90,4 91.5,5 92,6.8 L90,7.5 C89.7,6.5 89,5.8 88,5.8 C86.2,5.8 85,7 85,9 C85,11 86.2,12.2 88,12.2 C89,12.2 89.7,11.5 90,10.5 L92,11.2 C91.5,13 90,14 88,14 C85,14 83,12 83,9 Z" fill="white"/>
          <!-- o -->
          <path d="M95,9 C95,6 97,4 100,4 C103,4 105,6 105,9 C105,12 103,14 100,14 C97,14 95,12 95,9 Z M100,12.2 C101.8,12.2 103,11 103,9 C103,7 101.8,5.8 100,5.8 C98.2,5.8 97,7 97,9 C97,11 98.2,12.2 100,12.2 Z" fill="white"/>
        </g>
      </svg>
    `);
    
    // 合成圖片 - 放在底部
    const result = await image
      .composite([
        {
          input: svgWatermark,
          gravity: "south",
        },
      ])
      .toBuffer();
    
    console.log("[AI Design] Watermark added successfully, result size:", result.length);
    return result;
  } catch (error: any) {
    console.error("[AI Design] Watermark error:", error?.message || error);
    console.error("[AI Design] Watermark error stack:", error?.stack);
    // 如果添加浮水印失敗，返回原圖
    console.log("[AI Design] Returning original image without watermark due to error");
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
