// app/page.tsx
import Image from "next/image";
import { SiteShell } from "../components/SiteShell";

export default function Home() {
  return (
    <SiteShell>
      {/* HERO */}
      <section className="mt-4 text-center md:mt-6">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 md:text-6xl">
          Premium Gift Box Manufacturing
          <br />
          for Global Brands
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          Customized rigid boxes, packaging sets and gifting programs — engineered,
          sampled and produced with consistent quality.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/contact"
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Start Your Project
          </a>
          <a
            href="/cdn/catalog.pdf"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Download Catalog
          </a>
        </div>

        {/* Hero Image */}
        <div className="mt-16 flex justify-center">
          <div className="relative aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
            <Image
              src="/cdn/hero/hero-giftbox.jpg"
              alt="Gift box and packaging sets"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <Divider />

      {/* WHY US */}
      <section className="mt-6 md:mt-8">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Why Brands Choose Us
        </h2>
        <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
          Strong engineering, stable quality and clear communication for packaging
          projects that actually land on time.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <Feature
            title="Brand-Level Quality"
            body="Clean edges, precise structures and consistent color from sample to mass production."
          />
          <Feature
            title="Reliable Production"
            body="Experienced teams, strict QC and realistic schedules for seasonal campaigns."
          />
          <Feature
            title="One-Stop Packaging"
            body="Gift box, insert, bag and shipping carton integrated into a single project."
          />
        </div>
      </section>

      <Divider />

      {/* PRODUCT CATEGORIES */}
      <section id="products" className="mt-6 md:mt-8">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Product Categories
        </h2>
        <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
          Three focused lines that cover most gifting and retail packaging needs.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <CategoryCard
            image="/cdn/categories/giftbox.jpg"
            title="Gift Boxes"
            body="Rigid boxes, magnetic boxes, drawer boxes and book-style packaging."
          />
          <CategoryCard
            image="/cdn/categories/bags.jpg"
            title="Gift Bags"
            body="Paper bags, non-woven bags and reusable fabric totes for campaigns and retail."
          />
          <CategoryCard
            image="/cdn/categories/giftset.jpg"
            title="Gift Sets"
            body="Complete packaging sets combining box, insert, bag and outer carton."
          />
        </div>
      </section>

      <Divider />

      {/* FACTORY STRENGTH */}
      <section id="factory" className="mt-6 md:mt-8">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Factory Strength
        </h2>
        <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
          A clean production base with the capacity and equipment to support
          global gifting programs.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <FactoryCard
            title="10,000 m² Facility"
            image="/cdn/factory/floor.jpg"
            body="ISO-audited production space with flexible lines for different box types."
          />
          <FactoryCard
            title="Advanced Equipment"
            image="/cdn/factory/machine.jpg"
            body="Offset printing, die-cutting, lamination, hot stamping and rigid box forming."
          />
          <FactoryCard
            title="QC & Engineering"
            image="/cdn/factory/qc.jpg"
            body="In-house structural engineers and QC checks at critical stages of production."
          />
        </div>
      </section>

      <Divider />

      {/* BLOG PREVIEW */}
      <section id="blog" className="mt-6 md:mt-8">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
          From the Blog
        </h2>
        <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
          Short notes to help buyers, marketers and designers make better
          packaging decisions.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <BlogPreview
            title="How to choose the right rigid box structure"
            date="Jan 2025"
          />
          <BlogPreview
            title="Packaging trends for seasonal gifting"
            date="Dec 2024"
          />
          <BlogPreview
            title="Paper materials and finishing explained simply"
            date="Nov 2024"
          />
        </div>
      </section>

      <Divider />

      {/* FINAL CTA */}
      <section id="contact" className="mt-10 text-center md:mt-16">
        <h2 className="text-4xl font-semibold tracking-tight text-zinc-900">
          Start Your Gift Box Project
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-zinc-600">
          Send us your quantity, timeline and a rough idea. We’ll reply with
          structural suggestions and a quick quotation.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/contact"
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Get a Quote
          </a>
          <a
            href="mailto:info@example.com"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Email Your Brief
          </a>
        </div>
      </section>
    </SiteShell>
  );
}

/* 小組件 */

function Divider() {
  return <div className="my-20 border-t border-zinc-200" />;
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-xl font-medium text-zinc-900">{title}</h3>
      <p className="mt-2 text-[15px] text-zinc-600">{body}</p>
    </div>
  );
}

function CategoryCard({
  title,
  body,
  image,
}: {
  title: string;
  body: string;
  image: string;
}) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-4 text-lg font-medium text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-600">{body}</p>
    </div>
  );
}

function FactoryCard({
  title,
  body,
  image,
}: {
  title: string;
  body: string;
  image: string;
}) {
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-600">{body}</p>
    </div>
  );
}

function BlogPreview({ title, date }: { title: string; date: string }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="text-xs text-zinc-500">{date}</div>
      <h3 className="mt-2 text-[15px] font-medium text-zinc-900">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">Read more →</p>
    </article>
  );
}
  