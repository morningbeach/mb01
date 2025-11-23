"use client";

import { useLanguage } from "../contexts/LanguageContext";

export function ContactClient({ page }: { page: any }) {
  const { lang } = useLanguage();
  const data = page.pageData as any;

  return (
    <>
      {/* HERO */}
      <section className="text-center">
        {page[`label_${lang}` as keyof typeof page] && (
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            {page[`label_${lang}` as keyof typeof page] as string}
          </p>
        )}
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {page[`title_${lang}` as keyof typeof page] as string}
        </h1>
        {page[`desc_${lang}` as keyof typeof page] && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
            {page[`desc_${lang}` as keyof typeof page] as string}
          </p>
        )}
      </section>

      {/* CONTACT INFO + FORM */}
      <section className="mx-auto mt-12 grid max-w-4xl gap-12 md:grid-cols-2">
        {/* Contact Details */}
        <div className="space-y-8">
          {data?.contactDetails && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                {lang === "zh" ? data.contactDetails.title_zh : data.contactDetails.title_en || data.contactDetails.title_zh}
              </h2>
              <div className="mt-3 space-y-2 text-[15px] text-zinc-600">
                <p>{data.contactDetails.email}</p>
                <p>{data.contactDetails.whatsapp}</p>
              </div>
            </div>
          )}
          {data?.officeInfo && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                {lang === "zh" ? data.officeInfo.title_zh : data.officeInfo.title_en || data.officeInfo.title_zh}
              </h2>
              <div className="mt-3 text-[15px] text-zinc-600">
                <p>{lang === "zh" ? data.officeInfo.address_zh : data.officeInfo.address_en || data.officeInfo.address_zh}</p>
                {data.officeInfo.note_zh && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {lang === "zh" ? data.officeInfo.note_zh : data.officeInfo.note_en || data.officeInfo.note_zh}
                  </p>
                )}
              </div>
            </div>
          )}
          {data?.businessHours && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                {lang === "zh" ? data.businessHours.title_zh : data.businessHours.title_en || data.businessHours.title_zh}
              </h2>
              <div className="mt-3 text-[15px] text-zinc-600">
                <p>{lang === "zh" ? data.businessHours.hours_zh : data.businessHours.hours_en || data.businessHours.hours_zh}</p>
                {data.businessHours.note_zh && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {lang === "zh" ? data.businessHours.note_zh : data.businessHours.note_en || data.businessHours.note_zh}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div>
          <form className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            {data?.formLabels && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    {lang === "zh" ? data.formLabels.name_zh : data.formLabels.name_en || data.formLabels.name_zh}
                  </label>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-[15px] focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    {lang === "zh" ? data.formLabels.email_zh : data.formLabels.email_en || data.formLabels.email_zh}
                  </label>
                  <input
                    type="email"
                    className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-[15px] focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    {lang === "zh" ? data.formLabels.company_zh : data.formLabels.company_en || data.formLabels.company_zh}
                  </label>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-[15px] focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    {lang === "zh" ? data.formLabels.quantity_zh : data.formLabels.quantity_en || data.formLabels.quantity_zh}
                  </label>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-[15px] focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    {lang === "zh" ? data.formLabels.timeline_zh : data.formLabels.timeline_en || data.formLabels.timeline_zh}
                  </label>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-[15px] focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    {lang === "zh" ? data.formLabels.details_zh : data.formLabels.details_en || data.formLabels.details_zh}
                  </label>
                  <textarea
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-[15px] focus:border-black focus:outline-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  {lang === "zh" ? data.formLabels.submit_zh : data.formLabels.submit_en || data.formLabels.submit_zh}
                </button>
                {data.formLabels.emailNote_zh && (
                  <p className="text-xs text-zinc-500">
                    {lang === "zh" ? data.formLabels.emailNote_zh : data.formLabels.emailNote_en || data.formLabels.emailNote_zh}
                  </p>
                )}
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
