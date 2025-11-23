"use client";

import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";

export function AboutClient({ page }: { page: any }) {
  const { lang } = useLanguage();
  const data = page.pageData as any;

  return (
    <>
      {/* HERO */}
      <section className="text-center">
        {page[`label_${lang}` as keyof typeof page] && (
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            {page[`label_${lang}` as keyof typeof page] as string}
          </p>
        )}
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {page[`title_${lang}` as keyof typeof page] as string}
        </h1>
        {page[`desc_${lang}` as keyof typeof page] && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
            {page[`desc_${lang}` as keyof typeof page] as string}
          </p>
        )}
      </section>

      {/* STORY + IMAGE */}
      {data?.story_zh && (
        <section className="mt-12 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
          <div className="space-y-5 text-[15px] leading-relaxed text-zinc-700">
            {(lang === "zh" ? data.story_zh : data.story_en || data.story_zh)
              .split("\n")
              .filter((p: string) => p.trim())
              .map((p: string, i: number) => (
                <p key={i}>{p.trim()}</p>
              ))}
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <Image src={data.storyImage || "/cdn/about/studio.jpg"} alt="About" fill className="object-cover" />
          </div>
        </section>
      )}

      {/* VALUES */}
      {data?.values && data.values.length > 0 && (
        <section className="mt-16 md:mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            {lang === "zh" ? "我們在乎的事" : "What we care about"}
          </h2>
          <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
            {lang === "zh" ? "三個核心價值指導每個專案" : "Three things guide every project"}
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {data.values.map((v: any, i: number) => (
              <div key={i}>
                <h3 className="text-lg font-medium">{lang === "zh" ? v.title_zh : v.title_en || v.title_zh}</h3>
                <p className="mt-2 text-[15px] text-zinc-600">{lang === "zh" ? v.body_zh : v.body_en || v.body_zh}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STATS */}
      {data?.stats && data.stats.length > 0 && (
        <section className="mt-16 md:mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            {data.experienceTitle_zh && lang === "zh" ? data.experienceTitle_zh : data.experienceTitle_en || "Experience"}
          </h2>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            {data.stats.map((s: any, i: number) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {lang === "zh" ? s.label_zh : s.label_en || s.label_zh}
                </div>
                <div className="mt-2 text-2xl font-semibold text-zinc-900">{s.value}</div>
              </div>
            ))}
          </div>
          {data.experience_zh && (
            <ul className="mt-10 space-y-3 text-[15px] text-zinc-700">
              {(lang === "zh" ? data.experience_zh : data.experience_en || data.experience_zh)
                .split("\n")
                .filter((item: string) => item.trim())
                .map((item: string, i: number) => (
                  <li key={i}>{item.trim()}</li>
                ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
