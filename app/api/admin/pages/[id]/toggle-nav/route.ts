// app/api/admin/pages/[id]/toggle-nav/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.sitePage.findUnique({
      where: { id: params.id },
    });

    if (!page) {
      return NextResponse.json({ error: "頁面不存在" }, { status: 404 });
    }

    await prisma.sitePage.update({
      where: { id: params.id },
      data: { showInNav: !page.showInNav },
    });

    revalidatePath("/admin-v2/pages");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggle nav error:", error);
    return NextResponse.json({ error: "操作失敗" }, { status: 500 });
  }
}
