// app/catalog-tree/page.tsx - 樹狀結構首頁
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { SiteShell } from "@/components/SiteShell";
import { CatalogTreeClient } from "./CatalogTreeClient";

export const dynamic = 'force-dynamic';

export default async function CatalogTreeIndexPage() {
  console.log('[catalog-tree] Starting query...');

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

  console.log('[catalog-tree] Found categories:', visibleCategories.length);
  console.log('[catalog-tree] Categories:', visibleCategories.map(c => c.name_zh));

  // 將資料轉換為純 JSON（避免 Prisma 物件序列化問題）
  const categories = JSON.parse(JSON.stringify(visibleCategories));

  return (
    <SiteShell>
      <CatalogTreeClient categories={categories} />
    </SiteShell>
  );
}
