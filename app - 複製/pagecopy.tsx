// app/page.tsx
import type { ReactNode } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* 背景裝飾 */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_top,_#4f46e5_0,_transparent_60%)] opacity-40" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_bottom,_#ec4899_0,_transparent_60%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0)_0,_rgba(15,23,42,1)_70%)]" />
      </div>

      {/* 導覽 */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-xl bg-slate-900/60 shadow-[0_0_40px_rgba(129,140,248,0.6)]">
              <div className="absolute inset-[2px] rounded-[10px] bg-[conic-gradient(at_0%_0%,_#38bdf8,_#6366f1,_#ec4899,_#eab308,_#38bdf8)] opacity-80" />
              <div className="absolute inset-[5px] rounded-[7px] bg-slate-950" />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-semibold tracking-[0.3em] text-slate-300">
                MB PACKAGING STUDIO
              </div>
              <div className="text-[11px] text-slate-500">
                GIFTING ・ STRUCTURE ・ BRAND PACKAGING
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-[11px] font-medium text-slate-300 md:flex">
            <a href="#hero" className="hover:text-white">
              Studio view
            </a>
            <a href="#services" className="hover:text-white">
              Services
            </a>
            <a href="#cases" className="hover:text-white">
              Cases
            </a>
            <a href="#process" className="hover:text-white">
              Process
            </a>
          </nav>

          <a
            href="#contact"
            className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium hover:border-white/40 hover:bg-white/10"
          >
            PROJECT INQUIRY
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-6 md:pt-12">
        {/* HERO 區：文字 + 大圖 placeholder */}
        <section
          id="hero"
          className="grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)] md:items-center"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="tracking-[0.24em]">
                B2B GIFTING & PACKAGING STUDIO
              </span>
            </div>

            <h1 className="mt-5 text-[2.2rem] font-semibold leading-tight tracking-tight text-slate-50 md:text-[2.6rem]">
              我們替品牌設計的是「被打開的場景」，
              <span className="block text-slate-400">
                而不是單一一個盒子或提袋。
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-[15px]">
              我們閱讀你的品牌簡報、檔期與預算，再反推結構、材質與物流。
              讓每一檔禮盒、會員禮與 Gift set，都在現實限制裡保持精緻與一致。
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-[11px] text-slate-200">
              <Badge>Seasonal gift programs</Badge>
              <Badge>Corporate & VIP gifting</Badge>
              <Badge>Retail & membership</Badge>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-xs">
              <a
                href="#contact"
                className="rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-5 py-2.5 font-medium text-slate-50 shadow-[0_0_40px_rgba(79,70,229,0.7)] hover:brightness-110"
              >
                先丟一個還不完整的 brief 給我們
              </a>
              <a
                href="#services"
                className="flex items-center gap-2 text-slate-300 hover:text-white"
              >
                看我們實際可以幫你做什麼
                <span className="text-slate-500">↗</span>
              </a>
            </div>
          </div>

          {/* 假圖：Hero 大圖區 */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.95)]">
              <div className="aspect-[4/3] rounded-2xl bg-[radial-gradient(circle_at_0_0,_rgba(56,189,248,0.65),transparent_55%),radial-gradient(circle_at_100%_100%,_rgba(236,72,153,0.7),transparent_55%)] opacity-90" />
              <div className="pointer-events-none absolute inset-3 rounded-2xl border border-white/20 border-dashed" />
              <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-[11px] text-slate-100">
                Hero Image Placeholder（之後放禮盒＋提袋實拍）
              </div>
            </div>

            <div className="grid gap-3 text-[11px] text-slate-200 sm:grid-cols-2">
              <PillCard
                title="拍照建議"
                body="此區建議放 1–2 組主力檔期禮盒／提袋實拍，偏大景、冷光、高反差。"
              />
              <PillCard
                title="視覺方向"
                body="避免放電商棚拍排排站，改用類品牌形象照的構圖與光線。"
              />
            </div>
          </div>
        </section>

        {/* 服務區 */}
        <section id="services" className="mt-16 md:mt-20">
          <SectionHeader
            eyebrow="SERVICES"
            title="我們在一檔專案裡，實際會做的事"
            description="從讀簡報、拆結構，到跟工廠與物流對齊；不只是「接單生產」。"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ServiceCard
              tag="PLANNING"
              title="專案 framing 與粗估"
              items={[
                "閱讀簡報與預算，拆關鍵限制",
                "提出 1–2 組結構與材質方向",
                "協助你向內部說明選項差異",
              ]}
            />
            <ServiceCard
              tag="DEVELOPMENT"
              title="盒型／提袋開發與打樣"
              items={[
                "調整刀模、結構與尺寸比例",
                "確認工藝可行性與風險",
                "白樣／彩樣驗證開箱節奏",
              ]}
            />
            <ServiceCard
              tag="PRODUCTION"
              title="量產追蹤與出貨"
              items={[
                "工廠排程與品質跟進",
                "EXW／FOB／CIF 等條件安排",
                "支援台灣＋海外多點配送",
              ]}
            />
          </div>
        </section>

        {/* 案例 Snapshots + 圖片牆 placeholder */}
        <section id="cases" className="mt-16 md:mt-20">
          <SectionHeader
            eyebrow="CASE SNAPSHOTS"
            title="我們怎麼看待一個「好」的禮盒專案"
            description="不是單看盒子漂不漂亮，而是看整個打開過程是否被編排過。"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] md:items-start">
            <div className="space-y-4">
              <CaseCard
                label="UNBOXING RHYTHM"
                title="打開順序就是故事的節奏。"
                body="蓋子、內襯、層次與卡片，每一步都有停頓與期待。我們會一起決定，在第一眼、第二層與最後拿到內容物的瞬間，各自要說什麼。"
                chip="Mid-Autumn / VIP"
              />
              <CaseCard
                label="COST & BRAND"
                title="在預算內維持品牌識別，而不是每檔都推翻重來。"
                body="幫你建立可以沿用數年的盒型與提袋語言，在有限的預算裡保留最核心的品牌元素。"
                chip="Brand system"
              />
            </div>

            {/* 假圖：案例圖片牆 */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <ImagePlaceholder label="Case image 01" />
                <ImagePlaceholder label="Case image 02" />
                <ImagePlaceholder label="Case image 03" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ImagePlaceholderWide label="Box detail / 工藝 close-up" />
                <ImagePlaceholderWide label="Unboxing scene / 開箱情境" />
              </div>
              <p className="text-[11px] text-slate-400">
                這區之後可以放 3–5 張最代表性的禮盒／提袋實拍與局部特寫，做成簡易案例牆。
              </p>
            </div>
          </div>
        </section>

        {/* 流程 */}
        <section id="process" className="mt-16 md:mt-20">
          <SectionHeader
            eyebrow="PROCESS"
            title="從第一封信開始，我們就在幫你排版這個專案。"
            description="把各部門的期待、時間與現實限制，整理成一個可以被執行的路線圖。"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <StepCard
              step="01"
              title="INTAKE"
              desc="收集簡報、預算與時間表，拆關鍵限制與風險。"
            />
            <StepCard
              step="02"
              title="FRAMING"
              desc="提出 1–2 組方案，清楚列出取捨與成本區間。"
            />
            <StepCard
              step="03"
              title="PROTOTYPE"
              desc="打樣與細節確認，確保可被大量複製。"
            />
            <StepCard
              step="04"
              title="PRODUCTION"
              desc="量產、品檢與出貨，必要時協助多點配送。"
            />
          </div>
        </section>

        {/* CTA */}
        <section
          id="contact"
          className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 px-6 py-8 text-sm shadow-[0_0_40px_rgba(15,23,42,0.9)] md:px-8 md:py-10"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.3em] text-slate-400">
                START A BRIEF
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-50 md:text-xl">
                你可以先只丟來：檔期、數量、預算帶，其他交給我們整理。
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                不一定要是一份完整 brief。可以是內部簡報、粗略 EXCEL
                或只是「今年中秋想比去年多做一點什麼」的想法，我們都可以幫你往下一步整理。
              </p>
            </div>
            <div className="space-y-3 text-xs text-slate-200">
              <a
                href="mailto:info@example.com"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-6 py-2.5 text-[11px] font-medium text-white shadow-[0_0_30px_rgba(79,70,229,0.7)] hover:brightness-110"
              >
                Email 一個 rough brief 給我們
              </a>
              <p className="text-[11px] text-slate-400">
                也可以先只問：「這樣的預算，值得做到哪個等級？」我們會誠實回答。
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-4 text-center text-[11px] text-slate-500">
        MB PACKAGING STUDIO — Project-based gifting & packaging.
      </footer>
    </div>
  );
}

/* 小組件 */

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">
      {children}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4">
      <div>
        <div className="text-[11px] font-semibold tracking-[0.3em] text-slate-500">
          {eyebrow}
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-50 md:text-xl">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-xs text-slate-300 md:text-[13px]">
          {description}
        </p>
      </div>
      <div className="hidden text-[11px] text-slate-500 md:block">
        For buyers, brand leads & designers.
      </div>
    </div>
  );
}

function ServiceCard({
  tag,
  title,
  items,
}: {
  tag: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/15 bg-white/5 p-4 text-sm shadow-[0_16px_40px_rgba(15,23,42,0.9)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-400">
          {tag}
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-60" />
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-slate-50">{title}</h3>
      <ul className="mt-3 space-y-1.5 text-[13px] text-slate-200">
        {items.map((item) => (
          <li key={item}>・{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CaseCard({
  label,
  title,
  body,
  chip,
}: {
  label: string;
  title: string;
  body: string;
  chip: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/15 bg-white/5 p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
          {label}
        </span>
        <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] text-slate-100">
          {chip}
        </span>
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-slate-50">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-200">{body}</p>
    </div>
  );
}

function PillCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
      <div className="text-[11px] font-semibold text-slate-50">{title}</div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
        {body}
      </p>
    </div>
  );
}

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="aspect-square rounded-xl border border-white/15 bg-[radial-gradient(circle_at_0_0,_rgba(148,163,184,0.5),transparent_55%)]">
      <div className="flex h-full items-end justify-start p-2">
        <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-slate-100">
          {label}
        </span>
      </div>
    </div>
  );
}

function ImagePlaceholderWide({ label }: { label: string }) {
  return (
    <div className="aspect-[4/3] rounded-xl border border-white/15 bg-[radial-gradient(circle_at_0_0,_rgba(148,163,184,0.5),transparent_55%)]">
      <div className="flex h-full items-end justify-start p-2">
        <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-slate-100">
          {label}
        </span>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/15 bg-slate-900/80 p-4 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-mono text-slate-400">{step}</span>
        <span className="h-5 w-5 rounded-full border border-slate-500/60" />
      </div>
      <h3 className="mt-3 text-[14px] font-semibold text-slate-50">{title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-slate-300">{desc}</p>
    </div>
  );
}
