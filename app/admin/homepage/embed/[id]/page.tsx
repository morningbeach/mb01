// app/admin/homepage/embed/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

/** 預設 EMBED 內容 */
const defaultEmbedPayload = {
  title_en: "",
  title_zh: "",
  embedCode: "",
  embedType: "custom", // youtube, vimeo, instagram, custom
  aspectRatio: "16:9", // 16:9, 4:3, 1:1, custom
  customHeight: "",
  maxWidth: "800",
  showTitle: false,
};

/** Server action：更新 EMBED 區塊 */
async function updateEmbedPayload(formData: FormData) {
  "use server";

  const idRaw = formData.get("embedId")?.toString();
  if (!idRaw) return;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) return;

  const section = await prisma.homeSection.findUnique({
    where: { id },
  });

  if (!section || section.type !== "EMBED") {
    return;
  }

  const str = (name: string) =>
    formData.get(name)?.toString().trim() || "";

  const prev = (section.payload as any) || {};

  const newPayload = {
    ...prev,
    title_en: str("embed_title_en"),
    title_zh: str("embed_title_zh"),
    embedCode: str("embed_embedCode"),
    embedType: str("embed_embedType") || "custom",
    aspectRatio: str("embed_aspectRatio") || "16:9",
    customHeight: str("embed_customHeight"),
    maxWidth: str("embed_maxWidth") || "800",
    showTitle: formData.get("embed_showTitle") === "on",
  };

  await prisma.homeSection.update({
    where: { id: section.id },
    data: { payload: newPayload },
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export default async function AdminEmbedEditPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          編輯嵌入區塊
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          提供的 ID 無效。
        </p>
        <Link
          href="/admin/homepage"
          className="mt-4 inline-block text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← 返回區塊列表
        </Link>
      </main>
    );
  }

  const section = await prisma.homeSection.findUnique({
    where: { id },
  });

  if (!section || section.type !== "EMBED") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          編輯嵌入區塊
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          找不到這個 ID 對應的 EMBED 區塊。
        </p>
        <Link
          href="/admin/homepage"
          className="mt-4 inline-block text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← 返回區塊列表
        </Link>
      </main>
    );
  }

  const payload = (section.payload as any) || {};
  const get = (key: keyof typeof defaultEmbedPayload) =>
    (payload[key] as any) ?? defaultEmbedPayload[key];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            編輯嵌入區塊 (Embed)
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            區塊 ID：<span className="font-mono font-semibold">#{section.id}</span>
            ，order = {section.order}
          </p>
        </div>
        <Link
          href="/admin/homepage"
          className="text-xs text-zinc-500 hover:text-zinc-900"
        >
          ← 返回區塊列表
        </Link>
      </div>

      <form action={updateEmbedPayload} className="mt-6 space-y-6">
        <input type="hidden" name="embedId" value={section.id.toString()} />

        {/* 標題區（可選） */}
        <section className="space-y-3 rounded-md bg-zinc-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              區塊標題（可選）
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="embed_showTitle"
                defaultChecked={get("showTitle")}
                className="rounded"
              />
              <span className="text-zinc-600">顯示標題</span>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                標題 (EN)
              </label>
              <input
                name="embed_title_en"
                defaultValue={get("title_en")}
                placeholder="e.g., Our Latest Video"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                標題 (ZH)
              </label>
              <input
                name="embed_title_zh"
                defaultValue={get("title_zh")}
                placeholder="例如：最新影片"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* 嵌入類型選擇 */}
        <section className="space-y-4 rounded-md bg-zinc-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            嵌入設定
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                嵌入類型
              </label>
              <select
                name="embed_embedType"
                defaultValue={get("embedType")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="instagram">Instagram</option>
                <option value="spotify">Spotify</option>
                <option value="google_map">Google Map</option>
                <option value="custom">自訂 HTML/iframe</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                畫面比例
              </label>
              <select
                name="embed_aspectRatio"
                defaultValue={get("aspectRatio")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="16:9">16:9 (影片)</option>
                <option value="4:3">4:3 (傳統)</option>
                <option value="1:1">1:1 (正方形)</option>
                <option value="9:16">9:16 (直式影片)</option>
                <option value="custom">自訂高度</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                最大寬度 (px)
              </label>
              <input
                name="embed_maxWidth"
                type="number"
                defaultValue={get("maxWidth")}
                placeholder="800"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                自訂高度 (px)
              </label>
              <input
                name="embed_customHeight"
                type="number"
                defaultValue={get("customHeight")}
                placeholder="留空使用比例自動計算"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
              <p className="text-[11px] text-zinc-500">
                僅在選擇「自訂高度」比例時使用
              </p>
            </div>
          </div>
        </section>

        {/* 嵌入碼 */}
        <section className="space-y-3 rounded-md bg-zinc-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            嵌入碼 / URL
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              嵌入內容
            </label>
            <textarea
              name="embed_embedCode"
              rows={8}
              defaultValue={get("embedCode")}
              placeholder={`支援以下格式：

1. YouTube 連結：
   https://www.youtube.com/watch?v=xxxxx
   https://youtu.be/xxxxx

2. Vimeo 連結：
   https://vimeo.com/xxxxx

3. Instagram 貼文：
   https://www.instagram.com/p/xxxxx/

4. 完整 iframe 程式碼：
   <iframe src="..." ...></iframe>

5. 任何 HTML 程式碼`}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-mono"
            />
            <p className="text-[11px] text-zinc-500">
              可以貼入 YouTube/Vimeo URL、Instagram 貼文連結，或完整的 iframe/HTML 程式碼
            </p>
          </div>
        </section>

        {/* 預覽提示 */}
        <section className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium">支援的平台</p>
              <ul className="mt-1 list-inside list-disc text-xs space-y-1">
                <li>YouTube - 貼入影片連結或嵌入碼</li>
                <li>Vimeo - 貼入影片連結</li>
                <li>Instagram - 貼入貼文連結</li>
                <li>Spotify - 貼入播放器嵌入碼</li>
                <li>Google Maps - 貼入地圖 iframe</li>
                <li>任何 iframe 或 HTML 內容</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4">
          <Link
            href="/admin/homepage"
            className="rounded-md border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            取消
          </Link>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
          >
            儲存嵌入區塊
          </button>
        </div>
      </form>
    </main>
  );
}
