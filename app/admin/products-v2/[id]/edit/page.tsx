import { prisma } from "@/lib/prisma";
import { ProductFormBilingual } from "../../components/ProductFormBilingual";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      ProductTag: {
        include: { Tag: true },
      },
    },
  });

  if (!product || product.version !== 2) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">
            編輯產品
            <span className="ml-3 text-sm font-normal text-zinc-500">
              Edit Product (多語系 Bilingual)
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            修改產品資料：{product.name}
          </p>
        </div>

        <ProductFormBilingual product={product} />
      </div>
    </div>
  );
}
