// app/api/admin/ai-usage/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const { logId } = await request.json();
    
    if (!logId) {
      return NextResponse.json(
        { success: false, error: "缺少 logId" },
        { status: 400 }
      );
    }

    // 刪除記錄
    await prisma.aiUsageLog.delete({
      where: { id: logId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin AI Usage Delete] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "刪除失敗" },
      { status: 500 }
    );
  }
}
