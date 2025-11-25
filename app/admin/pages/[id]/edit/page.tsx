import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminPageHeader } from "@/app/admin/components/AdminPageHeader";
import Link from "next/link";
import { TranslateButton } from "../../components/TranslateButton";
import { AboutEditor } from "./AboutEditor";
import { FactoryEditor } from "./FactoryEditor";
import { ContactEditor } from "./ContactEditor";

export const dynamic = "force-dynamic";

async function updatePageHero(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) return;
  await prisma.sitePage.update({
    where: { id },
    data: {
      navLabel_zh: formData.get("navLabel_zh")?.toString(),
      navLabel_en: formData.get("navLabel_en")?.toString(),
      label_zh: formData.get("label_zh")?.toString(),
      label_en: formData.get("label_en")?.toString(),
      title_zh: formData.get("title_zh")?.toString(),
      title_en: formData.get("title_en")?.toString(),
      desc_zh: formData.get("desc_zh")?.toString(),
      desc_en: formData.get("desc_en")?.toString(),
    },
  });
  revalidatePath("/admin-v2/pages");
  revalidatePath(`/admin-v2/pages/${id}/edit`);
}

export default async function EditPagePage({ params }: { params: { id: string } }) {
  const page = await prisma.sitePage.findUnique({ where: { id: params.id } });
  if (!page) notFound();
  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminPageHeader title={`編輯: ${page.navLabel_zh || page.slug} (${page.type})`} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <form action={updatePageHero} className="space-y-6">
          <input type="hidden" name="id" value={page.id} />
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Hero 區塊</h2>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">導覽列名稱（中）*</label>
                <input type="text" name="navLabel_zh" required defaultValue={page.navLabel_zh || ""} className="w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 flex justify-between text-sm font-medium"><span>導覽列名稱（英）</span><TranslateButton sourceField="navLabel_zh" targetField="navLabel_en" /></label>
                <input type="text" name="navLabel_en" defaultValue={page.navLabel_en || ""} className="w-full rounded border px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">標籤（中）</label>
                <input type="text" name="label_zh" defaultValue={page.label_zh || ""} className="w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 flex justify-between text-sm font-medium"><span>標籤（英）</span><TranslateButton sourceField="label_zh" targetField="label_en" /></label>
                <input type="text" name="label_en" defaultValue={page.label_en || ""} className="w-full rounded border px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">標題（中）*</label>
                <textarea name="title_zh" required rows={2} defaultValue={page.title_zh || ""} className="w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 flex justify-between text-sm font-medium"><span>標題（英）</span><TranslateButton sourceField="title_zh" targetField="title_en" /></label>
                <textarea name="title_en" rows={2} defaultValue={page.title_en || ""} className="w-full rounded border px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">描述（中）</label>
                <textarea name="desc_zh" rows={3} defaultValue={page.desc_zh || ""} className="w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 flex justify-between text-sm font-medium"><span>描述（英）</span><TranslateButton sourceField="desc_zh" targetField="desc_en" /></label>
                <textarea name="desc_en" rows={3} defaultValue={page.desc_en || ""} className="w-full rounded border px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end"><button type="submit" className="rounded bg-black px-6 py-2 text-sm text-white">儲存</button></div>
          </div>
        </form>

        {/* 根據頁面類型顯示對應編輯器 */}
        {page.type === "ABOUT" && (
          <div className="mt-6">
            <AboutEditor pageId={page.id} pageData={page.pageData} />
          </div>
        )}
        {page.type === "FACTORY" && (
          <div className="mt-6">
            <FactoryEditor pageId={page.id} pageData={page.pageData} />
          </div>
        )}
        {page.type === "CONTACT" && (
          <div className="mt-6">
            <ContactEditor pageId={page.id} pageData={page.pageData} />
          </div>
        )}
        {page.type === "CUSTOM" && (
          <div className="mt-6 rounded-xl border border-blue-300 bg-blue-50 p-6">
            <p className="text-sm text-blue-800">CUSTOM 類型使用 Homepage sections 系統（待開發）</p>
          </div>
        )}

        <div className="mt-6"><Link href="/admin-v2/pages" className="rounded border px-4 py-2 text-sm">← 返回</Link></div>
      </main>
    </div>
  );
}