// app/api/admin/pinterest-official/test/route.ts
// Pinterest Official API 測試端點

import { NextRequest, NextResponse } from "next/server";
import { testPinterestApiConnection } from "@/lib/pinterest-api-official";

/**
 * GET /api/admin/pinterest-official/test
 * 測試 Pinterest Official API 連線
 */
export async function GET(req: NextRequest) {
  try {
    // 可以從 query 傳入測試 token
    const { searchParams } = new URL(req.url);
    const testToken = searchParams.get("token");

    console.log(`[API] 測試 Pinterest Official API 連線`);

    const result = await testPinterestApiConnection(testToken || undefined);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        userInfo: result.userInfo,
        instructions: {
          step1: "前往 https://developers.pinterest.com/",
          step2: "建立應用程式並取得 Access Token",
          step3: "在 .env.local 設定 PINTEREST_ACCESS_TOKEN=your_token",
          step4: "重新啟動開發伺服器",
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          instructions: {
            tokenMissing: !process.env.PINTEREST_ACCESS_TOKEN,
            howToGetToken: [
              "1. 前往 https://developers.pinterest.com/",
              "2. 登入並建立新的應用程式",
              "3. 在 OAuth 設定中取得 Access Token",
              "4. 在 .env.local 加入: PINTEREST_ACCESS_TOKEN=pina_...",
              "5. 重新啟動開發伺服器",
            ],
            apiDocs: "https://developers.pinterest.com/docs/api/v5/",
          },
        },
        { status: result.message.includes("未設定") ? 400 : 401 }
      );
    }
  } catch (error: any) {
    console.error(`[API] Pinterest Official API 測試失敗:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
