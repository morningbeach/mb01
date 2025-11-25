import { ProductForm } from "../components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">新增產品</h1>
          <p className="mt-1 text-sm text-zinc-600">
            建立新的產品資料
          </p>
        </div>

        <ProductForm />
      </div>
    </div>
  );
}
