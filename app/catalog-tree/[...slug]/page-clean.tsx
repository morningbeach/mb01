// app/catalog-tree/[...slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { CatalogPageClient } from "./CatalogPageClient";

export default async function TreeCatalogPage({
  params,
  searchParams,
}: {
  params: { slug: string[] };
  searchParams: { displayMode?: string };
}) {
  
  // 取得最後一個 slug（當前節點）
  const currentSlug = params.slug[params.slug.length - 1];
  
  // 從資料庫查詢當前節點
  const currentNode = await prisma.categoryNode.findUnique({
    where: {
      slug: currentSlug,
      isActive: true,
    },
    include: {
      children: {
        where: {
          isActive: true,
          isHidden: false,
        },
        orderBy: {
          order: 'asc',
        },
      },
      parent: true,
    },
  });

  if (!currentNode) {
    return notFound();
  }
  
  // 建構麵包屑（根據 path 欄位）
  const breadcrumbSlugs = currentNode.path;
  const breadcrumbs = await prisma.categoryNode.findMany({
    where: {
      slug: {
        in: breadcrumbSlugs,
      },
      isActive: true,
    },
    orderBy: {
      depth: 'asc',
    },
  });

  // 允許前台臨時切換展示模式（未來會移除）
  const displayMode = searchParams.displayMode || currentNode.displayMode;

  return (
    <SiteShell>
      <CatalogPageClient 
        node={currentNode}
        breadcrumbs={breadcrumbs}
        displayMode={displayMode}
        currentPath={params.slug.join('/')}
      />
    </SiteShell>
  );
}
