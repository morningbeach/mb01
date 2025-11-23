// app/products/page.tsx
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "../../components/SiteShell";

export const dynamic = "force-dynamic";

export default async function ProductsLandingPage() {
  const categories = await prisma.frontCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return (
    <SiteShell>
      {/* HERO */}
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Products</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          A focused catalog for gifting & presentation packaging.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
          Each category below is managed from the database. You can add new
          categories, change copy and reorder items without touching code,
          while keeping a clear structure for buyers and brand teams.
        </p>
      </section>

      {/* CATEGORY GRID */}
      <section className="mt-12">
        <div className="grid gap-8 md:grid-cols-2">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              href={`/catalog/${cat.slug}`}
              label={cat.name}
              title={cat.cardTitle || cat.name}
              description={
                cat.cardDescription ||
                "Explore items and solutions under this category."
              }
              imageSrc={cat.cardImage || "/cdn/categories/placeholder.jpg"}
            />
          ))}

          {categories.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-500">
              No categories yet. Create <code>FrontCategory</code> records in
              the database to populate this page.
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-zinc-200 bg-white px-6 py-7 text-center shadow-sm md:px-10 md:py-8">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-zinc-900 md:text-2xl">
            Not sure where your idea fits?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-zinc-600">
            You don&apos;t need a finished spec sheet to start. Share your
            product type, approximate quantity and budget range — we&apos;ll
            suggest whether it should be a single gift, a box structure or a
            complete gift set solution.
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
            >
              Start a project brief
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

/* ----------------- Components ----------------- */

type CategoryCardProps = {
  href: string;
  label: string;
  title: string;
  description: string;
  imageSrc: string;
};

function CategoryCard({
  href,
  label,
  title,
  description,
  imageSrc,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative overflow-hidden border-b border-zinc-200">
        <div className="relative aspect-[4/3]">
          <Image
            src={imageSrc}
            alt={label}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-transparent opacity-70" />
        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-700 shadow-sm">
          {label}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-4 md:px-5 md:pb-5 md:pt-4">
        <h2 className="text-[17px] font-semibold leading-snug tracking-[-0.02em] text-zinc-900">
          {title}
        </h2>
        <p className="text-[13px] leading-relaxed text-zinc-600">
          {description}
        </p>
        <div className="mt-3 flex items-center justify-between text-[12px] text-zinc-500">
          <span>Configured in the backend via categories and tags.</span>
          <span className="flex items-center gap-1 text-zinc-600">
            <span>View items</span>
            <span aria-hidden>↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
