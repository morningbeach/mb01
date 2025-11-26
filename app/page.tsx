// app/page.tsx
import { prisma } from "@/lib/prisma";
import { SiteShell } from "../components/SiteShell";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  // 載入所有區塊
  const sections = await prisma.homeSection.findMany({
    orderBy: { order: "asc" },
  });
  const visibleSections = sections.filter((s) => s.enabled);

  // 載入產品區塊的產品
  const productsSection = visibleSections.find(
    (s) => s.type === "PRODUCTS",
  );

  let productsForHomepage: any[] = [];
  let productsPayload: any = undefined;
  let productsLayout: any = undefined;

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
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: limit,
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
          where: {
            id: { in: productIds },
            status: "ACTIVE",
          },
        });

        const orderMap = new Map<string, number>();
        productIds.forEach((id, index) => orderMap.set(id, index));
        rows.sort(
          (a, b) =>
            (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
        );

        productsForHomepage = rows.slice(0, limit);
      }
    } else {
      const rawTagIds: any[] = Array.isArray(source.tagIds)
        ? source.tagIds
        : [];
      const tagIds: string[] = rawTagIds
        .map((id) => (id ?? "").toString())
        .filter((id) => id.length > 0);

      if (tagIds.length > 0) {
        const mappings = await prisma.productTag.findMany({
          where: { tagId: { in: tagIds } },
          select: { productId: true },
        });

        const productIdSet = new Set<string>(
          mappings.map((m) => m.productId),
        );

        if (productIdSet.size > 0) {
          productsForHomepage = await prisma.product.findMany({
            where: {
              id: { in: Array.from(productIdSet) },
              status: "ACTIVE",
            },
            orderBy: { createdAt: "desc" },
            take: limit,
          });
        }
      }

      if (productsForHomepage.length === 0) {
        productsForHomepage = await prisma.product.findMany({
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: limit,
        });
      }
    }
  }

  // 預載入所有 GALLERY 區塊的相簿資料
  const gallerySections = visibleSections.filter((s) => s.type === "GALLERY");
  const galleryDataMap: Record<string, any> = {};

  for (const section of gallerySections) {
    const payload = (section.payload as any) || {};
    const albumId = payload.albumId;
    const imageLimit = payload.imageLimit;

    if (albumId) {
      const album = await prisma.album.findUnique({
        where: { id: albumId },
        include: {
          items: {
            include: { image: true },
            orderBy: { position: "asc" },
            ...(imageLimit ? { take: imageLimit } : {}),
          },
        },
      });

      if (album && album.items.length > 0) {
        galleryDataMap[albumId] = {
          images: album.items.map((item) => ({
            id: item.image.id,
            url: item.image.url,
            label: item.image.title || album.name,
            title: item.image.title || album.name,
            subtitle: item.image.alt || "",
          })),
        };
      }
    }
  }

  return (
    <SiteShell>
      <HomeClient
        sections={visibleSections}
        productsSection={productsSection}
        productsPayload={productsPayload}
        productsLayout={productsLayout}
        productsForHomepage={productsForHomepage}
        galleryDataMap={galleryDataMap}
      />
    </SiteShell>
  );
}
