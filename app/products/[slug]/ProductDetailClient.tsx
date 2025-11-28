"use client";

import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { ProductGallery } from "./ProductGallery";

type Lang = "en" | "zh";

function t(lang: Lang, en?: string | null, zh?: string | null, fallback?: string) {
  const v = lang === "en" ? en : zh;
  return (v && v.trim().length > 0 ? v : null) ?? fallback ?? "";
}

interface ProductDetailClientProps {
  product: any;
  gallery: string[];
  categoryPath: any[] | null;
}

export default function ProductDetailClient({ product, gallery, categoryPath }: ProductDetailClientProps) {
  const { lang } = useLanguage();
  
  const productName = t(lang, product.name_en, product.name_zh, product.name);
  const shortDesc = t(lang, product.shortDesc_en, product.shortDesc_zh, product.shortDesc);
  const description = t(lang, product.description_en, product.description_zh, product.description);
  const dimensions = t(lang, product.dimensions_en, product.dimensions_zh, product.dimensions);
  const materials = t(lang, product.materials_en, product.materials_zh, product.materials);
  const leadTime = t(lang, product.leadTime_en, product.leadTime_zh, product.leadTime);
  const packagingInfo = t(lang, product.packagingInfo_en, product.packagingInfo_zh, product.packagingInfo);
  const originCountry = t(lang, product.originCountry_en, product.originCountry_zh, product.originCountry);
  const unit = t(lang, product.unit_en, product.unit_zh, product.unit);
  const priceHint = t(lang, product.priceHint_en, product.priceHint_zh, product.priceHint);
  const notesForBuyer = t(lang, product.notesForBuyer_en, product.notesForBuyer_zh, product.notesForBuyer);
  
  return (
    <div>
      {/* Breadcrumb with full tree path */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 flex-wrap">
        <Link href="/products" className="hover:text-zinc-900">
          {lang === "zh" ? "產品" : "Products"}
        </Link>
        
        {categoryPath && categoryPath.length > 0 ? (
          <>
            {categoryPath.map((node, index) => {
              const nodeName = lang === "zh" ? node.name_zh : node.name_en;
              // 建立完整的 slug 路徑
              const slugPath = categoryPath.slice(0, index + 1).map(n => n.slug).join('/');
              
              return (
                <div key={node.id} className="flex items-center gap-2">
                  <span>/</span>
                  <Link 
                    href={`/catalog-tree/${slugPath}`}
                    className="hover:text-zinc-900 transition-colors"
                  >
                    {nodeName || node.slug}
                  </Link>
                </div>
              );
            })}
            <span>/</span>
            <span className="text-zinc-400">{productName}</span>
          </>
        ) : (
          <>
            <span>/</span>
            <span className="text-zinc-400">{productName}</span>
          </>
        )}
      </div>

      {/* Title + Tags */}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {productName}
          </h1>
          {shortDesc && (
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-zinc-700">
              {shortDesc}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {product.tags.map((pt: any) => {
            const tagName = t(lang, pt.tag.name_en, pt.tag.name_zh, pt.tag.name);
            return (
              <span
                key={pt.tagId}
                className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] text-zinc-700"
              >
                {tagName}
              </span>
            );
          })}
        </div>
      </div>

      {/* Layout: Gallery + Info */}
      <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr]">
        {/* LEFT: Gallery */}
        <div>
          <ProductGallery images={gallery} />
        </div>

        {/* RIGHT: Info */}
        <div className="space-y-7">
          {/* Commercial info */}
          <SpecsBlock product={product} lang={lang} priceHint={priceHint} />

          {/* Extra specs from schema */}
          <ExtraSpecs 
            lang={lang}
            dimensions={dimensions}
            materials={materials}
            leadTime={leadTime}
            packagingInfo={packagingInfo}
            originCountry={originCountry}
            unit={unit}
            notesForBuyer={notesForBuyer}
          />

          {/* Long description */}
          {description && (
            <section>
              <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
                {lang === "zh" ? "詳細說明" : "Description"}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-zinc-700 whitespace-pre-line">
                {description}
              </p>
            </section>
          )}

          {/* Gift set contents */}
          {product.giftSet && product.giftSet.items.length > 0 && (
            <section>
              <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
                {lang === "zh" ? "內含物品" : "Items included in this set"}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                {product.giftSet.items.map((item: any) => (
                  <li key={item.id}>
                    ・ {item.product.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* CTA */}
          <section className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {lang === "zh" ? "索取報價" : "Request quotation"}
            </Link>
            {product.minQty && (
              <p className="mt-2 text-[12px] text-zinc-500">
                {lang === "zh" 
                  ? `建議訂購量 ${product.minQty.toLocaleString()} 件以上。分享您的預算，我們會優化結構和表面處理。`
                  : `Recommended for ${product.minQty.toLocaleString()} pcs and up. Share your target budget and we'll optimize the structure and finishes.`
                }
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ------------ Components ------------ */

function SpecsBlock({ product, lang, priceHint }: { product: any; lang: Lang; priceHint: string }) {
  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
        {lang === "zh" ? "商業規格" : "Commercial specs"}
      </h2>
      <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-4">
        <ul className="space-y-1.5 text-sm text-zinc-700">
          {product.sku && (
            <li>・{lang === "zh" ? "產品編號" : "Product code"}: {product.sku}</li>
          )}
          {product.minQty && (
            <li>
              ・{lang === "zh" ? "最小訂購量" : "Minimum order"}: {product.minQty.toLocaleString()} {lang === "zh" ? "件" : "pcs"}
            </li>
          )}
          {/* 價格欄位暫時關閉
          {priceHint && (
            <li>・{lang === "zh" ? "價格" : "Pricing"}: {priceHint}</li>
          )}
          */}
          {product.currency && (
            <li>・{lang === "zh" ? "幣別" : "Currency"}: {product.currency}</li>
          )}
        </ul>
      </div>
    </section>
  );
}

function ExtraSpecs({ 
  lang,
  dimensions,
  materials,
  leadTime,
  packagingInfo,
  originCountry,
  unit,
  notesForBuyer,
}: { 
  lang: Lang;
  dimensions: string;
  materials: string;
  leadTime: string;
  packagingInfo: string;
  originCountry: string;
  unit: string;
  notesForBuyer: string;
}) {
  const hasAny =
    materials ||
    dimensions ||
    leadTime ||
    packagingInfo ||
    originCountry ||
    unit ||
    notesForBuyer;

  if (!hasAny) return null;

  const labels = {
    materials: lang === "zh" ? "材質" : "Materials",
    dimensions: lang === "zh" ? "尺寸" : "Dimensions",
    leadTime: lang === "zh" ? "交期" : "Lead time",
    packagingInfo: lang === "zh" ? "包裝資訊" : "Packaging & carton",
    originCountry: lang === "zh" ? "產地" : "Origin",
    unit: lang === "zh" ? "單位" : "Unit",
    notesForBuyer: lang === "zh" ? "買家須知" : "Notes for buyer",
  };

  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
        {lang === "zh" ? "技術規格" : "Technical details"}
      </h2>
      <div className="mt-3 grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700 md:grid-cols-2">
        {materials && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {labels.materials}
            </div>
            <div className="mt-1">{materials}</div>
          </div>
        )}
        {dimensions && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {labels.dimensions}
            </div>
            <div className="mt-1">{dimensions}</div>
          </div>
        )}
        {leadTime && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {labels.leadTime}
            </div>
            <div className="mt-1">{leadTime}</div>
          </div>
        )}
        {packagingInfo && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {labels.packagingInfo}
            </div>
            <div className="mt-1">{packagingInfo}</div>
          </div>
        )}
        {originCountry && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {labels.originCountry}
            </div>
            <div className="mt-1">{originCountry}</div>
          </div>
        )}
        {unit && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {labels.unit}
            </div>
            <div className="mt-1">{unit}</div>
          </div>
        )}
        {notesForBuyer && (
          <div className="md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {labels.notesForBuyer}
            </div>
            <div className="mt-1 whitespace-pre-line">
              {notesForBuyer}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
