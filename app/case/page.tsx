"use client";

import { useState } from "react";
import Image from "next/image";

const caseData = [
  {
    id: 1,
    title: "電商平台網站重構",
    subtitle: "提升使用者體驗與轉換率",
    category: "電商 / UX",
    year: "2024",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    description: "為知名電商平台進行全面的網站重構，採用現代化的設計語言，優化購物流程，提升頁面載入速度。",
    results: ["轉換率提升 45%", "平均停留時間增加 3 分鐘", "行動裝置流量增長 60%"],
    tags: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    id: 2,
    title: "企業品牌形象網站",
    subtitle: "展現專業與創新",
    category: "品牌 / 企業",
    year: "2024",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    description: "為科技公司打造全新的品牌形象網站，展現企業文化與產品優勢，提升品牌識別度。",
    results: ["訪客停留時間增加 200%", "諮詢量提升 80%", "品牌認知度大幅提升"],
    tags: ["Brand Design", "CMS", "SEO"],
  },
  {
    id: 3,
    title: "藝廊展覽平台",
    subtitle: "藝術與科技的完美結合",
    category: "藝術 / 文化",
    year: "2023",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
    description: "為當代藝術館設計的線上展覽平台，結合 3D 展示與互動體驗，讓藝術品以數位形式呈現。",
    results: ["線上參觀人數破 10 萬", "國際訪客佔 40%", "獲得多項設計獎項"],
    tags: ["3D", "WebGL", "Interactive"],
  },
  {
    id: 4,
    title: "美食外送 App",
    subtitle: "快速、便利的點餐體驗",
    category: "App / 生活",
    year: "2023",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    description: "設計直覺易用的美食外送應用程式，簡化點餐流程，提供即時配送追蹤功能。",
    results: ["日活躍用戶 5 萬+", "平均評分 4.8 星", "訂單完成率 95%"],
    tags: ["Mobile App", "React Native", "Real-time"],
  },
];

export default function CasePage() {
  const [activeStyle, setActiveStyle] = useState<"grid" | "masonry" | "minimal" | "magazine">("grid");
  const [selectedCase, setSelectedCase] = useState<typeof caseData[0] | null>(null);

  const styles = [
    { id: "grid", name: "網格佈局", icon: "▦" },
    { id: "masonry", name: "瀑布流", icon: "≋" },
    { id: "minimal", name: "極簡風格", icon: "◻" },
    { id: "magazine", name: "雜誌風格", icon: "▣" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 py-20 text-white">
        <div className="container mx-auto px-6">
          <h1 className="mb-4 text-5xl font-bold">成功案例</h1>
          <p className="text-xl text-white/90">
            探索我們如何幫助客戶實現數位轉型與品牌升級
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
                    ? "bg-blue-600 text-white shadow-md"
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
        {activeStyle === "grid" && <GridLayout cases={caseData} onSelect={setSelectedCase} />}
        {activeStyle === "masonry" && <MasonryLayout cases={caseData} onSelect={setSelectedCase} />}
        {activeStyle === "minimal" && <MinimalLayout cases={caseData} onSelect={setSelectedCase} />}
        {activeStyle === "magazine" && <MagazineLayout cases={caseData} onSelect={setSelectedCase} />}
      </div>

      {/* Detail Modal */}
      {selectedCase && (
        <CaseDetailModal case={selectedCase} onClose={() => setSelectedCase(null)} />
      )}
    </div>
  );
}

// 網格佈局
function GridLayout({ cases, onSelect }: { cases: typeof caseData; onSelect: (c: any) => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cases.map((item, index) => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="relative h-64 overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900 backdrop-blur-sm">
              {item.year}
            </div>
          </div>
          <div className="p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
              {item.category}
            </div>
            <h3 className="mb-2 text-xl font-bold text-zinc-900">{item.title}</h3>
            <p className="mb-4 text-sm text-zinc-600">{item.subtitle}</p>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 瀑布流佈局
function MasonryLayout({ cases, onSelect }: { cases: typeof caseData; onSelect: (c: any) => void }) {
  const columns = [
    cases.filter((_, i) => i % 2 === 0),
    cases.filter((_, i) => i % 2 === 1),
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-6">
          {column.map((item, index) => {
            const heights = ["h-80", "h-96", "h-72"];
            const randomHeight = heights[(colIndex + index) % heights.length];
            
            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl ${randomHeight}`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                      {item.category}
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-white/90">{item.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// 極簡佈局 (MUJI)
function MinimalLayout({ cases, onSelect }: { cases: typeof caseData; onSelect: (c: any) => void }) {
  return (
    <div className="space-y-20">
      {cases.map((item, index) => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          className={`group flex cursor-pointer flex-col gap-8 ${
            index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
          }`}
        >
          <div className="relative h-80 flex-1 overflow-hidden rounded-sm bg-zinc-100 md:h-96">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col justify-center space-y-4">
            <div className="text-xs font-light uppercase tracking-[0.3em] text-zinc-400">
              {item.category} / {item.year}
            </div>
            <h3 className="text-3xl font-light text-zinc-900">{item.title}</h3>
            <p className="font-light leading-relaxed text-zinc-600">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-zinc-200 px-4 py-1 text-xs font-light text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 雜誌佈局
function MagazineLayout({ cases, onSelect }: { cases: typeof caseData; onSelect: (c: any) => void }) {
  return (
    <div className="space-y-12">
      {cases.map((item, index) => {
        const isLarge = index === 0;
        
        if (isLarge) {
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="group relative h-[600px] cursor-pointer overflow-hidden rounded-3xl shadow-2xl"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-12">
                  <div className="mb-4 inline-block rounded-full border-2 border-white px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Featured
                  </div>
                  <h2 className="mb-4 text-5xl font-bold text-white">{item.title}</h2>
                  <p className="mb-6 max-w-2xl text-xl text-white/90">{item.description}</p>
                  <div className="flex gap-3">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="group grid cursor-pointer gap-8 md:grid-cols-2"
          >
            <div className="relative h-80 overflow-hidden rounded-2xl">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-600">
                {item.category}
              </div>
              <h3 className="mb-4 text-3xl font-bold text-zinc-900">{item.title}</h3>
              <p className="mb-6 leading-relaxed text-zinc-600">{item.description}</p>
              <div className="space-y-2">
                {item.results.map((result, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-zinc-700">{result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 詳細資訊 Modal
function CaseDetailModal({ case: item, onClose }: { case: typeof caseData[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative h-96">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/80">
              {item.category} · {item.year}
            </div>
            <h2 className="text-4xl font-bold text-white">{item.title}</h2>
          </div>
        </div>

        <div className="p-8">
          <h3 className="mb-4 text-2xl font-semibold text-zinc-900">{item.subtitle}</h3>
          <p className="mb-6 leading-relaxed text-zinc-600">{item.description}</p>

          <div className="mb-8">
            <h4 className="mb-3 text-lg font-semibold text-zinc-900">專案成果</h4>
            <div className="space-y-3">
              {item.results.map((result, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-zinc-900">{result}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold text-zinc-900">使用技術</h4>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
