// app/admin/blog/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { BlogForm } from "../../components/BlogForm";
import { notFound } from "next/navigation";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">
            編輯 Blog 文章
            <span className="ml-3 text-sm font-normal text-zinc-500">
              Edit Blog Post (多語系 Bilingual)
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            修改文章：{post.title}
          </p>
        </div>

        <BlogForm post={post} />
      </div>
    </div>
  );
}
