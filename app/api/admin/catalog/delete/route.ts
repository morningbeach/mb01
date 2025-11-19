// app/api/admin/catalog/delete/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = String(formData.get("id") ?? "");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing category id" },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.frontCategoryTagGroup.deleteMany({
        where: { frontCategoryId: id },
      }),
      prisma.frontCategory.delete({
        where: { id },
      }),
    ]);

    const redirectUrl = new URL("/admin/catalog", req.url);
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error("[CATALOG_DELETE_ERROR]", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
