// app/admin/pages/[id]/edit/FaqEditor.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FaqItem {
  id: string;
  question_zh: string;
  question_en: string;
  answer_zh: string;
  answer_en: string;
  category?: string;
  order: number;
}

interface FaqData {
  sectionTitle_zh: string;
  sectionTitle_en: string;
  sectionDesc_zh: string;
  sectionDesc_en: string;
  categories: string[];
  faqs: FaqItem[];
  ctaTitle_zh: string;
  ctaTitle_en: string;
  ctaDesc_zh: string;
  ctaDesc_en: string;
  ctaButtonLabel_zh: string;
  ctaButtonLabel_en: string;
  ctaButtonUrl: string;
}

const defaultData: FaqData = {
  sectionTitle_zh: "常見問題",
  sectionTitle_en: "Frequently Asked Questions",
  sectionDesc_zh: "以下是客戶最常詢問的問題",
  sectionDesc_en: "Here are the most commonly asked questions from our clients",
  categories: ["訂購流程", "產品規格", "付款與運送"],
  faqs: [
    {
      id: "1",
      question_zh: "最低訂購量是多少？",
      question_en: "What is the minimum order quantity?",
      answer_zh: "我們的最低訂購量通常為 500 件，視產品複雜度而定。小量訂單也歡迎詢價。",
      answer_en: "Our minimum order quantity is typically 500 pieces, depending on product complexity. Small quantity orders are also welcome for inquiry.",
      category: "訂購流程",
      order: 1,
    },
    {
      id: "2",
      question_zh: "打樣需要多久時間？",
      question_en: "How long does sampling take?",
      answer_zh: "一般打樣時間約為 7-14 個工作天，視設計複雜度和材料供應而定。",
      answer_en: "Sampling typically takes 7-14 business days, depending on design complexity and material availability.",
      category: "訂購流程",
      order: 2,
    },
    {
      id: "3",
      question_zh: "可以提供什麼材質的包裝？",
      question_en: "What materials do you offer for packaging?",
      answer_zh: "我們提供多種材質選擇，包括灰卡紙、白卡紙、特殊紙張、皮革、布料等，可根據您的需求客製化。",
      answer_en: "We offer various material options including greyboard, white cardboard, specialty papers, leather, fabric, and more, customizable to your needs.",
      category: "產品規格",
      order: 3,
    },
  ],
  ctaTitle_zh: "還有其他問題？",
  ctaTitle_en: "Have more questions?",
  ctaDesc_zh: "歡迎直接聯繫我們，我們將盡快回覆",
  ctaDesc_en: "Feel free to contact us directly, we will respond as soon as possible",
  ctaButtonLabel_zh: "聯絡我們",
  ctaButtonLabel_en: "Contact Us",
  ctaButtonUrl: "/contact",
};

export function FaqEditor({ pageId, pageData }: { pageId: string; pageData: any }) {
  const router = useRouter();
  const initialData: FaqData = pageData || defaultData;
  const [formData, setFormData] = useState<FaqData>(initialData);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");

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
    faqIndex?: number
  ) => {
    if (!sourceValue.trim()) return;
    
    const fieldKey = faqIndex !== undefined ? `faq_${faqIndex}_${sourceField}` : sourceField;
    setTranslating(fieldKey);
    
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceValue, from: "zh", to: "en" }),
      });
      
      if (res.ok) {
        const { translatedText } = await res.json();
        
        if (faqIndex !== undefined) {
          const newFaqs = [...formData.faqs];
          newFaqs[faqIndex] = { ...newFaqs[faqIndex], [targetField]: translatedText };
          setFormData({ ...formData, faqs: newFaqs });
        } else {
          setFormData({ ...formData, [targetField]: translatedText });
        }
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setTranslating(null);
    }
  };

  const addFaq = () => {
    const newId = String(Date.now());
    setFormData({
      ...formData,
      faqs: [
        ...formData.faqs,
        {
          id: newId,
          question_zh: "",
          question_en: "",
          answer_zh: "",
          answer_en: "",
          category: formData.categories[0] || "",
          order: formData.faqs.length + 1,
        },
      ],
    });
  };

  const removeFaq = (index: number) => {
    if (!confirm("確定要刪除此問答嗎？")) return;
    const newFaqs = formData.faqs.filter((_, i) => i !== index);
    setFormData({ ...formData, faqs: newFaqs });
  };

  const moveFaq = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.faqs.length) return;
    
    const newFaqs = [...formData.faqs];
    [newFaqs[index], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[index]];
    
    const reordered = newFaqs.map((f, i) => ({ ...f, order: i + 1 }));
    setFormData({ ...formData, faqs: reordered });
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (formData.categories.includes(newCategory.trim())) {
      alert("此分類已存在");
      return;
    }
    setFormData({
      ...formData,
      categories: [...formData.categories, newCategory.trim()],
    });
    setNewCategory("");
  };

  const removeCategory = (cat: string) => {
    if (!confirm(`確定要刪除「${cat}」分類嗎？`)) return;
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c !== cat),
      faqs: formData.faqs.map((f) =>
        f.category === cat ? { ...f, category: "" } : f
      ),
    });
  };

  const TranslateBtn = ({
    sourceField,
    targetField,
    sourceValue,
    faqIndex,
  }: {
    sourceField: string;
    targetField: string;
    sourceValue: string;
    faqIndex?: number;
  }) => {
    const fieldKey = faqIndex !== undefined ? `faq_${faqIndex}_${sourceField}` : sourceField;
    const isLoading = translating === fieldKey;
    
    return (
      <button
        type="button"
        onClick={() => translateField(sourceField, targetField, sourceValue, faqIndex)}
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

      {/* 分類管理 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">FAQ 分類</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {formData.categories.map((cat) => (
            <div
              key={cat}
              className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1"
            >
              <span className="text-sm">{cat}</span>
              <button
                type="button"
                onClick={() => removeCategory(cat)}
                className="ml-1 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="新分類名稱"
            className="flex-1 rounded border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addCategory}
            className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
          >
            新增分類
          </button>
        </div>
      </div>

      {/* FAQ 列表 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">問答列表</h2>
          <button
            type="button"
            onClick={addFaq}
            className="rounded bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
          >
            + 新增問答
          </button>
        </div>

        <div className="space-y-4">
          {formData.faqs.map((faq, index) => (
            <div key={faq.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <select
                    value={faq.category || ""}
                    onChange={(e) => {
                      const newFaqs = [...formData.faqs];
                      newFaqs[index] = { ...newFaqs[index], category: e.target.value };
                      setFormData({ ...formData, faqs: newFaqs });
                    }}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    <option value="">無分類</option>
                    {formData.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveFaq(index, "up")}
                    disabled={index === 0}
                    className="rounded border p-1 hover:bg-zinc-200 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFaq(index, "down")}
                    disabled={index === formData.faqs.length - 1}
                    className="rounded border p-1 hover:bg-zinc-200 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="rounded border border-red-300 p-1 text-red-600 hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">問題（中）</label>
                    <input
                      type="text"
                      value={faq.question_zh}
                      onChange={(e) => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[index] = { ...newFaqs[index], question_zh: e.target.value };
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      className="w-full rounded border px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center text-xs font-medium">
                      <span>問題（英）</span>
                      <TranslateBtn
                        sourceField="question_zh"
                        targetField="question_en"
                        sourceValue={faq.question_zh}
                        faqIndex={index}
                      />
                    </label>
                    <input
                      type="text"
                      value={faq.question_en}
                      onChange={(e) => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[index] = { ...newFaqs[index], question_en: e.target.value };
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      className="w-full rounded border px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">答案（中）</label>
                    <textarea
                      value={faq.answer_zh}
                      onChange={(e) => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[index] = { ...newFaqs[index], answer_zh: e.target.value };
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      rows={3}
                      className="w-full rounded border px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center text-xs font-medium">
                      <span>答案（英）</span>
                      <TranslateBtn
                        sourceField="answer_zh"
                        targetField="answer_en"
                        sourceValue={faq.answer_zh}
                        faqIndex={index}
                      />
                    </label>
                    <textarea
                      value={faq.answer_en}
                      onChange={(e) => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[index] = { ...newFaqs[index], answer_en: e.target.value };
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      rows={3}
                      className="w-full rounded border px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
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
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">CTA 描述（中）</label>
            <textarea
              value={formData.ctaDesc_zh}
              onChange={(e) => setFormData({ ...formData, ctaDesc_zh: e.target.value })}
              rows={2}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center text-sm font-medium">
              <span>CTA 描述（英）</span>
              <TranslateBtn
                sourceField="ctaDesc_zh"
                targetField="ctaDesc_en"
                sourceValue={formData.ctaDesc_zh}
              />
            </label>
            <textarea
              value={formData.ctaDesc_en}
              onChange={(e) => setFormData({ ...formData, ctaDesc_en: e.target.value })}
              rows={2}
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
