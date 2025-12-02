// app/admin/products-v2/page.tsx
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { ProductListClient } from "./components/ProductListClient";

export const dynamic = "force-dynamic";

export default async function ProductsV2Page() {
  const products = await prisma.product.findMany({
    where: { version: 2 },
    include: {
      ProductTag: { include: { Tag: true } },
      _count: { select: { ProductTag: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="商品管理 V2"
        title="新版本商品系統"
        description="優化的商品管理介面 - 更簡潔、更直觀"
      />

      <ProductListClient products={products} />
    </>
  );
}
