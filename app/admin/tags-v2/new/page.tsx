import { AdminPageHeader } from "../../components/AdminPageHeader";
import { TagForm } from "../components/TagForm";

export default function NewTagPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="標籤管理"
        title="新增標籤"
        description="建立新的產品標籤，請確保填寫中英文名稱"
      />

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">💡</span>
          <span className="font-medium text-blue-800">小提示</span>
        </div>
        <p className="mt-1 text-sm text-blue-700">
          請務必填寫中英文名稱，以確保網站在不同語言下都能正常顯示。
        </p>
      </div>

      <TagForm />
    </>
  );
}
