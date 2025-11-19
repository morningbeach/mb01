// app/api/admin/products/create/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = String(formData.get("name") ?? "");
    const slug = String(formData.get("slug") ?? "");
    const category = (formData.get("category") as string | null) ?? "GIFT";
    const sku = (formData.get("sku") as string | null) ?? "";

    const minQtyRaw = formData.get("minQty") as string | null;
    const minQty = minQtyRaw ? Number(minQtyRaw) : 0;

    const priceHint = (formData.get("priceHint") as string | null) ?? "";
    const currency = (formData.get("currency") as string | null) ?? "";

    const shortDesc = (formData.get("shortDesc") as string | null) ?? "";
    const description = (formData.get("description") as string | null) ?? "";

    const coverImage = (formData.get("coverImage") as string | null) ?? "";

    // gallery images
    let images: string[] = (formData.getAll("images") as string[])
      .map((v) => v.toString().trim())
      .filter(Boolean);

    if (images.length === 0) {
      const imagesRaw = (formData.get("images") as string | null) ?? "";
      images = imagesRaw
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean);
    }

    // ✅ 這裡拿到所有勾選的 tagIds（來自 checkbox name="tagIds"）
    const tagIds = (formData.getAll("tagIds") as string[]).filter(Boolean);

    // 1. 先建立 product 本身（不處理 tags）
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        category,
        sku,
        minQty,
        priceHint,
        currency,
        shortDesc,
        description,
        coverImage,
        images,
      },
    });

    // 2. 再建立中介表 ProductTag
    if (tagIds.length > 0) {
      await prisma.productTag.createMany({
        data: tagIds.map((tagId) => ({
          productId: product.id,
          tagId,
        })),
      });
    }

    const redirectUrl = new URL("/admin/products", req.url);
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error("[PRODUCT_CREATE_ERROR]", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
