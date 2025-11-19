// app/factory/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function FactoryPage() {
  return (
    <div className="bg-white text-zinc-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pt-16">
        {/* HERO */}
        <section>
          <p className="text-sm text-zinc-500">Factory Strength</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            A clean, structured production base for gift boxes and packaging.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-600">
            Our facility is designed around consistent quality and reliable
            delivery, with experienced teams handling engineering, production
            and QC.
          </p>
        </section>

        {/* STATS */}
        <section className="mt-12 grid gap-8 md:grid-cols-4">
          <Stat label="Factory area" value="10,000 m²" />
          <Stat label="People" value="120+" />
          <Stat label="Monthly capacity" value="300,000+ boxes" />
          <Stat label="Certifications" value="ISO / audited" />
        </section>

        {/* IMAGES */}
        <section className="mt-16 grid gap-6 md:grid-cols-3">
          <FactoryImage
            src="/cdn/factory/floor.jpg"
            alt="Factory floor"
            caption="Clean and organized production floor."
          />
          <FactoryImage
            src="/cdn/factory/machines.jpg"
            alt="Equipment"
            caption="Equipment for printing, die-cutting and rigid box forming."
          />
          <FactoryImage
            src="/cdn/factory/qc.jpg"
            alt="QC area"
            caption="QC teams checking structure, printing and finishing."
          />
        </section>

        {/* EQUIPMENT & QC */}
        <section className="mt-16 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Equipment & capabilities
            </h2>
            <ul className="mt-4 space-y-2 text-[15px] text-zinc-700">
              <li>・ 4-color and 5-color offset printing</li>
              <li>・ Automatic and semi-automatic rigid box lines</li>
              <li>・ Die-cutting and creasing machines</li>
              <li>・ Hot stamping and embossing equipment</li>
              <li>・ Lamination and surface finishing lines</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Quality control & engineering
            </h2>
            <ul className="mt-4 space-y-2 text-[15px] text-zinc-700">
              <li>・ In-house structural engineers for box design and testing</li>
              <li>・ Pre-production sampling and approval</li>
              <li>・ In-process checks during mass production</li>
              <li>・ Final inspection before packing and shipping</li>
            </ul>
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="mt-16 md:mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            From brief to shipment
          </h2>
          <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
            A clear flow from enquiry to delivery helps keep projects predictable.
          </p>

          <ol className="mt-6 grid gap-4 text-[14px] text-zinc-700 md:grid-cols-4">
            <StepItem
              step="01"
              title="Engineering"
              body="We confirm structure, materials and key tolerances."
            />
            <StepItem
              step="02"
              title="Sampling"
              body="White and printed samples for structure & finishing approval."
            />
            <StepItem
              step="03"
              title="Mass production"
              body="Production with in-line QC at critical stages."
            />
            <StepItem
              step="04"
              title="Packing & shipping"
              body="Final QC, packing and shipping arrangements to your location."
            />
          </ol>
        </section>

        {/* CTA */}
        <section className="mt-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Want to audit our factory or see more details?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-zinc-600">
            We can share more information on equipment, processes and previous
            audits for your internal vendor approval.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Contact us
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

function FactoryImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
      <figcaption className="text-sm text-zinc-600">{caption}</figcaption>
    </figure>
  );
}

function StepItem({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="text-xs text-zinc-500">{step}</div>
      <div className="mt-1 text-[15px] font-medium text-zinc-900">{title}</div>
      <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">{body}</p>
    </li>
  );
}
