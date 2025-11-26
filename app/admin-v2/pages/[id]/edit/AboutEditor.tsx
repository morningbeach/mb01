"use client";
import { useState } from "react";
import { TranslateButton } from "../../components/TranslateButton";

export function AboutEditor({ pageId, pageData }: any) {
  const initialData = pageData || {
    story_zh: "", story_en: "", storyImage: "/cdn/about/studio.jpg",
    values: [
      { title_zh: "清晰", title_en: "Clarity", body_zh: "", body_en: "" },
      { title_zh: "一致性", title_en: "Consistency", body_zh: "", body_en: "" },
      { title_zh: "可靠", title_en: "Reliability", body_zh: "", body_en: "" }
    ],
    stats: [
      { label_zh: "包裝年限", label_en: "Years in packaging", value: "10+" },
      { label_zh: "年度專案", label_en: "Projects per year", value: "100+" },
      { label_zh: "服務區域", label_en: "Regions served", value: "Asia / EU / US" }
    ],
    experienceTitle_zh: "經驗列表", experienceTitle_en: "Experience in gifting",
    experience_zh: " 節慶禮品盒專案\n 會員及VIP贈禮計畫", experience_en: " Seasonal gift sets\n VIP gifting programs"
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
      <div className="rounded-xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-lg font-semibold">品牌故事</h2>
        <div className="mb-4"><label className="mb-2 block text-sm">圖片URL</label><input type="text" value={formData.storyImage} onChange={(e)=>setFormData({...formData,storyImage:e.target.value})} className="w-full rounded border px-3 py-2 text-sm" /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="mb-2 block text-sm">故事（中）</label><textarea name="story_zh" value={formData.story_zh} onChange={(e)=>setFormData({...formData,story_zh:e.target.value})} rows={10} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-2 flex justify-between text-sm"><span>故事（英）</span><TranslateButton sourceField="story_zh" targetField="story_en" /></label><textarea name="story_en" value={formData.story_en} onChange={(e)=>setFormData({...formData,story_en:e.target.value})} rows={10} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
      </div>
      
      <div className="rounded-xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-lg font-semibold">核心價值（3個）</h2>
        {formData.values.map((v:any, i:number) => (
          <div key={i} className="mb-4 rounded border p-3"><h3 className="mb-2 text-sm font-medium">價值 {i+1}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div><label className="mb-1 block text-xs">標題（中）</label><input value={v.title_zh} onChange={(e)=>{const n=[...formData.values];n[i]={...n[i],title_zh:e.target.value};setFormData({...formData,values:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
              <div><label className="mb-1 block text-xs">標題（英）</label><input value={v.title_en} onChange={(e)=>{const n=[...formData.values];n[i]={...n[i],title_en:e.target.value};setFormData({...formData,values:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
              <div><label className="mb-1 block text-xs">說明（中）</label><textarea value={v.body_zh} onChange={(e)=>{const n=[...formData.values];n[i]={...n[i],body_zh:e.target.value};setFormData({...formData,values:n})}} rows={2} className="w-full rounded border px-2 py-1 text-sm" /></div>
              <div><label className="mb-1 block text-xs">說明（英）</label><textarea value={v.body_en} onChange={(e)=>{const n=[...formData.values];n[i]={...n[i],body_en:e.target.value};setFormData({...formData,values:n})}} rows={2} className="w-full rounded border px-2 py-1 text-sm" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-lg font-semibold">數據（3個）</h2>
        {formData.stats.map((s:any, i:number) => (
          <div key={i} className="mb-3 grid gap-3 rounded border p-3 md:grid-cols-3">
            <div><label className="mb-1 block text-xs">標籤（中）</label><input value={s.label_zh} onChange={(e)=>{const n=[...formData.stats];n[i]={...n[i],label_zh:e.target.value};setFormData({...formData,stats:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
            <div><label className="mb-1 block text-xs">標籤（英）</label><input value={s.label_en} onChange={(e)=>{const n=[...formData.stats];n[i]={...n[i],label_en:e.target.value};setFormData({...formData,stats:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
            <div><label className="mb-1 block text-xs">數值</label><input value={s.value} onChange={(e)=>{const n=[...formData.stats];n[i]={...n[i],value:e.target.value};setFormData({...formData,stats:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-lg font-semibold">經驗列表</h2>
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div><label className="mb-2 block text-sm">標題（中）</label><input value={formData.experienceTitle_zh} onChange={(e)=>setFormData({...formData,experienceTitle_zh:e.target.value})} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-2 block text-sm">標題（英）</label><input value={formData.experienceTitle_en} onChange={(e)=>setFormData({...formData,experienceTitle_en:e.target.value})} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="mb-2 block text-sm">列表（中）</label><textarea name="experience_zh" value={formData.experience_zh} onChange={(e)=>setFormData({...formData,experience_zh:e.target.value})} rows={5} className="w-full rounded border px-3 py-2 text-sm" /><p className="mt-1 text-xs text-zinc-500">每行一項，以開頭</p></div>
          <div><label className="mb-2 flex justify-between text-sm"><span>列表（英）</span><TranslateButton sourceField="experience_zh" targetField="experience_en" /></label><textarea name="experience_en" value={formData.experience_en} onChange={(e)=>setFormData({...formData,experience_en:e.target.value})} rows={5} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
      </div>

      <div className="flex justify-end"><button type="submit" disabled={saving} className="rounded bg-black px-6 py-2 text-sm text-white">{saving?"儲存中...":"儲存內容"}</button></div>
    </form>
  );
}