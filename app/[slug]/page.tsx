// app/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "../../components/SiteShell";
import { useLanguage } from "../contexts/LanguageContext";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function DynamicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { lang } = useLanguage();
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pages/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setPageData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <SiteShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 mx-auto"></div>
            <p className="text-sm text-zinc-600">載入中...</p>
          </div>
        </div>
      </SiteShell>
    );
  }

  if (!pageData) {
    return (
      <SiteShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-zinc-900">404</h1>
            <p className="text-zinc-600">找不到此頁面</p>
          </div>
        </div>
      </SiteShell>
    );
  }

  const data = pageData.pageData || {};
  const type = pageData.type;

  // 根據頁面類型渲染不同內容
  if (type === "ABOUT") {
    return <AboutPageContent pageData={pageData} lang={lang} data={data} />;
  } else if (type === "FACTORY") {
    return <FactoryPageContent pageData={pageData} lang={lang} data={data} />;
  } else if (type === "CONTACT") {
    return <ContactPageContent pageData={pageData} lang={lang} data={data} />;
  } else {
    return <CustomPageContent pageData={pageData} lang={lang} data={data} />;
  }
}

// About 頁面內容組件
function AboutPageContent({ pageData, lang, data }: any) {
  const hero = {
    label: lang === "zh" ? pageData.label_zh : pageData.label_en,
    title: lang === "zh" ? pageData.title_zh : pageData.title_en,
    desc: lang === "zh" ? pageData.desc_zh : pageData.desc_en,
  };

  const story = {
    paragraphs:
      lang === "zh"
        ? (data.story_zh || "").split("\n\n")
        : (data.story_en || "").split("\n\n"),
    image: data.storyImage || "/cdn/about/studio.jpg",
  };

  const values = data.values || [];
  const stats = data.stats || [];
  const experience = {
    title:
      lang === "zh"
        ? data.experienceTitle_zh || "經驗"
        : data.experienceTitle_en || "Experience",
    items:
      lang === "zh"
        ? (data.experience_zh || "").split("\n")
        : (data.experience_en || "").split("\n"),
  };

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-16 text-center">
          {hero.label && (
            <p className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-600">
              {hero.label}
            </p>
          )}
          {hero.title && (
            <h1 className="mb-6 text-4xl font-bold text-zinc-900 sm:text-5xl">
              {hero.title}
            </h1>
          )}
          {hero.desc && (
            <p className="mx-auto max-w-3xl text-lg text-zinc-600">
              {hero.desc}
            </p>
          )}
        </div>

        {/* Story */}
        {story.paragraphs.length > 0 && (
          <div className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              {story.paragraphs.map((p: string, i: number) => (
                <p key={i} className="text-zinc-700 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
            {story.image && (
              <div className="relative h-96 overflow-hidden rounded-2xl">
                <Image
                  src={story.image}
                  alt="Story"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Values */}
        {values.length > 0 && (
          <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v: any, i: number) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6">
                <h3 className="mb-3 text-xl font-bold text-zinc-900">
                  {lang === "zh" ? v.title_zh : v.title_en}
                </h3>
                <p className="text-zinc-600">
                  {lang === "zh" ? v.body_zh : v.body_en}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <div className="mb-16 grid gap-8 sm:grid-cols-3">
            {stats.map((s: any, i: number) => (
              <div key={i} className="text-center">
                <p className="mb-2 text-4xl font-bold text-zinc-900">{s.value}</p>
                <p className="text-sm text-zinc-600">
                  {lang === "zh" ? s.label_zh : s.label_en}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {experience.items.length > 0 && (
          <div className="rounded-2xl bg-zinc-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-zinc-900">
              {experience.title}
            </h2>
            <ul className="space-y-2">
              {experience.items.map((item: string, i: number) => (
                <li key={i} className="text-zinc-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </SiteShell>
  );
}

// Factory 頁面內容組件
function FactoryPageContent({ pageData, lang, data }: any) {
  const hero = {
    label: lang === "zh" ? pageData.label_zh : pageData.label_en,
    title: lang === "zh" ? pageData.title_zh : pageData.title_en,
    desc: lang === "zh" ? pageData.desc_zh : pageData.desc_en,
  };

  const stats = data.stats || [];
  const images = data.images || [];
  const equipment = lang === "zh" ? data.equipment_zh : data.equipment_en;
  const qc = lang === "zh" ? data.qc_zh : data.qc_en;
  const workflow = data.workflow || [];
  const workflowTitle =
    lang === "zh" ? data.workflowTitle_zh : data.workflowTitle_en;
  const cta = {
    title: lang === "zh" ? data.ctaTitle_zh : data.ctaTitle_en,
    desc: lang === "zh" ? data.ctaDesc_zh : data.ctaDesc_en,
  };

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-16 text-center">
          {hero.label && (
            <p className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-600">
              {hero.label}
            </p>
          )}
          {hero.title && (
            <h1 className="mb-6 text-4xl font-bold text-zinc-900 sm:text-5xl">
              {hero.title}
            </h1>
          )}
          {hero.desc && (
            <p className="mx-auto max-w-3xl text-lg text-zinc-600">
              {hero.desc}
            </p>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s: any, i: number) => (
              <div key={i} className="text-center">
                <p className="mb-2 text-4xl font-bold text-zinc-900">{s.value}</p>
                <p className="text-sm text-zinc-600">
                  {lang === "zh" ? s.label_zh : s.label_en}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img: any, i: number) => (
              <div key={i} className="relative">
                <div className="relative h-64 overflow-hidden rounded-xl">
                  <Image
                    src={img.url || "/cdn/placeholder.jpg"}
                    alt={
                      lang === "zh"
                        ? img.caption_zh || "工廠圖片"
                        : img.caption_en || "Factory image"
                    }
                    fill
                    className="object-cover"
                  />
                </div>
                {(img.caption_zh || img.caption_en) && (
                  <p className="mt-2 text-sm text-zinc-600">
                    {lang === "zh" ? img.caption_zh : img.caption_en}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Equipment & QC */}
        <div className="mb-16 grid gap-8 lg:grid-cols-2">
          {equipment && (
            <div className="rounded-xl border border-zinc-200 bg-white p-8">
              <h2 className="mb-4 text-2xl font-bold text-zinc-900">
                {lang === "zh" ? "設備" : "Equipment"}
              </h2>
              <p className="whitespace-pre-line text-zinc-700">{equipment}</p>
            </div>
          )}
          {qc && (
            <div className="rounded-xl border border-zinc-200 bg-white p-8">
              <h2 className="mb-4 text-2xl font-bold text-zinc-900">
                {lang === "zh" ? "品質控制" : "Quality Control"}
              </h2>
              <p className="whitespace-pre-line text-zinc-700">{qc}</p>
            </div>
          )}
        </div>

        {/* Workflow */}
        {workflow.length > 0 && (
          <div className="mb-16">
            {workflowTitle && (
              <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900">
                {workflowTitle}
              </h2>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {workflow.map((step: any, i: number) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-200 bg-white p-6 text-center"
                >
                  <div className="mb-4 text-4xl font-bold text-zinc-900">
                    {i + 1}
                  </div>
                  <h3 className="mb-2 font-bold text-zinc-900">
                    {lang === "zh" ? step.title_zh : step.title_en}
                  </h3>
                  <p className="text-sm text-zinc-600">
                    {lang === "zh" ? step.desc_zh : step.desc_en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {(cta.title || cta.desc) && (
          <div className="rounded-2xl bg-zinc-900 p-12 text-center text-white">
            {cta.title && <h2 className="mb-4 text-3xl font-bold">{cta.title}</h2>}
            {cta.desc && <p className="mb-8 text-zinc-300">{cta.desc}</p>}
            <a
              href="/contact"
              className="inline-block rounded-lg bg-white px-8 py-3 font-medium text-zinc-900 hover:bg-zinc-100"
            >
              {lang === "zh" ? "聯絡我們" : "Contact Us"}
            </a>
          </div>
        )}
      </main>
    </SiteShell>
  );
}

// Contact 頁面內容組件
function ContactPageContent({ pageData, lang, data }: any) {
  const hero = {
    label: lang === "zh" ? pageData.label_zh : pageData.label_en,
    title: lang === "zh" ? pageData.title_zh : pageData.title_en,
    desc: lang === "zh" ? pageData.desc_zh : pageData.desc_en,
  };

  const formLabels = data.formLabels || {};
  const contactDetails = data.contactDetails || {};
  const officeInfo = data.officeInfo || {};
  const businessHours = data.businessHours || {};

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-16 text-center">
          {hero.label && (
            <p className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-600">
              {hero.label}
            </p>
          )}
          {hero.title && (
            <h1 className="mb-6 text-4xl font-bold text-zinc-900 sm:text-5xl">
              {hero.title}
            </h1>
          )}
          {hero.desc && (
            <p className="mx-auto max-w-3xl text-lg text-zinc-600">
              {hero.desc}
            </p>
          )}
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-xl border border-zinc-200 bg-white p-8">
            <form className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900">
                  {lang === "zh" ? formLabels.name_zh : formLabels.name_en}
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900">
                  {lang === "zh" ? formLabels.email_zh : formLabels.email_en}
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900">
                  {lang === "zh" ? formLabels.company_zh : formLabels.company_en}
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900">
                  {lang === "zh" ? formLabels.message_zh : formLabels.message_en}
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800"
              >
                {lang === "zh" ? formLabels.submit_zh : formLabels.submit_en}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Contact Details */}
            {contactDetails.title && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-zinc-900">
                  {lang === "zh"
                    ? contactDetails.title_zh
                    : contactDetails.title_en}
                </h2>
                <div className="space-y-3">
                  {contactDetails.email && (
                    <p className="text-zinc-700">
                      <span className="font-medium">Email:</span>{" "}
                      {contactDetails.email}
                    </p>
                  )}
                  {contactDetails.whatsapp && (
                    <p className="text-zinc-700">
                      <span className="font-medium">WhatsApp:</span>{" "}
                      {contactDetails.whatsapp}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Office Info */}
            {officeInfo.title && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-zinc-900">
                  {lang === "zh" ? officeInfo.title_zh : officeInfo.title_en}
                </h2>
                <p className="mb-2 text-zinc-700">
                  {lang === "zh" ? officeInfo.address_zh : officeInfo.address_en}
                </p>
                {officeInfo.note && (
                  <p className="text-sm text-zinc-600">
                    {lang === "zh" ? officeInfo.note_zh : officeInfo.note_en}
                  </p>
                )}
              </div>
            )}

            {/* Business Hours */}
            {businessHours.title && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-zinc-900">
                  {lang === "zh"
                    ? businessHours.title_zh
                    : businessHours.title_en}
                </h2>
                <p className="mb-2 text-zinc-700">
                  {lang === "zh" ? businessHours.hours_zh : businessHours.hours_en}
                </p>
                {businessHours.note && (
                  <p className="text-sm text-zinc-600">
                    {lang === "zh" ? businessHours.note_zh : businessHours.note_en}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </SiteShell>
  );
}

// 自訂頁面內容組件（使用 Homepage Section 系統）
function CustomPageContent({ pageData, lang, data }: any) {
  const hero = {
    label: lang === "zh" ? pageData.label_zh : pageData.label_en,
    title: lang === "zh" ? pageData.title_zh : pageData.title_en,
    desc: lang === "zh" ? pageData.desc_zh : pageData.desc_en,
  };

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          {hero.label && (
            <p className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-600">
              {hero.label}
            </p>
          )}
          {hero.title && (
            <h1 className="mb-6 text-4xl font-bold text-zinc-900 sm:text-5xl">
              {hero.title}
            </h1>
          )}
          {hero.desc && (
            <p className="mx-auto max-w-3xl text-lg text-zinc-600">
              {hero.desc}
            </p>
          )}
        </div>

        <div className="prose prose-zinc mx-auto max-w-4xl">
          <p className="text-zinc-600">
            {lang === "zh"
              ? "此頁面使用 Homepage Section 系統。請到後台編輯頁面內容。"
              : "This page uses the Homepage Section system. Please edit content in the admin panel."}
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
