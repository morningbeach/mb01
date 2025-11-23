"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";

export function FactoryClient({ page }: { page: any }) {
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

      {/* STATS */}
      {data?.stats && data.stats.length > 0 && (
        <section className="mt-12 grid gap-8 md:grid-cols-4">
          {data.stats.map((s: any, i: number) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                {lang === "zh" ? s.label_zh : s.label_en || s.label_zh}
              </div>
              <div className="mt-2 text-xl font-semibold text-zinc-900">{s.value}</div>
            </div>
          ))}
        </section>
      )}

      {/* IMAGES */}
      {data?.images && data.images.length > 0 && (
        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {data.images.map((img: any, i: number) => (
            <figure key={i} className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                <Image src={img.url} alt={img.caption_en || "Factory"} fill className="object-cover" />
              </div>
              <figcaption className="text-sm text-zinc-600">
                {lang === "zh" ? img.caption_zh : img.caption_en || img.caption_zh}
              </figcaption>
            </figure>
          ))}
        </section>
      )}

      {/* EQUIPMENT & QC */}
      {(data?.equipment_zh || data?.qc_zh) && (
        <section className="mt-16 grid gap-10 md:grid-cols-2">
          {data.equipment_zh && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {lang === "zh" ? "設備與能力" : "Equipment & capabilities"}
              </h2>
              <ul className="mt-4 space-y-2 text-[15px] text-zinc-700">
                {(lang === "zh" ? data.equipment_zh : data.equipment_en || data.equipment_zh)
                  .split("\n")
                  .filter((item: string) => item.trim())
                  .map((item: string, i: number) => (
                    <li key={i}>{item.trim()}</li>
                  ))}
              </ul>
            </div>
          )}
          {data.qc_zh && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {lang === "zh" ? "品質控制與工程" : "Quality control & engineering"}
              </h2>
              <ul className="mt-4 space-y-2 text-[15px] text-zinc-700">
                {(lang === "zh" ? data.qc_zh : data.qc_en || data.qc_zh)
                  .split("\n")
                  .filter((item: string) => item.trim())
                  .map((item: string, i: number) => (
                    <li key={i}>{item.trim()}</li>
                  ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* WORKFLOW */}
      {data?.workflow && data.workflow.length > 0 && (
        <section className="mt-16 md:mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            {lang === "zh" ? data.workflowTitle_zh : data.workflowTitle_en || "Workflow"}
          </h2>
          <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
            {lang === "zh" ? "清晰的流程讓專案可預測" : "A clear flow keeps projects predictable"}
          </p>
          <ol className="mt-6 grid gap-4 text-[14px] text-zinc-700 md:grid-cols-4">
            {data.workflow.map((w: any, i: number) => (
              <li key={i} className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
                <div className="text-xs text-zinc-500">{w.step}</div>
                <div className="mt-1 text-[15px] font-medium text-zinc-900">
                  {lang === "zh" ? w.title_zh : w.title_en || w.title_zh}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">
                  {lang === "zh" ? w.body_zh : w.body_en || w.body_zh}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* CTA */}
      {data?.ctaTitle_zh && (
        <section className="mt-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            {lang === "zh" ? data.ctaTitle_zh : data.ctaTitle_en || data.ctaTitle_zh}
          </h2>
          {data.ctaDesc_zh && (
            <p className="mx-auto mt-3 max-w-xl text-[15px] text-zinc-600">
              {lang === "zh" ? data.ctaDesc_zh : data.ctaDesc_en || data.ctaDesc_zh}
            </p>
          )}
          <div className="mt-6">
            <Link
              href="/contact"
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {lang === "zh" ? "聯絡我們" : "Contact us"}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
