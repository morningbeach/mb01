import { ProductFormBilingual } from "../components/ProductFormBilingual";

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">
            新增產品
            <span className="ml-3 text-sm font-normal text-zinc-500">
              Create Product (多語系 Bilingual)
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            建立新的產品資料，支援中英文內容
          </p>
        </div>

        <ProductFormBilingual />
      </div>
    </div>
  );
}
