import { TagForm } from "../components/TagForm";

export default function NewTagPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">新增標籤</h1>
          <p className="mt-1 text-sm text-zinc-600">
            建立新的產品標籤
          </p>
        </div>

        <TagForm />
      </div>
    </div>
  );
}
