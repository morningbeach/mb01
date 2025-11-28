"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { DisplayModeToggle } from "./DisplayModeToggle";
import { useRef, useMemo } from "react";

// 雙語文字輔助函數
function t(lang: string, en?: string | null, zh?: string | null, fallback?: string) {
  const v = lang === "en" ? en : zh;
  return (v && v.trim().length > 0 ? v : null) ?? fallback ?? "";
}

export function CatalogPageClient({
  node,
  breadcrumbs,
  displayMode,
  currentPath,
  products = [],
  childrenWithProducts = [],
}: {
  node: any;
  breadcrumbs: any[];
  displayMode: string;
  currentPath: string;
  products?: any[];
  childrenWithProducts?: any[];
}) {
  const { lang } = useLanguage();
  
  // 判斷是否需要流式顯示（非葉節點且有子節點產品）
  const isStreamLayout = !node.isLeaf && childrenWithProducts.length > 0;

  return (
    <>
      {/* 麵包屑導航 */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-600">
        <Link href="/" className="hover:text-zinc-900">
          {lang === 'zh' ? '首頁' : 'Home'}
        </Link>
        <span>/</span>
        <Link href="/catalog-tree" className="hover:text-zinc-900">
          {lang === 'zh' ? '產品目錄' : 'Catalog'}
        </Link>
        {breadcrumbs
          .filter((crumb: any) => crumb.depth > 0) // 過濾掉 depth: 0 的 Products 根節點
          .map((crumb: any) => (
            <span key={crumb.id} className="flex items-center gap-2">
              <span>/</span>
              <Link
                href={`/catalog-tree/${crumb.path.join("/")}`}
                className="hover:text-zinc-900"
              >
                {lang === 'zh' ? crumb.name_zh : crumb.name_en}
              </Link>
            </span>
          ))}
      </nav>

      {/* 展示模式切換器 - 流式佈局時隱藏 */}
      {!isStreamLayout && (
        <DisplayModeToggle currentMode={displayMode} currentPath={currentPath} />
      )}

      {/* 主要內容 */}
      <div className="mt-8">
        {/* 流式佈局：非葉節點展示子節點及其產品 */}
        {isStreamLayout ? (
          <StreamLayout node={node} lang={lang} childrenWithProducts={childrenWithProducts} />
        ) : (
          <>
            {displayMode === "hero-cards" && <HeroCardsLayout node={node} lang={lang} products={products} />}
            {displayMode === "grid" && <GridLayout node={node} lang={lang} products={products} />}
            {displayMode === "masonry" && <MasonryLayout node={node} lang={lang} products={products} />}
            {displayMode === "waterfall" && <WaterfallLayout node={node} lang={lang} products={products} />}
            {displayMode === "carousel" && <CarouselLayout node={node} lang={lang} products={products} />}
            {displayMode === "list" && <ListLayout node={node} lang={lang} products={products} />}
            {displayMode === "product-detail" && <ProductDetailLayout node={node} lang={lang} />}
          </>
        )}
      </div>
    </>
  );
}

// Hero + Cards Layout (大分類)
function HeroCardsLayout({ node, lang, products = [] }: { node: any; lang: string; products?: any[] }) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative h-96">
          <Image
            src={node.heroImage || node.coverImage || '/placeholder.jpg'}
            alt={lang === 'zh' ? node.name_zh : node.name_en}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h1 className="text-4xl font-semibold tracking-tight">{lang === 'zh' ? node.name_zh : node.name_en}</h1>
            <p className="mt-2 text-base leading-relaxed opacity-90">{lang === 'zh' ? node.description_zh : node.description_en}</p>
          </div>
        </div>
      </div>

      {/* 子分類卡片 */}
      {node.children && node.children.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-10">
          {node.children.map((child: any) => (
            <Link
              key={child.id}
              href={`/catalog-tree/${Array.isArray(child.path) ? child.path.join("/") : child.slug}`}
              className="group block w-full max-w-[320px] overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-48">
                <Image
                  src={child.heroImage || child.coverImage || '/placeholder.jpg'}
                  alt={lang === 'zh' ? child.name_zh : child.name_en}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                  {lang === 'zh' ? child.name_zh : child.name_en}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {lang === 'zh' ? child.description_zh : child.description_en}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 產品卡片 */}
      {products.length > 0 && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-900">
              {lang === 'zh' ? '產品列表' : 'Products'}
            </h2>
            <span className="text-sm text-zinc-500">{products.length} {lang === 'zh' ? '個產品' : 'products'}</span>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg"
              >
                <div className="relative h-64 bg-zinc-100">
                  {product.coverImage ? (
                    <Image
                      src={product.coverImage}
                      alt={t(lang, product.name_en, product.name_zh, product.name)}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      <span className="text-6xl">📦</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{t(lang, product.name_en, product.name_zh, product.name)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t(lang, product.shortDesc_en, product.shortDesc_zh, product.shortDesc)}</p>
                  {/* 價格欄位暫時關閉
                  {(product.priceHint || product.priceHint_en || product.priceHint_zh) && (
                    <p className="mt-3 text-sm font-medium text-zinc-900">{t(lang, product.priceHint_en, product.priceHint_zh, product.priceHint)}</p>
                  )}
                  */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((pt: any) => (
                        <span
                          key={pt.tag.id}
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{ 
                            backgroundColor: pt.tag.color ? `${pt.tag.color}15` : '#f4f4f5',
                            color: pt.tag.color || '#71717a'
                          }}
                        >
                          {t(lang, pt.tag.name_en, pt.tag.name_zh, pt.tag.name)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 空狀態 */}
      {!node.children?.length && !products.length && (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <p className="text-zinc-600">{lang === 'zh' ? '此分類下暫無內容' : 'No content in this category'}</p>
        </div>
      )}
    </div>
  );
}

// Grid Layout (中分類)
function GridLayout({ node, lang, products = [] }: { node: any; lang: string; products?: any[] }) {
  return (
    <div className="space-y-8">
      {/* 標題區 */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">{lang === 'zh' ? node.name_zh : node.name_en}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">{lang === 'zh' ? node.description_zh : node.description_en}</p>
      </div>

      {/* 子分類網格 */}
      {node.children && node.children.length > 0 && (
        <div className="flex flex-wrap justify-center gap-5 md:gap-6 lg:gap-8">
          {node.children.map((child: any) => (
            <Link
              key={child.id}
              href={`/catalog-tree/${Array.isArray(child.path) ? child.path.join("/") : child.slug}`}
              className="group block w-[calc(50%-12px)] md:w-[200px] lg:w-[220px] overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={child.coverImage || child.heroImage || '/placeholder.jpg'}
                  alt={lang === 'zh' ? child.name_zh : child.name_en}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-zinc-900">{lang === 'zh' ? child.name_zh : child.name_en}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500 line-clamp-2">{lang === 'zh' ? child.description_zh : child.description_en}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 產品網格（當為葉節點時） */}
      {products.length > 0 && (
        <div>
          <div className="mb-6 flex items-center justify-center gap-4">
            <h2 className="text-xl font-semibold text-zinc-900">
              {lang === 'zh' ? '產品列表' : 'Products'}
            </h2>
            <span className="text-sm text-zinc-400">({products.length})</span>
          </div>
          <div className="flex flex-wrap justify-center gap-5 md:gap-6 lg:gap-8">
            {products.map((product: any) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group block w-[calc(50%-12px)] md:w-[200px] lg:w-[220px] overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-50">
                  {product.coverImage ? (
                    <Image
                      src={product.coverImage}
                      alt={t(lang, product.name_en, product.name_zh, product.name)}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      <span className="text-5xl">📦</span>
                    </div>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-zinc-900">{t(lang, product.name_en, product.name_zh, product.name)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 line-clamp-2">{t(lang, product.shortDesc_en, product.shortDesc_zh, product.shortDesc)}</p>
                  {/* 價格欄位暫時關閉
                  {(product.priceHint || product.priceHint_en || product.priceHint_zh) && (
                    <p className="mt-2 text-sm font-medium text-zinc-900">{t(lang, product.priceHint_en, product.priceHint_zh, product.priceHint)}</p>
                  )}
                  */}
                  {/* TAG 顯示 */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {product.tags.slice(0, 3).map((pt: any) => (
                        <span
                          key={pt.tag.id}
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{ 
                            backgroundColor: pt.tag.color ? `${pt.tag.color}15` : '#f4f4f5',
                            color: pt.tag.color || '#71717a'
                          }}
                        >
                          {t(lang, pt.tag.name_en, pt.tag.name_zh, pt.tag.name)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 空狀態 */}
      {!node.children?.length && !products.length && (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <p className="text-zinc-600">{lang === 'zh' ? '此分類下暫無內容' : 'No content in this category'}</p>
        </div>
      )}
    </div>
  );
}

// Masonry Layout (小分類 - 瀑布流)
function MasonryLayout({ node, lang, products = [] }: { node: any; lang: string; products?: any[] }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">{lang === 'zh' ? node.name_zh : node.name_en}</h1>
        <p className="mt-2 text-zinc-600">{lang === 'zh' ? node.description_zh : node.description_en}</p>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
          {node.children.map((child: any) => (
            <Link
              key={child.id}
              href={`/catalog-tree/${Array.isArray(child.path) ? child.path.join("/") : child.slug}`}
              className="mb-6 block break-inside-avoid overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={child.coverImage || child.heroImage || '/placeholder.jpg'}
                  alt={lang === 'zh' ? child.name_zh : child.name_en}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-zinc-900">{lang === 'zh' ? child.name_zh : child.name_en}</h3>
                <p className="mt-1 text-sm text-zinc-600">{lang === 'zh' ? child.description_zh : child.description_en}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              {lang === 'zh' ? '產品列表' : 'Products'}
            </h2>
            <span className="text-sm text-zinc-500">{products.length} {lang === 'zh' ? '個產品' : 'products'}</span>
          </div>
          <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
            {products.map((product: any) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="mb-6 block break-inside-avoid overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-square bg-zinc-100">
                  {product.coverImage ? (
                    <Image
                      src={product.coverImage}
                      alt={t(lang, product.name_en, product.name_zh, product.name)}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      <span className="text-5xl">📦</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-900">{t(lang, product.name_en, product.name_zh, product.name)}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{t(lang, product.shortDesc_en, product.shortDesc_zh, product.shortDesc)}</p>
                  {/* 價格欄位暫時關閉
                  {(product.priceHint || product.priceHint_en || product.priceHint_zh) && (
                    <p className="mt-2 text-sm font-medium text-zinc-900">{t(lang, product.priceHint_en, product.priceHint_zh, product.priceHint)}</p>
                  )}
                  */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((pt: any) => (
                        <span
                          key={pt.tag.id}
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{ 
                            backgroundColor: pt.tag.color ? `${pt.tag.color}15` : '#f4f4f5',
                            color: pt.tag.color || '#71717a'
                          }}
                        >
                          {t(lang, pt.tag.name_en, pt.tag.name_zh, pt.tag.name)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!node.children?.length && !products.length && (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <p className="text-zinc-600">{lang === 'zh' ? '此分類下暫無內容' : 'No content in this category'}</p>
        </div>
      )}
    </div>
  );
}

// Waterfall Layout
function WaterfallLayout({ node, lang, products = [] }: { node: any; lang: string; products?: any[] }) {
  return <MasonryLayout node={node} lang={lang} products={products} />;
}

// Carousel Layout
function CarouselLayout({ node, lang, products = [] }: { node: any; lang: string; products?: any[] }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">{lang === 'zh' ? node.name_zh : node.name_en}</h1>
        <p className="mt-2 text-zinc-600">{lang === 'zh' ? node.description_zh : node.description_en}</p>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4">
            {node.children.map((child: any) => (
              <Link
                key={child.id}
                href={`/catalog-tree/${Array.isArray(child.path) ? child.path.join("/") : child.slug}`}
                className="min-w-[300px] flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative h-48">
                  <Image
                    src={child.coverImage || child.heroImage || '/placeholder.jpg'}
                    alt={lang === 'zh' ? child.name_zh : child.name_en}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-900">{lang === 'zh' ? child.name_zh : child.name_en}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{lang === 'zh' ? child.description_zh : child.description_en}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              {lang === 'zh' ? '產品列表' : 'Products'}
            </h2>
            <span className="text-sm text-zinc-500">{products.length} {lang === 'zh' ? '個產品' : 'products'}</span>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-6 pb-4">
              {products.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="min-w-[280px] flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-64 bg-zinc-100">
                    {product.coverImage ? (
                      <Image
                        src={product.coverImage}
                        alt={t(lang, product.name_en, product.name_zh, product.name)}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-400">
                        <span className="text-5xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-zinc-900">{t(lang, product.name_en, product.name_zh, product.name)}</h3>
                    <p className="mt-1 text-sm text-zinc-600">{t(lang, product.shortDesc_en, product.shortDesc_zh, product.shortDesc)}</p>
                    {/* 價格欄位暫時關閉
                    {(product.priceHint || product.priceHint_en || product.priceHint_zh) && (
                      <p className="mt-2 text-sm font-medium text-zinc-900">{t(lang, product.priceHint_en, product.priceHint_zh, product.priceHint)}</p>
                    )}
                    */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((pt: any) => (
                          <span
                            key={pt.tag.id}
                            className="rounded-full px-2 py-0.5 text-xs"
                            style={{ 
                              backgroundColor: pt.tag.color ? `${pt.tag.color}15` : '#f4f4f5',
                              color: pt.tag.color || '#71717a'
                            }}
                          >
                            {t(lang, pt.tag.name_en, pt.tag.name_zh, pt.tag.name)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {!node.children?.length && !products.length && (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <p className="text-zinc-600">{lang === 'zh' ? '此分類下暫無內容' : 'No content in this category'}</p>
        </div>
      )}
    </div>
  );
}

// List Layout
function ListLayout({ node, lang, products = [] }: { node: any; lang: string; products?: any[] }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{lang === 'zh' ? node.name_zh : node.name_en}</h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-600">{lang === 'zh' ? node.description_zh : node.description_en}</p>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="space-y-4">
          {node.children.map((child: any) => (
            <Link
              key={child.id}
              href={`/catalog-tree/${Array.isArray(child.path) ? child.path.join("/") : child.slug}`}
              className="flex items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-md"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={child.coverImage || child.heroImage || '/placeholder.jpg'}
                  alt={lang === 'zh' ? child.name_zh : child.name_en}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900">
                  {lang === 'zh' ? child.name_zh : child.name_en}
                </h3>
                <p className="mt-1 text-sm text-zinc-600">
                  {lang === 'zh' ? child.description_zh : child.description_en}
                </p>
              </div>
              <div className="flex-shrink-0 text-zinc-400">→</div>
            </Link>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              {lang === 'zh' ? '產品列表' : 'Products'}
            </h2>
            <span className="text-sm text-zinc-500">{products.length} {lang === 'zh' ? '個產品' : 'products'}</span>
          </div>
          <div className="space-y-4">
            {products.map((product: any) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-md"
              >
                <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                  {product.coverImage ? (
                    <Image
                      src={product.coverImage}
                      alt={t(lang, product.name_en, product.name_zh, product.name)}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900">{t(lang, product.name_en, product.name_zh, product.name)}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{t(lang, product.shortDesc_en, product.shortDesc_zh, product.shortDesc)}</p>
                  {(product.priceHint || product.priceHint_en || product.priceHint_zh) && (
                    <p className="mt-2 text-sm font-medium text-zinc-900">{t(lang, product.priceHint_en, product.priceHint_zh, product.priceHint)}</p>
                  )}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.tags.slice(0, 5).map((pt: any) => (
                        <span
                          key={pt.tag.id}
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{ 
                            backgroundColor: pt.tag.color ? `${pt.tag.color}15` : '#f4f4f5',
                            color: pt.tag.color || '#71717a'
                          }}
                        >
                          {t(lang, pt.tag.name_en, pt.tag.name_zh, pt.tag.name)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-zinc-400">→</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!node.children?.length && !products.length && (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <p className="text-zinc-600">{lang === 'zh' ? '此分類下暫無內容' : 'No content in this category'}</p>
        </div>
      )}
    </div>
  );
}

// Product Detail Layout (商品詳細頁)
function ProductDetailLayout({ node, lang }: { node: any; lang: string }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-12 md:grid-cols-2">
        {/* 左側：圖片 */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200">
            <Image
              src={node.coverImage || node.heroImage || '/placeholder.jpg'}
              alt={lang === 'zh' ? node.name_zh : node.name_en}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* 右側：資訊 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{lang === 'zh' ? node.name_zh : node.name_en}</h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">{lang === 'zh' ? node.description_zh : node.description_en}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <div className="text-sm font-medium text-zinc-600">
              {lang === 'zh' ? '產品資訊' : 'Product Info'}
            </div>
            <div className="mt-3 space-y-2 text-sm text-zinc-500">
              <p>{lang === 'zh' ? '產品編號' : 'Product ID'}: <span className="font-mono text-zinc-700">{node.slug}</span></p>
              <p>{lang === 'zh' ? '分類' : 'Category'}: {lang === 'zh' ? node.name_zh : node.name_en}</p>
            </div>
          </div>

          <button className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800">
            {lang === 'zh' ? '聯絡詢價' : 'Contact for Quote'}
          </button>

          <div className="space-y-2 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
            <p>✓ {lang === 'zh' ? '支援客製化 LOGO' : 'Custom LOGO Support'}</p>
            <p>✓ {lang === 'zh' ? '提供樣品確認' : 'Sample Confirmation Available'}</p>
            <p>✓ {lang === 'zh' ? '大量訂購優惠' : 'Bulk Order Discount'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 流式佈局：子節點橫排 + 產品展示
function StreamLayout({ 
  node, 
  lang, 
  childrenWithProducts 
}: { 
  node: any; 
  lang: string; 
  childrenWithProducts: any[];
}) {
  // 收集所有子節點的產品並隨機排序
  const shuffledProducts = useMemo(() => {
    const allProducts: any[] = [];
    childrenWithProducts.forEach((child: any) => {
      if (child.products && child.products.length > 0) {
        child.products.forEach((product: any) => {
          allProducts.push({
            ...product,
            categorySlug: child.slug,
            categoryPath: child.path,
          });
        });
      }
    });
    // Fisher-Yates 隨機打亂
    for (let i = allProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
    }
    return allProducts;
  }, [childrenWithProducts]);

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          {t(lang, node.name_en, node.name_zh)}
        </h1>
        {(node.description_en || node.description_zh) && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">
            {t(lang, node.description_en, node.description_zh)}
          </p>
        )}
      </div>

      {/* 子分類完整圖片卡片 */}
      {childrenWithProducts.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {childrenWithProducts.map((child: any) => {
            const coverImage = child.coverImage || child.heroImage || child.products?.[0]?.coverImage;
            return (
              <Link
                key={child.id}
                href={`/catalog-tree/${Array.isArray(child.path) ? child.path.join("/") : child.slug}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100"
              >
                {coverImage ? (
                  <Image
                    src={coverImage}
                    alt={t(lang, child.name_en, child.name_zh)}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-zinc-300">
                    📁
                  </div>
                )}
                {/* 漸層遮罩與標題 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="text-sm font-medium text-white drop-shadow-md">
                    {t(lang, child.name_en, child.name_zh)}
                  </h3>
                  <p className="mt-0.5 text-xs text-white/80">
                    {child.products?.length || 0} {lang === 'zh' ? '個產品' : 'items'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* 分隔線 */}
      {childrenWithProducts.length > 0 && shuffledProducts.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-sm text-zinc-500">
            {shuffledProducts.length} {lang === 'zh' ? '個產品' : 'products'}
          </span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>
      )}

      {/* 純圖片瀑布流 - 橫三欄 */}
      {shuffledProducts.length > 0 ? (
        <div className="columns-2 gap-3 sm:columns-3">
          {shuffledProducts.map((product: any, index: number) => (
            <Link
              key={`${product.id}-${index}`}
              href={`/products/${product.slug}`}
              className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-xl"
              title={t(lang, product.name_en, product.name_zh, product.name)}
            >
              {product.coverImage ? (
                <Image
                  src={product.coverImage}
                  alt={t(lang, product.name_en, product.name_zh, product.name)}
                  width={600}
                  height={750}
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex aspect-[3/4] w-full items-center justify-center bg-zinc-100 text-5xl text-zinc-300">
                  📦
                </div>
              )}
              {/* 滑鼠懸停顯示產品名稱 */}
              <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <h3 className="line-clamp-2 text-sm font-medium text-white md:text-base">
                  {t(lang, product.name_en, product.name_zh, product.name)}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <div className="text-4xl">📦</div>
          <p className="mt-4 text-zinc-600">
            {lang === 'zh' ? '此分類下暫無產品' : 'No products in this category'}
          </p>
        </div>
      )}
    </div>
  );
}
