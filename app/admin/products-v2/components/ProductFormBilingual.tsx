// app/admin/products-v2/components/ProductFormBilingual.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BilingualInput } from "./BilingualInput";
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

export function ProductFormBilingual({ product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 多語系表單狀態
  const [formData, setFormData] = useState({
    slug: product?.slug || "",
    // 基本資訊（多語系）
    name_en: product?.name_en || product?.name || "",
    name_zh: product?.name_zh || "",
    shortDesc_en: product?.shortDesc_en || product?.shortDesc || "",
    shortDesc_zh: product?.shortDesc_zh || "",
    description_en: product?.description_en || product?.description || "",
    description_zh: product?.description_zh || "",
    
    // 規格（多語系）
    dimensions_en: product?.dimensions_en || product?.dimensions || "",
    dimensions_zh: product?.dimensions_zh || "",
    materials_en: product?.materials_en || product?.materials || "",
    materials_zh: product?.materials_zh || "",
    leadTime_en: product?.leadTime_en || product?.leadTime || "",
    leadTime_zh: product?.leadTime_zh || "",
    packagingInfo_en: product?.packagingInfo_en || product?.packagingInfo || "",
    packagingInfo_zh: product?.packagingInfo_zh || "",
    unit_en: product?.unit_en || product?.unit || "",
    unit_zh: product?.unit_zh || "",
    notesForBuyer_en: product?.notesForBuyer_en || product?.notesForBuyer || "",
    notesForBuyer_zh: product?.notesForBuyer_zh || "",
    originCountry_en: product?.originCountry_en || product?.originCountry || "",
    originCountry_zh: product?.originCountry_zh || "",
    priceHint_en: product?.priceHint_en || product?.priceHint || "",
    priceHint_zh: product?.priceHint_zh || "",
    
    // SEO（多語系）
    seoTitle_en: product?.seoTitle_en || product?.seoTitle || "",
    seoTitle_zh: product?.seoTitle_zh || "",
    seoDescription_en: product?.seoDescription_en || product?.seoDescription || "",
    seoDescription_zh: product?.seoDescription_zh || "",
    
    // 單一語言欄位
    category: product?.category || "GIFT",
    sku: product?.sku || "",
    minQty: product?.minQty || 0,
    currency: product?.currency || "TWD",
    status: product?.status || "DRAFT",
    coverImage: product?.coverImage || "",
    images: (product?.images || []) as string[],
    tagIds: product?.ProductTag?.map((pt: any) => pt.tagId) || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = product
        ? `/api/admin/products-v2/${product.id}`
        : "/api/admin/products-v2";
      
      const method = product ? "PUT" : "POST";

      // 準備提交資料，包含向下相容的單語言欄位
      const submitData = {
        ...formData,
        version: 2,
        // 將空字串轉換為 null（避免唯一性約束錯誤）
        sku: formData.sku && formData.sku.trim() !== '' ? formData.sku.trim() : null,
        slug: formData.slug && formData.slug.trim() !== '' ? formData.slug.trim() : '',
        // 向下相容：使用英文作為預設值
        name: formData.name_en,
        shortDesc: formData.shortDesc_en,
        description: formData.description_en,
        dimensions: formData.dimensions_en,
        materials: formData.materials_en,
        leadTime: formData.leadTime_en,
        packagingInfo: formData.packagingInfo_en,
        unit: formData.unit_en,
        notesForBuyer: formData.notesForBuyer_en,
        originCountry: formData.originCountry_en,
        priceHint: formData.priceHint_en,
        seoTitle: formData.seoTitle_en,
        seoDescription: formData.seoDescription_en,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本資訊 - 多語系 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900">
          基本資訊
          <span className="ml-2 text-sm font-normal text-zinc-500">
            Basic Information
          </span>
        </h2>
        
        <div className="space-y-6">
          {/* 產品名稱 - 雙語 */}
          <BilingualInput
            label="產品名稱 / Product Name"
            name="name"
            valueEn={formData.name_en}
            valueZh={formData.name_zh}
            onChangeEn={(val) => setFormData({ ...formData, name_en: val })}
            onChangeZh={(val) => setFormData({ ...formData, name_zh: val })}
            required
            context="product_name"
            placeholder={{
              en: "Premium Gift Box A",
              zh: "豪華禮品盒 A 型",
            }}
          />

          {/* URL Slug - 單語 */}
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
              placeholder="premium-gift-box-a"
            />
            <p className="mt-1 text-xs text-zinc-500">
              用於 URL 的唯一識別碼，例如：/products/premium-gift-box-a
            </p>
          </div>

          {/* 簡短描述 - 雙語 */}
          <BilingualInput
            label="簡短描述 / Short Description"
            name="shortDesc"
            valueEn={formData.shortDesc_en}
            valueZh={formData.shortDesc_zh}
            onChangeEn={(val) => setFormData({ ...formData, shortDesc_en: val })}
            onChangeZh={(val) => setFormData({ ...formData, shortDesc_zh: val })}
            context="short_desc"
            placeholder={{
              en: "Luxury heaven-and-earth box structure for premium gifts",
              zh: "高級天地盒結構，適合高端禮品包裝",
            }}
          />

          {/* 詳細描述 - 雙語 */}
          <BilingualInput
            label="詳細描述 / Detailed Description"
            name="description"
            valueEn={formData.description_en}
            valueZh={formData.description_zh}
            onChangeEn={(val) => setFormData({ ...formData, description_en: val })}
            onChangeZh={(val) => setFormData({ ...formData, description_zh: val })}
            type="textarea"
            context="product_description"
            placeholder={{
              en: "Made with imported specialty paper, velvet lining, magnetic closure...",
              zh: "採用進口特種紙，內襯絨布，磁吸式開合設計...",
            }}
          />

          {/* 分類與 SKU - 單語 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                分類 / Category *
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
                SKU / 產品編號
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                placeholder="MB-GIFT-001"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 商品規格 - 多語系 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900">
          產品規格
          <span className="ml-2 text-sm font-normal text-zinc-500">
            Product Specifications
          </span>
        </h2>
        
        <div className="space-y-6">
          <BilingualInput
            label="尺寸 / Dimensions"
            name="dimensions"
            valueEn={formData.dimensions_en}
            valueZh={formData.dimensions_zh}
            onChangeEn={(val) => setFormData({ ...formData, dimensions_en: val })}
            onChangeZh={(val) => setFormData({ ...formData, dimensions_zh: val })}
            context="specifications"
            placeholder={{
              en: "20 × 15 × 8 cm",
              zh: "20 × 15 × 8 公分",
            }}
          />

          <BilingualInput
            label="材質 / Materials"
            name="materials"
            valueEn={formData.materials_en}
            valueZh={formData.materials_zh}
            onChangeEn={(val) => setFormData({ ...formData, materials_en: val })}
            onChangeZh={(val) => setFormData({ ...formData, materials_zh: val })}
            context="specifications"
            placeholder={{
              en: "Premium cardboard, velvet lining",
              zh: "高級紙板、絨布內襯",
            }}
          />

          <BilingualInput
            label="交期 / Lead Time"
            name="leadTime"
            valueEn={formData.leadTime_en}
            valueZh={formData.leadTime_zh}
            onChangeEn={(val) => setFormData({ ...formData, leadTime_en: val })}
            onChangeZh={(val) => setFormData({ ...formData, leadTime_zh: val })}
            placeholder={{
              en: "15-20 business days",
              zh: "15-20 個工作天",
            }}
          />

          <BilingualInput
            label="包裝資訊 / Packaging Info"
            name="packagingInfo"
            valueEn={formData.packagingInfo_en}
            valueZh={formData.packagingInfo_zh}
            onChangeEn={(val) => setFormData({ ...formData, packagingInfo_en: val })}
            onChangeZh={(val) => setFormData({ ...formData, packagingInfo_zh: val })}
            placeholder={{
              en: "12 pcs/carton",
              zh: "12 個/箱",
            }}
          />
        </div>
      </div>

      {/* 商業資訊 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900">商業資訊</h2>
        
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                最小訂購量 / MOQ
              </label>
              <input
                type="number"
                min="0"
                value={formData.minQty}
                onChange={(e) => setFormData({ ...formData, minQty: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">
                幣別 / Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              >
                <option value="TWD">TWD (台幣)</option>
                <option value="USD">USD (美金)</option>
                <option value="EUR">EUR (歐元)</option>
              </select>
            </div>
          </div>

          <BilingualInput
            label="價格提示 / Price Hint"
            name="priceHint"
            valueEn={formData.priceHint_en}
            valueZh={formData.priceHint_zh}
            onChangeEn={(val) => setFormData({ ...formData, priceHint_en: val })}
            onChangeZh={(val) => setFormData({ ...formData, priceHint_zh: val })}
            placeholder={{
              en: "From $5.50 per unit (MOQ 500)",
              zh: "每個 $5.50 起（最小訂購量 500）",
            }}
          />
        </div>
      </div>

      {/* 圖片管理 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900">產品圖片</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              封面圖片 / Cover Image
            </label>
            <ImagePicker
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              圖片庫 / Image Gallery
            </label>
            <ImagePicker
              multiple
              multiValue={formData.images}
              onMultiChange={(urls) => setFormData({ ...formData, images: urls })}
            />
            {formData.images.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          images: formData.images.filter((_, i) => i !== idx),
                        });
                      }}
                      className="absolute right-1 top-1 rounded bg-red-500 p-1 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 標籤管理 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900">產品標籤</h2>
        <ProductTagManager
          initialTagIds={formData.tagIds}
          onChange={(tagIds) => setFormData({ ...formData, tagIds })}
        />
      </div>

      {/* SEO - 多語系 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900">
          SEO 設定
          <span className="ml-2 text-sm font-normal text-zinc-500">
            Search Engine Optimization
          </span>
        </h2>
        
        <div className="space-y-6">
          <BilingualInput
            label="SEO 標題 / SEO Title"
            name="seoTitle"
            valueEn={formData.seoTitle_en}
            valueZh={formData.seoTitle_zh}
            onChangeEn={(val) => setFormData({ ...formData, seoTitle_en: val })}
            onChangeZh={(val) => setFormData({ ...formData, seoTitle_zh: val })}
            context="seo_title"
            placeholder={{
              en: "Premium Gift Box A | Custom Packaging",
              zh: "豪華禮品盒 A 型 | 客製化包裝",
            }}
          />

          <BilingualInput
            label="SEO 描述 / SEO Description"
            name="seoDescription"
            valueEn={formData.seoDescription_en}
            valueZh={formData.seoDescription_zh}
            onChangeEn={(val) => setFormData({ ...formData, seoDescription_en: val })}
            onChangeZh={(val) => setFormData({ ...formData, seoDescription_zh: val })}
            type="textarea"
            context="seo_description"
            placeholder={{
              en: "High-quality premium gift box with custom branding...",
              zh: "高品質豪華禮品盒，可客製化品牌印刷...",
            }}
          />
        </div>
      </div>

      {/* 狀態 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900">發布狀態</h2>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* 提交按鈕 */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "處理中..." : product ? "更新產品" : "建立產品"}
        </button>
        
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-6 py-3 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          取消
        </button>
      </div>
    </form>
  );
}
