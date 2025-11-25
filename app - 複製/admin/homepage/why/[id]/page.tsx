// app/admin/homepage/why/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

/** WHY 預設 payload：沒填時用這組 fallback */
const defaultWhyPayload = {
  title_en: "Why Brands Choose Us",
  subtitle_en:
    "Strong engineering, stable quality and clear communication for packaging projects that actually land on time.",
  title_zh: "為什麼品牌選擇我們？",
  subtitle_zh:
    "從結構工程、品質管理到溝通回應，以專案需求為核心協助你穩定落地每一檔活動。",
  cards: [
    {
      title_en: "Brand-Level Quality",
      body_en:
        "Clean edges, precise structures and consistent color from sample to mass production.",
      title_zh: "品牌級品質控制",
      body_zh: "從打樣到量產，邊角、結構與色彩都維持一致與穩定。",
    },
    {
      title_en: "Reliable Production",
      body_en:
        "Experienced teams, strict QC and realistic schedules for seasonal campaigns.",
      title_zh: "穩定量產與交期",
      body_zh: "有經驗的團隊與實際可行的排程，支援檔期與季節專案。",
    },
    {
      title_en: "One-Stop Packaging",
      body_en:
        "Gift box, insert, bag and shipping carton integrated into a single project.",
      title_zh: "一站式包裝服務",
      body_zh: "從禮盒、內襯、提袋到外箱，整合成同一個專案管理。",
    },
  ],
};

/** Server action：更新指定 WHY id 的 payload */
async function updateWhyPayload(formData: FormData) {
  "use server";

  const idRaw = formData.get("whyId")?.toString();
  if (!idRaw) return;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) return;

  const why = await prisma.homeSection.findUnique({
    where: { id },
  });

  if (!why || why.type !== "WHY") {
    return;
  }

  const str = (name: string) =>
    formData.get(name)?.toString().trim() || "";

  const prev = (why.payload as any) || {};

  const title_en = str("why_title_en");
  const subtitle_en = str("why_subtitle_en");
  const title_zh = str("why_title_zh");
  const subtitle_zh = str("why_subtitle_zh");

  const slotsRaw = formData.get("cardSlots")?.toString() ?? "0";
  const slots = Number(slotsRaw);
  const cards: {
    title_en: string;
    body_en: string;
    title_zh: string;
    body_zh: string;
  }[] = [];

  for (let i = 0; i < slots; i++) {
    const cTitleEn = str(`card_${i}_title_en`);
    const cBodyEn = str(`card_${i}_body_en`);
    const cTitleZh = str(`card_${i}_title_zh`);
    const cBodyZh = str(`card_${i}_body_zh`);

    const allEmpty =
      !cTitleEn && !cBodyEn && !cTitleZh && !cBodyZh;

    if (allEmpty) continue;

    cards.push({
      title_en: cTitleEn,
      body_en: cBodyEn,
      title_zh: cTitleZh,
      body_zh: cBodyZh,
    });
  }

  const newPayload = {
    ...prev,
    title_en,
    subtitle_en,
    title_zh,
    subtitle_zh,
    cards,
  };

  await prisma.homeSection.update({
    where: { id: why.id },
    data: { payload: newPayload },
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export default async function AdminWhyEditPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          編輯 WHY 區塊
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

  const why = await prisma.homeSection.findUnique({
    where: { id },
  });

  if (!why || why.type !== "WHY") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          編輯 WHY 區塊
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          找不到這個 ID 對應的 WHY 區塊。
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

  const payload = (why.payload as any) || {};
  const cards: any[] =
    (payload.cards as any[]) ??
    (defaultWhyPayload.cards as any[]);

  const baseCount = Math.max(cards.length, 3);
  const slots = baseCount + 3;

  const get = <
    K extends "title_en" | "subtitle_en" | "title_zh" | "subtitle_zh"
  >(
    key: K,
  ) =>
    (payload[key] as string) ??
    (defaultWhyPayload as any)[key];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            編輯 WHY 區塊
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            目前編輯的區塊 ID 為{" "}
            <span className="font-mono font-semibold">
              #{why.id}
            </span>{" "}
            ，order = {why.order}。
          </p>
        </div>
        <Link
          href="/admin/homepage"
          className="text-xs text-zinc-500 hover:text-zinc-900"
        >
          ← 返回區塊列表
        </Link>
      </div>

      <form action={updateWhyPayload} className="mt-6 space-y-6">
        <input type="hidden" name="whyId" value={why.id.toString()} />
        <input type="hidden" name="cardSlots" value={slots} />

        {/* 主標 / 副標 */}
        <section className="space-y-3 rounded-md bg-zinc-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Section title
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Title (EN)
              </label>
              <input
                name="why_title_en"
                defaultValue={get("title_en")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                標題 (ZH)
              </label>
              <input
                name="why_title_zh"
                defaultValue={get("title_zh")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Subtitle (EN)
              </label>
              <textarea
                name="why_subtitle_en"
                rows={3}
                defaultValue={get("subtitle_en")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                副標說明 (ZH)
              </label>
              <textarea
                name="why_subtitle_zh"
                rows={3}
                defaultValue={get("subtitle_zh")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* 卡片列表 */}
        <section className="space-y-4 rounded-md bg-zinc-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Feature cards
            </div>
            <p className="text-[11px] text-zinc-500">
              留白的卡片會被忽略；把某張卡片四個欄位全部清空 =
              刪除那張卡片。最上面三張會在前台以 3 欄顯示，其餘會變成橫向滑動。
            </p>
          </div>

          <div className="space-y-3">
            {Array.from({ length: slots }).map((_, i) => {
              const existing = cards[i] || {};
              const label =
                i < cards.length
                  ? `Card #${i + 1}`
                  : `新增卡片 #${i + 1}`;

              return (
                <div
                  key={i}
                  className="space-y-2 rounded-md border border-zinc-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-700">
                      {label}
                    </span>
                    {i >= 3 && (
                      <span className="text-[10px] text-zinc-400">
                        （可能顯示在橫向滑動列）
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">
                        Title (EN)
                      </label>
                      <input
                        name={`card_${i}_title_en`}
                        defaultValue={existing.title_en || ""}
                        className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">
                        標題 (ZH)
                      </label>
                      <input
                        name={`card_${i}_title_zh`}
                        defaultValue={existing.title_zh || ""}
                        className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">
                        Body (EN)
                      </label>
                      <textarea
                        name={`card_${i}_body_en`}
                        rows={2}
                        defaultValue={existing.body_en || ""}
                        className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">
                        說明 (ZH)
                      </label>
                      <textarea
                        name={`card_${i}_body_zh`}
                        rows={2}
                        defaultValue={existing.body_zh || ""}
                        className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex justify-end border-t border-zinc-200 pt-4">
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
          >
            儲存 WHY 內容
          </button>
        </div>
      </form>
    </main>
  );
}
