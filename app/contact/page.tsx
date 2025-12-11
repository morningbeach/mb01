"use client";

import { SiteShell } from "../../components/SiteShell";
import { useLanguage } from "../contexts/LanguageContext";
import { useEffect, useState } from "react";
import ContactForm from "./ContactForm";

// 固定的聯絡資訊（與 Footer 同步）
const CONTACT_INFO = {
  companyInfo: {
    taiwan: {
      name: "明日島嶼有限公司",
      nameEn: "Morning Beach Co., Ltd.",
      taxId: "89188386"
    },
    china: {
      name: "深圳天文印刷包装有限公司",
      nameEn: "Sky Word Printing Packaging Co Ltd"
    }
  },
  addresses: {
    taiwan: "台灣高雄市左營區立大路377巷6弄3號 (來訪請先預約)",
    taiwanEn: "No. 3, Aly. 6, Ln. 377, Lida Rd., Zuoying Dist., Kaohsiung City, Taiwan (By appointment only)",
    china: "广东省深圳市龙岗区平湖镇峨公岭湖田路16号盈冠工业园1栋3楼",
    chinaEn: "3F, Building 1, Yingguan Industrial Park, No.16 Hutian Road, Egongling, Pinghu Town, Longgang District, Shenzhen, Guangdong, China"
  },
  phones: [
    { label: "Taiwan", number: "+886-7-345-0928", tel: "+88673450928" },
    { label: "Mobile", number: "+886-963-581-855", tel: "+886963581855" },
    { label: "China", number: "+86-199-2872-496", tel: "+861992872496" }
  ],
  email: "morningbeachtw@gmail.com"
};

export default function ContactPage() {
  const { lang } = useLanguage();
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/pages/contact")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setPageData(data))
      .catch(() => {});
  }, []);

  const hero = {
    label: lang === "zh" ? (pageData?.label_zh || "聯絡我們") : (pageData?.label_en || "Get in touch"),
    title: lang === "zh" ? (pageData?.title_zh || "讓我們討論您的包裝需求") : (pageData?.title_en || "Let's discuss your packaging needs"),
    desc: lang === "zh" ? (pageData?.desc_zh || "向我們發送簡短的問題或專案需求，我們將盡快回覆。") : (pageData?.desc_en || "Send us a brief or a question about your project. We will reply within one business day."),
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
      <section className="mx-auto mt-12 grid max-w-5xl gap-12 md:grid-cols-2">
        {/* Contact Details */}
        <div className="space-y-8">
          {/* 公司資訊 */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {lang === "zh" ? "公司資訊" : "Company Info"}
            </h2>
            <div className="mt-3 space-y-3 text-[15px] text-zinc-600">
              <div>
                <p className="font-medium text-zinc-800">{lang === "zh" ? "台灣" : "Taiwan"}</p>
                <p>{lang === "zh" ? CONTACT_INFO.companyInfo.taiwan.name : CONTACT_INFO.companyInfo.taiwan.nameEn}</p>
                <p className="text-sm text-zinc-500">{lang === "zh" ? "統編" : "Tax ID"}｜{CONTACT_INFO.companyInfo.taiwan.taxId}</p>
              </div>
              <div>
                <p className="font-medium text-zinc-800">{lang === "zh" ? "中國" : "China"}</p>
                <p>{lang === "zh" ? CONTACT_INFO.companyInfo.china.name : CONTACT_INFO.companyInfo.china.nameEn}</p>
              </div>
            </div>
          </div>

          {/* 地址 */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {lang === "zh" ? "地址" : "Office Location"}
            </h2>
            <div className="mt-3 space-y-3 text-[15px] text-zinc-600">
              <div>
                <p className="font-medium text-zinc-800">{lang === "zh" ? "台灣" : "Taiwan"}</p>
                <p className="leading-relaxed">{lang === "zh" ? CONTACT_INFO.addresses.taiwan : CONTACT_INFO.addresses.taiwanEn}</p>
              </div>
              <div>
                <p className="font-medium text-zinc-800">{lang === "zh" ? "中國" : "China"}</p>
                <p className="leading-relaxed">{lang === "zh" ? CONTACT_INFO.addresses.china : CONTACT_INFO.addresses.chinaEn}</p>
              </div>
            </div>
          </div>

          {/* 聯絡方式 */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {lang === "zh" ? "聯絡方式" : "Contact"}
            </h2>
            <div className="mt-3 space-y-2 text-[15px] text-zinc-600">
              <p className="font-medium text-zinc-800">Phone / WhatsApp / LINE</p>
              {CONTACT_INFO.phones.map((phone, idx) => (
                <p key={idx}>
                  <span className="text-zinc-500 text-sm">{phone.label}: </span>
                  <a href={`tel:${phone.tel}`} className="hover:text-indigo-600 transition-colors">
                    {phone.number}
                  </a>
                </p>
              ))}
              <div className="pt-2">
                <p className="font-medium text-zinc-800">{lang === "zh" ? "信箱" : "Email"}</p>
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-indigo-600 transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>
          </div>

          {/* 營業時間 */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {lang === "zh" ? "營業時間" : "Business Hours"}
            </h2>
            <div className="mt-3 text-[15px] text-zinc-600">
              <p>{lang === "zh" ? "週一至週五，上午 9:00 至下午 6:00" : "Mon–Fri, 9:00 AM – 6:00 PM"}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {lang === "zh" ? "我們通常在 24 小時內回覆。" : "We typically reply within 24 hours."}
              </p>
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
