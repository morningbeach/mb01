// app/products/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductGallery } from "./ProductGallery";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      tags: { include: { tag: true } },
      giftSet: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return notFound();
  }

  const gallery = [
    product.coverImage,
    ...(product.images ?? []),
  ].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-white text-zinc-900 pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-10 md:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <a href="/products" className="hover:text-zinc-900">
            Products
          </a>
          <span>/</span>
          <span className="text-zinc-400">{product.name}</span>
        </div>

        {/* Title + Tags */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-zinc-700">
              {product.shortDesc}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((pt) => (
              <span
                key={pt.tagId}
                className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] text-zinc-700"
              >
                {pt.tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Layout: Gallery + Info */}
          {/* Layout: Gallery + Info */}
        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr]">
          {/* LEFT: Gallery */}
          <div>
            <ProductGallery images={gallery} name={product.name} />
          </div>

          {/* RIGHT: Info */}
          <div className="space-y-7">
            {/* Commercial info */}
            <SpecsBlock product={product} />

            {/* Extra specs from schema */}
            <ExtraSpecs product={product} />

            {/* Long description */}
            {product.description && (
              <section>
                <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
                  Description
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-700 whitespace-pre-line">
                  {product.description}
                </p>
              </section>
            )}

            {/* Gift set contents */}
            {product.giftSet && product.giftSet.items.length > 0 && (
              <section>
                <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
                  Items included in this set
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                  {product.giftSet.items.map((item) => (
                    <li key={item.id}>
                      ・ {item.product.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* CTA */}
            <section className="pt-2">
              <a
                href="/contact"
                className="inline-flex items-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Request quotation
              </a>
              {product.minQty && (
                <p className="mt-2 text-[12px] text-zinc-500">
                  Recommended for {product.minQty.toLocaleString()} pcs and up.{" "}
                  Share your target budget and we’ll optimize the structure and
                  finishes.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ------------ Components ------------ */


function SpecsBlock({ product }: { product: any }) {
  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
        Commercial specs
      </h2>
      <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-4">
        <ul className="space-y-1.5 text-sm text-zinc-700">
          {product.sku && <li>・Product code: {product.sku}</li>}
          {product.minQty && (
            <li>・Minimum order: {product.minQty.toLocaleString()} pcs</li>
          )}
          {product.priceHint && <li>・Pricing: {product.priceHint}</li>}
          {product.currency && <li>・Currency: {product.currency}</li>}
        </ul>
      </div>
    </section>
  );
}

function ExtraSpecs({ product }: { product: any }) {
  const hasAny =
    product.materials ||
    product.dimensions ||
    product.leadTime ||
    product.packagingInfo ||
    product.originCountry ||
    product.unit ||
    product.notesForBuyer;

  if (!hasAny) return null;

  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
        Technical details
      </h2>
      <div className="mt-3 grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700 md:grid-cols-2">
        {product.materials && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Materials
            </div>
            <div className="mt-1">{product.materials}</div>
          </div>
        )}
        {product.dimensions && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Dimensions
            </div>
            <div className="mt-1">{product.dimensions}</div>
          </div>
        )}
        {product.leadTime && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Lead time
            </div>
            <div className="mt-1">{product.leadTime}</div>
          </div>
        )}
        {product.packagingInfo && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Packaging & carton
            </div>
            <div className="mt-1">{product.packagingInfo}</div>
          </div>
        )}
        {product.originCountry && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Origin
            </div>
            <div className="mt-1">{product.originCountry}</div>
          </div>
        )}
        {product.unit && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Unit
            </div>
            <div className="mt-1">{product.unit}</div>
          </div>
        )}
        {product.notesForBuyer && (
          <div className="md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Notes for buyer
            </div>
            <div className="mt-1 whitespace-pre-line">
              {product.notesForBuyer}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
