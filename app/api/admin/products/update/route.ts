// app/api/admin/products/update/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const id = String(formData.get("id") ?? "");
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing product id" },
        { status: 400 },
      );
    }

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

    // ✅ 目前表單勾選的所有 tags
    const tagIds = (formData.getAll("tagIds") as string[]).filter(Boolean);

    // 1. 更新 product 本身欄位
    await prisma.product.update({
      where: { id },
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

    // 2. 重新寫入中介表（先刪掉原本，再新增現在勾選的）
    await prisma.$transaction([
      prisma.productTag.deleteMany({
        where: { productId: id },
      }),
      tagIds.length
        ? prisma.productTag.createMany({
            data: tagIds.map((tagId) => ({
              productId: id,
              tagId,
            })),
          })
        : prisma.$executeRaw`SELECT 1`, // 沒 tag 時用一個 no-op 占位
    ]);

    const redirectUrl = new URL(`/admin/products/${id}`, req.url);
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error("[PRODUCT_UPDATE_ERROR]", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
