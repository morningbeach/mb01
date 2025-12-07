// app/api/admin/ai-prompts/route.ts
// 管理後台 - AI 提示詞範本 CRUD
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 取得所有範本
export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.aiPromptTemplate.findMany({
      orderBy: { order: "asc" },
    });
    
    return NextResponse.json({
      success: true,
      templates,
    });
    
  } catch (error: any) {
    console.error("[Admin AI Prompts] GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: 新增範本
export async function POST(request: NextRequest) {
  try {
    const { name_zh, name_en, prompt, order, isActive } = await request.json();
    
    if (!name_zh || !prompt) {
      return NextResponse.json(
        { success: false, error: "請填寫必要欄位" },
        { status: 400 }
      );
    }
    
    const template = await prisma.aiPromptTemplate.create({
      data: {
        name_zh,
        name_en: name_en || name_zh,
        prompt,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });
    
    return NextResponse.json({
      success: true,
      template,
    });
    
  } catch (error: any) {
    console.error("[Admin AI Prompts] POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: 更新範本
export async function PUT(request: NextRequest) {
  try {
    const { id, name_zh, name_en, prompt, order, isActive } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "請提供範本 ID" },
        { status: 400 }
      );
    }
    
    const template = await prisma.aiPromptTemplate.update({
      where: { id },
      data: {
        name_zh,
        name_en,
        prompt,
        order,
        isActive,
      },
    });
    
    return NextResponse.json({
      success: true,
      template,
    });
    
  } catch (error: any) {
    console.error("[Admin AI Prompts] PUT Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: 刪除範本
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "請提供範本 ID" },
        { status: 400 }
      );
    }
    
    await prisma.aiPromptTemplate.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: "範本已刪除",
    });
    
  } catch (error: any) {
    console.error("[Admin AI Prompts] DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
