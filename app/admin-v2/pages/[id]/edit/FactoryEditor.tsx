"use client";
import { useState } from "react";
import { TranslateButton } from "../../components/TranslateButton";

export function FactoryEditor({ pageId, pageData }: any) {
  const initialData = pageData || {
    stats: [
      { label_zh: "廠房面積", label_en: "Factory area", value: "10,000 m²" },
      { label_zh: "員工人數", label_en: "People", value: "120+" },
      { label_zh: "月產能", label_en: "Monthly capacity", value: "300,000+ boxes" },
      { label_zh: "認證", label_en: "Certifications", value: "ISO / audited" }
    ],
    images: [
      { url: "/cdn/factory/floor.jpg", caption_zh: "整潔的生產車間", caption_en: "Clean production floor" },
      { url: "/cdn/factory/machines.jpg", caption_zh: "印刷和模切設備", caption_en: "Printing equipment" },
      { url: "/cdn/factory/qc.jpg", caption_zh: "品控檢查區域", caption_en: "QC area" }
    ],
    equipment_zh: "・ 4色和5色膠印機\n・ 自動和半自動精裝盒生產線\n・ 模切和壓痕機\n・ 燙金和壓凸設備\n・ 覆膜和表面處理線",
    equipment_en: "・ 4-color and 5-color offset printing\n・ Automatic rigid box lines\n・ Die-cutting machines\n・ Hot stamping equipment\n・ Lamination lines",
    qc_zh: "・ 內部結構工程師進行設計和測試\n・ 量產前打樣和審批\n・ 生產過程中的檢查\n・ 出貨前最終檢驗",
    qc_en: "・ In-house structural engineers\n・ Pre-production sampling\n・ In-process checks\n・ Final inspection before shipping",
    workflowTitle_zh: "從需求到出貨",
    workflowTitle_en: "From brief to shipment",
    workflow: [
      { step: "01", title_zh: "工程", title_en: "Engineering", body_zh: "確認結構、材料和關鍵公差", body_en: "Confirm structure and materials" },
      { step: "02", title_zh: "打樣", title_en: "Sampling", body_zh: "白樣和印刷樣品審批", body_en: "White and printed samples" },
      { step: "03", title_zh: "量產", title_en: "Mass production", body_zh: "關鍵階段的品控檢查", body_en: "Production with in-line QC" },
      { step: "04", title_zh: "包裝出貨", title_en: "Packing & shipping", body_zh: "最終檢驗和出貨安排", body_en: "Final QC and shipping" }
    ],
    ctaTitle_zh: "想要查看更多工廠資訊？",
    ctaTitle_en: "Want to audit our factory?",
    ctaDesc_zh: "我們可以分享更多設備、流程和審計報告的資訊",
    ctaDesc_en: "We can share more information on equipment and processes"
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
      <div className="rounded-xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-lg font-semibold">數據統計（4個）</h2>
        {formData.stats.map((s:any, i:number) => (
          <div key={i} className="mb-3 grid gap-3 rounded border p-3 md:grid-cols-3">
            <div><label className="mb-1 block text-xs">標籤（中）</label><input value={s.label_zh} onChange={(e)=>{const n=[...formData.stats];n[i]={...n[i],label_zh:e.target.value};setFormData({...formData,stats:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
            <div><label className="mb-1 block text-xs">標籤（英）</label><input value={s.label_en} onChange={(e)=>{const n=[...formData.stats];n[i]={...n[i],label_en:e.target.value};setFormData({...formData,stats:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
            <div><label className="mb-1 block text-xs">數值</label><input value={s.value} onChange={(e)=>{const n=[...formData.stats];n[i]={...n[i],value:e.target.value};setFormData({...formData,stats:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-lg font-semibold">工廠圖片（3張）</h2>
        {formData.images.map((img:any, i:number) => (
          <div key={i} className="mb-4 rounded border p-3"><h3 className="mb-2 text-sm font-medium">圖片 {i+1}</h3>
            <div className="mb-3"><label className="mb-1 block text-xs">圖片 URL</label><input value={img.url} onChange={(e)=>{const n=[...formData.images];n[i]={...n[i],url:e.target.value};setFormData({...formData,images:n})}} className="w-full rounded border px-2 py-1 text-sm" placeholder="/cdn/factory/floor.jpg" /></div>
            <div className="grid gap-3 md:grid-cols-2">
              <div><label className="mb-1 block text-xs">說明（中）</label><input value={img.caption_zh} onChange={(e)=>{const n=[...formData.images];n[i]={...n[i],caption_zh:e.target.value};setFormData({...formData,images:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
              <div><label className="mb-1 block text-xs">說明（英）</label><input value={img.caption_en} onChange={(e)=>{const n=[...formData.images];n[i]={...n[i],caption_en:e.target.value};setFormData({...formData,images:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-lg font-semibold">設備能力</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="mb-2 block text-sm">設備列表（中）</label><textarea name="equipment_zh" value={formData.equipment_zh} onChange={(e)=>setFormData({...formData,equipment_zh:e.target.value})} rows={6} className="w-full rounded border px-3 py-2 text-sm" /><p className="mt-1 text-xs text-zinc-500">每行一項，以・開頭</p></div>
          <div><label className="mb-2 flex justify-between text-sm"><span>設備列表（英）</span><TranslateButton sourceField="equipment_zh" targetField="equipment_en" /></label><textarea name="equipment_en" value={formData.equipment_en} onChange={(e)=>setFormData({...formData,equipment_en:e.target.value})} rows={6} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-lg font-semibold">品質控制</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="mb-2 block text-sm">品控流程（中）</label><textarea name="qc_zh" value={formData.qc_zh} onChange={(e)=>setFormData({...formData,qc_zh:e.target.value})} rows={5} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-2 flex justify-between text-sm"><span>品控流程（英）</span><TranslateButton sourceField="qc_zh" targetField="qc_en" /></label><textarea name="qc_en" value={formData.qc_en} onChange={(e)=>setFormData({...formData,qc_en:e.target.value})} rows={5} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-lg font-semibold">工作流程（4步驟）</h2>
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div><label className="mb-2 block text-sm">區塊標題（中）</label><input value={formData.workflowTitle_zh} onChange={(e)=>setFormData({...formData,workflowTitle_zh:e.target.value})} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-2 block text-sm">區塊標題（英）</label><input value={formData.workflowTitle_en} onChange={(e)=>setFormData({...formData,workflowTitle_en:e.target.value})} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
        {formData.workflow.map((w:any, i:number) => (
          <div key={i} className="mb-3 rounded border p-3"><h3 className="mb-2 text-sm font-medium">步驟 {w.step}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div><label className="mb-1 block text-xs">標題（中）</label><input value={w.title_zh} onChange={(e)=>{const n=[...formData.workflow];n[i]={...n[i],title_zh:e.target.value};setFormData({...formData,workflow:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
              <div><label className="mb-1 block text-xs">標題（英）</label><input value={w.title_en} onChange={(e)=>{const n=[...formData.workflow];n[i]={...n[i],title_en:e.target.value};setFormData({...formData,workflow:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
              <div><label className="mb-1 block text-xs">說明（中）</label><input value={w.body_zh} onChange={(e)=>{const n=[...formData.workflow];n[i]={...n[i],body_zh:e.target.value};setFormData({...formData,workflow:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
              <div><label className="mb-1 block text-xs">說明（英）</label><input value={w.body_en} onChange={(e)=>{const n=[...formData.workflow];n[i]={...n[i],body_en:e.target.value};setFormData({...formData,workflow:n})}} className="w-full rounded border px-2 py-1 text-sm" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-lg font-semibold">CTA 區塊</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="mb-2 block text-sm">標題（中）</label><input value={formData.ctaTitle_zh} onChange={(e)=>setFormData({...formData,ctaTitle_zh:e.target.value})} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-2 block text-sm">標題（英）</label><input value={formData.ctaTitle_en} onChange={(e)=>setFormData({...formData,ctaTitle_en:e.target.value})} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-2 block text-sm">說明（中）</label><textarea value={formData.ctaDesc_zh} onChange={(e)=>setFormData({...formData,ctaDesc_zh:e.target.value})} rows={2} className="w-full rounded border px-3 py-2 text-sm" /></div>
          <div><label className="mb-2 block text-sm">說明（英）</label><textarea value={formData.ctaDesc_en} onChange={(e)=>setFormData({...formData,ctaDesc_en:e.target.value})} rows={2} className="w-full rounded border px-3 py-2 text-sm" /></div>
        </div>
      </div>

      <div className="flex justify-end"><button type="submit" disabled={saving} className="rounded bg-black px-6 py-2 text-sm text-white">{saving?"儲存中...":"儲存內容"}</button></div>
    </form>
  );
}
