// app/factory/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { useLanguage } from "../contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function FactoryPage() {
  const { lang } = useLanguage();
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/pages/factory")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setPageData(data))
      .catch(() => {});
  }, []);

  const data = pageData?.pageData || {};

  const hero = {
    label: lang === "zh" ? (pageData?.label_zh || "工廠實力") : (pageData?.label_en || "Factory Strength"),
    title: lang === "zh" ? (pageData?.title_zh || "清潔、結構化的禮品盒和包裝生產基地。") : (pageData?.title_en || "A clean, structured production base for gift boxes and packaging."),
    desc: lang === "zh" ? (pageData?.desc_zh || "我們的設施專注於一致的品質和可靠的交付。") : (pageData?.desc_en || "Our facility is designed around consistent quality and reliable delivery."),
  };

  const stats = data.stats || [
    { label_en: "Factory area", label_zh: "工廠面積", value: "10,000 m²" },
    { label_en: "People", label_zh: "員工", value: "120+" },
    { label_en: "Monthly capacity", label_zh: "月產能", value: "300,000+ boxes" },
    { label_en: "Certifications", label_zh: "認證", value: "ISO / audited" },
  ];

  const images = data.images || [
    { url: "/cdn/factory/floor.jpg", caption_en: "Clean and organized production floor.", caption_zh: "清潔整齊的生產樓層。" },
    { url: "/cdn/factory/machines.jpg", caption_en: "Equipment for printing, die-cutting and rigid box forming.", caption_zh: "印刷、模切和硬盒成型設備。" },
    { url: "/cdn/factory/qc.jpg", caption_en: "QC teams checking structure, printing and finishing.", caption_zh: "QC 團隊檢查結構、印刷和整理。" },
  ];

  const equipment = {
    title: lang === "zh" ? "設備與能力" : "Equipment & capabilities",
    items: lang === "zh" ?
      (data.equipment_zh || "・ 4色和5色膠印\n・ 全自動和半自動硬盒生產線\n・ 模切和壓痕機\n・ 燙金和壓紋設備\n・ 覆膜和表面處理線").split("\n") :
      (data.equipment_en || "・ 4-color and 5-color offset printing\n・ Automatic and semi-automatic rigid box lines\n・ Die-cutting and creasing machines\n・ Hot stamping and embossing equipment\n・ Lamination and surface finishing lines").split("\n"),
  };

  const qc = {
    title: lang === "zh" ? "品質控制與工程" : "Quality control & engineering",
    items: lang === "zh" ?
      (data.qc_zh || "・ 內部結構工程師負責盒子設計和測試\n・ 生產前打樣和批准\n・ 量產期間的過程檢查\n・ 包裝和運輸前的最終檢驗").split("\n") :
      (data.qc_en || "・ In-house structural engineers for box design and testing\n・ Pre-production sampling and approval\n・ In-process checks during mass production\n・ Final inspection before packing and shipping").split("\n"),
  };

  const workflow = data.workflow || [
    { step: "01", title_en: "Engineering", title_zh: "工程", body_en: "We confirm structure, materials and key tolerances.", body_zh: "我們確認結構、材料和關鍵公差。" },
    { step: "02", title_en: "Sampling", title_zh: "打樣", body_en: "White and printed samples for structure & finishing approval.", body_zh: "白樣和印刷樣品用於結構和整理批准。" },
    { step: "03", title_en: "Mass production", title_zh: "量產", body_en: "Production with in-line QC at critical stages.", body_zh: "在關鍵階段進行在線 QC 的生產。" },
    { step: "04", title_en: "Packing & shipping", title_zh: "包裝和運輸", body_en: "Final QC, packing and shipping arrangements to your location.", body_zh: "最終 QC、包裝和運輸安排到您的位置。" },
  ];

  const cta = {
    title: lang === "zh" ? (data.ctaTitle_zh || "想要審核我們的工廠或查看更多詳情？") : (data.ctaTitle_en || "Want to audit our factory or see more details?"),
    desc: lang === "zh" ? (data.ctaDesc_zh || "我們可以分享更多關於設備、流程和以前的審核信息。") : (data.ctaDesc_en || "We can share more information on equipment, processes and previous audits."),
  };

  return (
    <SiteShell>
      {/* HERO */}
      <section>
        <p className="text-sm text-zinc-500">{hero.label}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          {hero.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-600">
          {hero.desc}
        </p>
      </section>

      {/* STATS */}
      <section className="mt-12 grid gap-8 md:grid-cols-4">
        {stats.map((s: any, i: number) => (
          <Stat key={i} label={lang === "zh" ? s.label_zh : s.label_en} value={s.value} />
        ))}
      </section>

      {/* IMAGES */}
      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {images.map((img: any, i: number) => (
          <FactoryImage
            key={i}
            src={img.url}
            alt={lang === "zh" ? img.caption_zh : img.caption_en}
            caption={lang === "zh" ? img.caption_zh : img.caption_en}
          />
        ))}
      </section>

      {/* EQUIPMENT & QC */}
      <section className="mt-16 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {equipment.title}
          </h2>
          <ul className="mt-4 space-y-2 text-[15px] text-zinc-700">
            {equipment.items.filter((item: string) => item.trim()).map((item: string, i: number) => (
              <li key={i}>{item.trim()}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {qc.title}
          </h2>
          <ul className="mt-4 space-y-2 text-[15px] text-zinc-700">
            {qc.items.filter((item: string) => item.trim()).map((item: string, i: number) => (
              <li key={i}>{item.trim()}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="mt-16 md:mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">
          {lang === "zh" ? (data.workflowTitle_zh || "從需求到交付") : (data.workflowTitle_en || "From brief to shipment")}
        </h2>
        <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
          {lang === "zh" ? "清晰的流程讓專案可預測" : "A clear flow from enquiry to delivery helps keep projects predictable."}
        </p>

        <ol className="mt-6 grid gap-4 text-[14px] text-zinc-700 md:grid-cols-4">
          {workflow.map((w: any, i: number) => (
            <StepItem
              key={i}
              step={w.step}
              title={lang === "zh" ? w.title_zh : w.title_en}
              body={lang === "zh" ? w.body_zh : w.body_en}
            />
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {cta.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-zinc-600">
          {cta.desc}
        </p>
        <div className="mt-6">
          <Link
            href="/contact"
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {lang === "zh" ? "聯絡我們" : "Contact us"}
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

function FactoryImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
      <figcaption className="text-sm text-zinc-600">{caption}</figcaption>
    </figure>
  );
}

function StepItem({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="text-xs text-zinc-500">{step}</div>
      <div className="mt-1 text-[15px] font-medium text-zinc-900">{title}</div>
      <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">{body}</p>
    </li>
  );
}
