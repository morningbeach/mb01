// app/admin/products/new/route.ts
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();

  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const categoryRaw = (formData.get("category") as string) || "";

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

  const category =
    categoryRaw === "GIFT" ||
    categoryRaw === "GIFT_BOX" ||
    categoryRaw === "GIFT_SET"
      ? categoryRaw
      : "GIFT";

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      category: category as any,
      shortDesc,
      description,
      coverImage,
      images,
      sku,
      minQty,
      priceHint,
      currency,
      tags: {
        create: tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      },
    },
  });

  revalidatePath("/products");
  revalidatePath("/catalog");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);

  return NextResponse.redirect(
    new URL(`/admin/products/${product.id}`, req.url),
    { status: 303 }
  );
}
