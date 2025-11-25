// app/api/admin/products/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const id = formData.get("id")?.toString();
    if (!id) {
      return NextResponse.json(
        { error: "Missing product id" },
        { status: 400 },
      );
    }

    const name = formData.get("name")?.toString().trim() ?? "";
    const slug = formData.get("slug")?.toString().trim() ?? "";
    const category = formData.get("category")?.toString() ?? null;
    const status = formData.get("status")?.toString() ?? "DRAFT";

    const sku = formData.get("sku")?.toString() || null;
    const minQtyRaw = formData.get("minQty")?.toString() || null;
    const minQty = minQtyRaw ? Number(minQtyRaw) : null;

    const priceHint = formData.get("priceHint")?.toString() || null;
    const currency = formData.get("currency")?.toString() || null;

    const shortDesc = formData.get("shortDesc")?.toString() || null;
    const description = formData.get("description")?.toString() || null;

    // ✅ 這兩個很重要：從 form 取出圖片 URL
    const coverImage =
      (formData.get("coverImage") as string | null)?.trim() || null;

    const gallery = formData
      .getAll("gallery")
      .map((v) => v.toString().trim())
      .filter(Boolean); // string[]

    // Debug 需要的話可以暫時打開
    // console.log("[UPDATE_FORM_IMAGES]", coverImage, gallery);

    await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        category: category as any,
        status: status as any,
        sku,
        minQty: minQty ?? undefined,
        priceHint,
        currency,
        shortDesc,
        description,
        coverImage,     // 👈 大圖 URL 寫進欄位
        gallery,        // 👈 小圖陣列寫進欄位 (String[])
      },
    });

    return NextResponse.redirect(
      new URL(`/admin/products/${id}`, req.url),
    );
  } catch (err) {
    console.error("[PRODUCT_UPDATE_ERROR]", err);
    return NextResponse.json(
      {
        error: "Failed to update product",
        detail:
          err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
