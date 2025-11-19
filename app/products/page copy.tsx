// app/products/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="bg-white text-zinc-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pt-16">
        {/* HERO */}
        <section>
          <p className="text-sm text-zinc-500">Product Categories</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Gift boxes, bags and complete packaging sets.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-600">
            We focus on a few core categories where we can deliver stable quality:
            rigid gift boxes, gift bags and full gift set packaging projects.
          </p>
        </section>

        {/* GIFT BOXES */}
        <section className="mt-12 md:mt-16">
          <SectionTitle
            title="Gift Boxes"
            subtitle="Rigid boxes for seasonal gifting, retail and premium sets."
          />

          <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                <Image
                  src="/cdn/products/giftbox-main.jpg"
                  alt="Gift boxes"
                  fill
                  className="object-cover"
                />
              </div>
              <ul className="mt-6 space-y-2 text-[15px] text-zinc-700">
                <li>・ Lid & base rigid boxes</li>
                <li>・ Magnetic closure boxes</li>
                <li>・ Drawer / slide-out boxes</li>
                <li>・ Book-style rigid boxes</li>
              </ul>
            </div>

            <div className="space-y-4 text-[14px] text-zinc-700">
              <SpecBlock
                title="Typical specs"
                lines={[
                  "Board: 1.5–3.0 mm greyboard",
                  "Paper: coated / uncoated / specialty",
                  "Finishing: lamination, hot stamping, spot UV",
                ]}
              />
              <SpecBlock
                title="Common applications"
                lines={[
                  "Mid-Autumn and Lunar New Year gift sets",
                  "Retail premium packaging",
                  "VIP and membership gifting",
                ]}
              />
              <SpecBlock
                title="MOQ & sizing"
                lines={[
                  "Flexible sizing based on your products",
                  "MOQ usually from 1,000–3,000 sets depending on specs",
                ]}
              />
            </div>
          </div>
        </section>

        {/* BAGS */}
        <section className="mt-16 md:mt-20">
          <SectionTitle
            title="Gift Bags"
            subtitle="Paper bags, non-woven bags and reusable fabric totes."
          />

          <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-start">
            <div className="space-y-4 text-[14px] text-zinc-700">
              <SpecBlock
                title="Types"
                lines={[
                  "Coated / uncoated paper bags",
                  "Non-woven shopping bags",
                  "Canvas / cotton / fabric totes",
                ]}
              />
              <SpecBlock
                title="Handle options"
                lines={[
                  "Paper twist, flat or rope handles",
                  "Fabric / webbing straps",
                  "Custom handle colors & length",
                ]}
              />
              <SpecBlock
                title="Use cases"
                lines={[
                  "Retail shopping bags",
                  "Event and exhibition giveaways",
                  "Membership and subscription programs",
                ]}
              />
            </div>

            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                <Image
                  src="/cdn/products/bags-main.jpg"
                  alt="Gift bags"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* GIFT SETS */}
        <section className="mt-16 md:mt-20">
          <SectionTitle
            title="Gift Sets"
            subtitle="Complete packaging projects: box, insert, bag and outer carton."
          />

          <div className="mt-6 grid gap-8 md:grid-cols-2 md:items-start">
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                <Image
                  src="/cdn/products/giftset-main.jpg"
                  alt="Gift set packaging"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 text-[14px] text-zinc-700">
              <p>
                For brands who need a full solution, we design and manage the
                entire packaging set: inner trays, inserts, outer boxes, gift
                bags and shipping cartons. This ensures a consistent unboxing
                experience and smoother logistics.
              </p>
              <SpecBlock
                title="What’s included"
                lines={[
                  "Outer gift box (rigid / foldable)",
                  "Inner insert (cardboard / EVA / pulp etc.)",
                  "Matching gift bag",
                  "Outer shipping carton and labeling",
                ]}
              />
              <SpecBlock
                title="Suitable for"
                lines={[
                  "Corporate and VIP gifting",
                  "Employee gift programs",
                  "Limited edition brand collaborations",
                ]}
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Need help choosing the right structure?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-zinc-600">
            Share your product dimensions, quantity and budget. We’ll recommend
            suitable structures and finishing options.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Talk to our team
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div className="text-lg font-semibold tracking-tight">MB Packaging</div>
        <nav className="hidden gap-8 text-sm text-zinc-600 md:flex">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <Link href="/about" className="hover:text-black">
            About
          </Link>
          <Link href="/products" className="hover:text-black">
            Products
          </Link>
          <Link href="/factory" className="hover:text-black">
            Factory
          </Link>
          <Link href="/blog" className="hover:text-black">
            Blog
          </Link>
          <Link href="/contact" className="hover:text-black">
            Contact
          </Link>
        </nav>
        <Link
          href="/contact"
          className="rounded-full bg-black px-4 py-1.5 text-sm text-white hover:bg-zinc-800"
        >
          Get a Quote
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
      © 2025 MB Packaging — Premium Gift Box Manufacturer.
    </footer>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-xl text-[15px] text-zinc-600">{subtitle}</p>
    </div>
  );
}

function SpecBlock({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </div>
      <ul className="mt-2 space-y-1.5 text-[13px] text-zinc-700">
        {lines.map((line) => (
          <li key={line}>・{line}</li>
        ))}
      </ul>
    </div>
  );
}
