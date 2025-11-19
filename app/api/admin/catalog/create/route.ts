// app/api/admin/catalog/create/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const baseCategoryRaw = (formData.get("baseCategory") as string | null) ?? "";
    const orderRaw = (formData.get("order") as string | null) ?? "";
    const isActive = formData.get("isActive") === "on";

    if (!name || !slug) {
      return NextResponse.json(
        { ok: false, error: "Missing name or slug" },
        { status: 400 },
      );
    }

    const count = await prisma.frontCategory.count();
    const order = orderRaw ? Number(orderRaw) : count + 1;

    const category = await prisma.frontCategory.create({
      data: {
        name,
        slug,
        baseCategory: baseCategoryRaw ? (baseCategoryRaw as any) : null,
        order,
        isActive,
      },
    });

    const redirectUrl = new URL(`/admin/catalog/${category.id}`, req.url);
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error("[CATALOG_CREATE_ERROR]", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
