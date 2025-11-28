"use client";
import { useState, useEffect } from "react";
import { TranslateButton } from "../../components/TranslateButton";

interface CaseProject {
  id: string;
  slug: string;
  title_zh: string;
  title_en?: string;
  desc_zh?: string;
  desc_en?: string;
  client_zh?: string;
  client_en?: string;
  category_zh?: string;
  category_en?: string;
  year?: number;
  coverImage?: string;
  images: string[];
  isPublished: boolean;
  isFeatured: boolean;
  order: number;
}

interface CaseFormData extends Omit<CaseProject, 'id' | 'slug'> {
  id?: string;
  slug?: string;
}

export function CaseEditor({ pageId }: { pageId: string }) {
  const [cases, setCases] = useState<CaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseProject | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<CaseFormData>({
    title_zh: "",
    title_en: "",
    desc_zh: "",
    desc_en: "",
    client_zh: "",
    client_en: "",
    category_zh: "",
    category_en: "",
    year: new Date().getFullYear(),
    coverImage: "",
    images: [],
    isPublished: false,
    isFeatured: false,
    order: 0,
  });

  // 載入案例列表
  const loadCases = async () => {
    try {
      const res = await fetch('/api/admin/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  // 上傳圖片
  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // 重置表單
  const resetForm = () => {
    setFormData({
      title_zh: "",
      title_en: "",
      desc_zh: "",
      desc_en: "",
      client_zh: "",
      client_en: "",
      category_zh: "",
      category_en: "",
      year: new Date().getFullYear(),
      coverImage: "",
      images: [],
      isPublished: false,
      isFeatured: false,
      order: 0,
    });
    setEditingCase(null);
  };

  // 開啟新增表單
  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  // 開啟編輯表單
  const handleEdit = (caseProject: CaseProject) => {
    setFormData({
      id: caseProject.id,
      slug: caseProject.slug,
      title_zh: caseProject.title_zh,
      title_en: caseProject.title_en || "",
      desc_zh: caseProject.desc_zh || "",
      desc_en: caseProject.desc_en || "",
      client_zh: caseProject.client_zh || "",
      client_en: caseProject.client_en || "",
      category_zh: caseProject.category_zh || "",
      category_en: caseProject.category_en || "",
      year: caseProject.year || new Date().getFullYear(),
      coverImage: caseProject.coverImage || "",
      images: caseProject.images || [],
      isPublished: caseProject.isPublished,
      isFeatured: caseProject.isFeatured,
      order: caseProject.order,
    });
    setEditingCase(caseProject);
    setShowForm(true);
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const url = editingCase 
        ? `/api/admin/cases/${editingCase.id}`
        : '/api/admin/cases';
      
      const method = editingCase ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        await loadCases();
        setShowForm(false);
        resetForm();
        alert(editingCase ? '案例更新成功！' : '案例新增成功！');
      } else {
        alert('操作失敗');
      }
    } catch (error) {
      console.error('Failed to save case:', error);
      alert('操作失敗');
    } finally {
      setSaving(false);
    }
  };

  // 刪除案例
  const handleDelete = async (caseProject: CaseProject) => {
    if (!confirm(`確定要刪除案例「${caseProject.title_zh}」嗎？`)) return;
    
    try {
      const res = await fetch(`/api/admin/cases/${caseProject.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        await loadCases();
        alert('案例刪除成功！');
      } else {
        alert('刪除失敗');
      }
    } catch (error) {
      console.error('Failed to delete case:', error);
      alert('刪除失敗');
    }
  };

  // 添加圖片
  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }));
  };

  // 更新圖片
  const updateImage = (index: number, url: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? url : img)
    }));
  };

  // 移除圖片
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <p className="text-center text-zinc-500">載入中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 案例列表 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">案例管理</h2>
          <button
            onClick={handleAdd}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            + 新增案例
          </button>
        </div>
        
        {cases.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">尚無案例資料</p>
        ) : (
          <div className="space-y-3">
            {cases.map((caseProject) => (
              <div
                key={caseProject.id}
                className="flex items-center justify-between rounded border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{caseProject.title_zh}</h3>
                    {caseProject.isFeatured && (
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                        精選
                      </span>
                    )}
                    {caseProject.isPublished && (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                        已發布
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600">
                    {caseProject.category_zh} • {caseProject.year}
                  </p>
                  {caseProject.client_zh && (
                    <p className="text-sm text-zinc-500">客戶：{caseProject.client_zh}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(caseProject)}
                    className="rounded border px-3 py-1 text-sm hover:bg-zinc-50"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDelete(caseProject)}
                    className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 編輯表單 Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-6">
              <h3 className="text-lg font-semibold">
                {editingCase ? '編輯案例' : '新增案例'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 基本資訊 */}
              <div className="space-y-4">
                <h4 className="font-medium text-zinc-900">基本資訊</h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">標題（中）*</label>
                    <input
                      type="text"
                      required
                      value={formData.title_zh}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_zh: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex justify-between text-sm font-medium">
                      <span>標題（英）</span>
                      <TranslateButton sourceField="title_zh" targetField="title_en" />
                    </label>
                    <input
                      type="text"
                      value={formData.title_en || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">客戶（中）</label>
                    <input
                      type="text"
                      value={formData.client_zh || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_zh: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex justify-between text-sm font-medium">
                      <span>客戶（英）</span>
                      <TranslateButton sourceField="client_zh" targetField="client_en" />
                    </label>
                    <input
                      type="text"
                      value={formData.client_en || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_en: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">分類（中）</label>
                    <input
                      type="text"
                      value={formData.category_zh || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_zh: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                      placeholder="例：奢侈品 / 手錶"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex justify-between text-sm font-medium">
                      <span>分類（英）</span>
                      <TranslateButton sourceField="category_zh" targetField="category_en" />
                    </label>
                    <input
                      type="text"
                      value={formData.category_en || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_en: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                      placeholder="例：Luxury / Watches"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">年份</label>
                    <input
                      type="number"
                      value={formData.year || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || undefined }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                      min="2000"
                      max="2030"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">描述（中）</label>
                    <textarea
                      rows={4}
                      value={formData.desc_zh || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, desc_zh: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex justify-between text-sm font-medium">
                      <span>描述（英）</span>
                      <TranslateButton sourceField="desc_zh" targetField="desc_en" />
                    </label>
                    <textarea
                      rows={4}
                      value={formData.desc_en || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, desc_en: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 圖片 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-zinc-900">圖片管理</h4>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">封面圖片</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.coverImage || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                      className="flex-1 rounded border px-3 py-2 text-sm"
                      placeholder="https://..."
                    />
                    <label className="flex cursor-pointer items-center rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const uploadedUrl = await uploadImage(file);
                            if (uploadedUrl) {
                              setFormData(prev => ({ ...prev, coverImage: uploadedUrl }));
                            }
                          }
                        }}
                      />
                      {uploading ? '上傳中...' : '上傳圖片'}
                    </label>
                  </div>
                  {formData.coverImage && (
                    <div className="mt-2">
                      <img
                        src={formData.coverImage}
                        alt="封面預覽"
                        className="h-20 w-32 rounded border object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium">其他圖片</label>
                    <button
                      type="button"
                      onClick={addImage}
                      className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
                    >
                      + 新增圖片
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => updateImage(index, e.target.value)}
                            className="flex-1 rounded border px-3 py-2 text-sm"
                            placeholder="https://..."
                          />
                          <label className="flex cursor-pointer items-center rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200">
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploading}
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const uploadedUrl = await uploadImage(file);
                                  if (uploadedUrl) {
                                    updateImage(index, uploadedUrl);
                                  }
                                }
                              }}
                            />
                            {uploading ? '上傳中...' : '上傳'}
                          </label>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="rounded border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            移除
                          </button>
                        </div>
                        {image && (
                          <img
                            src={image}
                            alt={`圖片 ${index + 1}`}
                            className="h-16 w-24 rounded border object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 設定 */}
              <div className="space-y-4">
                <h4 className="font-medium text-zinc-900">顯示設定</h4>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">排序</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="isPublished" className="text-sm">已發布</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="isFeatured" className="text-sm">精選案例</label>
                  </div>
                </div>
              </div>

              {/* 按鈕 */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded border px-4 py-2 text-sm hover:bg-zinc-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? '儲存中...' : editingCase ? '更新案例' : '新增案例'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}