// app/api/admin/virtual-folders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: 取得所有虛擬資料夾
export async function GET() {
  try {
    const folders = await prisma.virtualFolder.findMany({
      orderBy: { path: "asc" },
    });

    return NextResponse.json({ 
      folders: folders.map(f => f.path) 
    });
  } catch (error) {
    console.error("取得虛擬資料夾失敗:", error);
    return NextResponse.json(
      { error: "取得虛擬資料夾失敗" },
      { status: 500 }
    );
  }
}

// POST: 新增虛擬資料夾
export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { error: "path 必須是字串" },
        { status: 400 }
      );
    }

    const folder = await prisma.virtualFolder.upsert({
      where: { path },
      update: {},
      create: { path },
    });

    return NextResponse.json({ success: true, path: folder.path });
  } catch (error) {
    console.error("新增虛擬資料夾失敗:", error);
    return NextResponse.json(
      { error: "新增虛擬資料夾失敗" },
      { status: 500 }
    );
  }
}

// DELETE: 刪除虛擬資料夾
export async function DELETE(req: NextRequest) {
  try {
    const { path } = await req.json();

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { error: "path 必須是字串" },
        { status: 400 }
      );
    }

    await prisma.virtualFolder.delete({
      where: { path },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("刪除虛擬資料夾失敗:", error);
    return NextResponse.json(
      { error: "刪除虛擬資料夾失敗" },
      { status: 500 }
    );
  }
}
