// app/admin/pages/[id]/edit/ProcessEditor.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProcessStep {
  id: string;
  number: string;
  title_zh: string;
  title_en: string;
  desc_zh: string;
  desc_en: string;
  icon?: string;
  image?: string;
}

interface ProcessData {
  sectionTitle_zh: string;
  sectionTitle_en: string;
  sectionDesc_zh: string;
  sectionDesc_en: string;
  steps: ProcessStep[];
  ctaTitle_zh: string;
  ctaTitle_en: string;
  ctaButtonLabel_zh: string;
  ctaButtonLabel_en: string;
  ctaButtonUrl: string;
}

const defaultData: ProcessData = {
  sectionTitle_zh: "我們的流程",
  sectionTitle_en: "Our Process",
  sectionDesc_zh: "從概念到交付，我們提供完整的專案管理服務",
  sectionDesc_en: "From concept to delivery, we provide comprehensive project management services",
  steps: [
    {
      id: "1",
      number: "01",
      title_zh: "需求諮詢",
      title_en: "Consultation",
      desc_zh: "了解您的品牌需求、預算與時程",
      desc_en: "Understanding your brand needs, budget, and timeline",
      icon: "💬",
    },
    {
      id: "2",
      number: "02",
      title_zh: "設計打樣",
      title_en: "Design & Sample",
      desc_zh: "提供設計方案與實體打樣",
      desc_en: "Providing design proposals and physical samples",
      icon: "✏️",
    },
    {
      id: "3",
      number: "03",
      title_zh: "生產製造",
      title_en: "Production",
      desc_zh: "高品質量產與嚴格品管",
      desc_en: "High-quality mass production with strict QC",
      icon: "🏭",
    },
    {
      id: "4",
      number: "04",
      title_zh: "出貨交付",
      title_en: "Delivery",
      desc_zh: "準時交付與完善的售後服務",
      desc_en: "On-time delivery with comprehensive after-sales service",
      icon: "📦",
    },
  ],
  ctaTitle_zh: "準備開始您的專案？",
  ctaTitle_en: "Ready to start your project?",
  ctaButtonLabel_zh: "聯絡我們",
  ctaButtonLabel_en: "Contact Us",
  ctaButtonUrl: "/contact",
};

export function ProcessEditor({ pageId, pageData }: { pageId: string; pageData: any }) {
  const router = useRouter();
  const initialData: ProcessData = pageData || defaultData;
  const [formData, setFormData] = useState<ProcessData>(initialData);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);

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
        router.refresh();
      } else {
        alert("儲存失敗");
      }
    } finally {
      setSaving(false);
    }
  };

  const translateField = async (
    sourceField: string,
    targetField: string,
    sourceValue: string,
    stepIndex?: number
  ) => {
    if (!sourceValue.trim()) return;
    
    const fieldKey = stepIndex !== undefined ? `step_${stepIndex}_${sourceField}` : sourceField;
    setTranslating(fieldKey);
    
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceValue, from: "zh", to: "en" }),
      });
      
      if (res.ok) {
        const { translatedText } = await res.json();
        
        if (stepIndex !== undefined) {
          // 更新步驟中的欄位
          const newSteps = [...formData.steps];
          newSteps[stepIndex] = { ...newSteps[stepIndex], [targetField]: translatedText };
          setFormData({ ...formData, steps: newSteps });
        } else {
          // 更新頂層欄位
          setFormData({ ...formData, [targetField]: translatedText });
        }
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setTranslating(null);
    }
  };

  const addStep = () => {
    const newId = String(Date.now());
    const newNumber = String(formData.steps.length + 1).padStart(2, "0");
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          id: newId,
          number: newNumber,
          title_zh: "",
          title_en: "",
          desc_zh: "",
          desc_en: "",
          icon: "📌",
        },
      ],
    });
  };

  const removeStep = (index: number) => {
    if (!confirm("確定要刪除此步驟嗎？")) return;
    const newSteps = formData.steps.filter((_, i) => i !== index);
    // 重新編號
    const renumbered = newSteps.map((s, i) => ({
      ...s,
      number: String(i + 1).padStart(2, "0"),
    }));
    setFormData({ ...formData, steps: renumbered });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.steps.length) return;
    
    const newSteps = [...formData.steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    
    // 重新編號
    const renumbered = newSteps.map((s, i) => ({
      ...s,
      number: String(i + 1).padStart(2, "0"),
    }));
    setFormData({ ...formData, steps: renumbered });
  };

  const TranslateBtn = ({
    sourceField,
    targetField,
    sourceValue,
    stepIndex,
  }: {
    sourceField: string;
    targetField: string;
    sourceValue: string;
    stepIndex?: number;
  }) => {
    const fieldKey = stepIndex !== undefined ? `step_${stepIndex}_${sourceField}` : sourceField;
    const isLoading = translating === fieldKey;
    
    return (
      <button
        type="button"
        onClick={() => translateField(sourceField, targetField, sourceValue, stepIndex)}
        disabled={isLoading || !sourceValue.trim()}
        className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-200 disabled:opacity-50"
      >
        {isLoading ? "翻譯中..." : "AI 翻譯"}
      </button>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 區塊標題 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">區塊標題</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">標題（中）</label>
            <input
              type="text"
              value={formData.sectionTitle_zh}
              onChange={(e) => setFormData({ ...formData, sectionTitle_zh: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center text-sm font-medium">
              <span>標題（英）</span>
              <TranslateBtn
                sourceField="sectionTitle_zh"
                targetField="sectionTitle_en"
                sourceValue={formData.sectionTitle_zh}
              />
            </label>
            <input
              type="text"
              value={formData.sectionTitle_en}
              onChange={(e) => setFormData({ ...formData, sectionTitle_en: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">描述（中）</label>
            <textarea
              value={formData.sectionDesc_zh}
              onChange={(e) => setFormData({ ...formData, sectionDesc_zh: e.target.value })}
              rows={2}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center text-sm font-medium">
              <span>描述（英）</span>
              <TranslateBtn
                sourceField="sectionDesc_zh"
                targetField="sectionDesc_en"
                sourceValue={formData.sectionDesc_zh}
              />
            </label>
            <textarea
              value={formData.sectionDesc_en}
              onChange={(e) => setFormData({ ...formData, sectionDesc_en: e.target.value })}
              rows={2}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 流程步驟 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">流程步驟</h2>
          <button
            type="button"
            onClick={addStep}
            className="rounded bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
          >
            + 新增步驟
          </button>
        </div>

        <div className="space-y-4">
          {formData.steps.map((step, index) => (
            <div key={step.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                    {step.number}
                  </span>
                  <input
                    type="text"
                    value={step.icon || ""}
                    onChange={(e) => {
                      const newSteps = [...formData.steps];
                      newSteps[index] = { ...newSteps[index], icon: e.target.value };
                      setFormData({ ...formData, steps: newSteps });
                    }}
                    placeholder="圖示 emoji"
                    className="w-16 rounded border px-2 py-1 text-center text-lg"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveStep(index, "up")}
                    disabled={index === 0}
                    className="rounded border p-1 hover:bg-zinc-200 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, "down")}
                    disabled={index === formData.steps.length - 1}
                    className="rounded border p-1 hover:bg-zinc-200 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="rounded border border-red-300 p-1 text-red-600 hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium">標題（中）</label>
                  <input
                    type="text"
                    value={step.title_zh}
                    onChange={(e) => {
                      const newSteps = [...formData.steps];
                      newSteps[index] = { ...newSteps[index], title_zh: e.target.value };
                      setFormData({ ...formData, steps: newSteps });
                    }}
                    className="w-full rounded border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 flex items-center text-xs font-medium">
                    <span>標題（英）</span>
                    <TranslateBtn
                      sourceField="title_zh"
                      targetField="title_en"
                      sourceValue={step.title_zh}
                      stepIndex={index}
                    />
                  </label>
                  <input
                    type="text"
                    value={step.title_en}
                    onChange={(e) => {
                      const newSteps = [...formData.steps];
                      newSteps[index] = { ...newSteps[index], title_en: e.target.value };
                      setFormData({ ...formData, steps: newSteps });
                    }}
                    className="w-full rounded border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">描述（中）</label>
                  <textarea
                    value={step.desc_zh}
                    onChange={(e) => {
                      const newSteps = [...formData.steps];
                      newSteps[index] = { ...newSteps[index], desc_zh: e.target.value };
                      setFormData({ ...formData, steps: newSteps });
                    }}
                    rows={2}
                    className="w-full rounded border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 flex items-center text-xs font-medium">
                    <span>描述（英）</span>
                    <TranslateBtn
                      sourceField="desc_zh"
                      targetField="desc_en"
                      sourceValue={step.desc_zh}
                      stepIndex={index}
                    />
                  </label>
                  <textarea
                    value={step.desc_en}
                    onChange={(e) => {
                      const newSteps = [...formData.steps];
                      newSteps[index] = { ...newSteps[index], desc_en: e.target.value };
                      setFormData({ ...formData, steps: newSteps });
                    }}
                    rows={2}
                    className="w-full rounded border px-2 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium">步驟圖片 URL（可選）</label>
                <input
                  type="text"
                  value={step.image || ""}
                  onChange={(e) => {
                    const newSteps = [...formData.steps];
                    newSteps[index] = { ...newSteps[index], image: e.target.value };
                    setFormData({ ...formData, steps: newSteps });
                  }}
                  placeholder="https://..."
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">行動呼籲（CTA）</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">CTA 標題（中）</label>
            <input
              type="text"
              value={formData.ctaTitle_zh}
              onChange={(e) => setFormData({ ...formData, ctaTitle_zh: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center text-sm font-medium">
              <span>CTA 標題（英）</span>
              <TranslateBtn
                sourceField="ctaTitle_zh"
                targetField="ctaTitle_en"
                sourceValue={formData.ctaTitle_zh}
              />
            </label>
            <input
              type="text"
              value={formData.ctaTitle_en}
              onChange={(e) => setFormData({ ...formData, ctaTitle_en: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">按鈕文字（中）</label>
            <input
              type="text"
              value={formData.ctaButtonLabel_zh}
              onChange={(e) => setFormData({ ...formData, ctaButtonLabel_zh: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center text-sm font-medium">
              <span>按鈕文字（英）</span>
              <TranslateBtn
                sourceField="ctaButtonLabel_zh"
                targetField="ctaButtonLabel_en"
                sourceValue={formData.ctaButtonLabel_zh}
              />
            </label>
            <input
              type="text"
              value={formData.ctaButtonLabel_en}
              onChange={(e) => setFormData({ ...formData, ctaButtonLabel_en: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">按鈕連結</label>
            <input
              type="text"
              value={formData.ctaButtonUrl}
              onChange={(e) => setFormData({ ...formData, ctaButtonUrl: e.target.value })}
              placeholder="/contact"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-black px-6 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "儲存中..." : "儲存內容"}
        </button>
      </div>
    </form>
  );
}
