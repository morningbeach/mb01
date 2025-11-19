// app/api/admin/catalog/update/route.ts
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

    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const baseCategoryRaw = (formData.get("baseCategory") as string | null) ?? "";
    const orderRaw = (formData.get("order") as string | null) ?? "";
    const heroTitle = (formData.get("heroTitle") as string | null) ?? "";
    const heroSubtitle = (formData.get("heroSubtitle") as string | null) ?? "";
    const cardTitle = (formData.get("cardTitle") as string | null) ?? "";
    const cardDescription =
      (formData.get("cardDescription") as string | null) ?? "";
    const cardImage = (formData.get("cardImage") as string | null) ?? "";
    const heroImage = (formData.get("heroImage") as string | null) ?? "";
    const isActive = formData.get("isActive") === "on";

    const order = orderRaw ? Number(orderRaw) : 0;

    await prisma.frontCategory.update({
      where: { id },
      data: {
        name,
        slug,
        baseCategory: baseCategoryRaw ? (baseCategoryRaw as any) : null,
        order,
        heroTitle: heroTitle || null,
        heroSubtitle: heroSubtitle || null,
        cardTitle: cardTitle || null,
        cardDescription: cardDescription || null,
        cardImage: cardImage || null,
        heroImage: heroImage || null,
        isActive,
      },
    });

    const redirectUrl = new URL(`/admin/catalog/${id}`, req.url);
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error("[CATALOG_UPDATE_ERROR]", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
