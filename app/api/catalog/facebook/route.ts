import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mbpack.co";
const BRAND_NAME = "MB Packaging";
const DEFAULT_CURRENCY = "TWD";
const TARGET_COUNTRY = "TW";
const DEFAULT_PRICE_VALUE = 0;

const CSV_HEADERS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "condition",
  "price",
  "brand",
  "content_language",
  "target_country",
  "custom_label_0",
  "custom_label_1",
  "custom_label_2",
  "additional_image_link",
];

type ProductLanguageVariant = {
  id: string;
  title: string;
  description: string;
  contentLanguage: string;
  link: string;
};

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes("\n") || str.includes("\"")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildLanguageVariants(product: any): ProductLanguageVariant[] {
  const baseLink = `${SITE_URL}/products/${product.slug}`;
  const variants: ProductLanguageVariant[] = [];

  const zhTitle = product.name_zh || product.name || product.name_en;
  if (zhTitle) {
    variants.push({
      id: `${product.id}-zh`,
      title: zhTitle,
      description: product.shortDesc_zh || product.description_zh || product.shortDesc || product.description || "",
      contentLanguage: "zh",
      link: `${baseLink}?lang=zh`,
    });
  }

  const enTitle = product.name_en || product.name || product.name_zh;
  if (enTitle) {
    variants.push({
      id: `${product.id}-en`,
      title: enTitle,
      description: product.shortDesc_en || product.description_en || product.shortDesc || product.description || "",
      contentLanguage: "en",
      link: `${baseLink}?lang=en`,
    });
  }

  if (variants.length === 0) {
    variants.push({
      id: product.id,
      title: product.name,
      description: product.shortDesc || product.description || "",
      contentLanguage: "en",
      link: baseLink,
    });
  }

  return variants;
}

function formatPrice(product: any): string {
  const priceValue = Number(product.minQty) > 0 ? Number(product.minQty) : DEFAULT_PRICE_VALUE;
  const currency = product.currency || DEFAULT_CURRENCY;
  return `${priceValue.toFixed(2)} ${currency}`;
}

function getPrimaryImage(product: any): string {
  if (product.coverImage) return product.coverImage;
  if (Array.isArray(product.gallery) && product.gallery.length) return product.gallery[0];
  if (Array.isArray(product.images) && product.images.length) return product.images[0];
  return "";
}

function getAdditionalImages(product: any): string {
  const allImages = [
    ...(Array.isArray(product.gallery) ? product.gallery : []),
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);

  const unique = Array.from(new Set(allImages));
  if (!unique.length) return "";
  return unique.slice(0, 10).join(",");
}

function mapProductToRows(product: any) {
  const availability = product.status === "ACTIVE" ? "in stock" : "out of stock";
  const price = formatPrice(product);
  const imageLink = getPrimaryImage(product);
  const additionalImages = getAdditionalImages(product);
  const tags = product.tags?.map((pt: any) => pt.tag?.name_en || pt.tag?.name_zh || pt.tag?.name).filter(Boolean).join(" | ") || "";

  return buildLanguageVariants(product).map((variant) => {
    const row = [
      variant.id,
      variant.title,
      variant.description,
      variant.link,
      imageLink,
      availability,
      "new",
      price,
      BRAND_NAME,
      variant.contentLanguage,
      TARGET_COUNTRY,
      tags,
      product.category,
      `v${product.version}`,
      additionalImages,
    ];
    return row.map(escapeCsv).join(",");
  });
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        version: 2,
        status: { in: ["ACTIVE", "DRAFT"] },
      },
      include: {
        tags: { include: { tag: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const rows = products.flatMap(mapProductToRows);
    const csv = [CSV_HEADERS.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // allow hourly caching
        "Content-Disposition": `inline; filename="facebook_catalog_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("Facebook catalog feed error", error);
    return NextResponse.json({ error: "Failed to generate feed" }, { status: 500 });
  }
}
