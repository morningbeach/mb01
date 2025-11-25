// app/api/admin/products/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const category = (formData.get("category") as string | null) ?? "GIFT";
    const status = (formData.get("status") as string | null) ?? "ACTIVE";

    // ...其他欄位（sku / shortDesc / description / minQty / ...）
    const sku = (formData.get("sku") as string | null) ?? null;

    if (!name || !slug) {
      return NextResponse.json(
        { ok: false, error: "Name & slug are required" },
        { status: 400 },
      );
    }

    // ✅ 先建立 Product（暫時不含圖片）
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        category: category as any,
        status: status as any,
        coverImage,                  // 👈 大圖 URL 寫進來
        gallery,                     // 👈 小圖陣列寫進來
        sku,
        // 其他欄位...
      },
    });

    // 圖片已在 product 建立時設定（coverImage, images）
    const coverImageUrl =
      (formData.get("coverImage") as string | null) ?? null;
    const galleryUrls = formData.getAll("images") as string[];

    // 你的原本 redirect / response
    const redirectUrl = new URL("/admin/products", req.url);
    return NextResponse.redirect(redirectUrl, 303);
  } catch (err) {
    console.error("[PRODUCT_CREATE_ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Create product failed" },
      { status: 500 },
    );
  }
}
