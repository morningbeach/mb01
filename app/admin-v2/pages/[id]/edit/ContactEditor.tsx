"use client";
import { useState } from "react";
import { TranslateButton } from "../../components/TranslateButton";

export function ContactEditor({ pageId, pageData }: any) {
  const initialData = pageData || {
    formLabels: {
      name_zh: "姓名", name_en: "Name",
      email_zh: "電子郵件", email_en: "Email",
      company_zh: "公司", company_en: "Company",
      quantity_zh: "預估數量", quantity_en: "Estimated quantity",
      timeline_zh: "時間表", timeline_en: "Timeline",
      details_zh: "專案詳情", details_en: "Project details",
      submit_zh: "發送訊息", submit_en: "Send message",
      emailNote_zh: "或直接發送郵件至", emailNote_en: "Or email us directly at"
    },
    contactDetails: {
      title_zh: "聯絡方式", title_en: "Contact details",
      email: "info@example.com",
      whatsapp: "+86 000 0000 000"
    },
    officeInfo: {
      title_zh: "辦公室與工廠", title_en: "Office & factory",
      address_zh: "地址第一行\n城市，省份，國家",
      address_en: "Address line 1\nCity, Province, Country",
      note_zh: "可安排工廠參觀或線上會議",
      note_en: "We can arrange factory visits or online calls"
    },
    businessHours: {
      title_zh: "營業時間", title_en: "Business hours",
      hours_zh: "週一至週五，9:00-18:00 (GMT+8)",
      hours_en: "Monday–Friday, 9:00–18:00 (GMT+8)",
      note_zh: "我們會在一個工作日內回覆",
      note_en: "We aim to respond within one working day"
    }
  };
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageData: formData }),
      });
      if (res.ok) { 
        alert("儲存成功！"); 
        // 如果有回調函數，調用它；否則重新載入
        if (typeof window !== 'undefined' && (window as any).__onPageSaved) {
          (window as any).__onPageSaved();
        } else {
          window.location.reload();
        }
      }
      else alert("儲存失敗");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">表單欄位標籤</h2>
        <div className="space-y-3">
          {[
            { key: "name", label: "姓名欄位" },
            { key: "email", label: "郵件欄位" },
            { key: "company", label: "公司欄位" },
            { key: "quantity", label: "數量欄位" },
            { key: "timeline", label: "時間欄位" },
            { key: "details", label: "詳情欄位" },
            { key: "submit", label: "提交按鈕" },
            { key: "emailNote", label: "郵件提示" }
          ].map(({ key, label }) => (
            <div key={key} className="grid gap-3 md:grid-cols-2">
              <div><label className="mb-1 block text-xs text-zinc-500">{label}（中）</label><input value={formData.formLabels[`${key}_zh`]} onChange={(e)=>setFormData({...formData,formLabels:{...formData.formLabels,[`${key}_zh`]:e.target.value}})} className="w-full rounded border px-2 py-1 text-sm" /></div>
              <div><label className="mb-1 block text-xs text-zinc-500">{label}（英）</label><input value={formData.formLabels[`${key}_en`]} onChange={(e)=>setFormData({...formData,formLabels:{...formData.formLabels,[`${key}_en`]:e.target.value}})} className="w-full rounded border px-2 py-1 text-sm" /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">聯絡方式區塊</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div><label className="mb-1 block text-sm">標題（中）</label><input value={formData.contactDetails.title_zh} onChange={(e)=>setFormData({...formData,contactDetails:{...formData.contactDetails,title_zh:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm">標題（英）</label><input value={formData.contactDetails.title_en} onChange={(e)=>setFormData({...formData,contactDetails:{...formData.contactDetails,title_en:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="mb-1 block text-sm">Email</label><input value={formData.contactDetails.email} onChange={(e)=>setFormData({...formData,contactDetails:{...formData.contactDetails,email:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm">WhatsApp</label><input value={formData.contactDetails.whatsapp} onChange={(e)=>setFormData({...formData,contactDetails:{...formData.contactDetails,whatsapp:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">辦公室與工廠區塊</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div><label className="mb-1 block text-sm">標題（中）</label><input value={formData.officeInfo.title_zh} onChange={(e)=>setFormData({...formData,officeInfo:{...formData.officeInfo,title_zh:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm">標題（英）</label><input value={formData.officeInfo.title_en} onChange={(e)=>setFormData({...formData,officeInfo:{...formData.officeInfo,title_en:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div><label className="mb-1 block text-sm">地址（中）</label><textarea value={formData.officeInfo.address_zh} onChange={(e)=>setFormData({...formData,officeInfo:{...formData.officeInfo,address_zh:e.target.value}})} rows={3} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm">地址（英）</label><textarea value={formData.officeInfo.address_en} onChange={(e)=>setFormData({...formData,officeInfo:{...formData.officeInfo,address_en:e.target.value}})} rows={3} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="mb-1 block text-sm">備註（中）</label><input value={formData.officeInfo.note_zh} onChange={(e)=>setFormData({...formData,officeInfo:{...formData.officeInfo,note_zh:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm">備註（英）</label><input value={formData.officeInfo.note_en} onChange={(e)=>setFormData({...formData,officeInfo:{...formData.officeInfo,note_en:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">營業時間區塊</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div><label className="mb-1 block text-sm">標題（中）</label><input value={formData.businessHours.title_zh} onChange={(e)=>setFormData({...formData,businessHours:{...formData.businessHours,title_zh:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm">標題（英）</label><input value={formData.businessHours.title_en} onChange={(e)=>setFormData({...formData,businessHours:{...formData.businessHours,title_en:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div><label className="mb-1 block text-sm">時間（中）</label><input value={formData.businessHours.hours_zh} onChange={(e)=>setFormData({...formData,businessHours:{...formData.businessHours,hours_zh:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm">時間（英）</label><input value={formData.businessHours.hours_en} onChange={(e)=>setFormData({...formData,businessHours:{...formData.businessHours,hours_en:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="mb-1 block text-sm">備註（中）</label><input value={formData.businessHours.note_zh} onChange={(e)=>setFormData({...formData,businessHours:{...formData.businessHours,note_zh:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm">備註（英）</label><input value={formData.businessHours.note_en} onChange={(e)=>setFormData({...formData,businessHours:{...formData.businessHours,note_en:e.target.value}})} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
      </div>

      <div className="flex justify-end"><button type="submit" disabled={saving} className="rounded bg-black px-6 py-2 text-sm text-white">{saving?"儲存中...":"儲存內容"}</button></div>
    </form>
  );
}
