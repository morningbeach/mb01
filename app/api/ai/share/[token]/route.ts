// app/api/ai/share/[token]/route.ts
// 取得分享資料
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "無效的分享連結" },
        { status: 400 }
      );
    }
    
    const usageLog = await prisma.aiUsageLog.findUnique({
      where: {
        shareToken: token,
      },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name_zh: true,
            name_en: true,
            coverImage: true,
          },
        },
      },
    });
    
    if (!usageLog) {
      return NextResponse.json(
        { success: false, error: "分享連結不存在或已過期" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        resultUrl: usageLog.resultUrl,
        prompt: usageLog.prompt,
        createdAt: usageLog.createdAt,
        product: usageLog.product,
      },
    });
    
  } catch (error: any) {
    console.error("[AI Share] GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
