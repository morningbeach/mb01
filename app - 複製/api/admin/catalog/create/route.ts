// app/api/admin/catalog/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const baseCategoryRaw = String(formData.get("baseCategory") || "").trim();
    const orderRaw = String(formData.get("order") || "").trim();
    const isActiveRaw = formData.get("isActive");

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required." },
        { status: 400 }
      );
    }

    const order = orderRaw ? Number(orderRaw) : 0;
    const baseCategory = baseCategoryRaw || null;
    const isActive = isActiveRaw === "on" || isActiveRaw === "true";

    const created = await prisma.frontCategory.create({
      data: {
        name,
        slug,
        baseCategory, // 如果是 enum，值是 GIFT / GIFT_BOX / GIFT_SET 就可以
        order,
        isActive,
      },
    });

    // 建立完導回後台編輯頁或列表都可以
    return NextResponse.redirect(
      new URL(`/admin/catalog/${created.id}`, request.url),
      { status: 303 }
    );
  } catch (err) {
    console.error("Error creating frontCategory:", err);
    return NextResponse.json(
      { error: "Failed to create catalog category." },
      { status: 500 }
    );
  }
}
