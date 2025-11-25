// app/admin/homepage/factory/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

/** FACTORY 預設 payload：沒填時用這組 fallback */
const defaultFactoryPayload = {
  title_en: "Factory Strength",
  subtitle_en:
    "A clean production base with the capacity and equipment to support global gifting programs.",
  title_zh: "工廠實力與產能",
  subtitle_zh:
    "自有整潔生產基地與完整設備配置，支援品牌專案與大檔期禮盒需求。",
  cards: [
    {
      title_en: "10,000 m² Facility",
      body_en:
        "ISO-audited production space with flexible lines for different box types.",
      title_zh: "一萬平方公尺廠房",
      body_zh: "通過稽核的生產空間，可彈性配置不同盒型產線。",
      imageUrl: "/cdn/factory/floor.jpg",
    },
    {
      title_en: "Advanced Equipment",
      body_en:
        "Offset printing, die-cutting, lamination, hot stamping and rigid box forming.",
      title_zh: "完整包裝設備",
      body_zh: "膠版印刷、模切、過膜、燙金到自動成型機一應俱全。",
      imageUrl: "/cdn/factory/machine.jpg",
    },
    {
      title_en: "QC & Engineering",
      body_en:
        "In-house structural engineers and QC checks at critical stages of production.",
      title_zh: "結構工程與品管",
      body_zh: "內部結構工程團隊與多階段 QC，降低風險與錯誤。",
      imageUrl: "/cdn/factory/qc.jpg",
    },
  ],
};

/** Server action：更新指定 FACTORY id 的 payload */
async function updateFactoryPayload(formData: FormData) {
  "use server";

  const idRaw = formData.get("factoryId")?.toString();
  if (!idRaw) return;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) return;

  const factory = await prisma.homeSection.findUnique({
    where: { id },
  });

  if (!factory || factory.type !== "FACTORY") {
    return;
  }

  const str = (name: string) =>
    formData.get(name)?.toString().trim() || "";

  const prev = (factory.payload as any) || {};

  // 區塊標題 / 副標
  const title_en = str("factory_title_en");
  const subtitle_en = str("factory_subtitle_en");
  const title_zh = str("factory_title_zh");
  const subtitle_zh = str("factory_subtitle_zh");

  // 卡片 slots
  const slotsRaw = formData.get("cardSlots")?.toString() ?? "0";
  const slots = Number(slotsRaw);
  const cards: {
    title_en: string;
    body_en: string;
    title_zh: string;
    body_zh: string;
    imageUrl: string;
  }[] = [];

  for (let i = 0; i < slots; i++) {
    const cTitleEn = str(`card_${i}_title_en`);
    const cBodyEn = str(`card_${i}_body_en`);
    const cTitleZh = str(`card_${i}_title_zh`);
    const cBodyZh = str(`card_${i}_body_zh`);
    const cImage = str(`card_${i}_imageUrl`);

    const allEmpty =
      !cTitleEn && !cBodyEn && !cTitleZh && !cBodyZh && !cImage;

    if (allEmpty) continue;

    cards.push({
      title_en: cTitleEn,
      body_en: cBodyEn,
      title_zh: cTitleZh,
      body_zh: cBodyZh,
      imageUrl: cImage,
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
    where: { id: factory.id },
    data: { payload: newPayload },
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export default async function AdminFactoryEditPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          編輯 FACTORY 區塊
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

  const factory = await prisma.homeSection.findUnique({
    where: { id },
  });

  if (!factory || factory.type !== "FACTORY") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          編輯 FACTORY 區塊
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          找不到這個 ID 對應的 FACTORY 區塊。
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

  const payload = (factory.payload as any) || {};
  const cards: any[] =
    (payload.cards as any[]) ??
    (defaultFactoryPayload.cards as any[]);

  const baseCount = Math.max(cards.length, 3);
  const slots = baseCount + 3;

  const get = <
    K extends "title_en" | "subtitle_en" | "title_zh" | "subtitle_zh"
  >(
    key: K,
  ) =>
    (payload[key] as string) ??
    (defaultFactoryPayload as any)[key];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            編輯 FACTORY 區塊
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            目前編輯的區塊 ID 為{" "}
            <span className="font-mono font-semibold">
              #{factory.id}
            </span>{" "}
            ，order = {factory.order}。
          </p>
        </div>
        <Link
          href="/admin/homepage"
          className="text-xs text-zinc-500 hover:text-zinc-900"
        >
          ← 返回區塊列表
        </Link>
      </div>

      <form action={updateFactoryPayload} className="mt-6 space-y-6">
        <input
          type="hidden"
          name="factoryId"
          value={factory.id.toString()}
        />
        <input type="hidden" name="cardSlots" value={slots} />

        {/* 區塊主標 / 副標 */}
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
                name="factory_title_en"
                defaultValue={get("title_en")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                標題 (ZH)
              </label>
              <input
                name="factory_title_zh"
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
                name="factory_subtitle_en"
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
                name="factory_subtitle_zh"
                rows={3}
                defaultValue={get("subtitle_zh")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* 工廠卡片列表 */}
        <section className="space-y-4 rounded-md bg-zinc-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Factory cards
            </div>
            <p className="text-[11px] text-zinc-500">
              留白的卡片會被忽略；把某張卡片所有欄位清空 = 刪除那張卡片。前三張可在前台 3 欄顯示，其餘可做橫向滑動。
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

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-700">
                      Image URL
                    </label>
                    <input
                      name={`card_${i}_imageUrl`}
                      defaultValue={existing.imageUrl || ""}
                      className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs"
                    />
                    <p className="text-[10px] text-zinc-500">
                      先填 CDN / public 圖片路徑，之後可以再做上傳工具。
                    </p>
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
            儲存 FACTORY 內容
          </button>
        </div>
      </form>
    </main>
  );
}
