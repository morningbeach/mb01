"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

/**
 * MB Packaging – Admin System Handbook
 * 精緻版：導覽＋內容＋色彩規劃，方便非工程同仁閱讀。
 */
export default function SystemGuideClient() {
  const [active, setActive] = useState("welcome");
  const [keyword, setKeyword] = useState("");

  const sections = useMemo(
    () => [
      { id: "welcome", label: "👋 快速導覽" },
      { id: "architecture", label: "🧱 系統地圖" },
      { id: "frontend", label: "🎨 前台網站" },
      { id: "admin", label: "🛠️ 後台模組" },
      { id: "content", label: "📦 內容管理" },
      { id: "media", label: "🖼️ 圖片與檔案" },
      { id: "ai", label: "🤖 AI 工具" },
      { id: "operations", label: "⚙️ 維運與部署" },
      { id: "checklist", label: "✅ 工作檢查表" },
      { id: "troubleshoot", label: "🩺 故障排除" },
      { id: "resources", label: "📚 附錄" },
    ],
    []
  );

  const filteredSections = sections.filter(({ label }) =>
    label.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="flex min-h-[calc(100vh-160px)] bg-slate-950/5">
      {/* SIDEBAR */}
      <aside className="sticky top-20 hidden h-[calc(100vh-160px)] w-72 flex-shrink-0 border-r border-slate-200/70 bg-white/90 px-5 py-6 backdrop-blur lg:block">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            MB PACKAGING
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">後台說明中心</h2>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜尋章節"
            className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <nav className="space-y-1">
          {filteredSections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full rounded-xl px-4 py-2 text-left text-sm font-semibold transition-all duration-150 ${
                active === id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white">
          <p className="text-sm font-semibold">需要人工協助？</p>
          <p className="mt-1 text-xs text-white/70">dev@morningbeach.com</p>
          <a
            href="mailto:dev@morningbeach.com"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
          >
            📩 寫信給技術團隊
          </a>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          {active === "welcome" && <WelcomeSection />}
          {active === "architecture" && <ArchitectureSection />}
          {active === "frontend" && <FrontendSection />}
          {active === "admin" && <AdminSection />}
          {active === "content" && <ContentSection />}
          {active === "media" && <MediaSection />}
          {active === "ai" && <AISection />}
          {active === "operations" && <OperationsSection />}
          {active === "checklist" && <ChecklistSection />}
          {active === "troubleshoot" && <TroubleshootSection />}
          {active === "resources" && <ResourcesSection />}
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🎯 Section 1: Welcome                                                       */
/* -------------------------------------------------------------------------- */
function WelcomeSection() {
  const quickLinks = [
    { label: "商品管理 V2", href: "/admin/products-v2", color: "bg-blue-100 text-blue-900" },
    { label: "首頁編輯器", href: "/admin/homepage", color: "bg-violet-100 text-violet-900" },
    { label: "圖片庫 (R2)", href: "/admin/images", color: "bg-emerald-100 text-emerald-900" },
    { label: "客戶詢價", href: "/admin/contact-inquiries", color: "bg-rose-100 text-rose-900" },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <Badge label="版本 2025.12" />
      <h1 className="mt-4 text-4xl font-black text-slate-900">MB 系統一站式操作指南</h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">
        本文件整理了前台與後台的結構、日常操作步驟、部署與維運流程，適合新同仁快速上手，也方便資深夥伴回查細節。
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {quickLinks.map(({ label, href, color }) => (
          <LinkCard key={label} label={label} href={href} color={color} />
        ))}
      </div>

      <InfoPanel
        title="今日任務建議"
        items={[
          "檢查客戶詢價列表，清空 NEW 狀態",
          "更新至少一則最新案例或部落格內容",
          "確認首頁 hero 區塊 CTA 是否連結正確",
        ]}
      />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 🧱 Section 2: Architecture                                                  */
/* -------------------------------------------------------------------------- */
function ArchitectureSection() {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <SectionTitle icon="🧱" title="系統全貌" subtitle="Next.js App Router + Prisma + Cloudflare" />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="前台" description="Next.js 14 SSR + 客製 UI" details="/app + components/" color="from-blue-500/10" />
        <StatCard title="後台" description="受保護的 /admin routes" details="七大模組 + AI 工具" color="from-violet-500/10" />
        <StatCard title="資料層" description="PostgreSQL + R2" details="Prisma schema + Cloudflare" color="from-emerald-500/10" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
        <h3 className="text-lg font-semibold text-slate-900">資料流程 (文字示意)</h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>1. 客戶在前台填表 → 送往 API `/api/contact` → 儲存於 `ContactInquiry`</li>
          <li>2. 後台 `contact-inquiries` 頁面透過 REST API（Next route handler）取得分頁資料</li>
          <li>3. 商品資料由 Prisma 連線 PostgreSQL，圖片 URL 指向 Cloudflare R2</li>
          <li>4. 多語系欄位以 `_zh`、`_en` 存於同一資料列，前台依語系切換</li>
          <li>5. AI 功能（Gift Box Radar / Trend Scanner / AI 批次上架）透過 Google Gemini API 完成圖片編輯、翻譯與商品分析，再寫入 `/api/admin/products-v2`</li>
          <li>6. 任何 AI 產出的圖片都儲存於 Cloudflare R2 `AItrend/日期/` 與 `AItrend/日期/ok/`，供批次匯入與一鍵上架</li>
        </ul>
      </div>

      <Callout type="tip" message="任何資料異動後若未即時反映，可使用 admin 頁面右上角的 Reload、或至 /api/revalidate 進行重新驗證。" />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 🎨 Section 3: Frontend                                                      */
/* -------------------------------------------------------------------------- */
function FrontendSection() {
  const routes = [
    { path: "/", desc: "首頁（首頁編輯器控制 hero / why / products 等區塊）" },
    { path: "/products/[slug]", desc: "商品內頁，讀取 `product.slug`" },
    { path: "/catalog", desc: "分類導覽，搭配 Category Tree" },
    { path: "/case", desc: "案例/作品集" },
    { path: "/blog", desc: "部落格列表與文章內頁" },
    { path: "/contact", desc: "聯絡表單＋即時詢價按鈕" },
  ];

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <SectionTitle icon="🎨" title="前台網站" subtitle="品牌形象、SEO、轉換的第一線" />

      <div className="grid gap-4 md:grid-cols-2">
        <InfoBlock title="排版系統" items={[
          "Tailwind +自定義 CSS，維持一致字重與間距",
          "`components/SiteShell` 為主架構：Header / Main / Footer",
          "下方 Footer 具備詢價彈窗，與 `/api/contact-buttons` 設定同步",
        ]} />
        <InfoBlock title="互動與 SEO" items={[
          "動態 meta 設定在個別 page or layout",
          "使用 Next Image 以及 lazy loading 減輕載入",
          "GTM 與 GA4 於 root layout 註冊，支援追蹤",
        ]} />
      </div>

      <div className="rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900">主要路由</h3>
        <ul className="mt-4 divide-y divide-slate-100 text-sm text-slate-600">
          {routes.map(({ path, desc }) => (
            <li key={path} className="flex flex-col gap-1 py-2 md:flex-row md:items-center md:justify-between">
              <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700">{path}</code>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
      </div>

      <Callout type="info" message="前台語系透過 `LanguageProvider` 管理，切換語系時會重新渲染，以 `_zh` 或 `_en` 欄位提供內容。" />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 🛠️ Section 4: Admin Modules                                                */
/* -------------------------------------------------------------------------- */
function AdminSection() {
  const modules = [
    {
      title: "控制面板",
      url: "/admin",
      color: "from-slate-900 to-slate-700",
      points: ["顯示版本切換器（V1/V2）", "快速導向商品/AI/分類"],
    },
    {
      title: "客戶詢價",
      url: "/admin/contact-inquiries",
      color: "from-rose-500 to-pink-500",
      points: ["狀態流：NEW→IN_PROGRESS→...", "支援分頁、狀態篩選與備註"],
    },
    {
      title: "商品管理 V2",
      url: "/admin/products-v2",
      color: "from-blue-500 to-indigo-500",
      points: ["標籤式分類、批次操作", "商品內含多語內容、AI 翻譯"],
    },
    {
      title: "分類樹 / 標籤",
      url: "/admin/category-tree",
      color: "from-emerald-500 to-teal-500",
      points: ["樹狀 drag & drop", "標籤 slug 與 SEO"],
    },
    {
      title: "首頁編輯器",
      url: "/admin/homepage",
      color: "from-purple-500 to-fuchsia-500",
      points: ["區塊式管理、可停用", "自動 revalidate"],
    },
    {
      title: "AI Studio",
      url: "/admin/gift-box-radar",
      color: "from-amber-500 to-orange-500",
      points: ["Gift Box Radar、Trend Scanner", "批次翻譯 / 生成"],
    },
  ];

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <SectionTitle icon="🛠️" title="後台模組" subtitle="所有管理功能集中在 /admin" />
      <div className="grid gap-5 md:grid-cols-2">
        {modules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </div>
      <Callout type="success" message="後台按鈕在右下角：『系統技術文件』隨時可開啟本手冊。" />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 📦 Section 5: Content Ops                                                  */
/* -------------------------------------------------------------------------- */
function ContentSection() {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <SectionTitle icon="📦" title="內容管理流程" subtitle="商品、首頁、頁面、翻譯一次掌握" />

      <StepRow
        title="商品上架六步驟"
        steps={[
          "在 /admin/products-v2 點擊『新增商品』",
          "填寫中文內容 → 使用 AI 翻譯產生英文",
          "設定 slug、狀態、顯示版本 (V2)",
          "上傳封面圖與圖庫，引用 /admin/images URL",
          "指派標籤 (Tag) 與分類 tree",
          "儲存並確認於前台顯示",
        ]}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <InfoBlock title="首頁編輯" items={[
          "表單 action 為 server action `createSection`",
          "Hero / Why / Products / Factory / CTA / Gallery / Embed / Video",
          "可調整 Order，有 revalidatePath('/')",
        ]} />
        <InfoBlock title="靜態頁面" items={[
          "/admin/pages 管理 about / factory / faq / case 等",
          "內容可用 Markdown 或富文本 (取決於頁面)",
          "SEO 欄位 `seoTitle` / `seoDescription`" ,
        ]} />
      </div>

      <div className="rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900">多語內容策略</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>所有主要資料表（Product、Tag、HomeSection payload）皆建 `_zh`、`_en` 欄位</li>
          <li>優先撰寫中文 → 使用 AI 翻譯 → 人工微調</li>
          <li>保留專有名詞英譯表，避免 AI 破壞品牌用語</li>
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 🖼️ Section 6: Media                                                        */
/* -------------------------------------------------------------------------- */
function MediaSection() {
  const table = [
    { usage: "商品封面", size: "800x800px", weight: "<300KB", folder: "uploads/products" },
    { usage: "Hero 橫幅", size: "1920x900px", weight: "<500KB", folder: "uploads/hero" },
    { usage: "首頁展示圖", size: "1280x720px", weight: "<400KB", folder: "uploads/home" },
    { usage: "部落格封面", size: "1200x630px", weight: "<300KB", folder: "uploads/blog" },
  ];

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <SectionTitle icon="🖼️" title="圖片與檔案" subtitle="Cloudflare R2 + R2 Manager" />

      <div className="grid gap-5 md:grid-cols-2">
        <InfoBlock title="使用方式" items={[
          "進入 /admin/images → 選取資料夾 → 上傳",
          "支援拖曳、複製 URL、標記軟刪除",
          "若刪除錯誤，可於 7 天內恢復",
        ]} />
        <InfoBlock title="命名規則" items={[
          "全部使用英文與 dash，如 gift-box-classic.jpg",
          "同系列圖加序號：gift-box-classic-01",
          "避免空白與中文，利於 SEO 與 CDN" ,
        ]} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">用途</th>
              <th className="px-4 py-3">建議尺寸</th>
              <th className="px-4 py-3">檔案大小</th>
              <th className="px-4 py-3">資料夾</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {table.map((row) => (
              <tr key={row.usage}>
                <td className="px-4 py-3">{row.usage}</td>
                <td className="px-4 py-3">{row.size}</td>
                <td className="px-4 py-3">{row.weight}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.folder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning" message="R2 目前無自動壓縮，請上傳前使用 TinyPNG / Squoosh 等工具降低體積。" />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 🤖 Section 7: AI Tools                                                     */
/* -------------------------------------------------------------------------- */
function AISection() {
  const tools = [
    {
      name: "Gift Box Radar × Gemini",
      route: "/admin/gift-box-radar",
      purpose: "Apify 串流＋Gemini 圖片編修，直接輸出可上架素材",
      steps: [
        "輸入平台、關鍵字、地區後開始掃描，結果會即時寫入 selectedImages 列表",
        "在圖片卡片輸入提示詞後按『Gemini AI 圖片編輯』，/api/admin/gemini-edit 會套用 `gemini-3-pro-image-preview` 或 2.0 Flash",
        "點『分析』觸發 `/api/admin/products-v2/analyze-direct`，Gemini 會輸出完整 JSON 欄位＋建議標籤",
        "按『發布產品』即可一次把圖片、描述與標籤送往 `/api/admin/products-v2` 寫入資料庫",
      ],
      tips: "Gemini API Key 存在 localStorage `gemini_api_key`，同一把 key 控管編輯、翻譯與發布流程。",
    },
    {
      name: "Trend Scanner V2 × Gemini",
      route: "/admin/trend-scanner",
      purpose: "跨區域關鍵字掃描 → Gemini 翻譯、生成摘要與商品草稿",
      steps: [
        "選擇地區與類別後輸入關鍵字；若啟用 auto translate，`/api/admin/translate` 會用 Gemini 1.5/2.0 將關鍵字轉為目標語系",
        "執行掃描並勾選圖片，使用『Gemini 編輯』改善素材並自動存到 R2 `AItrend/日期/ok/`",
        "點『分析圖片』走 `/api/admin/products-v2/analyze-direct`，可同時比對既有標籤、取得中英文文案",
        "完成後用『發布產品』或匯出 JSON，整套流程都維持在單一頁面完成",
      ],
      tips: "遇到模型額度或地區限制時，可改選 gemini-2.0-flash-exp，或先只執行翻譯步驟再進行編輯。",
    },
    {
      name: "AI 圖片編輯器 + 批次上架",
      route: "/admin/ai-image-editor → /admin/products-v2/batch",
      purpose: "Gemini 生成圖片後，透過 AItrend 圖庫一鍵批次上架",
      steps: [
        "在 AI 圖片編輯器載入 `AItrend/日期` 資料夾、輸入 Gemini API Key，批次選圖並按『AI 生成/編輯』",
        "結果可個別或全部儲存到 `AItrend/日期/ok/`，供後續批次工具讀取",
        "切換到 AI 批次產品上架頁，點『從 AItrend 圖庫選擇』把剛生成的圖像匯入待上架清單",
        "按『AI 分析』或『全部分析』，`/api/admin/products-v2/analyze` 會把圖片＋提示詞交給 Gemini 生成中英內容與建議標籤",
        "確認欄位後點『🚀 一鍵批次上架』，由 `uploadAllProducts` 逐筆呼叫 `/api/admin/products-v2` 正式建立產品",
      ],
      tips: "圖片大於 500KB 會自動壓縮，確定欄位正確後即可一次上架，平均 3~5 秒一個品項。",
    },
  ];

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <SectionTitle icon="🤖" title="AI 工具全攻略" subtitle="翻譯、靈感、趨勢、批次作業一次掌握" />

      <div className="grid gap-6">
        {tools.map((tool) => (
          <div key={tool.name} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-slate-900">{tool.name}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{tool.route}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">用途：{tool.purpose}</p>

            <h4 className="mt-4 text-sm font-semibold text-slate-900">操作步驟</h4>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
              {tool.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <Callout type="tip" message={tool.tips} />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-800">
        <h3 className="font-semibold text-slate-900">Gemini 整合重點</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>三個 AI 工具共用 localStorage `gemini_api_key`，送請求時才附在 body，伺服端不會長期儲存。</li>
          <li>圖片編修 → `/api/admin/gemini-edit`、圖片分析 → `/api/admin/products-v2/analyze( -direct)`、翻譯 → `/api/admin/translate`，都採 Google Generative Language API。</li>
          <li>所有生成圖片會落在 R2 `AItrend/{"{date}"}/ok/`，批次上架頁再透過 `importFromAItrend` 讀取並一鍵發布。</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm text-amber-900">
        <p className="font-semibold">配額與錯誤處理</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Gemini 的圖片編輯與分析屬高耗量操作，建議避開整點尖峰或切換至 Flash 模型。</li>
          <li>若 API 回傳 `RESOURCE_EXHAUSTED`，可暫停 1 分鐘或改為少量圖片重試。</li>
          <li>OpenAI 只剩餘在舊翻譯按鈕，後續會陸續汰換；請把焦點放在 Gemini key 的維護。</li>
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* ⚙️ Section 8: Operations                                                   */
/* -------------------------------------------------------------------------- */
function OperationsSection() {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <SectionTitle icon="⚙️" title="維運與部署" subtitle="環境變數、部署流程、資料備援" />

      <InfoBlock title="主要環境" items={[
        "DATABASE_URL：PostgreSQL (Supabase / Render)",
        "R2_ACCESS_KEY / SECRET / ENDPOINT：Cloudflare R2",
        "OPENAI_API_KEY：AI 翻譯與趨勢分析",
        "KV_REST_API_URL / TOKEN：Vercel KV (若有啟用)",
      ]} />

      <div className="grid gap-6 md:grid-cols-2">
        <StepCardStyled
          title="部署流程 Cloudflare Pages"
          steps={[
            "1. `npm run pages:build` 生成 .next 與 Functions",
            "2. `wrangler pages deploy` 發佈",
            "3. 驗證 /admin 及 /api endpoints",
          ]}
        />
        <StepCardStyled
          title="資料庫備援"
          steps={[
            "每日 03:00 UTC 由 `scripts/backup-database.js` 觸發",
            "結果放置於 `db_backups/`（JSON + SQL）",
            "重大異動前再手動執行 `npx prisma db pull` 保存 schema",
          ]}
        />
      </div>

      <Callout type="info" message="若需緊急下線某功能，可於 `next.config.js` 設定 rewrite 或在 `app/admin` 內暫時關閉路由。" />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* ✅ Section 8: Checklist                                                    */
/* -------------------------------------------------------------------------- */
function ChecklistSection() {
  const checklist = {
    每日: ["檢查客戶詢價列表", "確認首頁 CTA 是否正常", "Review Cloudflare 日誌"],
    每週: ["更新至少一則內容（商品/案例/部落格）", "備份資料庫並上傳至雲端", "檢視 GA4 轉換事件"],
    每月: ["整理 R2 圖片，刪除未使用", "檢查環境變數是否即時", "審視 SEO 標題與描述"],
  };

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <SectionTitle icon="✅" title="例行檢查表" subtitle="用最小時間確保網站品質" />

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(checklist).map(([period, items]) => (
          <div key={period} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{period}</h3>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-600">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Callout type="success" message="完成任務後建議在 Notion 或 Teams 上紀錄，利於交接與追蹤。" />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 🩺 Section 9: Troubleshooting                                              */
/* -------------------------------------------------------------------------- */
function TroubleshootSection() {
  const issues = [
    {
      title: "前台顯示舊資料",
      steps: [
        "確認有重新儲存後台內容",
        "使用 Ctrl + Shift + R 強制刷新",
        "若仍舊，執行 `/api/revalidate?path=/`",
      ],
    },
    {
      title: "圖片失聯 (404)",
      steps: [
        "檢查 R2 是否存在該檔案",
        "確認 URL 是否含 https://...",
        "若為被移除資料夾，改用新版路徑",
      ],
    },
    {
      title: "翻譯 API 無回應",
      steps: [
        "檢查 `OPENAI_API_KEY` 是否有效",
        "Cloudflare 防火牆是否阻擋",
        "暫時改用人工翻譯備案",
      ],
    },
    {
      title: "無法登入後台",
      steps: [
        "確認帳號是否仍存在 AdminUser",
        "清除 Cookie/LocalStorage",
        "若多次失敗，重設密碼或聯絡技術",
      ],
    },
  ];

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <SectionTitle icon="🩺" title="故障排除" subtitle="常見問題快速解法" />
      <div className="grid gap-5 md:grid-cols-2">
        {issues.map((issue) => (
          <TroubleCard key={issue.title} {...issue} />
        ))}
      </div>
      <Callout type="warning" message="若涉及資料遺失，切勿自行 Drop table。請先從 `db_backups/` 找到最近備份，再與技術人員確認還原計畫。" />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 📚 Section 10: Resources                                                   */
/* -------------------------------------------------------------------------- */
function ResourcesSection() {
  const docs = [
    { name: "Product Version System", file: "PRODUCT_VERSION_SYSTEM.md", highlight: "敘述 V1/V2 差異" },
    { name: "Category Tree Guide", file: "CATEGORY_TREE_GUIDE.md", highlight: "分類操作教學" },
    { name: "AI Trend Scanner", file: "AI_TREND_SCANNER_V2_COMPLETE.md", highlight: "AI 工具參考" },
    { name: "Deploy Guide", file: "DEPLOYMENT.md", highlight: "部署流程" },
    { name: "Sync Report", file: "SYNC_REPORT.md", highlight: "資料同步紀錄" },
  ];

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <SectionTitle icon="📚" title="附錄與延伸" subtitle="Repository 內的其他文件" />
      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((doc) => (
          <ResourceCard key={doc.file} {...doc} />
        ))}
      </div>
      <Callout type="info" message="若有新流程或重大調整，請於 Repo README 與本文件同時更新，確保資訊一致。" />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 💠 Shared Components                                                       */
/* -------------------------------------------------------------------------- */
function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-600">
      {label}
    </span>
  );
}

function LinkCard({ label, href, color }: { label: string; href: string; color: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-2xl border border-transparent bg-white/60 p-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-200`}
    >
      <span>
        {label}
        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${color}`}>前往</span>
      </span>
      <span className="text-slate-400">→</span>
    </Link>
  );
}

function InfoPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{subtitle}</p>
      <h2 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-900">
        <span className="text-2xl">{icon}</span>
        {title}
      </h2>
    </div>
  );
}

function StatCard({ title, description, details, color }: { title: string; description: string; details: string; color: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${color} p-4`}> 
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-lg font-bold text-slate-900">{description}</p>
      <p className="text-sm text-slate-600">{details}</p>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ModuleCard({ title, url, color, points }: { title: string; url: string; color: string; points: string[] }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${color} p-5 text-white shadow-sm`}>
      <p className="text-xs uppercase tracking-wide text-white/80">{url}</p>
      <h3 className="mt-2 text-xl font-semibold">{title}</h3>
      <ul className="mt-3 space-y-1 text-sm text-white/90">
        {points.map((point) => (
          <li key={point}>• {point}</li>
        ))}
      </ul>
    </div>
  );
}

function StepRow({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-6">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step} className="rounded-xl border border-slate-100 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">STEP {index + 1}</div>
            <p className="text-sm text-slate-700">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCardStyled({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <ol className="mt-3 space-y-2 text-sm text-slate-600">
        {steps.map((step) => (
          <li key={step} className="flex gap-2">
            <span className="text-blue-500">→</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TroubleCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 p-5">
      <h3 className="text-base font-semibold text-rose-900">{title}</h3>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-rose-900/80">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

function ResourceCard({ name, file, highlight }: { name: string; file: string; highlight: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{file}</p>
      <h3 className="mt-2 text-lg font-bold text-slate-900">{name}</h3>
      <p className="text-sm text-slate-600">{highlight}</p>
    </div>
  );
}

function Callout({ type, message }: { type: "info" | "tip" | "warning" | "success"; message: string }) {
  const styles = {
    info: "border-slate-200 bg-slate-50 text-slate-800",
    tip: "border-blue-200 bg-blue-50 text-blue-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };
  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm ${styles[type]}`}>{message}</div>
  );
}
