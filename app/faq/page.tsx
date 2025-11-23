"use client";

import { useState } from "react";

const faqData = [
  {
    id: 1,
    category: "專案合作",
    question: "如何開始一個新專案？",
    answer: "您可以透過網站的聯絡表單、電子郵件或電話與我們聯繫。我們會安排初步會議，了解您的需求、目標和預算，並提供專業的解決方案與報價。",
    icon: "🤝",
  },
  {
    id: 2,
    category: "專案合作",
    question: "一個網站專案通常需要多長時間？",
    answer: "專案時間取決於規模和複雜度。一般企業形象網站約需 6-8 週，功能型網站或電商平台可能需要 10-16 週。我們會在專案初期提供詳細的時程規劃。",
    icon: "⏱️",
  },
  {
    id: 3,
    category: "專案合作",
    question: "專案的付款方式是什麼？",
    answer: "通常採用分期付款方式：簽約時支付 30%、設計完成支付 30%、開發完成支付 30%、正式上線支付 10%。具體付款條件可依專案需求調整。",
    icon: "💰",
  },
  {
    id: 4,
    category: "設計開發",
    question: "你們使用什麼技術開發網站？",
    answer: "我們採用現代化的技術堆疊，包括 Next.js、React、TypeScript、Tailwind CSS 等前端技術，後端則依需求使用 Node.js、Python 或其他解決方案。所有技術選擇都以效能、安全性和擴展性為考量。",
    icon: "💻",
  },
  {
    id: 5,
    category: "設計開發",
    question: "網站會支援手機和平板嗎？",
    answer: "絕對會！所有網站都採用響應式設計（RWD），確保在各種裝置（手機、平板、電腦）上都能完美呈現。我們也會進行跨瀏覽器測試，確保相容性。",
    icon: "📱",
  },
  {
    id: 6,
    category: "設計開發",
    question: "可以客製化設計嗎？",
    answer: "當然！我們提供完全客製化的設計服務。設計師會根據您的品牌形象、目標受眾和產業特性，打造獨一無二的視覺設計。您可以參與整個設計流程，提供意見與修改建議。",
    icon: "🎨",
  },
  {
    id: 7,
    category: "功能特色",
    question: "可以整合第三方服務嗎？",
    answer: "可以。我們能整合各種第三方服務，包括金流系統（綠界、藍新）、物流系統、會員系統、Google Analytics、Facebook Pixel、CRM 系統等。",
    icon: "🔗",
  },
  {
    id: 8,
    category: "功能特色",
    question: "網站可以自己更新內容嗎？",
    answer: "可以。我們會建置易於使用的後台管理系統（CMS），讓您能輕鬆更新文字、圖片、產品資訊等內容，不需要懂程式。我們也會提供完整的操作教學。",
    icon: "✏️",
  },
  {
    id: 9,
    category: "功能特色",
    question: "有提供 SEO 優化嗎？",
    answer: "有的。所有網站都會進行基礎 SEO 優化，包括語意化標籤、Meta 設定、Sitemap、結構化資料等。我們也提供進階的 SEO 顧問服務，協助您提升搜尋排名。",
    icon: "🔍",
  },
  {
    id: 10,
    category: "維護支援",
    question: "上線後有提供維護服務嗎？",
    answer: "有的。我們提供不同等級的維護方案，包括技術支援、功能更新、安全性更新、效能優化、內容協助等。您可以選擇適合的維護計畫。",
    icon: "🛠️",
  },
  {
    id: 11,
    category: "維護支援",
    question: "如果網站出問題怎麼辦？",
    answer: "我們提供即時技術支援。緊急問題會在 2 小時內回應，一般問題在 24 小時內處理。維護合約客戶享有優先處理權。",
    icon: "🚨",
  },
  {
    id: 12,
    category: "維護支援",
    question: "網站資料會定期備份嗎？",
    answer: "是的。我們會設定自動備份機制，包括資料庫和檔案的每日備份。雲端備份會保留至少 30 天，確保資料安全無虞。",
    icon: "💾",
  },
];

export default function FaqPage() {
  const [activeStyle, setActiveStyle] = useState<"accordion" | "cards" | "minimal" | "tabs">("accordion");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("專案合作");

  const styles = [
    { id: "accordion", name: "手風琴式", icon: "☰" },
    { id: "cards", name: "卡片式", icon: "▢" },
    { id: "minimal", name: "極簡式", icon: "◻" },
    { id: "tabs", name: "分類標籤", icon: "◫" },
  ];

  const categories = ["專案合作", "設計開發", "功能特色", "維護支援"];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-6">
          <h1 className="mb-4 text-5xl font-bold">常見問題</h1>
          <p className="text-xl text-white/90">
            快速找到您需要的答案，或直接聯繫我們獲得協助
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
                    ? "bg-green-600 text-white shadow-md"
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
        {activeStyle === "accordion" && (
          <AccordionLayout faqs={faqData} expandedId={expandedId} setExpandedId={setExpandedId} />
        )}
        {activeStyle === "cards" && <CardsLayout faqs={faqData} />}
        {activeStyle === "minimal" && <MinimalLayout faqs={faqData} />}
        {activeStyle === "tabs" && (
          <TabsLayout
            faqs={faqData}
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        )}
      </div>

      {/* Contact CTA */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-900">找不到答案？</h2>
          <p className="mb-8 text-zinc-600">
            歡迎直接與我們聯繫，我們的團隊隨時為您解答
          </p>
          <button className="rounded-full bg-green-600 px-8 py-3 font-semibold text-white transition-all hover:bg-green-700 hover:shadow-lg">
            聯繫我們
          </button>
        </div>
      </section>
    </div>
  );
}

// 手風琴式佈局
function AccordionLayout({
  faqs,
  expandedId,
  setExpandedId,
}: {
  faqs: typeof faqData;
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
}) {
  const categoryColors: Record<string, string> = {
    "專案合作": "bg-blue-100 text-blue-700 border-blue-300",
    "設計開發": "bg-purple-100 text-purple-700 border-purple-300",
    "功能特色": "bg-green-100 text-green-700 border-green-300",
    "維護支援": "bg-orange-100 text-orange-700 border-orange-300",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      {faqs.map((faq) => {
        const isExpanded = expandedId === faq.id;
        
        return (
          <div
            key={faq.id}
            className="overflow-hidden rounded-xl border-2 border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : faq.id)}
              className="flex w-full items-start justify-between gap-4 p-6 text-left transition-colors hover:bg-zinc-50"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{faq.icon}</span>
                <div className="flex-1">
                  <span className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${categoryColors[faq.category]}`}>
                    {faq.category}
                  </span>
                  <h3 className="text-lg font-semibold text-zinc-900">{faq.question}</h3>
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
              <div className="border-t border-zinc-200 p-6 pl-[4.5rem]">
                <p className="leading-relaxed text-zinc-600">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 卡片式佈局
function CardsLayout({ faqs }: { faqs: typeof faqData }) {
  const categoryColors: Record<string, string> = {
    "專案合作": "from-blue-500 to-blue-600",
    "設計開發": "from-purple-500 to-purple-600",
    "功能特色": "from-green-500 to-green-600",
    "維護支援": "from-orange-500 to-orange-600",
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {faqs.map((faq, index) => (
        <div
          key={faq.id}
          className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={`bg-gradient-to-br ${categoryColors[faq.category]} p-5 text-white`}>
            <div className="mb-3 text-4xl">{faq.icon}</div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
              {faq.category}
            </span>
          </div>
          <div className="p-6">
            <h3 className="mb-3 text-lg font-bold text-zinc-900">{faq.question}</h3>
            <p className="text-sm leading-relaxed text-zinc-600">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// 極簡式佈局 (MUJI)
function MinimalLayout({ faqs }: { faqs: typeof faqData }) {
  return (
    <div className="mx-auto max-w-4xl space-y-12">
      {faqs.map((faq, index) => (
        <div
          key={faq.id}
          className="group border-b border-zinc-200 pb-12 last:border-b-0"
        >
          <div className="mb-4 flex items-start gap-6">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center text-4xl transition-transform group-hover:scale-110">
              {faq.icon}
            </div>
            <div className="flex-1">
              <div className="mb-2 text-xs font-light uppercase tracking-[0.3em] text-zinc-400">
                {faq.category} · Q{String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mb-4 text-2xl font-light text-zinc-900">{faq.question}</h3>
              <p className="font-light leading-loose text-zinc-600">{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 分類標籤式佈局
function TabsLayout({
  faqs,
  categories,
  activeCategory,
  setActiveCategory,
}: {
  faqs: typeof faqData;
  categories: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}) {
  const filteredFaqs = faqs.filter((faq) => faq.category === activeCategory);

  const categoryColors: Record<string, string> = {
    "專案合作": "blue",
    "設計開發": "purple",
    "功能特色": "green",
    "維護支援": "orange",
  };

  const activeColor = categoryColors[activeCategory];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Category Tabs */}
      <div className="mb-8 flex flex-wrap gap-3">
        {categories.map((category) => {
          const color = categoryColors[category];
          const isActive = activeCategory === category;
          const count = faqs.filter((f) => f.category === category).length;
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-6 py-3 font-medium transition-all ${
                isActive
                  ? `bg-${color}-600 text-white shadow-lg scale-105`
                  : "bg-white text-zinc-700 shadow-md hover:shadow-lg"
              }`}
            >
              {category}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  isActive ? "bg-white/20" : "bg-zinc-100"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => (
          <div
            key={faq.id}
            className="overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-lg"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`flex items-start gap-5 bg-${activeColor}-50 p-6`}>
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                {faq.icon}
              </div>
              <div className="flex-1">
                <div className={`mb-2 text-xs font-bold uppercase tracking-wider text-${activeColor}-600`}>
                  Q{String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mb-3 text-xl font-bold text-zinc-900">{faq.question}</h3>
                <p className="leading-relaxed text-zinc-700">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
