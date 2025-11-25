// app/about/page.tsx
import Image from "next/image";
import { SiteShell } from "../../components/SiteShell";

export default function AboutPage() {
  return (
    <SiteShell>
      {/* HERO */}
      <section>
        <p className="text-sm text-zinc-500">Brand Story</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          A packaging partner built around projects, not just SKUs.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-600">
          MB Packaging was founded with a simple idea: gift boxes and packaging
          shouldn’t be an afterthought. They are part of the brand, the
          campaign and the unboxing moment. We work between brands and
          factories to turn timelines, budgets and ideas into tangible,
          consistent packaging.
        </p>
      </section>

      {/* IMAGE + STORY */}
      <section className="mt-12 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
        <div className="space-y-5 text-[15px] leading-relaxed text-zinc-700">
          <p>
            We support global brands, agencies and buyers with project-based
            packaging: from seasonal gifting campaigns to long-term retail
            lines. Our team reads your brief, aligns with your internal
            stakeholders, and translates everything into structures, materials
            and production-ready specs.
          </p>
          <p>
            Instead of pushing standard catalogs, we start from your
            constraints: quantities, timing, shipping, and brand guidelines.
            From there we propose structural directions, rough budget ranges
            and sampling plans that make sense for your project.
          </p>
          <p>
            Over time, we help brands build reusable structural “language” for
            boxes and bags, so each new project feels consistent but never
            repetitive.
          </p>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
          <Image
            src="/cdn/about/studio.jpg"
            alt="MB Packaging studio"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* VALUES */}
      <section className="mt-16 md:mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">What we care about</h2>
        <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
          Three things guide every project we take on.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <ValueItem
            title="Clarity"
            body="We make the options, trade-offs and costs easy to explain internally."
          />
          <ValueItem
            title="Consistency"
            body="From sampling to mass production, we focus on repeatable results."
          />
          <ValueItem
            title="Reliability"
            body="Realistic timelines, transparent updates and honest communication."
          />
        </div>
      </section>

      {/* TIMELINE / EXPERIENCE */}
      <section className="mt-16 md:mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">Experience in gifting</h2>

        <div className="mt-6 grid gap-8 md:grid-cols-3">
          <StatBlock label="Years in packaging" value="10+" />
          <StatBlock label="Projects per year" value="100+" />
          <StatBlock label="Regions served" value="Asia / EU / US" />
        </div>

        <ul className="mt-10 space-y-3 text-[15px] text-zinc-700">
          <li>・ Seasonal gift sets for FMCG and retail brands.</li>
          <li>・ Membership and VIP gifting programs.</li>
          <li>・ Long-term structural systems for brand packaging lines.</li>
        </ul>
      </section>
    </SiteShell>
  );
}

/* local small components */

function ValueItem({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 text-[15px] text-zinc-600">{body}</p>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-zinc-900">{value}</div>
    </div>
  );
}
