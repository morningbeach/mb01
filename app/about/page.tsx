// app/about/page.tsx
"use client";

import Image from "next/image";
import { SiteShell } from "../../components/SiteShell";
import { useLanguage } from "../contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const { lang } = useLanguage();
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/pages/about")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setPageData(data))
      .catch(() => {});
  }, []);

  // 使用資料庫數據或預設內容
  const data = pageData?.pageData || {};
  
  const hero = {
    label: lang === "zh" ? (pageData?.label_zh || "品牌故事") : (pageData?.label_en || "Brand Story"),
    title: lang === "zh" ? (pageData?.title_zh || "專注於專案的包裝合作夥伴，而非僅是產品目錄。") : (pageData?.title_en || "A packaging partner built around projects, not just SKUs."),
    desc: lang === "zh" ? (pageData?.desc_zh || "MB Packaging 的創立理念很簡單：禮品盒和包裝不應該是事後才想到的東西。") : (pageData?.desc_en || "MB Packaging was founded with a simple idea: gift boxes and packaging shouldn't be an afterthought. They are part of the brand, the campaign and the unboxing moment."),
  };

  const story = {
    paragraphs: lang === "zh" ? 
      (data.story_zh || "我們支援全球品牌、代理商和採購商的專案型包裝：從季節性禮品活動到長期零售線。我們的團隊閱讀您的簡報，與您的內部利害關係人保持一致，並將所有內容轉化為結構、材料和生產就緒的規格。\n我們不推銷標準目錄，而是從您的限制出發：數量、時間、運輸和品牌指南。從那裡我們提出結構方向、粗略的預算範圍和對您的專案有意義的打樣計劃。\n隨著時間推移，我們幫助品牌建立可重複使用的盒子和袋子的結構「語言」，因此每個新專案都感覺一致但從不重複。").split("\n") :
      (data.story_en || "We support global brands, agencies and buyers with project-based packaging: from seasonal gifting campaigns to long-term retail lines. Our team reads your brief, aligns with your internal stakeholders, and translates everything into structures, materials and production-ready specs.\nInstead of pushing standard catalogs, we start from your constraints: quantities, timing, shipping, and brand guidelines. From there we propose structural directions, rough budget ranges and sampling plans that make sense for your project.\nOver time, we help brands build reusable structural language for boxes and bags, so each new project feels consistent but never repetitive.").split("\n"),
    image: data.storyImage || "/cdn/about/studio.jpg",
  };

  const values = data.values || [
    { title_en: "Clarity", title_zh: "清晰", body_en: "We make the options, trade-offs and costs easy to explain internally.", body_zh: "我們讓選項、權衡和成本易於內部解釋。" },
    { title_en: "Consistency", title_zh: "一致性", body_en: "From sampling to mass production, we focus on repeatable results.", body_zh: "從打樣到量產，我們專注於可重複的結果。" },
    { title_en: "Reliability", title_zh: "可靠性", body_en: "Realistic timelines, transparent updates and honest communication.", body_zh: "實際的時間表、透明的更新和誠實的溝通。" },
  ];

  const stats = data.stats || [
    { label_en: "Years in packaging", label_zh: "包裝經驗", value: "10+" },
    { label_en: "Projects per year", label_zh: "年度專案", value: "100+" },
    { label_en: "Regions served", label_zh: "服務區域", value: "Asia / EU / US" },
  ];

  const experience = {
    title: lang === "zh" ? (data.experienceTitle_zh || "禮品包裝經驗") : (data.experienceTitle_en || "Experience in gifting"),
    items: lang === "zh" ?
      (data.experience_zh || "・ FMCG 和零售品牌的季節性禮品套裝。\n・ 會員和 VIP 禮品計劃。\n・ 品牌包裝線的長期結構系統。").split("\n") :
      (data.experience_en || "・ Seasonal gift sets for FMCG and retail brands.\n・ Membership and VIP gifting programs.\n・ Long-term structural systems for brand packaging lines.").split("\n"),
  };

  return (
    <SiteShell>
      {/* HERO */}
      <section>
        <p className="text-sm text-zinc-500">{hero.label}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          {hero.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-600">
          {hero.desc}
        </p>
      </section>

      {/* IMAGE + STORY */}
      <section className="mt-12 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
        <div className="space-y-5 text-[15px] leading-relaxed text-zinc-700">
          {story.paragraphs.filter((p: string) => p.trim()).map((p: string, i: number) => (
            <p key={i}>{p.trim()}</p>
          ))}
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
          <Image
            src={story.image}
            alt="MB Packaging studio"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* VALUES */}
      <section className="mt-16 md:mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">
          {lang === "zh" ? "我們在乎的事" : "What we care about"}
        </h2>
        <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
          {lang === "zh" ? "三個核心價值指導每個專案" : "Three things guide every project we take on."}
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {values.map((v: any, i: number) => (
            <ValueItem
              key={i}
              title={lang === "zh" ? v.title_zh : v.title_en}
              body={lang === "zh" ? v.body_zh : v.body_en}
            />
          ))}
        </div>
      </section>

      {/* TIMELINE / EXPERIENCE */}
      <section className="mt-16 md:mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">{experience.title}</h2>

        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {stats.map((s: any, i: number) => (
            <StatBlock
              key={i}
              label={lang === "zh" ? s.label_zh : s.label_en}
              value={s.value}
            />
          ))}
        </div>

        <ul className="mt-10 space-y-3 text-[15px] text-zinc-700">
          {experience.items.filter((item: string) => item.trim()).map((item: string, i: number) => (
            <li key={i}>{item.trim()}</li>
          ))}
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
