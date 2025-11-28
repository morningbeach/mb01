// app/products/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

// 找到產品所屬的分類路徑（第一個匹配的分類節點）
async function findCategoryPath(productTagIds: string[]) {
  if (!productTagIds.length) return null;

  // 找到包含這些 tagIds 的最深層分類節點
  const categoryNodes = await prisma.categoryNode.findMany({
    where: {
      tagIds: { hasSome: productTagIds },
      isActive: true,
      isHidden: false,
    },
    orderBy: { depth: 'desc' }, // 優先選擇更深的節點
  });

  if (!categoryNodes.length) return null;

  const targetNode = categoryNodes[0];

  // 建立完整路徑
  const breadcrumbs: any[] = [];
  let currentId: string | null = targetNode.id;

  while (currentId) {
    const node = await prisma.categoryNode.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        slug: true,
        name_zh: true,
        name_en: true,
        parentId: true,
        isHidden: true,
      },
    });

    if (!node) break;
    
    if (!node.isHidden) {
      breadcrumbs.unshift(node);
    }
    
    currentId = node.parentId;
  }

  return breadcrumbs;
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, version: 2 },
    include: {
      tags: { 
        include: { tag: true },
      },
      giftSet: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return notFound();
  }

  // 找到分類路徑
  const productTagIds = product.tags.map(pt => pt.tagId);
  const categoryPath = await findCategoryPath(productTagIds);

  const gallery = [
    product.coverImage,
    ...(product.images ?? []),
  ].filter(Boolean) as string[];

  // 序列化產品資料給客戶端
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedCategoryPath = categoryPath ? JSON.parse(JSON.stringify(categoryPath)) : null;

  return (
    <SiteShell>
      <ProductDetailClient 
        product={serializedProduct} 
        gallery={gallery} 
        categoryPath={serializedCategoryPath} 
      />
    </SiteShell>
  );
}
