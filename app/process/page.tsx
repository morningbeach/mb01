"use client";

import { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { useLanguage } from "../contexts/LanguageContext";

const processData = [
  {
    step: 1,
    title_en: "Consultation",
    title_zh: "需求諮詢",
    subtitle_en: "Understanding Your Vision",
    subtitle_zh: "了解您的願景",
    description_en: "We begin by understanding your brand, target audience, product specifications, and packaging goals to create a customized solution.",
    description_zh: "我們首先了解您的品牌、目標受眾、產品規格和包裝目標，以創建客製化解決方案。",
    duration_en: "1-2 days",
    duration_zh: "1-2 天",
    deliverables_en: ["Brand Analysis", "Product Requirements", "Budget Planning", "Timeline Proposal"],
    deliverables_zh: ["品牌分析", "產品需求", "預算規劃", "時程提案"],
    icon: "💬",
  },
  {
    step: 2,
    title_en: "Design Concept",
    title_zh: "設計概念",
    subtitle_en: "Creative Development",
    subtitle_zh: "創意開發",
    description_en: "Our design team creates multiple packaging concepts with 3D renderings, material recommendations, and structural designs.",
    description_zh: "我們的設計團隊創建多個包裝概念，包含 3D 渲染圖、材料建議和結構設計。",
    duration_en: "3-5 days",
    duration_zh: "3-5 天",
    deliverables_en: ["3D Mockups", "Material Samples", "Color Options", "Structural Design"],
    deliverables_zh: ["3D 模擬圖", "材料樣本", "色彩選項", "結構設計"],
    icon: "✏️",
  },
  {
    step: 3,
    title_en: "Prototype",
    title_zh: "樣品製作",
    subtitle_en: "Physical Sample Creation",
    subtitle_zh: "實體樣品創建",
    description_en: "We produce physical prototypes for your review, allowing you to feel the materials, test the structure, and make adjustments.",
    description_zh: "我們製作實體原型供您審查，讓您感受材料、測試結構並進行調整。",
    duration_en: "5-7 days",
    duration_zh: "5-7 天",
    deliverables_en: ["Physical Prototype", "Material Testing", "Quality Assessment", "Revision Options"],
    deliverables_zh: ["實體原型", "材料測試", "品質評估", "修改選項"],
    icon: "📦",
  },
  {
    step: 4,
    title_en: "Approval",
    title_zh: "確認批准",
    subtitle_en: "Final Review & Sign-off",
    subtitle_zh: "最終審查與簽署",
    description_en: "Review the prototype, approve specifications, and finalize all details before moving to production stage.",
    description_zh: "審查原型、批准規格，並在進入生產階段前確定所有細節。",
    duration_en: "2-3 days",
    duration_zh: "2-3 天",
    deliverables_en: ["Final Approval", "Production Specs", "Contract Signing", "Payment Schedule"],
    deliverables_zh: ["最終批准", "生產規格", "合約簽署", "付款時程"],
    icon: "✓",
  },
  {
    step: 5,
    title_en: "Production",
    title_zh: "量產製造",
    subtitle_en: "Manufacturing & Quality Control",
    subtitle_zh: "製造與品質控制",
    description_en: "Full-scale production begins with strict quality control measures, regular updates, and progress monitoring.",
    description_zh: "開始全面生產，實施嚴格的品質控制措施、定期更新和進度監控。",
    duration_en: "15-25 days",
    duration_zh: "15-25 天",
    deliverables_en: ["Mass Production", "Quality Inspection", "Progress Reports", "Pre-shipment Sample"],
    deliverables_zh: ["大量生產", "品質檢驗", "進度報告", "出貨前樣品"],
    icon: "🏭",
  },
  {
    step: 6,
    title_en: "Delivery",
    title_zh: "交付配送",
    subtitle_en: "Shipping & After-sales",
    subtitle_zh: "配送與售後",
    description_en: "Professional packaging, timely delivery, and comprehensive after-sales support to ensure your complete satisfaction.",
    description_zh: "專業包裝、準時交付和全面的售後支持，確保您完全滿意。",
    duration_en: "3-7 days",
    duration_zh: "3-7 天",
    deliverables_en: ["Secure Packaging", "Logistics Tracking", "After-sales Support", "Reorder Service"],
    deliverables_zh: ["安全包裝", "物流追蹤", "售後支持", "重複訂購服務"],
    icon: "🚚",
  },
];

export default function ProcessPage() {
  const { lang } = useLanguage();
  const [activeStyle, setActiveStyle] = useState<"timeline" | "cards" | "minimal" | "accordion">("timeline");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const styles = [
    { id: "timeline", name_en: "Timeline", name_zh: "時間軸", icon: "━" },
    { id: "cards", name_en: "Cards", name_zh: "卡片式", icon: "▢" },
    { id: "minimal", name_en: "Minimal", name_zh: "極簡式", icon: "◻" },
    { id: "accordion", name_en: "Accordion", name_zh: "手風琴", icon: "☰" },
  ];

  const content = {
    title_en: "Our Process",
    title_zh: "工作流程",
    subtitle_en: "From concept to delivery, we follow a proven process to ensure exceptional packaging quality",
    subtitle_zh: "從概念到交付，我們遵循經過驗證的流程，確保卓越的包裝品質",
    viewStyle_en: "View Style:",
    viewStyle_zh: "顯示風格：",
  };

  return (
    <SiteShell>
      <div className="min-h-screen -mx-6 md:-mx-10">
        {/* Hero Section */}
        <section className="bg-zinc-900 py-16 text-white md:py-20">
          <div className="container mx-auto px-6">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              {lang === "zh" ? content.title_zh : content.title_en}
            </h1>
            <p className="text-lg text-zinc-300 md:text-xl">
              {lang === "zh" ? content.subtitle_zh : content.subtitle_en}
            </p>
          </div>
        </section>

        {/* Style Selector */}
        <div className="sticky top-[73px] z-10 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-zinc-600">
                {lang === "zh" ? content.viewStyle_zh : content.viewStyle_en}
              </span>
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setActiveStyle(style.id as any)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeStyle === style.id
                      ? "bg-zinc-900 text-white shadow-md"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  <span className="text-lg">{style.icon}</span>
                  {lang === "zh" ? style.name_zh : style.name_en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-6 py-12">
          {activeStyle === "timeline" && <TimelineLayout steps={processData} lang={lang} />}
          {activeStyle === "cards" && <CardsLayout steps={processData} lang={lang} />}
          {activeStyle === "minimal" && <MinimalLayout steps={processData} lang={lang} />}
          {activeStyle === "accordion" && (
            <AccordionLayout
              steps={processData}
              expandedStep={expandedStep}
              setExpandedStep={setExpandedStep}
              lang={lang}
            />
          )}
        </div>
      </div>
    </SiteShell>
  );
}

// 時間軸佈局
function TimelineLayout({ steps, lang }: { steps: typeof processData; lang: "en" | "zh" }) {
  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-zinc-400 via-zinc-500 to-zinc-600 md:left-1/2" />

      <div className="space-y-16">
        {steps.map((step, index) => (
          <div
            key={step.step}
            className={`relative flex items-center ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            {/* Timeline Dot */}
            <div className="absolute left-8 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg md:left-1/2 md:-translate-x-1/2">
              <span className="text-3xl">{step.icon}</span>
            </div>

            {/* Content Card */}
            <div
              className={`ml-24 w-full rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl md:ml-0 md:w-[calc(50%-4rem)] ${
                index % 2 === 0 ? "md:mr-auto md:pr-12" : "md:ml-auto md:pl-12"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700">
                  STEP {step.step}
                </span>
                <span className="text-sm text-zinc-500">
                  {lang === "zh" ? step.duration_zh : step.duration_en}
                </span>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-zinc-900">
                {lang === "zh" ? step.title_zh : step.title_en}
              </h3>
              <p className="mb-1 text-sm font-medium text-zinc-500">
                {lang === "zh" ? step.subtitle_zh : step.subtitle_en}
              </p>
              <p className="mb-4 leading-relaxed text-zinc-600">
                {lang === "zh" ? step.description_zh : step.description_en}
              </p>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-zinc-900">
                  {lang === "zh" ? "交付成果" : "Deliverables"}
                </h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {(lang === "zh" ? step.deliverables_zh : step.deliverables_en).map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-zinc-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 卡片佈局
function CardsLayout({ steps, lang }: { steps: typeof processData; lang: "en" | "zh" }) {
  const gradients = [
    "from-zinc-700 to-zinc-800",
    "from-zinc-600 to-zinc-700",
    "from-zinc-800 to-zinc-900",
    "from-zinc-700 to-zinc-900",
    "from-zinc-600 to-zinc-800",
    "from-zinc-500 to-zinc-700",
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => (
        <div
          key={step.step}
          className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} p-6 text-white`}>
            <div className="mb-3 text-5xl">{step.icon}</div>
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                STEP {step.step}
              </span>
              <span className="text-sm text-white/90">
                {lang === "zh" ? step.duration_zh : step.duration_en}
              </span>
            </div>
            <h3 className="mb-1 text-2xl font-bold">
              {lang === "zh" ? step.title_zh : step.title_en}
            </h3>
            <p className="text-sm text-white/90">
              {lang === "zh" ? step.subtitle_zh : step.subtitle_en}
            </p>
          </div>
          <div className="p-6">
            <p className="mb-4 leading-relaxed text-zinc-600">
              {lang === "zh" ? step.description_zh : step.description_en}
            </p>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-zinc-900">
                {lang === "zh" ? "交付成果" : "Deliverables"}
              </h4>
              {(lang === "zh" ? step.deliverables_zh : step.deliverables_en).map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <svg className="h-4 w-4 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-zinc-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 極簡佈局 (MUJI)
function MinimalLayout({ steps, lang }: { steps: typeof processData; lang: "en" | "zh" }) {
  return (
    <div className="mx-auto max-w-4xl space-y-16">
      {steps.map((step, index) => (
        <div
          key={step.step}
          className="group border-b border-zinc-200 pb-16 last:border-b-0"
        >
          <div className="mb-8 flex items-center gap-6">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-2 border-zinc-300 text-4xl transition-all group-hover:scale-110 group-hover:border-zinc-900">
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-3">
                <span className="text-xs font-light uppercase tracking-[0.3em] text-zinc-400">
                  STEP {String(step.step).padStart(2, "0")}
                </span>
                <span className="text-xs font-light text-zinc-400">·</span>
                <span className="text-xs font-light text-zinc-400">
                  {lang === "zh" ? step.duration_zh : step.duration_en}
                </span>
              </div>
              <h3 className="mb-1 text-3xl font-light text-zinc-900">
                {lang === "zh" ? step.title_zh : step.title_en}
              </h3>
              <p className="text-sm font-light tracking-wide text-zinc-500">
                {lang === "zh" ? step.subtitle_zh : step.subtitle_en}
              </p>
            </div>
          </div>
          <p className="mb-6 font-light leading-loose text-zinc-600">
            {lang === "zh" ? step.description_zh : step.description_en}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {(lang === "zh" ? step.deliverables_zh : step.deliverables_en).map((item) => (
              <div key={item} className="flex items-center gap-3 border border-zinc-200 p-3">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span className="text-sm font-light text-zinc-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 手風琴佈局
function AccordionLayout({
  steps,
  expandedStep,
  setExpandedStep,
  lang,
}: {
  steps: typeof processData;
  expandedStep: number | null;
  setExpandedStep: (step: number | null) => void;
  lang: "en" | "zh";
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {steps.map((step) => {
        const isExpanded = expandedStep === step.step;
        
        return (
          <div
            key={step.step}
            className="overflow-hidden rounded-xl border-2 border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <button
              onClick={() => setExpandedStep(isExpanded ? null : step.step)}
              className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-zinc-50"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{step.icon}</span>
                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700">
                      STEP {step.step}
                    </span>
                    <span className="text-sm text-zinc-500">
                      {lang === "zh" ? step.duration_zh : step.duration_en}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">
                    {lang === "zh" ? step.title_zh : step.title_en}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {lang === "zh" ? step.subtitle_zh : step.subtitle_en}
                  </p>
                </div>
              </div>
              <svg
                className={`h-6 w-6 flex-shrink-0 transform text-zinc-400 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isExpanded ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="border-t border-zinc-200 p-6">
                <p className="mb-6 leading-relaxed text-zinc-600">
                  {lang === "zh" ? step.description_zh : step.description_en}
                </p>
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-zinc-900">
                    {lang === "zh" ? "交付成果" : "Deliverables"}
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {(lang === "zh" ? step.deliverables_zh : step.deliverables_en).map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-lg bg-green-50 p-3"
                      >
                        <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-zinc-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
