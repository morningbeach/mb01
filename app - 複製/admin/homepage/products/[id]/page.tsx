// app/admin/homepage/products/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProductsLayoutPanel } from "./ProductsLayoutPanel";

export const dynamic = "force-dynamic";

const defaultProductsPayload = {
  title_en: "Product Categories",
  subtitle_en:
    "Three focused lines that cover most gifting and retail packaging needs.",
  title_zh: "產品與方案",
  subtitle_zh: "聚焦幾種常見的禮盒與包裝形式，方便快速溝通與估價。",
  source: {
    mode: "tags" as "tags" | "latest" | "manual",
    tagIds: [] as string[],
    manualProductIds: [] as string[],
    matchMode: "any" as "any" | "all",
    limit: 9,
  },
  layout: {
    type: "grid" as "grid" | "carousel" | "scroll",
    showSectionTitle: true,
    showProductName: true,
    showSubtitle: true,
    showPriceHint: false,
    clickable: true,
    carousel: {
      itemsPerView: 3,
      autoPlay: false,
      showArrows: true,
    },
  },
};

/* Server action */

async function updateProductsSection(formData: FormData) {
  "use server";

  const idRaw = formData.get("sectionId")?.toString();
  if (!idRaw) return;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) return;

  const section = await prisma.homeSection.findUnique({
    where: { id },
  });
  if (!section || section.type !== "PRODUCTS") {
    return;
  }

  const payloadPrev = (section.payload as any) || {};
  const prevSource = (payloadPrev.source as any) || {};
  const prevLayout = (payloadPrev.layout as any) || {};

  const getStr = (name: string) =>
    formData.get(name)?.toString().trim() ?? "";

  // Title / subtitle
  const title_en = getStr("title_en");
  const title_zh = getStr("title_zh");
  const subtitle_en = getStr("subtitle_en");
  const subtitle_zh = getStr("subtitle_zh");

  // Source
  const sourceModeRaw = getStr("source_mode");
  const sourceMode: "tags" | "latest" | "manual" =
    sourceModeRaw === "latest"
      ? "latest"
      : sourceModeRaw === "manual"
      ? "manual"
      : "tags";

  const tagIdStrings = formData.getAll("source_tagIds") as string[];
  const tagIds = tagIdStrings
    .map((v) => v.toString().trim())
    .filter((v) => v.length > 0);

  const manualProductIdStrings = formData.getAll(
    "manual_product_ids",
  ) as string[];
  const manualProductIds = manualProductIdStrings
    .map((v) => v.toString().trim())
    .filter((v) => v.length > 0);

  const matchModeRaw = getStr("matchMode");
  const matchMode: "any" | "all" =
    matchModeRaw === "all" ? "all" : "any";

  const limitRaw = getStr("limit");
  const limitParsed = Number(limitRaw || "9");
  const limit =
    Number.isFinite(limitParsed) && limitParsed > 0
      ? limitParsed
      : 9;

  // Layout: 從 hidden JSON 讀（來自 ProductsLayoutPanel）
  let layout = prevLayout;
  const layoutJson = formData.get("layout_json")?.toString();
  if (layoutJson) {
    try {
      const parsed = JSON.parse(layoutJson);
      layout = {
        ...defaultProductsPayload.layout,
        ...prevLayout,
        ...parsed,
        carousel: {
          ...defaultProductsPayload.layout.carousel,
          ...(prevLayout.carousel || {}),
          ...(parsed.carousel || {}),
        },
      };
    } catch {
      layout = {
        ...defaultProductsPayload.layout,
        ...prevLayout,
      };
    }
  } else {
    layout = {
      ...defaultProductsPayload.layout,
      ...prevLayout,
      carousel: {
        ...defaultProductsPayload.layout.carousel,
        ...(prevLayout.carousel || {}),
      },
    };
  }

  // 額外處理 Section Title 顯示開關（上面的 checkbox）
  // 勾選代表「顯示 Section Title」，未勾選則隱藏
  const showSectionTitleField = formData.get(
    "layout_showSectionTitle",
  );
  const showSectionTitle = !!showSectionTitleField;

  layout = {
    ...layout,
    showSectionTitle,
  };

  const newPayload = {
    ...payloadPrev,
    title_en,
    title_zh,
    subtitle_en,
    subtitle_zh,
    source: {
      ...defaultProductsPayload.source,
      ...prevSource,
      mode: sourceMode,
      tagIds,
      manualProductIds,
      matchMode,
      limit,
    },
    layout,
  };

  await prisma.homeSection.update({
    where: { id: section.id },
    data: { payload: newPayload },
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  redirect("/admin/homepage");
}

/* Page */

export default async function AdminProductsEditPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          編輯 PRODUCTS 區塊
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

  if (!section || section.type !== "PRODUCTS") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          編輯 PRODUCTS 區塊
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          找不到這個 ID 對應的 PRODUCTS 區塊。
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
  const source = (payload.source as any) || {};
  const layout = (payload.layout as any) || {};

  const title_en =
    payload.title_en ?? defaultProductsPayload.title_en;
  const title_zh =
    payload.title_zh ?? defaultProductsPayload.title_zh;
  const subtitle_en =
    payload.subtitle_en ?? defaultProductsPayload.subtitle_en;
  const subtitle_zh =
    payload.subtitle_zh ?? defaultProductsPayload.subtitle_zh;

  const sourceMode: "tags" | "latest" | "manual" =
    source.mode === "latest"
      ? "latest"
      : source.mode === "manual"
      ? "manual"
      : "tags";

  const selectedTagIds: string[] = Array.isArray(source.tagIds)
    ? source.tagIds.map((v: any) => v.toString())
    : defaultProductsPayload.source.tagIds;

  const selectedManualIds: string[] = Array.isArray(
    source.manualProductIds,
  )
    ? source.manualProductIds.map((v: any) => v.toString())
    : defaultProductsPayload.source.manualProductIds;

  const matchModeValue: "any" | "all" =
    source.matchMode === "all" ? "all" : "any";

  let limitValue: number;
  if (typeof source.limit === "number" && source.limit > 0) {
    limitValue = source.limit;
  } else if (
    typeof source.limit === "string" &&
    !Number.isNaN(Number(source.limit))
  ) {
    const parsed = Number(source.limit);
    limitValue =
      parsed > 0 ? parsed : defaultProductsPayload.source.limit;
  } else {
    limitValue = defaultProductsPayload.source.limit;
  }

  const layoutMerged = {
    ...defaultProductsPayload.layout,
    ...layout,
    carousel: {
      ...defaultProductsPayload.layout.carousel,
      ...(layout.carousel || {}),
    },
  };

  const allTags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  const allProducts = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            編輯 PRODUCTS 區塊
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            目前編輯的區塊 ID 為{" "}
            <span className="font-mono font-semibold">
              #{section.id}
            </span>{" "}
            ，order = {section.order}。
          </p>
        </div>
        <Link
          href="/admin/homepage"
          className="text-xs text-zinc-500 hover:text-zinc-900"
        >
          ← 返回區塊列表
        </Link>
      </div>

      <form
        action={updateProductsSection}
        className="mt-6 space-y-8"
      >
        <input
          type="hidden"
          name="sectionId"
          value={section.id.toString()}
        />

        {/* 1. Section Title 區域 */}
        <section className="space-y-4 rounded-md bg-zinc-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Section title
            </div>
            <label className="flex items-center gap-2 text-[11px] text-zinc-600">
              <input
                type="checkbox"
                name="layout_showSectionTitle"
                defaultChecked={layoutMerged.showSectionTitle}
                className="h-3 w-3 rounded border-zinc-300"
              />
              顯示整個 Section Title（title + subtitle）
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Title (EN)
              </label>
              <input
                name="title_en"
                defaultValue={title_en}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                標題 (ZH)
              </label>
              <input
                name="title_zh"
                defaultValue={title_zh}
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
                name="subtitle_en"
                rows={3}
                defaultValue={subtitle_en}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                副標說明 (ZH)
              </label>
              <textarea
                name="subtitle_zh"
                rows={3}
                defaultValue={subtitle_zh}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* 2. 來源設定 */}
        <section className="space-y-4 rounded-md bg-zinc-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Source
            </div>
            <p className="text-[11px] text-zinc-500">
              選擇 PRODUCTS 區塊要顯示哪些商品。
            </p>
          </div>

          {/* 模式切換 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              Source mode
            </label>
            <div className="flex flex-wrap gap-3 text-[11px]">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="source_mode"
                  value="tags"
                  defaultChecked={sourceMode === "tags"}
                  className="h-3 w-3"
                />
                <span>依 Tag 自動抓取</span>
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="source_mode"
                  value="latest"
                  defaultChecked={sourceMode === "latest"}
                  className="h-3 w-3"
                />
                <span>最新商品（依建立時間）</span>
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="source_mode"
                  value="manual"
                  defaultChecked={sourceMode === "manual"}
                  className="h-3 w-3"
                />
                <span>手動指定商品</span>
              </label>
            </div>
          </div>

          {/* Tag 多選 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              Tags（依 Tag 抓商品時適用）
            </label>
            <div className="rounded-md border border-zinc-200 bg-white p-2">
              {allTags.length === 0 ? (
                <p className="text-[11px] text-zinc-500">
                  尚未建立任何 tag，可先到 /admin/products/tags 新增。
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-1 text-[11px]"
                    >
                      <input
                        type="checkbox"
                        name="source_tagIds"
                        value={tag.id}
                        defaultChecked={selectedTagIds.includes(
                          tag.id,
                        )}
                        className="h-3 w-3 rounded border-zinc-300"
                      />
                      <span>{tag.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              只要商品有勾到這些 tag，就有機會顯示在這個區塊。
            </p>
          </div>

          {/* 手動指定商品 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              手動指定商品（Source mode = manual 時使用）
            </label>
            <div className="rounded-md border border-zinc-200 bg-white p-2">
              {allProducts.length === 0 ? (
                <p className="text-[11px] text-zinc-500">
                  目前尚未建立任何商品。
                </p>
              ) : (
                <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto text-[11px] md:grid-cols-3">
                  {allProducts.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-1 rounded border border-zinc-200 px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        name="manual_product_ids"
                        value={p.id}
                        defaultChecked={selectedManualIds.includes(
                          p.id,
                        )}
                        className="h-3 w-3 rounded border-zinc-300"
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              手動模式會依勾選順序顯示商品（前台仍會依 limit 限制數量）。
            </p>
          </div>

          {/* match mode + limit */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Tag 匹配方式
              </label>
              <select
                name="matchMode"
                defaultValue={matchModeValue}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="any">
                  至少符合其中一個 tag 即顯示（建議）
                </option>
                <option value="all">
                  必須同時符合所有選取的 tag 才顯示
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                最多顯示商品數量（所有模式通用）
              </label>
              <input
                type="number"
                name="limit"
                min={1}
                max={48}
                defaultValue={limitValue}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
              <p className="text-[11px] text-zinc-500">
                依前台排版建議 6、9 或 12 個。
              </p>
            </div>
          </div>
        </section>

        {/* 3. 展示 Layout（客製 client panel） */}
        <ProductsLayoutPanel initialLayout={layoutMerged} />

        <div className="flex justify-end border-t border-zinc-200 pt-4">
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
          >
            儲存 PRODUCTS 內容並返回列表
          </button>
        </div>
      </form>
    </main>
  );
}
