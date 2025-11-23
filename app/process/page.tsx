"use client";

import { useState } from "react";

const processData = [
  {
    step: 1,
    title: "需求分析",
    subtitle: "Discovery & Research",
    description: "深入了解您的業務需求、目標受眾與市場定位，建立清晰的專案藍圖。",
    duration: "1-2 週",
    deliverables: ["需求規格書", "競品分析報告", "用戶旅程地圖", "專案時程規劃"],
    icon: "🔍",
    color: "blue",
  },
  {
    step: 2,
    title: "設計規劃",
    subtitle: "Design & Planning",
    description: "打造符合品牌形象的視覺設計，確保優秀的使用者體驗與介面互動。",
    duration: "2-3 週",
    deliverables: ["線框圖", "視覺設計稿", "設計系統", "互動原型"],
    icon: "🎨",
    color: "purple",
  },
  {
    step: 3,
    title: "開發製作",
    subtitle: "Development",
    description: "採用最新技術堆疊進行開發，確保程式碼品質、效能與擴展性。",
    duration: "4-6 週",
    deliverables: ["前端開發", "後端API", "資料庫設計", "第三方整合"],
    icon: "💻",
    color: "green",
  },
  {
    step: 4,
    title: "測試優化",
    subtitle: "Testing & QA",
    description: "進行全面的功能測試、效能測試與跨平台相容性測試，確保品質。",
    duration: "1-2 週",
    deliverables: ["功能測試報告", "效能優化", "Bug修復", "使用者測試"],
    icon: "🔬",
    color: "orange",
  },
  {
    step: 5,
    title: "上線部署",
    subtitle: "Launch & Deploy",
    description: "協助網站正式上線，並提供完整的技術文件與操作教學。",
    duration: "1 週",
    deliverables: ["正式上線", "DNS設定", "SSL憑證", "操作手冊"],
    icon: "🚀",
    color: "red",
  },
  {
    step: 6,
    title: "維護支援",
    subtitle: "Support & Maintenance",
    description: "提供持續的技術支援、功能更新與效能監控，確保網站穩定運行。",
    duration: "長期",
    deliverables: ["技術支援", "定期更新", "效能監控", "緊急修復"],
    icon: "🛡️",
    color: "indigo",
  },
];

export default function ProcessPage() {
  const [activeStyle, setActiveStyle] = useState<"timeline" | "cards" | "minimal" | "accordion">("timeline");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const styles = [
    { id: "timeline", name: "時間軸", icon: "━" },
    { id: "cards", name: "卡片式", icon: "▢" },
    { id: "minimal", name: "極簡式", icon: "◻" },
    { id: "accordion", name: "手風琴", icon: "☰" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 py-20 text-white">
        <div className="container mx-auto px-6">
          <h1 className="mb-4 text-5xl font-bold">工作流程</h1>
          <p className="text-xl text-white/90">
            從概念到上線，我們用專業流程確保每個專案的成功
          </p>
        </div>
      </section>

      {/* Style Selector */}
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-zinc-600">顯示風格：</span>
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setActiveStyle(style.id as any)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeStyle === style.id
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                <span className="text-lg">{style.icon}</span>
                {style.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-6 py-12">
        {activeStyle === "timeline" && <TimelineLayout steps={processData} />}
        {activeStyle === "cards" && <CardsLayout steps={processData} />}
        {activeStyle === "minimal" && <MinimalLayout steps={processData} />}
        {activeStyle === "accordion" && (
          <AccordionLayout
            steps={processData}
            expandedStep={expandedStep}
            setExpandedStep={setExpandedStep}
          />
        )}
      </div>
    </div>
  );
}

// 時間軸佈局
function TimelineLayout({ steps }: { steps: typeof processData }) {
  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 md:left-1/2" />

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
                <span className={`rounded-full bg-${step.color}-100 px-3 py-1 text-xs font-bold text-${step.color}-700`}>
                  STEP {step.step}
                </span>
                <span className="text-sm text-zinc-500">{step.duration}</span>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-zinc-900">{step.title}</h3>
              <p className="mb-1 text-sm font-medium text-zinc-500">{step.subtitle}</p>
              <p className="mb-4 leading-relaxed text-zinc-600">{step.description}</p>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-zinc-900">交付成果</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {step.deliverables.map((item) => (
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
function CardsLayout({ steps }: { steps: typeof processData }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => (
        <div
          key={step.step}
          className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`bg-gradient-to-br ${colors[step.color as keyof typeof colors]} p-6 text-white`}>
            <div className="mb-3 text-5xl">{step.icon}</div>
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                STEP {step.step}
              </span>
              <span className="text-sm text-white/90">{step.duration}</span>
            </div>
            <h3 className="mb-1 text-2xl font-bold">{step.title}</h3>
            <p className="text-sm text-white/90">{step.subtitle}</p>
          </div>
          <div className="p-6">
            <p className="mb-4 leading-relaxed text-zinc-600">{step.description}</p>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-zinc-900">交付成果</h4>
              {step.deliverables.map((item) => (
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
function MinimalLayout({ steps }: { steps: typeof processData }) {
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
                <span className="text-xs font-light text-zinc-400">{step.duration}</span>
              </div>
              <h3 className="mb-1 text-3xl font-light text-zinc-900">{step.title}</h3>
              <p className="text-sm font-light tracking-wide text-zinc-500">{step.subtitle}</p>
            </div>
          </div>
          <p className="mb-6 font-light leading-loose text-zinc-600">{step.description}</p>
          <div className="grid gap-3 md:grid-cols-2">
            {step.deliverables.map((item) => (
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
}: {
  steps: typeof processData;
  expandedStep: number | null;
  setExpandedStep: (step: number | null) => void;
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
    green: "bg-green-100 text-green-700 border-green-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    red: "bg-red-100 text-red-700 border-red-300",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-300",
  };

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
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors[step.color as keyof typeof colors]}`}>
                      STEP {step.step}
                    </span>
                    <span className="text-sm text-zinc-500">{step.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">{step.title}</h3>
                  <p className="text-sm text-zinc-500">{step.subtitle}</p>
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
                <p className="mb-6 leading-relaxed text-zinc-600">{step.description}</p>
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-zinc-900">交付成果</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {step.deliverables.map((item) => (
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
