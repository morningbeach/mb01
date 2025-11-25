// app/catalog-tree/page.tsx - 樹狀結構首頁
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { SiteShell } from "@/components/SiteShell";
import { CatalogTreeClient } from "./CatalogTreeClient";

export default async function CatalogTreeIndexPage() {

  // 從資料庫獲取第一層分類（排除隱藏節點）
  const visibleCategories = await prisma.categoryNode.findMany({
    where: {
      depth: 1, // 第一層分類
      isActive: true,
      isHidden: false,
    },
    orderBy: {
      order: 'asc',
    },
    include: {
      children: {
        where: {
          isActive: true,
        },
      },
    },
  });

  return (
    <SiteShell>
      <CatalogTreeClient categories={visibleCategories} />
    </SiteShell>
  );
}
