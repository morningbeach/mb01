"use client";

import { useState } from "react";
import Image from "next/image";
import { SiteShell } from "@/components/SiteShell";
import { useLanguage } from "../contexts/LanguageContext";

const caseData = [
  {
    id: 1,
    title_en: "Luxury Watch Gift Box Collection",
    title_zh: "奢華手錶禮盒系列",
    subtitle_en: "Premium packaging for high-end timepieces",
    subtitle_zh: "高端腕錶的精緻包裝",
    category_en: "Luxury / Watches",
    category_zh: "奢侈品 / 手錶",
    year: "2024",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&auto=format&fit=crop",
    description_en: "Designed an elegant gift box collection for a Swiss watch brand, featuring premium materials, magnetic closures, and custom foam inserts to protect valuable timepieces.",
    description_zh: "為瑞士手錶品牌設計優雅的禮盒系列，採用高級材料、磁吸式閉合設計，以及定製泡棉內襯以保護貴重腕錶。",
    results_en: ["Production efficiency +40%", "Client satisfaction 98%", "Reorder rate 85%"],
    results_zh: ["生產效率提升 40%", "客戶滿意度 98%", "複購率 85%"],
    tags: ["Premium", "Custom Design", "Magnetic Closure"],
  },
  {
    id: 2,
    title_en: "Eco-Friendly Cosmetics Packaging",
    title_zh: "環保化妝品包裝",
    subtitle_en: "Sustainable beauty product packaging",
    subtitle_zh: "永續美妝產品包裝",
    category_en: "Beauty / Eco",
    category_zh: "美妝 / 環保",
    year: "2024",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&auto=format&fit=crop",
    description_en: "Created sustainable packaging solutions for an organic cosmetics brand using recycled materials, biodegradable inserts, and water-based inks for eco-conscious consumers.",
    description_zh: "為有機化妝品品牌打造永續包裝解決方案，使用回收材料、可生物降解內襯和水性油墨，滿足環保意識消費者需求。",
    results_en: ["Carbon footprint -60%", "Brand value +45%", "Market expansion to EU"],
    results_zh: ["碳足跡減少 60%", "品牌價值提升 45%", "成功拓展歐盟市場"],
    tags: ["Sustainable", "FSC Certified", "Biodegradable"],
  },
  {
    id: 3,
    title_en: "Premium Wine Gift Set",
    title_zh: "高級葡萄酒禮盒",
    subtitle_en: "Sophisticated wine presentation boxes",
    subtitle_zh: "精緻葡萄酒展示盒",
    category_en: "Beverage / Luxury",
    category_zh: "酒類 / 奢侈品",
    year: "2024",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop",
    description_en: "Developed premium wine gift boxes with wooden accents, velvet lining, and compartments for bottles and accessories, perfect for corporate gifting and celebrations.",
    description_zh: "開發高級葡萄酒禮盒，搭配木質裝飾、絲絨內襯，以及酒瓶和配件隔層，完美適用於企業送禮和慶祝場合。",
    results_en: ["Luxury segment sales +120%", "Featured in 5 design awards", "Export to 12 countries"],
    results_zh: ["奢侈品市場銷售增長 120%", "獲得 5 項設計獎項", "出口至 12 個國家"],
    tags: ["Wood Finish", "Velvet Lining", "Multi-compartment"],
  },
  {
    id: 4,
    title_en: "Tech Gadget Packaging Series",
    title_zh: "科技產品包裝系列",
    subtitle_en: "Modern packaging for electronics",
    subtitle_zh: "現代電子產品包裝",
    category_en: "Electronics / Tech",
    category_zh: "電子 / 科技",
    year: "2023",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop",
    description_en: "Designed minimalist packaging for consumer electronics featuring clean lines, protective foam inserts, and unboxing experience that reflects the product's innovative nature.",
    description_zh: "為消費電子產品設計簡約包裝，具有簡潔線條、保護性泡棉內襯，以及反映產品創新本質的開箱體驗。",
    results_en: ["Unboxing videos 2M+ views", "Return rate -35%", "Premium positioning achieved"],
    results_zh: ["開箱影片觀看次數超過 200 萬", "退貨率降低 35%", "成功建立高端定位"],
    tags: ["Minimalist", "Foam Protection", "Unboxing Experience"],
  },
  {
    id: 5,
    title_en: "Artisan Chocolate Gift Collection",
    title_zh: "手工巧克力禮盒系列",
    subtitle_en: "Elegant packaging for premium chocolates",
    subtitle_zh: "高級巧克力的優雅包裝",
    category_en: "Food / Gourmet",
    category_zh: "食品 / 美食",
    year: "2023",
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop",
    description_en: "Crafted luxurious gift boxes for artisan chocolates with gold foil accents, ribbon closures, and individual compartments to showcase each handcrafted piece.",
    description_zh: "為手工巧克力打造奢華禮盒，配有金箔裝飾、緞帶封口，以及獨立隔層以展示每一顆手工巧克力。",
    results_en: ["Holiday sales +180%", "Gift segment revenue doubled", "Social media engagement +250%"],
    results_zh: ["節日銷售增長 180%", "禮品市場營收翻倍", "社交媒體互動提升 250%"],
    tags: ["Gold Foil", "Ribbon Closure", "Luxury Presentation"],
  },
  {
    id: 6,
    title_en: "Corporate Gift Box Program",
    title_zh: "企業禮品盒計劃",
    subtitle_en: "Custom branded corporate gifting solutions",
    subtitle_zh: "客製化企業送禮解決方案",
    category_en: "Corporate / B2B",
    category_zh: "企業 / B2B",
    year: "2023",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop",
    description_en: "Created a comprehensive corporate gifting program with customizable boxes, branded inserts, and flexible configurations for businesses to send premium gifts to clients and employees.",
    description_zh: "創建全面的企業送禮計劃，提供可客製化的禮盒、品牌內襯，以及靈活配置，讓企業向客戶和員工贈送高級禮品。",
    results_en: ["50+ corporate clients", "Average order value $15K", "95% client retention"],
    results_zh: ["超過 50 家企業客戶", "平均訂單金額 $15K", "客戶留存率 95%"],
    tags: ["Custom Branding", "Bulk Orders", "Flexible Design"],
  },
];

export default function CasePage() {
  const { lang } = useLanguage();
  const [activeStyle, setActiveStyle] = useState<"grid" | "masonry" | "minimal" | "magazine">("grid");
  const [selectedCase, setSelectedCase] = useState<typeof caseData[0] | null>(null);

  const styles = [
    { id: "grid", name_en: "Grid Layout", name_zh: "網格佈局", icon: "▦" },
    { id: "masonry", name_en: "Masonry", name_zh: "瀑布流", icon: "≋" },
    { id: "minimal", name_en: "Minimal", name_zh: "極簡風格", icon: "◻" },
    { id: "magazine", name_en: "Magazine", name_zh: "雜誌風格", icon: "▣" },
  ];

  const content = {
    title_en: "Our Portfolio",
    title_zh: "成功案例",
    subtitle_en: "Explore how we've helped brands elevate their packaging and gifting experience",
    subtitle_zh: "探索我們如何幫助品牌提升包裝與送禮體驗",
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
          {activeStyle === "grid" && <GridLayout cases={caseData} onSelect={setSelectedCase} lang={lang} />}
          {activeStyle === "masonry" && <MasonryLayout cases={caseData} onSelect={setSelectedCase} lang={lang} />}
          {activeStyle === "minimal" && <MinimalLayout cases={caseData} onSelect={setSelectedCase} lang={lang} />}
          {activeStyle === "magazine" && <MagazineLayout cases={caseData} onSelect={setSelectedCase} lang={lang} />}
        </div>

        {/* Detail Modal */}
        {selectedCase && (
          <CaseDetailModal case={selectedCase} onClose={() => setSelectedCase(null)} lang={lang} />
        )}
      </div>
    </SiteShell>
  );
}

// 網格佈局
function GridLayout({ cases, onSelect, lang }: { cases: typeof caseData; onSelect: (c: any) => void; lang: "en" | "zh" }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cases.map((item, index) => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="relative h-64 overflow-hidden bg-zinc-100">
            <Image
              src={item.image}
              alt={lang === "zh" ? item.title_zh : item.title_en}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900 backdrop-blur-sm">
              {item.year}
            </div>
          </div>
          <div className="p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">
              {lang === "zh" ? item.category_zh : item.category_en}
            </div>
            <h3 className="mb-2 text-xl font-bold text-zinc-900">
              {lang === "zh" ? item.title_zh : item.title_en}
            </h3>
            <p className="mb-4 text-sm text-zinc-600">
              {lang === "zh" ? item.subtitle_zh : item.subtitle_en}
            </p>
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
function MasonryLayout({ cases, onSelect, lang }: { cases: typeof caseData; onSelect: (c: any) => void; lang: "en" | "zh" }) {
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
                <div className="relative h-full w-full bg-zinc-100">
                  <Image
                    src={item.image}
                    alt={lang === "zh" ? item.title_zh : item.title_en}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                      {lang === "zh" ? item.category_zh : item.category_en}
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-white">
                      {lang === "zh" ? item.title_zh : item.title_en}
                    </h3>
                    <p className="text-sm text-white/90">
                      {lang === "zh" ? item.subtitle_zh : item.subtitle_en}
                    </p>
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
function MinimalLayout({ cases, onSelect, lang }: { cases: typeof caseData; onSelect: (c: any) => void; lang: "en" | "zh" }) {
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
              alt={lang === "zh" ? item.title_zh : item.title_en}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-all duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col justify-center space-y-4">
            <div className="text-xs font-light uppercase tracking-[0.3em] text-zinc-400">
              {lang === "zh" ? item.category_zh : item.category_en} / {item.year}
            </div>
            <h3 className="text-3xl font-light text-zinc-900">
              {lang === "zh" ? item.title_zh : item.title_en}
            </h3>
            <p className="font-light leading-relaxed text-zinc-600">
              {lang === "zh" ? item.description_zh : item.description_en}
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
function MagazineLayout({ cases, onSelect, lang }: { cases: typeof caseData; onSelect: (c: any) => void; lang: "en" | "zh" }) {
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
              <div className="relative h-full w-full bg-zinc-100">
                <Image
                  src={item.image}
                  alt={lang === "zh" ? item.title_zh : item.title_en}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-12">
                  <div className="mb-4 inline-block rounded-full border-2 border-white px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Featured
                  </div>
                  <h2 className="mb-4 text-5xl font-bold text-white">
                    {lang === "zh" ? item.title_zh : item.title_en}
                  </h2>
                  <p className="mb-6 max-w-2xl text-xl text-white/90">
                    {lang === "zh" ? item.description_zh : item.description_en}
                  </p>
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
            <div className="relative h-80 overflow-hidden rounded-2xl bg-zinc-100">
              <Image
                src={item.image}
                alt={lang === "zh" ? item.title_zh : item.title_en}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-600">
                {lang === "zh" ? item.category_zh : item.category_en}
              </div>
              <h3 className="mb-4 text-3xl font-bold text-zinc-900">
                {lang === "zh" ? item.title_zh : item.title_en}
              </h3>
              <p className="mb-6 leading-relaxed text-zinc-600">
                {lang === "zh" ? item.description_zh : item.description_en}
              </p>
              <div className="space-y-2">
                {(lang === "zh" ? item.results_zh : item.results_en).map((result, i) => (
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
function CaseDetailModal({ case: item, onClose, lang }: { case: typeof caseData[0]; onClose: () => void; lang: "en" | "zh" }) {
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

        <div className="relative h-96 bg-zinc-100">
          <Image
            src={item.image}
            alt={lang === "zh" ? item.title_zh : item.title_en}
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/80">
              {lang === "zh" ? item.category_zh : item.category_en} · {item.year}
            </div>
            <h2 className="text-4xl font-bold text-white">
              {lang === "zh" ? item.title_zh : item.title_en}
            </h2>
          </div>
        </div>

        <div className="p-8">
          <h3 className="mb-4 text-2xl font-semibold text-zinc-900">
            {lang === "zh" ? item.subtitle_zh : item.subtitle_en}
          </h3>
          <p className="mb-6 leading-relaxed text-zinc-600">
            {lang === "zh" ? item.description_zh : item.description_en}
          </p>

          <div className="mb-8">
            <h4 className="mb-3 text-lg font-semibold text-zinc-900">
              {lang === "zh" ? "專案成果" : "Project Results"}
            </h4>
            <div className="space-y-3">
              {(lang === "zh" ? item.results_zh : item.results_en).map((result, i) => (
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
            <h4 className="mb-3 text-lg font-semibold text-zinc-900">
              {lang === "zh" ? "使用技術" : "Technologies"}
            </h4>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700"
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
