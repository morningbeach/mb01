// app/admin/blog/new/page.tsx
import { BlogForm } from "../components/BlogForm";

export default function NewBlogPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">
            新增 Blog 文章
            <span className="ml-3 text-sm font-normal text-zinc-500">
              New Blog Post (多語系 Bilingual)
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            建立一篇新的 Blog 文章
          </p>
        </div>

        <BlogForm />
      </div>
    </div>
  );
}
