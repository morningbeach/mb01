// app/api/admin/catalog/[id]/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id;

  try {
    const formData = await req.formData();

    // 這個 field 目前是固定 "updateCategory"，可以不用特別管
    const _action = formData.get("_action")?.toString() ?? "updateCategory";

    if (_action !== "updateCategory") {
      return NextResponse.json(
        { ok: false, error: `Unsupported action: ${_action}` },
        { status: 400 },
      );
    }

    const name = (formData.get("name")?.toString() ?? "").trim();
    const slug = (formData.get("slug")?.toString() ?? "").trim();

    const heroTitle =
      (formData.get("heroTitle")?.toString() ?? "").trim() || null;
    const heroSubtitle =
      (formData.get("heroSubtitle")?.toString() ?? "").trim() || null;

    const cardTitle =
      (formData.get("cardTitle")?.toString() ?? "").trim() || null;
    const cardDescription =
      (formData.get("cardDescription")?.toString() ?? "").trim() || null;

    const baseCategoryRaw = (formData.get("baseCategory")?.toString() ?? "").trim();
    const orderRaw = (formData.get("order")?.toString() ?? "").trim();
    const isActiveRaw = (formData.get("isActive")?.toString() ?? "").trim();

    const cardImage =
      (formData.get("cardImage")?.toString() ?? "").trim() || null;

    if (!name || !slug) {
      return NextResponse.json(
        { ok: false, error: "Name and slug are required" },
        { status: 400 },
      );
    }

    const order = orderRaw ? Number(orderRaw) : 0;
    const baseCategory = baseCategoryRaw || null;
    const isActive = isActiveRaw === "true";

    await prisma.frontCategory.update({
      where: { id },
      data: {
        name,
        slug,
        heroTitle,
        heroSubtitle,
        cardTitle,
        cardDescription,
        baseCategory: baseCategory as any,
        order,
        isActive,
        cardImage,
      },
    });

    const redirectUrl = new URL(`/admin/catalog/${id}`, req.url);
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error("[FRONT_CATEGORY_UPDATE_ERROR]", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
