"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BilingualInput } from "../../products-v2/components/BilingualInput";
import ImagePicker from "../../components/ImagePicker";

type BlogFormProps = {
  post?: any;
};

export function BlogForm({ post }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "seo">("basic");

  const [formData, setFormData] = useState({
    slug: post?.slug || "",
    // 標題
    title: post?.title || "",
    title_en: post?.title_en || post?.title || "",
    title_zh: post?.title_zh || "",
    // 摘要
    excerpt: post?.excerpt || "",
    excerpt_en: post?.excerpt_en || post?.excerpt || "",
    excerpt_zh: post?.excerpt_zh || "",
    // 內容
    content: post?.content || "",
    content_en: post?.content_en || post?.content || "",
    content_zh: post?.content_zh || "",
    // 其他
    coverImage: post?.coverImage || "",
    isPublished: post?.isPublished || false,
    isFeatured: post?.isFeatured || false,
    publishedAt: post?.publishedAt
      ? new Date(post.publishedAt).toISOString().split("T")[0]
      : "",
    // SEO
    seoTitle_en: post?.seoTitle_en || "",
    seoTitle_zh: post?.seoTitle_zh || "",
    seoDesc_en: post?.seoDesc_en || "",
    seoDesc_zh: post?.seoDesc_zh || "",
    // Tags
    tagIds: post?.tags?.map((pt: any) => pt.tagId) || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = post
        ? `/api/admin/blog/${post.id}`
        : "/api/admin/blog";
      
      const method = post ? "PUT" : "POST";

      // 準備提交資料
      const submitData = {
        ...formData,
        // 向下相容
        title: formData.title_en || formData.title,
        excerpt: formData.excerpt_en || formData.excerpt,
        content: formData.content_en || formData.content,
        publishedAt: formData.publishedAt
          ? new Date(formData.publishedAt).toISOString()
          : null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "操作失敗");
      }

      alert(post ? "更新成功！" : "建立成功！");
      router.push("/admin/blog");
      router.refresh();
    } catch (error: any) {
      alert(`錯誤: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "基本資訊" },
    { id: "content", label: "文章內容" },
    { id: "seo", label: "SEO 設定" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab 導航 */}
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 基本資訊 Tab */}
      {activeTab === "basic" && (
        <div className="space-y-6">
          {/* URL Slug */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">基本設定</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  placeholder="my-blog-post"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  用於 URL，例如：/blog/my-blog-post
                </p>
              </div>

              {/* 標題 - 雙語 */}
              <BilingualInput
                label="文章標題 / Title"
                name="title"
                valueEn={formData.title_en}
                valueZh={formData.title_zh}
                onChangeEn={(val) => setFormData({ ...formData, title_en: val })}
                onChangeZh={(val) => setFormData({ ...formData, title_zh: val })}
                required
                context="blog_title"
                placeholder={{
                  en: "How to choose the right packaging structure",
                  zh: "如何選擇正確的包裝結構",
                }}
              />

              {/* 摘要 - 雙語 */}
              <BilingualInput
                label="摘要 / Excerpt"
                name="excerpt"
                valueEn={formData.excerpt_en}
                valueZh={formData.excerpt_zh}
                onChangeEn={(val) => setFormData({ ...formData, excerpt_en: val })}
                onChangeZh={(val) => setFormData({ ...formData, excerpt_zh: val })}
                type="textarea"
                context="blog_excerpt"
                placeholder={{
                  en: "A brief summary of the article...",
                  zh: "文章的簡短摘要...",
                }}
              />
            </div>
          </div>

          {/* 封面圖片 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">封面圖片</h2>
            <ImagePicker
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
            />
          </div>

          {/* 發布設定 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">發布設定</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <span className="text-sm text-zinc-700">已發布</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <span className="text-sm text-zinc-700">精選文章</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  發布日期
                </label>
                <input
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 文章內容 Tab */}
      {activeTab === "content" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">文章內容</h2>
          
          <BilingualInput
            label="內容 / Content"
            name="content"
            valueEn={formData.content_en}
            valueZh={formData.content_zh}
            onChangeEn={(val) => setFormData({ ...formData, content_en: val })}
            onChangeZh={(val) => setFormData({ ...formData, content_zh: val })}
            type="textarea"
            context="blog_content"
            placeholder={{
              en: "Write your article content here... (Supports Markdown)",
              zh: "在此輸入文章內容...（支援 Markdown）",
            }}
          />
          <p className="mt-2 text-xs text-zinc-500">
            支援 Markdown 格式。可使用 ## 標題、**粗體**、*斜體*、列表等。
          </p>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === "seo" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">SEO 設定</h2>
          
          <div className="space-y-4">
            <BilingualInput
              label="SEO 標題 / SEO Title"
              name="seoTitle"
              valueEn={formData.seoTitle_en}
              valueZh={formData.seoTitle_zh}
              onChangeEn={(val) => setFormData({ ...formData, seoTitle_en: val })}
              onChangeZh={(val) => setFormData({ ...formData, seoTitle_zh: val })}
              context="seo_title"
              placeholder={{
                en: "SEO optimized title for search engines",
                zh: "針對搜尋引擎優化的標題",
              }}
            />

            <BilingualInput
              label="SEO 描述 / SEO Description"
              name="seoDesc"
              valueEn={formData.seoDesc_en}
              valueZh={formData.seoDesc_zh}
              onChangeEn={(val) => setFormData({ ...formData, seoDesc_en: val })}
              onChangeZh={(val) => setFormData({ ...formData, seoDesc_zh: val })}
              type="textarea"
              context="seo_description"
              placeholder={{
                en: "A compelling description for search results...",
                zh: "吸引人的搜尋結果描述...",
              }}
            />
          </div>
        </div>
      )}

      {/* 提交按鈕 */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "處理中..." : post ? "更新文章" : "建立文章"}
        </button>
        
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-6 py-3 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          取消
        </button>
      </div>
    </form>
  );
}
