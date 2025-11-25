import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type Params = {
  params: Promise<{ id: string }>;
};

// GET - 取得單一 section
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const sectionId = parseInt(id);

    const section = await prisma.homeSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ section });
  } catch (error) {
    console.error("GET section error:", error);
    return NextResponse.json(
      { error: "Failed to fetch section" },
      { status: 500 }
    );
  }
}

// PUT - 更新 section
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const sectionId = parseInt(id);
    const body = await req.json();
    const { payload } = body;

    const section = await prisma.homeSection.update({
      where: { id: sectionId },
      data: { payload },
    });

    revalidatePath("/admin/homepage");
    revalidatePath("/");

    return NextResponse.json({ ok: true, section });
  } catch (error) {
    console.error("PUT section error:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}
