// app/admin/homepage/page.tsx
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

/* -------------------------------------------------------
   預設 HERO payload
------------------------------------------------------- */
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

/* -------------------------------------------------------
   Server Actions
------------------------------------------------------- */

// A. 新增 Section
export async function createSection(formData: FormData) {
  "use server";

  const type = formData.get("type")?.toString() as
    | "HERO"
    | "WHY"
    | "PRODUCTS"
    | "FACTORY"
    | "BLOG"
    | "CTA"
    | "RICH_TEXT";

  const enabled = formData.get("enabled") === "on";
  const orderRaw = formData.get("order")?.toString() ?? "100";
  const order = Number(orderRaw);

  if (!type) return;

  await prisma.homeSection.create({
    data: {
      type,
      order: Number.isFinite(order) ? order : 100,
      enabled,
      payload: type === "HERO" ? defaultHeroPayload : {},
    },
  });

  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

// B. 更新單一 Section（排序/啟用）
export async function updateSectionRow(formData: FormData) {
  "use server";

  const idRaw = formData.get("sectionId")?.toString();
  if (!idRaw) return;
  const id = Number(idRaw);

  const enabled = formData.get("enabled") === "on";
  const orderRaw = formData.get("order")?.toString() ?? "100";
  const order = Number(orderRaw);

  await prisma.homeSection.update({
    where: { id },
    data: {
      enabled,
      order: Number.isFinite(order) ? order : 100,
    },
  });

  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

// C. 刪除 section
export async function deleteSection(formData: FormData) {
  "use server";

  const idRaw = formData.get("deleteId")?.toString();
  if (!idRaw) return;

  const id = Number(idRaw);

  await prisma.homeSection.delete({
    where: { id },
  });

  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

/* -------------------------------------------------------
   Page Component
------------------------------------------------------- */

export default async function AdminHomepagePage() {
  const sections = await prisma.homeSection.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Homepage sections
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        控制首頁所有模組的新增、排序、啟用、編輯。
      </p>

      {/* ---------------------------------------------------
         新增 Section
      --------------------------------------------------- */}
      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">新增區塊</h2>

        <form
          action={createSection}
          className="mt-4 flex flex-col gap-4 md:flex-row md:items-end"
        >
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-zinc-700">
              Section 類型
            </label>
            <select
              name="type"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="HERO">HERO</option>
              <option value="WHY">WHY</option>
              <option value="PRODUCTS">PRODUCTS</option>
              <option value="FACTORY">FACTORY</option>
              <option value="BLOG">BLOG</option>
              <option value="CTA">CTA</option>
              <option value="RICH_TEXT">RICH_TEXT</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700">Order</label>
            <input
              name="order"
              type="number"
              defaultValue={
                sections.length
                  ? sections[sections.length - 1].order + 10
                  : 10
              }
              className="w-24 rounded-md border border-zinc-300 px-2 py-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-700">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked
              className="h-4 w-4 rounded border-zinc-300"
            />
            啟用
          </label>

          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
          >
            新增區塊
          </button>
        </form>
      </section>

      {/* ---------------------------------------------------
         Section List
      --------------------------------------------------- */}
      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">已有區塊</h2>
          <span className="text-xs text-zinc-500">{sections.length} 個</span>
        </div>

        <div className="mt-4 space-y-3">
          {sections.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
            >
              {/* 左側 label */}
              <div className="flex items-center gap-3">
                <span className="inline-flex min-w-[80px] justify-center rounded-full bg-zinc-900 px-2 py-1 text-xs font-medium uppercase tracking-wide text-white">
                  {s.type}
                </span>

                <div className="flex flex-col">
                  <span className="text-xs text-zinc-700">#{s.id}</span>
                </div>
              </div>

              {/* 中間：排序 + 啟用 + 編輯 */}
              <form
                action={updateSectionRow}
                className="flex flex-1 flex-wrap items-center justify-end gap-3 text-xs"
              >
                <input type="hidden" name="sectionId" value={s.id.toString()} />

                <div className="flex items-center gap-1">
                  <span>Order</span>
                  <input
                    type="number"
                    name="order"
                    defaultValue={s.order}
                    className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-xs"
                  />
                </div>

                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="enabled"
                    defaultChecked={s.enabled}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  啟用
                </label>

                {renderEditButton(s.type, s.id)}

                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 px-3 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  儲存
                </button>
              </form>

              {/* 刪除 */}
              <form action={deleteSection}>
                <input type="hidden" name="deleteId" value={s.id.toString()} />
                <button
                  type="submit"
                  className="rounded-md border border-red-300 px-3 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
                >
                  刪除
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------
   小工具：編輯按鈕路由
------------------------------------------------------- */
function renderEditButton(type: string, id: number) {
  const url = `/admin/homepage/${type.toLowerCase()}/${id}`;

  return (
    <Link
      href={url}
      className="rounded-md border border-zinc-300 px-3 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100"
    >
      編輯 {type}
    </Link>
  );
}
