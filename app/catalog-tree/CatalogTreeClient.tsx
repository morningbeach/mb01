"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import Link from "next/link";
import Image from "next/image";

export function CatalogTreeClient({ categories }: { categories: any[] }) {
  const { lang } = useLanguage();

  return (
    <>
      {/* HERO */}
      <section className="text-center px-4 sm:px-0">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-zinc-500">
          {lang === 'zh' ? '產品分類' : 'Product Categories'}
        </p>
        <h1 className="mx-auto mt-3 sm:mt-4 max-w-3xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight">
          {lang === 'zh' ? '選擇您需要的產品類別' : 'Choose Your Product Category'}
        </h1>
        <p className="mx-auto mt-3 sm:mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-zinc-600">
          {lang === 'zh' 
            ? '紙器包裝、手提袋、餐具包裝、禮品包裝及客製化禮品組，五大類別完整滿足您的需求。'
            : 'Paper packaging, bags, tableware, gift boxes, and custom gift sets - five major categories to meet all your needs.'
          }
        </p>
      </section>

      {/* CATEGORY GRID */}
      <section className="mt-10 sm:mt-16">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 lg:gap-12">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog-tree/${category.slug}`}
                className="group block w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] overflow-hidden rounded-xl sm:rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="relative aspect-[9/16] bg-zinc-50">
                  {(category.heroImage || category.coverImage) ? (
                    <Image
                      src={category.heroImage || category.coverImage}
                      alt={lang === 'zh' ? category.name_zh : category.name_en}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h2 className="text-sm md:text-base font-semibold tracking-tight text-white drop-shadow-sm">
                      {lang === 'zh' ? category.name_zh : category.name_en}
                    </h2>
                    <p className="mt-1.5 text-xs text-white/70">
                      {category.children?.length || 0} {lang === 'zh' ? '項' : 'items'}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="w-full text-center text-zinc-500">沒有分類資料</p>
          )}
        </div>
      </section>
    </>
  );
}
