// app/api/admin/products/batch-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProductInput = {
  name: string;
  imageUrl: string;
  tags: string[];
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products } = body as { products: ProductInput[] };

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Products array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // 限制為最多100個產品
    if (products.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 products per batch" },
        { status: 400 }
      );
    }

    const createdProducts = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      try {
        const { name, imageUrl, tags } = products[i];

        if (!name || !imageUrl) {
          errors.push({ index: i, error: "Name and imageUrl are required" });
          continue;
        }

        // 建立slug
        const slug = name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");

        // 創建或尋找標籤並連接
        const tagIds: string[] = [];
        if (tags && tags.length > 0) {
          for (const tagName of tags) {
            const tagSlug = tagName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, "");

            let tag = await prisma.tag.findUnique({
              where: { slug: tagSlug },
            });

            if (!tag) {
              tag = await prisma.tag.create({
                data: { 
                  name: tagName,
                  slug: tagSlug 
                },
              });
            }

            tagIds.push(tag.id);
          }
        }

        // 先建或找到 Image
        let image = await prisma.image.findUnique({
          where: { url: imageUrl },
        });

        if (!image) {
          image = await prisma.image.create({
            data: {
              url: imageUrl,
              storageKey: imageUrl,
              size: 0,
              mimeType: "image/jpeg",
            },
          });
        }

        // 創建產品
        const product = await prisma.product.create({
          data: {
            name,
            slug,
            category: "GIFT", // 預設分類
            productImages: {
              create: [
                {
                  imageId: image.id,
                  position: 0,
                },
              ],
            },
            tags: {
              create: tagIds.map(tagId => ({
                tagId,
              })),
            },
          },
        });

        createdProducts.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
        });
      } catch (err) {
        console.error(`Error creating product ${i}:`, err);
        errors.push({ index: i, error: String(err) });
      }
    }

    return NextResponse.json({
      ok: true,
      created: createdProducts.length,
      total: products.length,
      createdProducts,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[BATCH_UPLOAD_ERROR]", err);
    return NextResponse.json(
      { error: "Batch upload failed" },
      { status: 500 }
    );
  }
}
