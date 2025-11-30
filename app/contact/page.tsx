"use client";

import { SiteShell } from "../../components/SiteShell";
import { useLanguage } from "../contexts/LanguageContext";
import { useEffect, useState } from "react";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  const { lang } = useLanguage();
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/pages/contact")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setPageData(data))
      .catch(() => {});
  }, []);

  const data = pageData?.pageData || {};

  const hero = {
    label: lang === "zh" ? (pageData?.label_zh || "聯絡我們") : (pageData?.label_en || "Get in touch"),
    title: lang === "zh" ? (pageData?.title_zh || "讓我們討論您的包裝需求") : (pageData?.title_en || "Let's discuss your packaging needs"),
    desc: lang === "zh" ? (pageData?.desc_zh || "向我們發送簡短的問題或專案需求，我們將盡快回覆。") : (pageData?.desc_en || "Send us a brief or a question about your project. We will reply within one business day."),
  };

  const formLabels = {
    name: lang === "zh" ? (data.formLabels?.name_zh || "姓名") : (data.formLabels?.name_en || "Name"),
    email: lang === "zh" ? (data.formLabels?.email_zh || "電子郵件") : (data.formLabels?.email_en || "Email"),
    company: lang === "zh" ? (data.formLabels?.company_zh || "公司") : (data.formLabels?.company_en || "Company"),
    quantity: lang === "zh" ? (data.formLabels?.quantity_zh || "數量") : (data.formLabels?.quantity_en || "Quantity"),
    timeline: lang === "zh" ? (data.formLabels?.timeline_zh || "時間表") : (data.formLabels?.timeline_en || "Timeline"),
    details: lang === "zh" ? (data.formLabels?.details_zh || "專案詳情") : (data.formLabels?.details_en || "Project details"),
    submit: lang === "zh" ? (data.formLabels?.submit_zh || "提交") : (data.formLabels?.submit_en || "Submit"),
    emailNote: lang === "zh" ? (data.formLabels?.emailNote_zh || "或直接發送電子郵件至 info@mbpackaging.com") : (data.formLabels?.emailNote_en || "Or email us directly at info@mbpackaging.com"),
  };

  const contactDetails = {
    title: lang === "zh" ? (data.contactDetails?.title_zh || "聯絡資訊") : (data.contactDetails?.title_en || "Contact details"),
    email: data.contactDetails?.email || "info@mbpackaging.com",
    whatsapp: data.contactDetails?.whatsapp || "+86 138 xxxx xxxx",
  };

  const officeInfo = {
    title: lang === "zh" ? (data.officeInfo?.title_zh || "辦公地址") : (data.officeInfo?.title_en || "Office location"),
    address: lang === "zh" ? (data.officeInfo?.address_zh || "中國深圳市寶安區") : (data.officeInfo?.address_en || "Bao'an District, Shenzhen, China"),
    note: lang === "zh" ? (data.officeInfo?.note_zh || "（僅限預約訪問）") : (data.officeInfo?.note_en || "(By appointment only)"),
  };

  const businessHours = {
    title: lang === "zh" ? (data.businessHours?.title_zh || "營業時間") : (data.businessHours?.title_en || "Business hours"),
    hours: lang === "zh" ? (data.businessHours?.hours_zh || "週一至週五，上午 9:00 至下午 6:00（中國標準時間）") : (data.businessHours?.hours_en || "Mon–Fri, 9:00 AM – 6:00 PM (CST)"),
    note: lang === "zh" ? (data.businessHours?.note_zh || "我們通常在 24 小時內回覆。") : (data.businessHours?.note_en || "We typically reply within 24 hours."),
  };

  return (
    <SiteShell>
      {/* HERO */}
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          {hero.label}
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {hero.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
          {hero.desc}
        </p>
      </section>

      {/* CONTACT INFO + FORM */}
      <section className="mx-auto mt-12 grid max-w-4xl gap-12 md:grid-cols-2">
        {/* Contact Details */}
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {contactDetails.title}
            </h2>
            <div className="mt-3 space-y-2 text-[15px] text-zinc-600">
              <p>{contactDetails.email}</p>
              <p>{contactDetails.whatsapp}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {officeInfo.title}
            </h2>
            <div className="mt-3 text-[15px] text-zinc-600">
              <p>{officeInfo.address}</p>
              <p className="mt-1 text-xs text-zinc-500">{officeInfo.note}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {businessHours.title}
            </h2>
            <div className="mt-3 text-[15px] text-zinc-600">
              <p>{businessHours.hours}</p>
              <p className="mt-1 text-xs text-zinc-500">{businessHours.note}</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <ContactForm variant="full" source="contact-page" />
        </div>
      </section>
    </SiteShell>
  );
}
