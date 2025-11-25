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
    label: lang === "zh" ? (pageData?.label_zh || "生產基地") : (pageData?.label_en || "Production Base"),
    title: lang === "zh" ? (pageData?.title_zh || "以知識循環驅動的現代包裝生產基地") : (pageData?.title_en || "A modern packaging production base driven by knowledge circulation"),
    desc: lang === "zh" ? (pageData?.desc_zh || "我們的工廠不只是生產設備的集合，而是知識沉澱、流程優化與品質管理的系統化實踐。每一個環節都經過理性設計，每一次改進都源於經驗累積。") : (pageData?.desc_en || "Our factory is not just a collection of production equipment, but a systematic practice of knowledge settlement, process optimization, and quality management. Every step is rationally designed, every improvement stems from accumulated experience."),
  };

  const stats = data.stats || [
    { label_en: "Production Philosophy", label_zh: "生產理念", value: lang === "zh" ? "穩定是生產的形式，理解是品牌的靈魂" : "Stability is the form of production; understanding is the soul of the brand" },
    { label_en: "Quality System", label_zh: "品質系統", value: lang === "zh" ? "流程透明化與責任歸屬明確化" : "Process transparency and clear accountability" },
    { label_en: "Knowledge Management", label_zh: "知識管理", value: lang === "zh" ? "每次錯誤記錄成案例，每個成功附上原因" : "Every mistake becomes a case study, every success comes with its reason" },
    { label_en: "Team Culture", label_zh: "團隊文化", value: lang === "zh" ? "學習型團隊，共同成長" : "Learning team, co-growth" },
  ];

  const images = data.images || [
    { url: "/cdn/factory/floor.jpg", caption_en: "Organized production floor: every process has its flow, every detail is documented", caption_zh: "有序的生產現場：每個流程都有邏輯，每個細節都被記錄" },
    { url: "/cdn/factory/machines.jpg", caption_en: "Professional equipment: tools for precision, foundation for stability", caption_zh: "專業設備：實現精準的工具，穩定的基礎" },
    { url: "/cdn/factory/qc.jpg", caption_en: "Quality control: not just inspection, but systematic verification", caption_zh: "品質管控：不只是檢查，而是系統化的確認" },
  ];

  const equipment = {
    title: lang === "zh" ? "生產能力" : "Production Capabilities",
    items: lang === "zh" ?
      (data.equipment_zh || "・ 多工序整合：印刷、模切、成型、後加工一體化\n・ 彈性產能：小批量訂製到中大規模量產\n・ 材料整合：紙張、特種紙、裱貼材料供應鏈管理\n・ 工藝選擇：依專案需求提供適配的工法與節奏\n・ 品質追溯：完整記錄每批次生產參數與檢驗數據").split("\n") :
      (data.equipment_en || "・ Multi-process integration: printing, die-cutting, forming, post-processing integration\n・ Flexible capacity: from small-batch customization to medium-to-large-scale production\n・ Material integration: paper, specialty paper, lamination material supply chain management\n・ Process selection: providing adaptive methods and pace based on project needs\n・ Quality traceability: complete records of production parameters and inspection data for each batch").split("\n"),
  };

  const qc = {
    title: lang === "zh" ? "品質管理系統" : "Quality Management System",
    items: lang === "zh" ?
      (data.qc_zh || "・ 結構驗證：設計階段的可行性評估與工藝確認\n・ 打樣確認：白樣與印刷樣的階段性檢驗與修正\n・ 過程監控：關鍵製程的即時品檢與數據記錄\n・ 最終檢驗：出貨前的全面品質確認與包裝檢查\n・ 問題追溯：每次錯誤記錄成案例，持續改進").split("\n") :
      (data.qc_en || "・ Structural verification: feasibility assessment and process confirmation at design stage\n・ Sample confirmation: phased inspection and correction of white samples and printed samples\n・ Process monitoring: real-time quality inspection and data recording of critical processes\n・ Final inspection: comprehensive quality confirmation and packaging inspection before shipment\n・ Issue traceability: every mistake becomes a case study for continuous improvement").split("\n"),
  };

  const workflow = data.workflow || [
    { step: "01", title_en: "Understanding & Planning", title_zh: "理解與規劃", body_en: "Reading briefs, understanding needs, proposing structural directions and rough budget ranges that make sense for the project.", body_zh: "閱讀需求、理解目標、提出結構方向與合理的預算範圍，讓專案從規劃階段就有清晰依據。" },
    { step: "02", title_en: "Design & Sampling", title_zh: "設計與打樣", body_en: "Engineering validation, white samples and printed samples for phased confirmation. Every detail is discussed, not assumed.", body_zh: "工程驗證、白樣與印刷樣的階段性確認。每個細節都經過討論，而非假設。" },
    { step: "03", title_en: "Production & Monitoring", title_zh: "生產與監控", body_en: "Mass production with in-process quality checks. Process transparency and clear accountability at every critical stage.", body_zh: "量產階段的過程品檢。流程透明化與責任歸屬明確化，每個關鍵環節都有記錄。" },
    { step: "04", title_en: "Delivery & Follow-up", title_zh: "交付與追蹤", body_en: "Final inspection, packing and shipping. Post-delivery follow-up to ensure expectations are met and feedback is documented.", body_zh: "最終檢驗、包裝與出貨。交付後追蹤，確保符合預期，並將反饋記錄成知識。" },
  ];

  const cta = {
    title: lang === "zh" ? (data.ctaTitle_zh || "想了解更多關於我們的生產流程與品質系統？") : (data.ctaTitle_en || "Want to learn more about our production process and quality system?"),
    desc: lang === "zh" ? (data.ctaDesc_zh || "我們樂意分享更多關於設備、流程、案例與知識管理的細節。讓我們從理解開始，找到最適合您專案的包裝方案。") : (data.ctaDesc_en || "We're happy to share more details about equipment, processes, case studies and knowledge management. Let's start from understanding and find the most suitable packaging solution for your project."),
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
