// 測試 API 路由是否可以訪問
import { NextResponse } from "next/server";

export async function GET() {
  console.log("[Test] Test route accessed");
  return NextResponse.json({
    status: "ok",
    message: "Gift Box Radar API is working",
    timestamp: new Date().toISOString(),
    env: {
      hasApifyToken: !!process.env.APIFY_TOKEN,
    }
  });
}
