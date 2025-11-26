// app/blog/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

type Lang = "en" | "zh";

function t(lang: Lang, en?: string | null, zh?: string | null, fallback?: string) {
  const v = lang === "en" ? en : zh;
  return (v && v.trim().length > 0 ? v : null) ?? fallback ?? "";
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const lang: Lang = searchParams?.lang === "zh" ? "zh" : "en";

  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, isPublished: true },
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (!post) {
    notFound();
  }

  // 取得相關文章（同標籤）
  const tagIds = post.tags.map((pt) => pt.tagId);
  let relatedPosts: any[] = [];
  
  if (tagIds.length > 0) {
    relatedPosts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        id: { not: post.id },
        tags: {
          some: { tagId: { in: tagIds } },
        },
      },
      include: {
        tags: { include: { tag: true } },
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });
  }

  const title = t(lang, post.title_en, post.title_zh, post.title);
  const content = t(lang, post.content_en, post.content_zh, post.content);
  const excerpt = t(lang, post.excerpt_en, post.excerpt_zh, post.excerpt);

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(lang === "zh" ? "zh-TW" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SiteShell>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href={`/blog?lang=${lang}`} className="hover:text-zinc-900">
          {lang === "zh" ? "部落格" : "Blog"}
        </Link>
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-md">{title}</span>
      </div>

      {/* Article Header */}
      <article className="mt-6">
        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>{formatDate(post.publishedAt)}</span>
          {post.tags?.length > 0 && (
            <>
              <span>•</span>
              <div className="flex gap-2">
                {post.tags.map((pt: any) => {
                  const tagName = t(lang, pt.tag.name_en, pt.tag.name_zh, pt.tag.name);
                  return (
                    <span
                      key={pt.tagId}
                      className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs"
                    >
                      {tagName}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
          {title}
        </h1>

        {/* Excerpt */}
        {excerpt && (
          <p className="mt-4 text-lg text-zinc-600 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mt-8 relative aspect-[16/9] overflow-hidden rounded-xl bg-zinc-100">
            <Image
              src={post.coverImage}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="mt-8 prose prose-zinc max-w-none">
          {content.split("\n").map((paragraph, index) => {
            // 處理 Markdown 標題
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={index} className="text-xl font-semibold mt-8 mb-4">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("### ")) {
              return (
                <h3 key={index} className="text-lg font-semibold mt-6 mb-3">
                  {paragraph.replace("### ", "")}
                </h3>
              );
            }
            // 處理列表
            if (paragraph.startsWith("- ") || paragraph.startsWith("* ")) {
              return (
                <li key={index} className="ml-4">
                  {paragraph.replace(/^[-*] /, "")}
                </li>
              );
            }
            // 空行
            if (!paragraph.trim()) {
              return <br key={index} />;
            }
            // 一般段落
            return (
              <p key={index} className="mb-4 text-zinc-700 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Share / Back */}
        <div className="mt-12 flex items-center justify-between border-t border-zinc-200 pt-6">
          <Link
            href={`/blog?lang=${lang}`}
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            ← {lang === "zh" ? "返回部落格" : "Back to Blog"}
          </Link>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 border-t border-zinc-200 pt-12">
          <h2 className="text-xl font-semibold text-zinc-900">
            {lang === "zh" ? "相關文章" : "Related Posts"}
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {relatedPosts.map((relatedPost) => {
              const relatedTitle = t(
                lang,
                relatedPost.title_en,
                relatedPost.title_zh,
                relatedPost.title
              );
              const relatedExcerpt = t(
                lang,
                relatedPost.excerpt_en,
                relatedPost.excerpt_zh,
                relatedPost.excerpt
              );

              return (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}?lang=${lang}`}
                  className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  {relatedPost.coverImage && (
                    <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-lg bg-zinc-100">
                      <Image
                        src={relatedPost.coverImage}
                        alt={relatedTitle}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 line-clamp-2">
                    {relatedTitle}
                  </h3>
                  {relatedExcerpt && (
                    <p className="mt-2 text-xs text-zinc-600 line-clamp-2">
                      {relatedExcerpt}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </SiteShell>
  );
}
