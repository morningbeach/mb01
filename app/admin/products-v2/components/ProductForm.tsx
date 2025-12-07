"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImagePicker from "../../components/ImagePicker";
import ProductTagManager from "../../components/ProductTagManager";

type ProductFormProps = {
  product?: any;
};

const categories = [
  { value: "GIFT", label: "禮品贈品" },
  { value: "GIFT_BOX", label: "禮品盒" },
  { value: "GIFT_SET", label: "禮品組" },
];

const statuses = [
  { value: "DRAFT", label: "草稿" },
  { value: "ACTIVE", label: "已發布" },
  { value: "ARCHIVED", label: "已封存" },
];

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: product?.slug || "",
    name: product?.name || "",
    category: product?.category || "GIFT",
    shortDesc: product?.shortDesc || "",
    description: product?.description || "",
    sku: product?.sku || "",
    minQty: product?.minQty || 0,
    priceHint: product?.priceHint || "",
    currency: product?.currency || "TWD",
    dimensions: product?.dimensions || "",
    leadTime: product?.leadTime || "",
    materials: product?.materials || "",
    notesForBuyer: product?.notesForBuyer || "",
    originCountry: product?.originCountry || "台灣",
    packagingInfo: product?.packagingInfo || "",
    unit: product?.unit || "個",
    status: product?.status || "DRAFT",
    coverImage: product?.coverImage || "",
    gallery: (product?.gallery || []) as string[],
    tagIds: product?.ProductTag?.map((pt: any) => pt.tagId) || [],
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
    enableAiGen: product?.enableAiGen || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = product
        ? `/api/admin/products-v2/${product.id}`
        : "/api/admin/products-v2";
      
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, version: 2 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "操作失敗");
      }

      alert(product ? "更新成功！" : "建立成功！");
      router.push("/admin/products-v2");
      router.refresh();
    } catch (error: any) {
      alert(`錯誤: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`確定要刪除「${product.name}」嗎？此操作無法復原！`)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products-v2/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "刪除失敗");
      }

      alert("刪除成功！");
      router.push("/admin/products-v2");
      router.refresh();
    } catch (error: any) {
      alert(`錯誤: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本資訊 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">基本資訊</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              產品名稱 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="豪華禮品盒 A 型"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="luxury-gift-box-a"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              分類 *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              SKU
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="MB-GIFT-001"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">
              簡短描述
            </label>
            <input
              type="text"
              value={formData.shortDesc}
              onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="高級天地盒結構，適合高端禮品包裝"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">
              詳細描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              rows={4}
              placeholder="採用進口特種紙，內襯絨布，磁吸式開合設計..."
            />
          </div>
        </div>
      </div>

      {/* 價格與規格 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">價格與規格</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              最低起訂量
            </label>
            <input
              type="number"
              value={formData.minQty}
              onChange={(e) => setFormData({ ...formData, minQty: parseInt(e.target.value) || 0 })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              單位
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="個"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              幣別
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="TWD">TWD</option>
              <option value="USD">USD</option>
              <option value="CNY">CNY</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-zinc-700">
              價格提示
            </label>
            <input
              type="text"
              value={formData.priceHint}
              onChange={(e) => setFormData({ ...formData, priceHint: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="NT$ 80-150 / 個"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              尺寸規格
            </label>
            <input
              type="text"
              value={formData.dimensions}
              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="20 x 15 x 8 cm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              交期
            </label>
            <input
              type="text"
              value={formData.leadTime}
              onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="15-20 工作天"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              產地
            </label>
            <input
              type="text"
              value={formData.originCountry}
              onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="台灣"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-zinc-700">
              材質
            </label>
            <input
              type="text"
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="特種紙、灰板、絨布內襯"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-zinc-700">
              包裝資訊
            </label>
            <input
              type="text"
              value={formData.packagingInfo}
              onChange={(e) => setFormData({ ...formData, packagingInfo: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="單個包裝 / 50 個 / 紙箱"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-zinc-700">
              買家須知
            </label>
            <textarea
              value={formData.notesForBuyer}
              onChange={(e) => setFormData({ ...formData, notesForBuyer: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              rows={2}
              placeholder="可客製化 LOGO 燙金/燙銀，最低起訂量 500 個"
            />
          </div>
        </div>
      </div>

      {/* 圖片設定 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">圖片設定</h2>
        
        <div className="space-y-6">
          {/* 封面圖片 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              封面圖片 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-zinc-500 mb-2">
              此圖片會在產品列表和預覽中顯示
            </p>
            <ImagePicker
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
            />
            {formData.coverImage && (
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                placeholder="或直接輸入 URL"
              />
            )}
          </div>

          <hr className="border-zinc-200" />

          {/* 產品附圖 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  產品附圖
                </label>
                <p className="text-xs text-zinc-500 mt-1">
                  在產品詳情頁顯示的圖片集，可拖曳排序
                </p>
              </div>
              {formData.gallery.length > 0 && (
                <span className="text-xs text-zinc-500">
                  {formData.gallery.length} 張圖片
                </span>
              )}
            </div>
            
            {/* 已選圖片預覽 */}
            {formData.gallery.length > 0 && (
              <div className="mb-3 grid grid-cols-4 md:grid-cols-6 gap-3">
                {formData.gallery.map((url: string, idx: number) => (
                  <div
                    key={idx}
                    className="group relative aspect-square overflow-hidden rounded-lg border-2 border-zinc-200"
                  >
                    <img
                      src={url}
                      alt={`圖片 ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {/* 刪除按鈕 */}
                    <button
                      type="button"
                      onClick={() => {
                        const newGallery = formData.gallery.filter((_: string, i: number) => i !== idx);
                        setFormData({ ...formData, gallery: newGallery });
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {/* 序號 */}
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 添加圖片按鈕 */}
            <ImagePicker
              multiple
              multiValue={formData.gallery}
              onMultiChange={(urls) => setFormData({ ...formData, gallery: urls })}
            />
            
            <div className="mt-2 text-xs text-zinc-500">
              💡 提示：圖片顯示順序為從左到右、從上到下，點擊圖片右上角的 ✕ 可移除
            </div>
          </div>
        </div>
      </div>

      {/* TAG 管理 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">標籤管理</h2>
        <p className="mb-4 text-sm text-zinc-600">
          為產品添加標籤，用於分類篩選。可以選擇現有標籤或建立新標籤。
        </p>
        
        <ProductTagManager
          productId={product?.id}
          initialTagIds={formData.tagIds}
          onChange={(tagIds) => setFormData({ ...formData, tagIds })}
        />
      </div>

      {/* SEO 設定 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">SEO 設定</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              SEO 標題
            </label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="豪華禮品盒 A 型 | 天玎包裝工廠"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              SEO 描述
            </label>
            <textarea
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              rows={2}
              placeholder="高級天地盒結構，採用進口特種紙，內襯絨布..."
            />
          </div>
        </div>
      </div>

      {/* 狀態設定 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">狀態設定</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              發布狀態
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* AI 設計功能 */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
            <input
              type="checkbox"
              id="enableAiGen"
              checked={formData.enableAiGen}
              onChange={(e) => setFormData({ ...formData, enableAiGen: e.target.checked })}
              className="h-5 w-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
            />
            <div>
              <label htmlFor="enableAiGen" className="block text-sm font-medium text-zinc-800 cursor-pointer">
                ✨ 啟用 AI 設計功能
              </label>
              <p className="text-xs text-zinc-500 mt-0.5">
                開啟後，用戶可在產品頁面使用 AI 生成客製化包裝設計
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:bg-zinc-300"
        >
          {loading ? "處理中..." : product ? "更新產品" : "建立產品"}
        </button>
        
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-6 py-2 text-zinc-700 hover:bg-zinc-50"
        >
          取消
        </button>

        {product && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="ml-auto rounded-lg bg-red-500 px-6 py-2 text-white hover:bg-red-600 disabled:bg-zinc-300"
          >
            刪除產品
          </button>
        )}
      </div>
    </form>
  );
}
