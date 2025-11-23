import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { pageData } = await request.json();
    
    await prisma.sitePage.update({
      where: { id: params.id },
      data: { pageData },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("更新頁面失敗:", error);
    return NextResponse.json(
      { success: false, error: "更新失敗" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.sitePage.findUnique({
      where: { id: params.id },
    });

    if (!page) {
      return NextResponse.json({ error: "頁面不存在" }, { status: 404 });
    }

    if (page.isDefault) {
      return NextResponse.json({ error: "無法刪除預設頁面" }, { status: 400 });
    }

    await prisma.sitePage.delete({
      where: { id: params.id },
    });

    revalidatePath("/admin-v2/pages");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("刪除頁面失敗:", error);
    return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
  }
}
