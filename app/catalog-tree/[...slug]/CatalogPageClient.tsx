"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { DisplayModeToggle } from "./DisplayModeToggle";

// 多語系輔助函數
function getLocalizedText(item: any, field: string, lang: string): string {
  if (!item) return '';
  const zhField = `${field}_zh`;
  const enField = `${field}_en`;
  
  if (lang === 'zh') {
    return item[zhField] || item[field] || item[enField] || '';
  } else {
    return item[enField] || item[field] || item[zhField] || '';
  }
}

export function CatalogPageClient({
  node,
  breadcrumbs,
  displayMode,
  currentPath,
  products = [],
}: {
  node: any;
  breadcrumbs: any[];
  displayMode: string;
  currentPath: string;
  products?: any[];
}) {
  const { lang } = useLanguage();

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

      {/* 展示模式切換器 */}
      <DisplayModeToggle currentMode={displayMode} currentPath={currentPath} />

      {/* 主要內容 - 根據展示模式渲染 */}
      <div className="mt-8">
        {displayMode === "hero-cards" && <HeroCardsLayout node={node} lang={lang} products={products} />}
        {displayMode === "grid" && <GridLayout node={node} lang={lang} products={products} />}
        {displayMode === "masonry" && <MasonryLayout node={node} lang={lang} products={products} />}
        {displayMode === "waterfall" && <WaterfallLayout node={node} lang={lang} products={products} />}
        {displayMode === "carousel" && <CarouselLayout node={node} lang={lang} products={products} />}
        {displayMode === "list" && <ListLayout node={node} lang={lang} products={products} />}
        {displayMode === "product-detail" && <ProductDetailLayout node={node} lang={lang} />}
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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {node.children.map((child: any) => (
            <Link
              key={child.id}
              href={`/catalog-tree/${child.path.join("/")}`}
              className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg"
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
                      alt={getLocalizedText(product, 'name', lang)}
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
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{getLocalizedText(product, 'name', lang)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{getLocalizedText(product, 'shortDesc', lang)}</p>
                  {(product.priceHint || product.priceHint_zh || product.priceHint_en) && (
                    <p className="mt-3 text-sm font-medium text-zinc-900">{getLocalizedText(product, 'priceHint', lang)}</p>
                  )}
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
                          {getLocalizedText(pt.tag, 'name', lang)}
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
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {node.children.map((child: any) => (
            <Link
              key={child.id}
              href={`/catalog-tree/${child.path.join("/")}`}
              className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={child.coverImage || child.heroImage || '/placeholder.jpg'}
                  alt={lang === 'zh' ? child.name_zh : child.name_en}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-zinc-900">{lang === 'zh' ? child.name_zh : child.name_en}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">{lang === 'zh' ? child.description_zh : child.description_en}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 產品網格（當為葉節點時） */}
      {products.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              {lang === 'zh' ? '產品列表' : 'Products'}
            </h2>
            <span className="text-sm text-zinc-500">{products.length} {lang === 'zh' ? '個產品' : 'products'}</span>
          </div>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product: any) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-100">
                  {product.coverImage ? (
                    <Image
                      src={product.coverImage}
                      alt={getLocalizedText(product, 'name', lang)}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      <span className="text-5xl">📦</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-900">{getLocalizedText(product, 'name', lang)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600 line-clamp-2">{getLocalizedText(product, 'shortDesc', lang)}</p>
                  {(product.priceHint || product.priceHint_zh || product.priceHint_en) && (
                    <p className="mt-2 text-sm font-medium text-zinc-900">{getLocalizedText(product, 'priceHint', lang)}</p>
                  )}
                  {/* TAG 顯示 */}
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
                          {getLocalizedText(pt.tag, 'name', lang)}
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
              href={`/catalog-tree/${child.path.join("/")}`}
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
                      alt={getLocalizedText(product, 'name', lang)}
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
                  <h3 className="font-semibold text-zinc-900">{getLocalizedText(product, 'name', lang)}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{getLocalizedText(product, 'shortDesc', lang)}</p>
                  {(product.priceHint || product.priceHint_zh || product.priceHint_en) && (
                    <p className="mt-2 text-sm font-medium text-zinc-900">{getLocalizedText(product, 'priceHint', lang)}</p>
                  )}
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
                          {getLocalizedText(pt.tag, 'name', lang)}
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
                href={`/catalog-tree/${child.path.join("/")}`}
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
                        alt={getLocalizedText(product, 'name', lang)}
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
                    <h3 className="font-semibold text-zinc-900">{getLocalizedText(product, 'name', lang)}</h3>
                    <p className="mt-1 text-sm text-zinc-600">{getLocalizedText(product, 'shortDesc', lang)}</p>
                    {(product.priceHint || product.priceHint_zh || product.priceHint_en) && (
                      <p className="mt-2 text-sm font-medium text-zinc-900">{getLocalizedText(product, 'priceHint', lang)}</p>
                    )}
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
                            {getLocalizedText(pt.tag, 'name', lang)}
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
              href={`/catalog-tree/${child.path.join("/")}`}
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
                      alt={getLocalizedText(product, 'name', lang)}
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
                  <h3 className="text-lg font-semibold text-zinc-900">{getLocalizedText(product, 'name', lang)}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{getLocalizedText(product, 'shortDesc', lang)}</p>
                  {(product.priceHint || product.priceHint_zh || product.priceHint_en) && (
                    <p className="mt-2 text-sm font-medium text-zinc-900">{getLocalizedText(product, 'priceHint', lang)}</p>
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
                          {getLocalizedText(pt.tag, 'name', lang)}
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
