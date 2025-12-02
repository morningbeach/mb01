"use client";

import Image from "next/image";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useState } from "react";

type Lang = "en" | "zh";

// Helper for translation
function t(lang: Lang, en: string, zh: string, fallback: string) {
  if (lang === "zh") return zh || en || fallback;
  return en || zh || fallback;
}

const MOCK_PAYLOAD = {
  titleLine1_en: "MorningBeach / Gifts",
  titleLine1_zh: "MorningBeach / Gifts",
  titleLine2_en: "Premium Packaging Solutions",
  titleLine2_zh: "頂級包裝解決方案",
  subtitle_en: "We create unboxing experiences that elevate your brand. From concept to delivery, we are your partner in packaging.",
  subtitle_zh: "我們打造提升品牌價值的開箱體驗。從概念到交付，我們是您最值得信賴的包裝夥伴。",
  primaryLabel_en: "View Products",
  primaryLabel_zh: "查看產品",
  secondaryLabel_en: "Contact Us",
  secondaryLabel_zh: "聯絡我們",
  primaryUrl: "#",
  secondaryUrl: "#",
  // 使用 Unsplash 圖片替代 placehold.co 以避免需重啟伺服器的問題
  imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1600&auto=format&fit=crop", 
};

export default function HeroTestClient() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-24">
      
      {/* Version 1: Original */}
      <div className="border-t pt-10">
        <div className="mb-4 inline-block rounded bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">
          Version 1: Original (Centered)
        </div>
        <div className="rounded-xl border border-dashed border-zinc-300 p-4 md:p-8">
          <HeroOriginal lang={lang} payload={MOCK_PAYLOAD} />
        </div>
      </div>

      {/* Version 2: Split Layout */}
      <div className="border-t pt-10">
        <div className="mb-4 inline-block rounded bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">
          Version 2: Split (Left Text / Right Image)
        </div>
        <div className="rounded-xl border border-dashed border-zinc-300 p-4 md:p-8">
          <HeroSplit lang={lang} payload={MOCK_PAYLOAD} />
        </div>
      </div>

      {/* Version 3: Bold Left */}
      <div className="border-t pt-10">
        <div className="mb-4 inline-block rounded bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">
          Version 3: Bold Left (Modern)
        </div>
        <div className="rounded-xl border border-dashed border-zinc-300 p-4 md:p-8">
          <HeroBoldLeft lang={lang} payload={MOCK_PAYLOAD} />
        </div>
      </div>

      {/* Version 4: Overlay */}
      <div className="border-t pt-10">
        <div className="mb-4 inline-block rounded bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">
          Version 4: Image Overlay (Cinematic)
        </div>
        <div className="rounded-xl border border-dashed border-zinc-300 p-0 overflow-hidden">
          <HeroOverlay lang={lang} payload={MOCK_PAYLOAD} />
        </div>
      </div>

    </div>
  );
}

// ==========================================
// Components
// ==========================================

function HeroOriginal({ lang, payload }: { lang: Lang; payload: any }) {
  const titleLine1 = t(lang, payload.titleLine1_en, payload.titleLine1_zh, "");
  const titleLine2 = t(lang, payload.titleLine2_en, payload.titleLine2_zh, "");
  const subtitle = t(lang, payload.subtitle_en, payload.subtitle_zh, "");
  const primaryLabel = t(lang, payload.primaryLabel_en, payload.primaryLabel_zh, "");
  const secondaryLabel = t(lang, payload.secondaryLabel_en, payload.secondaryLabel_zh, "");
  
  const isEn = lang === "en";

  return (
    <section className="text-center">
      <h1 
        className={`font-semibold tracking-wide text-zinc-900 ${
          isEn ? "text-5xl md:text-7xl" : "text-4xl md:text-6xl"
        }`}
      >
        {titleLine1}
        {titleLine2 && (
          <>
            <br />
            <span 
              className={`whitespace-nowrap tracking-tight ${
                isEn ? "text-lg md:text-2xl" : "text-xl md:text-3xl"
              }`}
            >
              {titleLine2}
            </span>
          </>
        )}
      </h1>

      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-500">
          {subtitle}
        </p>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <ButtonPrimary label={primaryLabel} />
        <ButtonSecondary label={secondaryLabel} />
      </div>

      <div className="mt-12 flex justify-center">
        <div className="relative aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
          <Image src={payload.imageUrl} alt="Hero" fill className="object-cover" />
        </div>
      </div>
    </section>
  );
}

function HeroSplit({ lang, payload }: { lang: Lang; payload: any }) {
  const titleLine1 = t(lang, payload.titleLine1_en, payload.titleLine1_zh, "");
  const titleLine2 = t(lang, payload.titleLine2_en, payload.titleLine2_zh, "");
  const subtitle = t(lang, payload.subtitle_en, payload.subtitle_zh, "");
  const primaryLabel = t(lang, payload.primaryLabel_en, payload.primaryLabel_zh, "");
  const secondaryLabel = t(lang, payload.secondaryLabel_en, payload.secondaryLabel_zh, "");

  return (
    <section className="grid gap-12 md:grid-cols-2 md:items-center">
      <div className="text-left">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
          {titleLine1}
          {titleLine2 && (
            <span className="block text-zinc-500 mt-2">{titleLine2}</span>
          )}
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonPrimary label={primaryLabel} />
          <ButtonSecondary label={secondaryLabel} />
        </div>
      </div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 md:aspect-[4/3]">
        <Image src={payload.imageUrl} alt="Hero" fill className="object-cover" />
      </div>
    </section>
  );
}

function HeroBoldLeft({ lang, payload }: { lang: Lang; payload: any }) {
  const titleLine1 = t(lang, payload.titleLine1_en, payload.titleLine1_zh, "");
  const titleLine2 = t(lang, payload.titleLine2_en, payload.titleLine2_zh, "");
  const subtitle = t(lang, payload.subtitle_en, payload.subtitle_zh, "");
  const primaryLabel = t(lang, payload.primaryLabel_en, payload.primaryLabel_zh, "");
  const secondaryLabel = t(lang, payload.secondaryLabel_en, payload.secondaryLabel_zh, "");

  return (
    <section className="flex flex-col gap-10">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tighter text-zinc-900 md:text-7xl">
          {titleLine1}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500">
            {titleLine2}
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-xl text-zinc-600">
          {subtitle}
        </p>
        <div className="mt-8 flex gap-4">
          <ButtonPrimary label={primaryLabel} />
          <ButtonSecondary label={secondaryLabel} />
        </div>
      </div>
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-zinc-100">
        <Image src={payload.imageUrl} alt="Hero" fill className="object-cover" />
      </div>
    </section>
  );
}

function HeroOverlay({ lang, payload }: { lang: Lang; payload: any }) {
  const titleLine1 = t(lang, payload.titleLine1_en, payload.titleLine1_zh, "");
  const titleLine2 = t(lang, payload.titleLine2_en, payload.titleLine2_zh, "");
  const subtitle = t(lang, payload.subtitle_en, payload.subtitle_zh, "");
  const primaryLabel = t(lang, payload.primaryLabel_en, payload.primaryLabel_zh, "");
  const secondaryLabel = t(lang, payload.secondaryLabel_en, payload.secondaryLabel_zh, "");

  return (
    <section className="relative h-[600px] w-full overflow-hidden rounded-xl bg-zinc-900 text-white">
      <Image 
        src={payload.imageUrl} 
        alt="Hero" 
        fill 
        className="object-cover opacity-60" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl text-white drop-shadow-lg">
          {titleLine1}
          {titleLine2 && <span className="block mt-2">{titleLine2}</span>}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-200 drop-shadow-md">
          {subtitle}
        </p>
        <div className="mt-10 flex gap-4">
          <button className="rounded-full bg-white px-8 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-100 transition-colors">
            {primaryLabel}
          </button>
          <button className="rounded-full border-2 border-white px-8 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors">
            {secondaryLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

// UI Helpers
function ButtonPrimary({ label }: { label: string }) {
  if (!label) return null;
  return (
    <button className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-all hover:scale-105">
      {label}
    </button>
  );
}

function ButtonSecondary({ label }: { label: string }) {
  if (!label) return null;
  return (
    <button className="rounded-full border-2 border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition-all hover:scale-105">
      {label}
    </button>
  );
}
