// app/contact/page.tsx
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="bg-white text-zinc-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pt-16">
        {/* HERO */}
        <section>
          <p className="text-sm text-zinc-500">Contact</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Start a project or ask a question.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-600">
            Share your quantity, timeline and a rough idea of what you need.
            We’ll respond with suggestions and a quick quotation.
          </p>
        </section>

        {/* FORM + INFO */}
        <section className="mt-12 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* FORM */}
          <div className="rounded-xl border border-zinc-200 bg-white px-5 py-6 shadow-sm">
            <form className="space-y-4 text-sm text-zinc-800">
              <div>
                <label className="block text-xs text-zinc-500">Name</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  placeholder="Your name"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs text-zinc-500">Email</label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500">Company</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs text-zinc-500">Estimated quantity</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    placeholder="e.g. 5,000 sets"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500">Timeline</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    placeholder="e.g. before Sept 2025"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500">
                  Project details
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  rows={4}
                  placeholder="Briefly describe your products, packaging type, or any references."
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Send message
              </button>

              <p className="mt-2 text-xs text-zinc-500">
                Or email us directly at{" "}
                <a
                  href="mailto:info@example.com"
                  className="underline underline-offset-2"
                >
                  info@example.com
                </a>
                .
              </p>
            </form>
          </div>

          {/* INFO */}
          <div className="space-y-6 text-sm text-zinc-700">
            <div>
              <h2 className="text-base font-medium text-zinc-900">
                Contact details
              </h2>
              <p className="mt-2 text-[14px] text-zinc-700">
                Email: <span className="text-zinc-900">info@example.com</span>
                <br />
                WhatsApp: <span className="text-zinc-900">+86 000 0000 000</span>
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-zinc-900">
                Office & factory
              </h2>
              <p className="mt-2 text-[14px] text-zinc-700">
                Address line 1
                <br />
                City, Province, Country
              </p>
              <p className="mt-2 text-[13px] text-zinc-500">
                We can arrange factory visits or online calls for your team.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-zinc-900">
                Business hours
              </h2>
              <p className="mt-2 text-[14px] text-zinc-700">
                Monday–Friday, 9:00–18:00 (GMT+8)
              </p>
              <p className="mt-2 text-[13px] text-zinc-500">
                We aim to respond within one working day.
              </p>
            </div>
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
