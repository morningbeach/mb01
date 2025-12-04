// app/page.tsx
import { prisma } from "@/lib/prisma";
import { SiteShell } from "../components/SiteShell";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sections = await prisma.homeSection.findMany({
    orderBy: { order: "asc" },
  });
  const visibleSections = sections.filter((s) => s.enabled);

  const productsSection = visibleSections.find((s) => s.type === "PRODUCTS");

  let productsForHomepage: any[] = [];
  let productsPayload: any = {};
  let productsLayout: any = {};

  if (productsSection) {
    productsPayload = (productsSection.payload as any) || {};
    const source = (productsPayload.source as any) || {};
    productsLayout = (productsPayload.layout as any) || {};

    const mode: "tags" | "latest" | "manual" =
      source.mode === "latest"
        ? "latest"
        : source.mode === "manual"
        ? "manual"
        : "tags";

    const limitRaw = source.limit;
    let limit = 9;
    if (typeof limitRaw === "number" && limitRaw > 0) {
      limit = limitRaw;
    } else if (typeof limitRaw === "string") {
      const parsed = Number(limitRaw);
      if (Number.isFinite(parsed) && parsed > 0) {
        limit = parsed;
      }
    }

    if (mode === "latest") {
      productsForHomepage = await prisma.product.findMany({
        where: { status: "ACTIVE", version: 2 },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          name_en: true,
          name_zh: true,
          shortDesc: true,
          shortDesc_en: true,
          shortDesc_zh: true,
          coverImage: true,
          priceHint: true,
          priceHint_en: true,
          priceHint_zh: true,
        },
      });
    } else if (mode === "manual") {
      const rawIds: any[] = Array.isArray(source.manualProductIds)
        ? source.manualProductIds
        : [];
      const productIds: string[] = rawIds
        .map((v) => (v ?? "").toString())
        .filter((v) => v.length > 0);

      if (productIds.length > 0) {
        const rows = await prisma.product.findMany({
          where: { id: { in: productIds }, status: "ACTIVE" },
          select: {
            id: true,
            slug: true,
            name: true,
            name_en: true,
            name_zh: true,
            shortDesc: true,
            shortDesc_en: true,
            shortDesc_zh: true,
            coverImage: true,
            priceHint: true,
            priceHint_en: true,
            priceHint_zh: true,
          },
        });

        const orderMap = new Map<string, number>();
        productIds.forEach((id, index) => orderMap.set(id, index));
        rows.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
        productsForHomepage = rows.slice(0, limit);
      }
    } else {
      const rawTagIds: any[] = Array.isArray(source.tagIds) ? source.tagIds : [];
      const tagIds: string[] = rawTagIds
        .map((id) => (id ?? "").toString())
        .filter((id) => id.length > 0);

      if (tagIds.length > 0) {
        const mappings = await prisma.productTag.findMany({
          where: { tagId: { in: tagIds } },
          select: { productId: true },
        });

        const productIdSet = new Set<string>(mappings.map((m) => m.productId));

        if (productIdSet.size > 0) {
          productsForHomepage = await prisma.product.findMany({
            where: { id: { in: Array.from(productIdSet) }, status: "ACTIVE", version: 2 },
            orderBy: { createdAt: "desc" },
            take: limit,
            select: {
              id: true,
              slug: true,
              name: true,
              name_en: true,
              name_zh: true,
              shortDesc: true,
              shortDesc_en: true,
              shortDesc_zh: true,
              coverImage: true,
              priceHint: true,
              priceHint_en: true,
              priceHint_zh: true,
            },
          });
        }
      }

      if (productsForHomepage.length === 0) {
        productsForHomepage = await prisma.product.findMany({
          where: { status: "ACTIVE", version: 2 },
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            id: true,
            slug: true,
            name: true,
            name_en: true,
            name_zh: true,
            shortDesc: true,
            shortDesc_en: true,
            shortDesc_zh: true,
            coverImage: true,
            priceHint: true,
            priceHint_en: true,
            priceHint_zh: true,
          },
        });
      }
    }
  }

  // 預先載入 Gallery 資料
  const galleryData: Record<string, { images: any[]; effect: string }> = {};
  
  for (const section of visibleSections) {
    if (section.type === "GALLERY") {
      const payload = (section.payload as any) || {};
      const albumId = payload.albumId;
      const effect = payload.effect || "masonry";
      const imageLimit = payload.imageLimit;

      if (albumId) {
        const album = await prisma.album.findUnique({
          where: { id: albumId },
          include: {
            AlbumImage: {
              include: { Image: true },
              orderBy: { position: "asc" },
              ...(imageLimit ? { take: imageLimit } : {}),
            },
          },
        });

        if (album && album.AlbumImage.length > 0) {
          galleryData[albumId] = {
            effect,
            images: album.AlbumImage.map((item) => ({
              id: item.Image.id,
              url: item.Image.url,
              label: item.Image.title || album.name,
              title: item.Image.title || album.name,
              subtitle: item.Image.alt || "",
            })),
          };
        }
      }
    }
  }

  // 序列化資料給客戶端
  const serializedSections = JSON.parse(JSON.stringify(visibleSections));
  const serializedProducts = JSON.parse(JSON.stringify(productsForHomepage));
  const serializedPayload = JSON.parse(JSON.stringify(productsPayload));
  const serializedLayout = JSON.parse(JSON.stringify(productsLayout));
  const serializedGalleryData = JSON.parse(JSON.stringify(galleryData));

  return (
    <SiteShell>
      <HomeClient
        sections={serializedSections}
        productsPayload={serializedPayload}
        productsLayout={serializedLayout}
        productsForHomepage={serializedProducts}
        galleryData={serializedGalleryData}
      />
    </SiteShell>
  );
}
