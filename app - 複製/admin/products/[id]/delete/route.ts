// app/admin/products/[id]/delete/route.ts
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ProductTagSelector } from "@/app/admin/products/components/ProductTagSelector";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // 把相關聯的 giftSet / giftSetItem / tags 一起清掉
  await prisma.$transaction([
    prisma.giftSetItem.deleteMany({
      where: { productId: id },
    }),
    prisma.giftSet.deleteMany({
      where: { productId: id },
    }),
    prisma.productTag.deleteMany({
      where: { productId: id },
    }),
    prisma.product.delete({
      where: { id },
    }),
  ]);

  // 更新前後台 cache
  revalidatePath("/products");
  revalidatePath("/catalog");
  revalidatePath("/admin/products");

  return NextResponse.redirect(new URL("/admin/products", req.url), {
    status: 303,
  });
}
