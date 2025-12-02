import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      ProductImage: {
        include: {
          Image: true,
        },
        orderBy: {
          position: "asc",
        },
      },
      ProductTag: {
        include: {
          Tag: true,
        },
      },
    },
  });

  if (!product || product.version !== 2) {
    notFound();
  }

  // 重定向到編輯頁面
  redirect(`/admin/products-v2/${id}/edit`);
}
