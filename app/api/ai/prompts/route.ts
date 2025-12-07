// app/api/ai/prompts/route.ts
// 公開 API - 取得啟用的提示詞範本
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.aiPromptTemplate.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        name_zh: true,
        name_en: true,
        prompt: true,
        order: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      templates,
    });
    
  } catch (error: any) {
    console.error("[AI Prompts] GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
