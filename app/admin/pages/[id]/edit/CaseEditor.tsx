// app/admin/pages/[id]/edit/CaseEditor.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CaseProject {
  id: string;
  slug: string;
  title_zh: string;
  title_en: string | null;
  desc_zh: string | null;
  desc_en: string | null;
  client_zh: string | null;
  client_en: string | null;
  category_zh: string | null;
  category_en: string | null;
  year: number | null;
  coverImage: string | null;
  images: string[];
  isPublished: boolean;
  isFeatured: boolean;
  order: number;
}

interface CasePageData {
  sectionTitle_zh: string;
  sectionTitle_en: string;
  sectionDesc_zh: string;
  sectionDesc_en: string;
  displayMode: "grid" | "masonry" | "list";
  showFilters: boolean;
  filterCategories: string[];
}

const defaultPageData: CasePageData = {
  sectionTitle_zh: "案例展示",
  sectionTitle_en: "Case Studies",
  sectionDesc_zh: "探索我們為各類品牌打造的客製化包裝解決方案",
  sectionDesc_en: "Explore our custom packaging solutions for various brands",
  displayMode: "grid",
  showFilters: true,
  filterCategories: ["禮品包裝", "節慶禮盒", "企業贈禮", "VIP禮品"],
};

export function CaseEditor({ pageId, pageData }: { pageId: string; pageData: any }) {
  const router = useRouter();
  const initialPageData: CasePageData = pageData || defaultPageData;
  const [formData, setFormData] = useState<CasePageData>(initialPageData);
  const [cases, setCases] = useState<CaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);
  const [editingCase, setEditingCase] = useState<CaseProject | null>(null);
  const [newCategory, setNewCategory] = useState("");

  // 載入案例列表
  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/admin/cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPageData = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageData: formData }),
      });
      if (res.ok) {
        alert("頁面設定儲存成功！");
        router.refresh();
      } else {
        alert("儲存失敗");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCase = async (caseData: Partial<CaseProject>) => {
    try {
      const isNew = !caseData.id;
      const url = isNew ? "/api/admin/cases" : `/api/admin/cases/${caseData.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseData),
      });

      if (res.ok) {
        alert(isNew ? "案例新增成功！" : "案例更新成功！");
        setEditingCase(null);
        fetchCases();
      } else {
        alert("操作失敗");
      }
    } catch (error) {
      console.error("Save case error:", error);
      alert("操作失敗");
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm("確定要刪除此案例嗎？此操作無法復原。")) return;

    try {
      const res = await fetch(`/api/admin/cases/${caseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("案例已刪除");
        fetchCases();
      } else {
        alert("刪除失敗");
      }
    } catch (error) {
      console.error("Delete case error:", error);
      alert("刪除失敗");
    }
  };

  const translateField = async (
    sourceField: string,
    targetField: string,
    sourceValue: string
  ) => {
    if (!sourceValue.trim()) return;
    setTranslating(sourceField);
    
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceValue, from: "zh", to: "en" }),
      });
      
      if (res.ok) {
        const { translatedText } = await res.json();
        setFormData({ ...formData, [targetField]: translatedText });
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setTranslating(null);
    }
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (formData.filterCategories.includes(newCategory.trim())) {
      alert("此分類已存在");
      return;
    }
    setFormData({
      ...formData,
      filterCategories: [...formData.filterCategories, newCategory.trim()],
    });
    setNewCategory("");
  };

  const removeCategory = (cat: string) => {
    setFormData({
      ...formData,
      filterCategories: formData.filterCategories.filter((c) => c !== cat),
    });
  };

  const TranslateBtn = ({
    sourceField,
    targetField,
    sourceValue,
  }: {
    sourceField: string;
    targetField: string;
    sourceValue: string;
  }) => {
    const isLoading = translating === sourceField;
    return (
      <button
        type="button"
        onClick={() => translateField(sourceField, targetField, sourceValue)}
        disabled={isLoading || !sourceValue.trim()}
        className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-200 disabled:opacity-50"
      >
        {isLoading ? "翻譯中..." : "AI 翻譯"}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* 頁面設定 */}
      <form onSubmit={handleSubmitPageData} className="space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">頁面設定</h2>
          
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

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">顯示模式</label>
              <select
                value={formData.displayMode}
                onChange={(e) => setFormData({ ...formData, displayMode: e.target.value as any })}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="grid">格狀 (Grid)</option>
                <option value="masonry">瀑布流 (Masonry)</option>
                <option value="list">列表 (List)</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.showFilters}
                  onChange={(e) => setFormData({ ...formData, showFilters: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">顯示分類篩選</span>
              </label>
            </div>
          </div>

          {/* 分類管理 */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium">篩選分類</label>
            <div className="mb-3 flex flex-wrap gap-2">
              {formData.filterCategories.map((cat) => (
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
                新增
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-black px-6 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "儲存中..." : "儲存頁面設定"}
            </button>
          </div>
        </div>
      </form>

      {/* 案例列表 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">案例管理</h2>
          <button
            type="button"
            onClick={() =>
              setEditingCase({
                id: "",
                slug: "",
                title_zh: "",
                title_en: "",
                desc_zh: "",
                desc_en: "",
                client_zh: "",
                client_en: "",
                category_zh: formData.filterCategories[0] || "",
                category_en: "",
                year: new Date().getFullYear(),
                coverImage: "",
                images: [],
                isPublished: false,
                isFeatured: false,
                order: cases.length,
              })
            }
            className="rounded bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
          >
            + 新增案例
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-zinc-500">載入中...</div>
        ) : cases.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">尚無案例</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white"
              >
                {/* 封面圖 */}
                <div className="relative aspect-[4/3] bg-zinc-100">
                  {caseItem.coverImage ? (
                    <Image
                      src={caseItem.coverImage}
                      alt={caseItem.title_zh}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      無圖片
                    </div>
                  )}
                  {/* 狀態標籤 */}
                  <div className="absolute left-2 top-2 flex gap-1">
                    {caseItem.isFeatured && (
                      <span className="rounded bg-yellow-500 px-2 py-0.5 text-xs text-white">
                        精選
                      </span>
                    )}
                    <span
                      className={`rounded px-2 py-0.5 text-xs text-white ${
                        caseItem.isPublished ? "bg-green-500" : "bg-zinc-500"
                      }`}
                    >
                      {caseItem.isPublished ? "已發佈" : "草稿"}
                    </span>
                  </div>
                </div>

                {/* 資訊 */}
                <div className="p-3">
                  <h3 className="font-medium text-zinc-900">{caseItem.title_zh}</h3>
                  {caseItem.client_zh && (
                    <p className="mt-1 text-xs text-zinc-500">
                      客戶：{caseItem.client_zh}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                    <span>{caseItem.category_zh || "未分類"}</span>
                    <span>{caseItem.year || ""}</span>
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setEditingCase(caseItem)}
                    className="rounded bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-100"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDeleteCase(caseItem.id)}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 案例編輯彈窗 */}
      {editingCase && (
        <CaseEditModal
          caseData={editingCase}
          categories={formData.filterCategories}
          onSave={handleSaveCase}
          onCancel={() => setEditingCase(null)}
        />
      )}
    </div>
  );
}

// 案例編輯彈窗
function CaseEditModal({
  caseData,
  categories,
  onSave,
  onCancel,
}: {
  caseData: CaseProject;
  categories: string[];
  onSave: (data: Partial<CaseProject>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CaseProject>(caseData);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);

  const isNew = !caseData.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_zh.trim()) {
      alert("請輸入案例標題");
      return;
    }
    if (!formData.slug.trim()) {
      // 自動產生 slug
      formData.slug = formData.title_zh
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const translateField = async (
    sourceField: keyof CaseProject,
    targetField: keyof CaseProject,
    sourceValue: string
  ) => {
    if (!sourceValue.trim()) return;
    setTranslating(sourceField);
    
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceValue, from: "zh", to: "en" }),
      });
      
      if (res.ok) {
        const { translatedText } = await res.json();
        setFormData({ ...formData, [targetField]: translatedText });
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setTranslating(null);
    }
  };

  const TranslateBtn = ({
    sourceField,
    targetField,
    sourceValue,
  }: {
    sourceField: keyof CaseProject;
    targetField: keyof CaseProject;
    sourceValue: string | null;
  }) => {
    const isLoading = translating === sourceField;
    return (
      <button
        type="button"
        onClick={() => translateField(sourceField, targetField, sourceValue || "")}
        disabled={isLoading || !sourceValue?.trim()}
        className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-200 disabled:opacity-50"
      >
        {isLoading ? "..." : "AI"}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isNew ? "新增案例" : "編輯案例"}
          </h2>
          <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-900">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本資訊 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">標題（中）*</label>
              <input
                type="text"
                value={formData.title_zh}
                onChange={(e) => setFormData({ ...formData, title_zh: e.target.value })}
                required
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center text-sm font-medium">
                <span>標題（英）</span>
                <TranslateBtn sourceField="title_zh" targetField="title_en" sourceValue={formData.title_zh} />
              </label>
              <input
                type="text"
                value={formData.title_en || ""}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Slug（網址路徑）</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="留空將自動產生"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          {/* 描述 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">描述（中）</label>
              <textarea
                value={formData.desc_zh || ""}
                onChange={(e) => setFormData({ ...formData, desc_zh: e.target.value })}
                rows={3}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center text-sm font-medium">
                <span>描述（英）</span>
                <TranslateBtn sourceField="desc_zh" targetField="desc_en" sourceValue={formData.desc_zh} />
              </label>
              <textarea
                value={formData.desc_en || ""}
                onChange={(e) => setFormData({ ...formData, desc_en: e.target.value })}
                rows={3}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* 客戶資訊 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">客戶（中）</label>
              <input
                type="text"
                value={formData.client_zh || ""}
                onChange={(e) => setFormData({ ...formData, client_zh: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center text-sm font-medium">
                <span>客戶（英）</span>
                <TranslateBtn sourceField="client_zh" targetField="client_en" sourceValue={formData.client_zh} />
              </label>
              <input
                type="text"
                value={formData.client_en || ""}
                onChange={(e) => setFormData({ ...formData, client_en: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* 分類與年份 */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">分類</label>
              <select
                value={formData.category_zh || ""}
                onChange={(e) => setFormData({ ...formData, category_zh: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">請選擇</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">年份</label>
              <input
                type="number"
                value={formData.year || ""}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || null })}
                placeholder="2024"
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">排序</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* 圖片 */}
          <div>
            <label className="mb-1 block text-sm font-medium">封面圖 URL</label>
            <input
              type="text"
              value={formData.coverImage || ""}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://..."
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          {/* 狀態 */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">發佈</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">精選案例</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border px-4 py-2 text-sm hover:bg-zinc-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-black px-6 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "儲存中..." : isNew ? "新增案例" : "更新案例"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
