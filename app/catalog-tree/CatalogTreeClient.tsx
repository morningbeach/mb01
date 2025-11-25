"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const displayModes = [
  { value: "hero-cards", label: { zh: "大圖卡片", en: "Hero Cards" }, icon: "🎴" },
  { value: "grid", label: { zh: "網格", en: "Grid" }, icon: "▦" },
  { value: "masonry", label: { zh: "瀑布流", en: "Masonry" }, icon: "⬚" },
];

export function CatalogTreeClient({ categories }: { categories: any[] }) {
  const { lang } = useLanguage();
  const [displayMode, setDisplayMode] = useState<"vertical-card" | "cards" | "grid" | "list">("vertical-card");

  return (
    <>
      {/* HERO */}
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          {lang === 'zh' ? '產品分類' : 'Product Categories'}
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {lang === 'zh' ? '選擇您需要的產品類別' : 'Choose Your Product Category'}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
          {lang === 'zh' 
            ? '紙器包裝、手提袋、餐具包裝、禮品包裝及客製化禮品組，五大類別完整滿足您的需求。'
            : 'Paper packaging, bags, tableware, gift boxes, and custom gift sets - five major categories to meet all your needs.'
          }
        </p>
      </section>

      {/* 展示模式切換器 */}
      <section className="mt-8">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600">
              {lang === 'zh' ? '展示模式' : 'Display Mode'}
              <span className="ml-2 text-[10px] text-zinc-400">
                ({lang === 'zh' ? '測試功能' : 'Test Feature'})
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "vertical-card", label: { zh: "直式長條", en: "Vertical Card" }, icon: "📱" },
              { value: "cards", label: { zh: "卡片", en: "Cards" }, icon: "🎴" },
              { value: "grid", label: { zh: "網格", en: "Grid" }, icon: "▦" },
              { value: "list", label: { zh: "列表", en: "List" }, icon: "☰" },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setDisplayMode(mode.value as any)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  displayMode === mode.value
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50"
                }`}
              >
                <span>{mode.icon}</span>
                <span>{mode.label[lang]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="mt-12">
        {displayMode === "vertical-card" && (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog-tree/${category.slug}`}
                className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-xl"
              >
                <div className="relative aspect-[9/16]">
                  <Image
                    src={category.heroImage || category.coverImage || '/placeholder.jpg'}
                    alt={lang === 'zh' ? category.name_zh : category.name_en}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-base font-semibold tracking-tight text-white">
                      {lang === 'zh' ? category.name_zh : category.name_en}
                    </h2>
                    <p className="mt-1 text-xs text-white/80">
                      {category.children.length} {lang === 'zh' ? '項' : 'items'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {displayMode === "cards" && (
          <div className="grid gap-8 md:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog-tree/${category.slug}`}
                className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg"
              >
                <div className="relative h-64">
                  <Image
                    src={category.heroImage || category.coverImage || '/placeholder.jpg'}
                    alt={lang === 'zh' ? category.name_zh : category.name_en}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {lang === 'zh' ? category.name_zh : category.name_en}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed opacity-90">
                      {lang === 'zh' ? category.description_zh : category.description_en}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between text-sm text-zinc-600">
                    <span>
                      {category.children.length} {lang === 'zh' ? '個子分類' : 'subcategories'}
                    </span>
                    <span className="font-medium text-zinc-900">
                      {lang === 'zh' ? '查看全部' : 'View all'} →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {displayMode === "grid" && (
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog-tree/${category.slug}`}
                className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-md"
              >
                <div className="relative aspect-square">
                  <Image
                    src={category.coverImage || category.heroImage || '/placeholder.jpg'}
                    alt={lang === 'zh' ? category.name_zh : category.name_en}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-900">
                    {lang === 'zh' ? category.name_zh : category.name_en}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-600">
                    {category.children.length} {lang === 'zh' ? '項目' : 'items'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {displayMode === "list" && (
          <div className="space-y-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog-tree/${category.slug}`}
                className="flex items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-md"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={category.coverImage || category.heroImage || '/placeholder.jpg'}
                    alt={lang === 'zh' ? category.name_zh : category.name_en}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {lang === 'zh' ? category.name_zh : category.name_en}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    {lang === 'zh' ? category.description_zh : category.description_en}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {category.children.length} {lang === 'zh' ? '個子分類' : 'subcategories'}
                  </p>
                </div>
                <div className="flex-shrink-0 text-zinc-400">→</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 快速導航 */}
      <section className="mt-16 text-center">
        <Link
          href="/catalog-tree/tree-view"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
        >
          <span>🌳</span>
          <span>{lang === 'zh' ? '查看完整樹狀結構' : 'View Full Tree Structure'}</span>
        </Link>
      </section>
    </>
  );
}
