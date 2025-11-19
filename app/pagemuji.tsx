// app/page.tsx
import type { ReactNode } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      {/* Header */}
      <header className="border-b border-stone-200 bg-stone-100/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex flex-col leading-tight">
            <span className="text-xs tracking-[0.3em] text-stone-500">
              MB PACKAGING
            </span>
            <span className="text-[13px] text-stone-600">
              Gifting & Packaging for brands
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-[13px] text-stone-600 md:flex">
            <a href="#hero" className="hover:text-stone-900">
              關於
            </a>
            <a href="#services" className="hover:text-stone-900">
              服務
            </a>
            <a href="#lines" className="hover:text-stone-900">
              包裝線
            </a>
            <a href="#process" className="hover:text-stone-900">
              流程
            </a>
            <a href="#contact" className="hover:text-stone-900">
              聯絡
            </a>
          </nav>

          <a
            href="#contact"
            className="rounded-full border border-stone-400 px-3.5 py-1.5 text-[12px] text-stone-700 hover:bg-stone-200"
          >
            專案洽詢
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 md:px-6 md:pt-10">
        {/* HERO */}
        <section
          id="hero"
          className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center"
        >
          <div>
            <p className="text-[11px] tracking-[0.25em] text-stone-500">
              B2B GIFTING & PACKAGING
            </p>

            <h1 className="mt-4 text-[1.9rem] leading-snug text-stone-900 md:text-[2.1rem]">
              我們把禮盒與提袋視為
              <span className="block">一整個「專案」，而不是單一品項。</span>
            </h1>

            <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-stone-600">
              MB PACKAGING
              介於品牌與工廠之間。我們閱讀你的簡報、檔期與預算，反推盒型、提袋、
              材質與出貨方式，讓每一檔禮盒或會員禮，在現實限制下仍然乾淨、準時、
              有一致的品牌感。
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-stone-600">
              <Tag>企業 / 品牌端</Tag>
              <Tag>採購部門</Tag>
              <Tag>設計公司 & 代理商</Tag>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-[12px]">
              <a
                href="#contact"
                className="rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-stone-50 hover:bg-stone-800"
              >
                先丟一個大致 brief 給我們
              </a>
              <a
                href="#services"
                className="text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
              >
                看我們可以幫上什麼忙
              </a>
            </div>
          </div>

          {/* hero 圖片 placeholder */}
          <div className="h-full">
            <div className="aspect-[4/3] rounded-lg border border-stone-300 bg-stone-200/60">
              <div className="flex h-full flex-col justify-between p-4">
                <div className="text-[11px] text-stone-500">
                  建議實際放：一組主力檔期禮盒＋提袋的實拍。
                </div>
                <div className="space-y-2 text-[11px] text-stone-600">
                  <p>・乾淨桌面背景，偏自然光</p>
                  <p>・顏色不要太飽和，留一點空白空間</p>
                  <p>・可同時拍「打開前」與「打開後」的構圖</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 分隔線 */}
        <Divider />

        {/* Services */}
        <section id="services" className="mt-4">
          <SectionTitle
            title="在一個專案裡，我們實際會做的事"
            subtitle="從閱讀簡報、拆解限制，到打樣確認與出貨安排。"
          />

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <ServiceCard
              title="專案 framing 與粗估"
              meta="前期"
              lines={[
                "閱讀簡報、檔期與預算，整理成關鍵條件。",
                "提出 1–2 組結構與材質方向，附上預算區間。",
                "協助你向內部說明各方案的差異。",
              ]}
            />
            <ServiceCard
              title="盒型／提袋開發與打樣"
              meta="中段"
              lines={[
                "調整盒型尺寸與提袋結構，確保內容物放得穩。",
                "確認印刷與加工工藝的可行性與風險。",
                "安排白樣／彩樣，實際檢查開箱手感。",
              ]}
            />
            <ServiceCard
              title="量產管理與出貨"
              meta="後段"
              lines={[
                "與工廠確認排程與品質標準。",
                "依專案選擇 EXW / FOB / CIF 等出貨條件。",
                "必要時協助分批配送與外箱標示安排。",
              ]}
            />
          </div>
        </section>

        <Divider />

        {/* Lines */}
        <section id="lines" className="mt-4">
          <SectionTitle
            title="我們最常處理的三條包裝線"
            subtitle="你可以只委託其中一項，也可以讓我們整合成一套 Gift set。"
          />

          <div className="mt-6 space-y-4">
            <LineItem
              label="Gift bags"
              title="禮品提袋與購物袋"
              body="不織布、帆布、棉布與尼龍等材質，適合活動、會員禮與通路贈品。可以配合年度檔期做一季一款的延伸。"
            />
            <LineItem
              label="Gift boxes"
              title="客製禮盒與包裝盒"
              body="天地盒、書型盒、抽屜盒與酒盒等結構，支援不同紙材與加工組合。適合中秋、春節與品牌常態禮盒線。"
            />
            <LineItem
              label="Gift sets"
              title="整合型 Gift set 專案"
              body="從內容物、內襯到外箱一次規劃，把原本就有的商品整理成一個更完整的禮盒提案。適合 VIP、員工與大型企業方案。"
            />
          </div>
        </section>

        <Divider />

        {/* Process */}
        <section id="process" className="mt-4">
          <SectionTitle
            title="一個專案，大致會經過這幾個步驟"
            subtitle="過程中，我們會把每一步轉成你看得懂、也方便向內部溝通的文件。"
          />

          <ol className="mt-6 grid gap-4 text-[13px] text-stone-700 md:grid-cols-4">
            <StepItem
              step="01"
              title="Intake"
              body="收集檔期、數量、預算與內容物，先釐清哪些條件是不能動的。"
            />
            <StepItem
              step="02"
              title="Framing"
              body="提出 1–2 組方向，附上預算與優缺點，方便你在內部做選擇。"
            />
            <StepItem
              step="03"
              title="Prototype"
              body="打樣並調整細節，確認實際組裝方式與開箱節奏。"
            />
            <StepItem
              step="04"
              title="Production"
              body="量產追蹤、品檢與出貨。必要時協助分批出貨與標籤設定。"
            />
          </ol>
        </section>

        <Divider />

        {/* Contact */}
        <section
          id="contact"
          className="mt-6 rounded-lg border border-stone-300 bg-stone-100 px-4 py-6 md:px-6 md:py-7"
        >
          <p className="text-[11px] tracking-[0.28em] text-stone-500">
            PROJECT INQUIRY
          </p>
          <h2 className="mt-2 text-[18px] text-stone-900">
            你可以先只提供：檔期、數量與預算帶。
          </h2>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-stone-600">
            不一定要有完整 brief。可以是內部簡報截圖、Excel 粗估，或只是「今年中秋
            想比去年多做一點什麼」的想法。我們會先回覆可行方向與大致價格，再決定要不要進入打樣與細部規劃。
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-[12px] text-stone-700">
            <a
              href="mailto:info@example.com"
              className="rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-stone-50 hover:bg-stone-800"
            >
              Email 一個 rough brief 給我們
            </a>
            <span className="text-stone-500">
              或在信件裡直接問：「這樣的預算，值得做到哪個等級？」
            </span>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-stone-100 py-4 text-center text-[11px] text-stone-500">
        MB PACKAGING — project-based gifting & packaging support.
      </footer>
    </div>
  );
}

/* 小組件 */

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-stone-300 bg-stone-100 px-3 py-1">
      {children}
    </span>
  );
}

function Divider() {
  return (
    <div className="mt-10 border-t border-dashed border-stone-300/70 md:mt-12" />
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-[16px] text-stone-900">{title}</h2>
      <p className="max-w-xl text-[13px] text-stone-600">{subtitle}</p>
    </div>
  );
}

function ServiceCard({
  title,
  meta,
  lines,
}: {
  title: string;
  meta: string;
  lines: string[];
}) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-stone-300 bg-stone-50 px-4 py-4">
      <div className="flex items-baseline justify-between text-[11px] text-stone-500">
        <span>{meta}</span>
      </div>
      <h3 className="mt-2 text-[14px] text-stone-900">{title}</h3>
      <ul className="mt-3 space-y-1.5 text-[13px] text-stone-700">
        {lines.map((line) => (
          <li key={line}>・{line}</li>
        ))}
      </ul>
    </div>
  );
}

function LineItem({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-stone-300 bg-stone-50 px-4 py-4">
      <div className="text-[11px] text-stone-500">{label}</div>
      <h3 className="mt-1 text-[14px] text-stone-900">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-stone-700">{body}</p>
    </div>
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
    <li className="flex flex-col gap-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-3">
      <span className="text-[11px] text-stone-500">{step}</span>
      <span className="text-[13px] text-stone-900">{title}</span>
      <p className="text-[12px] leading-relaxed text-stone-700">{body}</p>
    </li>
  );
}
