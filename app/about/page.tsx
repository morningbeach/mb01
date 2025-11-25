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
    label: lang === "zh" ? (pageData?.label_zh || "關於天玎") : (pageData?.label_en || "About MorningBeach"),
    title: lang === "zh" ? (pageData?.title_zh || "理解，是我們最重要的生產線") : (pageData?.title_en || "Understanding is our most important production line"),
    desc: lang === "zh" ? (pageData?.desc_zh || "天玎包裝始終相信：真正的製造，不止是動手，更是動腦。我們不只生產包裝，我們生產理解——理解客戶、理解市場、理解變化的節奏。因為唯有被理解的產品，才有機會被選擇；唯有被理解的品牌，才能走得長遠。") : (pageData?.desc_en || "MorningBeach Packaging believes that true manufacturing is not just about hands, but minds. We don't just produce packaging — we produce understanding. Understanding clients, understanding markets, understanding the rhythm of change. Because only understood products have a chance to be chosen; only understood brands can go far."),
  };

  const story = {
    paragraphs: lang === "zh" ? 
      (data.story_zh || "天玎包裝不把自己定義為「製造業」，而是一家以知識為能量的品牌。我們用理性整理世界，用穩定回應變化。在多數工廠仍停留於執行的世界裡，我們選擇成為會思考的製造者。\n我們吸收資訊——來自市場、品牌、與客戶的每一個問題；我們消化資訊——將經驗、錯誤與靈感轉化為有邏輯的知識；我們輸出知識——以提案、對話與流程，分享給同事與客戶。\n我們把「共同成長」視為一種秩序，在穩定與理性之間，持續學習、思考、沉澱、再輸出。這種循環，是我們與世界保持新鮮的方式，也是我們與客戶共同成長的根基。").split("\n") :
      (data.story_en || "MorningBeach Packaging doesn't define itself as 'manufacturing,' but as a knowledge-powered brand. We organize the world with rationality and respond to change with stability. While most factories remain in execution mode, we choose to be thinking manufacturers.\nWe absorb information — from markets, brands, and every client question. We digest information — transforming experience, mistakes, and inspiration into logical knowledge. We output knowledge — through proposals, dialogues, and processes shared with colleagues and clients.\nWe see 'co-growth' as an order, continuously learning, thinking, settling, and outputting between stability and rationality. This cycle keeps us fresh with the world and forms the foundation of co-growth with our clients.").split("\n"),
    image: data.storyImage || "https://img.mbpack.co/uploads/homepage/2025-11-24/1763985256320-1cdb8ec7.jpg",
  };

  const values = data.values || [
    { title_en: "Rational Decision-Making", title_zh: "理性決策", body_en: "Every decision is based on clear reasoning. Discussions are logical, judgments are warm. We state, not exaggerate; explain, not overstate; express precisely, waste no words. All communication aims for consensus — being understood is always more important than being approved.", body_zh: "每一次決策都有清晰依據。討論有邏輯，判斷有溫度。我們陳述，不渲染；說明，不誇張；表達精確，不浪費字。所有溝通皆以共識為目標——被理解，永遠比被認可更重要。" },
    { title_en: "Stable Growth", title_zh: "穩定成長", body_en: "Stability is not conservatism, but accountability to trust; consistency amid change. Growth is not expanding scale, but deepening understanding; learn, summarize, learn again. We don't accelerate growth — we make growth more stable.", body_zh: "穩定不是保守，而是對信任負責；變化中保持一致。成長不是擴大規模，而是深化理解；學習、總結、再學習。我們不加速成長，我們讓成長變得更穩。" },
    { title_en: "Knowledge Circulation", title_zh: "知識循環", body_en: "Information is raw material, knowledge is the product. We absorb information, digest information, output knowledge. Every mistake becomes a case study; every success comes with its reason. Let knowledge flow, not accumulate. Absorption is responsibility, digestion is wisdom, output is warmth.", body_zh: "資訊是原料，知識是產品。我們吸收資訊、消化資訊、輸出知識。每一次錯誤記錄成案例；每一個成功附上原因；讓知識流動，而非堆積。吸收是責任，消化是智慧，輸出是溫度。" },
  ];

  const stats = data.stats || [
    { label_en: "Philosophy", label_zh: "經營理念", value: lang === "zh" ? "以理性與穩定，成就信任與成長" : "Achieving trust and growth through rationality and stability" },
    { label_en: "Core Capability", label_zh: "核心能力", value: lang === "zh" ? "知識循環：吸收·消化·輸出" : "Knowledge Circulation: Absorb · Digest · Output" },
    { label_en: "Positioning", label_zh: "品牌定位", value: lang === "zh" ? "會思考的製造者" : "Thinking Manufacturer" },
  ];

  const experience = {
    title: lang === "zh" ? (data.experienceTitle_zh || "我們的信條") : (data.experienceTitle_en || "Our Beliefs"),
    items: lang === "zh" ?
      (data.experience_zh || "・ 不炫耀產能，而沉澱知識\n・ 不追逐流行，而建立體系\n・ 不只回答問題，而是整理問題\n・ 穩定是生產的形式；理解是品牌的靈魂").split("\n") :
      (data.experience_en || "・ Not flaunting capacity, but settling knowledge\n・ Not chasing trends, but building systems\n・ Not just answering questions, but organizing questions\n・ Stability is the form of production; understanding is the soul of the brand").split("\n"),
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
