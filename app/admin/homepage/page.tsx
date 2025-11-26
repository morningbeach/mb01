// app/admin/homepage/page.tsx
import { prisma } from "@/lib/prisma";
import { HomepageSectionManager } from "./HomepageSectionManager";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/** 預設 HERO payload */
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

/** 預設 EMBED payload */
const defaultEmbedPayload = {
  title_en: "",
  title_zh: "",
  embedCode: "",
  embedType: "custom",
  aspectRatio: "16:9",
  customHeight: "",
  maxWidth: "800",
  showTitle: false,
};

/** 預設 VIDEO payload */
const defaultVideoPayload = {
  title_en: "",
  title_zh: "",
  videoUrl: "",
  posterImage: "",
  autoplay: false,
  loop: false,
  muted: true,
  showTitle: false,
};

/** 根據類型取得預設 payload */
function getDefaultPayload(type: string) {
  switch (type.toLowerCase()) {
    case "hero":
      return defaultHeroPayload;
    case "embed":
      return defaultEmbedPayload;
    case "video":
      return defaultVideoPayload;
    default:
      return {};
  }
}

/** Server Action: 新增 Section */
async function createSection(formData: FormData) {
  "use server";

  const typeInput = formData.get("type")?.toString();
  const enabled = formData.get("enabled") === "on";
  const orderRaw = formData.get("order")?.toString() ?? "100";
  const order = Number(orderRaw);

  if (!typeInput) return;

  // 轉換成大寫 enum 格式
  const type = typeInput.toUpperCase() as any;

  await prisma.homeSection.create({
    data: {
      type,
      order: Number.isFinite(order) ? order : 100,
      enabled,
      payload: getDefaultPayload(typeInput),
    },
  });

  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export default async function AdminHomepagePage() {
  const sections = await prisma.homeSection.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="首頁管理"
        description="管理首頁各區塊的內容、順序與顯示狀態"
      />

      {/* 新增區塊表單 */}
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
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
              <option value="hero">Hero（首頁橫幅）</option>
              <option value="why">Why（為什麼選擇我們）</option>
              <option value="products">Products（精選產品）</option>
              <option value="factory">Factory（工廠介紹）</option>
              <option value="cta">CTA（行動呼籲）</option>
              <option value="gallery">Gallery（圖片廊）</option>
              <option value="embed">Embed（嵌入區塊）</option>
              <option value="video">Video（影片區塊）</option>
              <option value="rich_text">Rich Text（富文本）</option>
              <option value="blog">Blog（部落格）</option>
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
      </div>

      <HomepageSectionManager sections={sections} />
    </div>
  );
}
