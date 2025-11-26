// app/admin/blog/page.tsx
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../components/AdminPageHeader";
import Link from "next/link";
import { BlogPostCard } from "./components/BlogPostCard";

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  const posts = await prisma.blogPost.findMany({
    include: {
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const publishedCount = posts.filter((p) => p.isPublished).length;
  const draftCount = posts.filter((p) => !p.isPublished).length;

  return (
    <>
      <AdminPageHeader
        eyebrow="內容管理"
        title="Blog 文章管理"
        description="管理網站的 Blog 文章，支援多語系內容"
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3">
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            已發布 {publishedCount}
          </span>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
            草稿 {draftCount}
          </span>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + 新增文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <h3 className="text-lg font-semibold text-zinc-900">尚無文章</h3>
          <p className="mt-2 text-sm text-zinc-600">
            開始撰寫你的第一篇 Blog 文章
          </p>
          <Link
            href="/admin/blog/new"
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            建立第一篇文章
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
