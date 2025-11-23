// app/blog/page.tsx
import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";

export default function BlogPage() {
  return (
    <SiteShell>
      {/* HERO */}
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Blog</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Notes on packaging, gifting and production.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
          Articles to help buyers, marketers and designers make better
          decisions about structures, materials and timelines.
        </p>
      </section>

        {/* POSTS GRID */}
        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <PostCard
            title="How to choose the right rigid box structure"
            excerpt="Lid & base, magnetic, drawer or book-style? A simple guide for brand and procurement teams."
            date="Jan 2025"
            tag="Structures"
          />
          <PostCard
            title="Top packaging trends for global gifting"
            excerpt="From sustainable materials to unboxing moments, a quick overview of what brands are asking for."
            date="Dec 2024"
            tag="Trends"
          />
          <PostCard
            title="A simple overview of paper materials and finishing"
            excerpt="Coated, uncoated, textured, laminated — explained in plain language."
            date="Nov 2024"
            tag="Materials"
          />
          <PostCard
            title="Planning timelines for seasonal gift box projects"
            excerpt="Working backwards from launch date to sampling and production."
            date="Oct 2024"
            tag="Timelines"
          />
          <PostCard
            title="Building a reusable structural system for your brand"
            excerpt="Why reusing structures across campaigns can save time and cost."
            date="Sep 2024"
            tag="Brand system"
          />
          <PostCard
            title="Common pitfalls in gift box production (and how to avoid them)"
            excerpt="Color shifts, fit issues and last-minute changes — and what helps prevent them."
            date="Aug 2024"
            tag="Production"
          />
        </section>

        {/* CTA */}
        <section className="mt-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Want us to write about a specific topic?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-zinc-600">
            We can share more detailed notes on structures, materials or
            workflows that matter for your team.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Leave us a message
            </Link>
          </div>
        </section>
    </SiteShell>
  );
}

function PostCard({
  title,
  excerpt,
  date,
  tag,
}: {
  title: string;
  excerpt: string;
  date: string;
  tag: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="text-xs text-zinc-500">{date}</div>
      <div className="mt-1 inline-flex items-center gap-2 text-xs text-zinc-500">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5">{tag}</span>
      </div>
      <h2 className="mt-3 text-[15px] font-medium text-zinc-900">{title}</h2>
      <p className="mt-2 flex-1 text-sm text-zinc-600">{excerpt}</p>
      <div className="mt-3 text-sm text-zinc-500">Read more →</div>
    </article>
  );
}
