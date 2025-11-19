// app/admin/products/[id]/update/route.ts
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const formData = await req.formData();
  const id = params.id;

  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const category = (formData.get("category") as string) || null;

  const shortDesc =
    ((formData.get("shortDesc") as string) || "").trim() || null;
  const description =
    ((formData.get("description") as string) || "").trim() || null;

  const coverImage =
    ((formData.get("coverImage") as string) || "").trim() || null;
  const imagesRaw =
    ((formData.get("images") as string) || "").trim() || "";

  const sku = ((formData.get("sku") as string) || "").trim() || null;
  const minQtyRaw = ((formData.get("minQty") as string) || "").trim();
  const priceHint =
    ((formData.get("priceHint") as string) || "").trim() || null;
  const currency =
    ((formData.get("currency") as string) || "").trim() || null;

  const minQty =
    minQtyRaw.length > 0 && !Number.isNaN(Number(minQtyRaw))
      ? Number(minQtyRaw)
      : null;

  const images = imagesRaw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const tagIds = formData.getAll("tagIds") as string[];

  await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        category: category as any, // Category enum
        shortDesc,
        description,
        coverImage,
        images,
        sku,
        minQty,
        priceHint,
        currency,
      },
    }),
    prisma.productTag.deleteMany({
      where: { productId: id },
    }),
    ...(tagIds.length > 0
      ? [
          prisma.productTag.createMany({
            data: tagIds.map((tagId) => ({
              productId: id,
              tagId,
            })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ]);

  // 前台 / 後台都 revalidate 一下
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
  revalidatePath("/products");
  revalidatePath("/catalog");
  revalidatePath("/admin/products");

  return NextResponse.redirect(
    new URL(`/admin/products/${id}`, req.url)
  );
}
