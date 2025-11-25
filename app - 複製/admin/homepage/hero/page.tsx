// app/admin/homepage/hero/page.tsx
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

/** 預設 HERO 內容：payload 沒填時用這組 fallback */
const defaultHeroPayload = {
  titleLine1_en: "Premium Gift Box Manufacturing",
  titleLine2_en: "for Global Brands",
  subtitle_en:
    "Customized rigid boxes, packaging sets and gifting programs — engineered, sampled and produced with consistent quality.",
  primaryLabel_en: "Start Your Project",
  secondaryLabel_en: "Download Catalog",
  primaryUrl: "/contact",
  secondaryUrl: "/cdn/catalog.pdf",
  imageUrl: "/cdn/hero/hero-giftbox.jpg",

  titleLine1_zh: "高質感客製禮盒製造",
  titleLine2_zh: "專為品牌與企業專案",
  subtitle_zh:
    "客製硬盒、禮盒組與企業贈品方案，從結構開發、打樣到大量生產一次完成。",
  primaryLabel_zh: "開始專案諮詢",
  secondaryLabel_zh: "下載型錄",
};

/** Server action：更新目前主 HERO 的 payload */
async function updateHeroPayload(formData: FormData) {
  "use server";

  // 先找啟用中的 HERO，order 最小者
  let hero = await prisma.homeSection.findFirst({
    where: { type: "HERO", enabled: true },
    orderBy: { order: "asc" },
  });

  // 如果沒有啟用中的，就找第一個 HERO
  if (!hero) {
    hero = await prisma.homeSection.findFirst({
      where: { type: "HERO" },
      orderBy: { order: "asc" },
    });
  }

  if (!hero) {
    // 沒有任何 HERO，就不做事
    return;
  }

  const str = (name: string) =>
    formData.get(name)?.toString().trim() || "";

  const prev = (hero.payload as any) || {};

  const newPayload = {
    ...prev,
    titleLine1_en: str("hero_titleLine1_en"),
    titleLine2_en: str("hero_titleLine2_en"),
    subtitle_en: str("hero_subtitle_en"),
    primaryLabel_en: str("hero_primaryLabel_en"),
    secondaryLabel_en: str("hero_secondaryLabel_en"),

    titleLine1_zh: str("hero_titleLine1_zh"),
    titleLine2_zh: str("hero_titleLine2_zh"),
    subtitle_zh: str("hero_subtitle_zh"),
    primaryLabel_zh: str("hero_primaryLabel_zh"),
    secondaryLabel_zh: str("hero_secondaryLabel_zh"),

    primaryUrl: str("hero_primaryUrl"),
    secondaryUrl: str("hero_secondaryUrl"),
    imageUrl: str("hero_imageUrl"),
  };

  await prisma.homeSection.update({
    where: { id: hero.id },
    data: { payload: newPayload },
  });

  // 讓前台與列表頁刷新
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export default async function AdminHeroEditPage() {
  // 讀取目前主 HERO
  const hero =
    (await prisma.homeSection.findFirst({
      where: { type: "HERO", enabled: true },
      orderBy: { order: "asc" },
    })) ??
    (await prisma.homeSection.findFirst({
      where: { type: "HERO" },
      orderBy: { order: "asc" },
    }));

  if (!hero) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          編輯 Hero 區塊
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          目前尚未建立任何 type=HERO 的首頁區塊。
          請先到{" "}
          <Link
            href="/admin/homepage"
            className="text-zinc-900 underline underline-offset-4"
          >
            /admin/homepage
          </Link>{" "}
          新增一個 HERO。
        </p>
      </main>
    );
  }

  const payload = (hero.payload as any) || {};

  const get = (key: keyof typeof defaultHeroPayload) =>
    (payload[key] as string) ?? defaultHeroPayload[key];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            編輯 Hero 區塊
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            套用到 type=HERO 且排序最前面的區塊。
            目前編輯的區塊 ID 為{" "}
            <span className="font-mono font-semibold">
              #{hero.id}
            </span>{" "}
            ，order = {hero.order}。
          </p>
        </div>
        <Link
          href="/admin/homepage"
          className="text-xs text-zinc-500 hover:text-zinc-900"
        >
          ← 返回區塊列表
        </Link>
      </div>

      <form action={updateHeroPayload} className="mt-6 space-y-6">
        {/* 英文區 */}
        <section className="space-y-3 rounded-md bg-zinc-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            English copy
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              Title line 1 (EN)
            </label>
            <input
              name="hero_titleLine1_en"
              defaultValue={get("titleLine1_en")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              Title line 2 (EN)
            </label>
            <input
              name="hero_titleLine2_en"
              defaultValue={get("titleLine2_en")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              Subtitle (EN)
            </label>
            <textarea
              name="hero_subtitle_en"
              rows={3}
              defaultValue={get("subtitle_en")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Primary button label (EN)
              </label>
              <input
                name="hero_primaryLabel_en"
                defaultValue={get("primaryLabel_en")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Secondary button label (EN)
              </label>
              <input
                name="hero_secondaryLabel_en"
                defaultValue={get("secondaryLabel_en")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* 中文區 */}
        <section className="space-y-3 rounded-md bg-zinc-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            中文文案
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              標題第一行 (ZH)
            </label>
            <input
              name="hero_titleLine1_zh"
              defaultValue={get("titleLine1_zh")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              標題第二行 (ZH)
            </label>
            <input
              name="hero_titleLine2_zh"
              defaultValue={get("titleLine2_zh")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              副標說明 (ZH)
            </label>
            <textarea
              name="hero_subtitle_zh"
              rows={3}
              defaultValue={get("subtitle_zh")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                主按鈕文字 (ZH)
              </label>
              <input
                name="hero_primaryLabel_zh"
                defaultValue={get("primaryLabel_zh")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                次按鈕文字 (ZH)
              </label>
              <input
                name="hero_secondaryLabel_zh"
                defaultValue={get("secondaryLabel_zh")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* URL / 圖片 */}
        <section className="space-y-4 rounded-md bg-zinc-50 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Primary button URL
              </label>
              <input
                name="hero_primaryUrl"
                defaultValue={get("primaryUrl")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Secondary button URL
              </label>
              <input
                name="hero_secondaryUrl"
                defaultValue={get("secondaryUrl")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              Hero image URL
            </label>
            <input
              name="hero_imageUrl"
              defaultValue={get("imageUrl")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <p className="text-[11px] text-zinc-500">
              目前先填圖片 URL（例如 /cdn/hero/hero-giftbox.jpg），未來再加「上傳圖片」功能。
            </p>
          </div>
        </section>

        <div className="flex justify-end border-t border-zinc-200 pt-4">
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
          >
            儲存 Hero 內容
          </button>
        </div>
      </form>
    </main>
  );
}
