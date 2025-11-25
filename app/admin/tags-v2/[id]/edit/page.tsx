import { prisma } from "@/lib/prisma";
import { TagForm } from "../../components/TagForm";
import { notFound } from "next/navigation";

export default async function EditTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!tag || tag.version !== 2) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">編輯標籤</h1>
          <p className="mt-1 text-sm text-zinc-600">
            修改標籤：{tag.name} ({tag._count.products} 個產品使用中)
          </p>
        </div>

        <TagForm tag={tag} />
      </div>
    </div>
  );
}
