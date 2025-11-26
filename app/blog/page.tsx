// app/blog/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "../../components/SiteShell";

export const dynamic = "force-dynamic";

type Lang = "en" | "zh";

function t(lang: Lang, en?: string | null, zh?: string | null, fallback?: string) {
  const v = lang === "en" ? en : zh;
  return (v && v.trim().length > 0 ? v : null) ?? fallback ?? "";
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const lang: Lang = searchParams?.lang === "zh" ? "zh" : "en";

  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    include: {
      tags: { include: { tag: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  const featuredPosts = posts.filter((p) => p.isFeatured);
  const regularPosts = posts.filter((p) => !p.isFeatured);

  return (
    <SiteShell>
      {/* HERO */}
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          {lang === "zh" ? "部落格" : "Blog"}
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {lang === "zh"
            ? "關於包裝、禮品與生產的筆記"
            : "Notes on packaging, gifting and production."}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
          {lang === "zh"
            ? "幫助採購、行銷和設計師做出更好決策的文章。"
            : "Articles to help buyers, marketers and designers make better decisions about structures, materials and timelines."}
        </p>
      </section>

      {/* FEATURED POSTS */}
      {featuredPosts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-semibold text-zinc-900">
            {lang === "zh" ? "精選文章" : "Featured"}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredPosts.map((post) => (
              <FeaturedPostCard key={post.id} post={post} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {/* POSTS GRID */}
      <section className="mt-12">
        {featuredPosts.length > 0 && (
          <h2 className="mb-6 text-xl font-semibold text-zinc-900">
            {lang === "zh" ? "所有文章" : "All Posts"}
          </h2>
        )}
        {posts.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-zinc-200 p-12 text-center">
            <p className="text-zinc-500">
              {lang === "zh" ? "尚無文章" : "No posts yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {(featuredPosts.length > 0 ? regularPosts : posts).map((post) => (
              <PostCard key={post.id} post={post} lang={lang} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {lang === "zh"
            ? "想讓我們撰寫特定主題？"
            : "Want us to write about a specific topic?"}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-zinc-600">
          {lang === "zh"
            ? "我們可以分享更多關於結構、材料或工作流程的詳細筆記。"
            : "We can share more detailed notes on structures, materials or workflows that matter for your team."}
        </p>
        <div className="mt-6">
          <Link
            href="/contact"
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {lang === "zh" ? "聯繫我們" : "Leave us a message"}
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}

function FeaturedPostCard({ post, lang }: { post: any; lang: Lang }) {
  const title = t(lang, post.title_en, post.title_zh, post.title);
  const excerpt = t(lang, post.excerpt_en, post.excerpt_zh, post.excerpt);

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(lang === "zh" ? "zh-TW" : "en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <Link
      href={`/blog/${post.slug}?lang=${lang}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg"
    >
      {post.coverImage && (
        <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100">
          <Image
            src={post.coverImage}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{formatDate(post.publishedAt)}</span>
          {post.tags?.[0] && (
            <>
              <span>•</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                {t(lang, post.tags[0].tag.name_en, post.tags[0].tag.name_zh, post.tags[0].tag.name)}
              </span>
            </>
          )}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-zinc-900 group-hover:text-blue-600">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 flex-1 text-sm text-zinc-600 line-clamp-2">
            {excerpt}
          </p>
        )}
        <div className="mt-4 text-sm font-medium text-zinc-900 group-hover:text-blue-600">
          {lang === "zh" ? "閱讀更多 →" : "Read more →"}
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post, lang }: { post: any; lang: Lang }) {
  const title = t(lang, post.title_en, post.title_zh, post.title);
  const excerpt = t(lang, post.excerpt_en, post.excerpt_zh, post.excerpt);

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(lang === "zh" ? "zh-TW" : "en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <Link
      href={`/blog/${post.slug}?lang=${lang}`}
      className="group flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      {post.coverImage && (
        <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-lg bg-zinc-100">
          <Image
            src={post.coverImage}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="text-xs text-zinc-500">{formatDate(post.publishedAt)}</div>
      <div className="mt-1 inline-flex items-center gap-2 text-xs text-zinc-500">
        {post.tags?.[0] && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5">
            {t(lang, post.tags[0].tag.name_en, post.tags[0].tag.name_zh, post.tags[0].tag.name)}
          </span>
        )}
      </div>
      <h2 className="mt-3 text-[15px] font-medium text-zinc-900 group-hover:text-blue-600">
        {title}
      </h2>
      {excerpt && (
        <p className="mt-2 flex-1 text-sm text-zinc-600 line-clamp-2">{excerpt}</p>
      )}
      <div className="mt-3 text-sm text-zinc-500 group-hover:text-blue-600">
        {lang === "zh" ? "閱讀更多 →" : "Read more →"}
      </div>
    </Link>
  );
}
