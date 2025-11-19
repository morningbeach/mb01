// app/admin/homepage/cta/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

/** CTA 預設 payload：沒填時用這組 fallback */
const defaultCtaPayload = {
  title_en: "Start Your Gift Box Project",
  subtitle_en:
    "Send us your quantity, timeline and a rough idea. We’ll reply with structural suggestions and a quick quotation.",
  title_zh: "開始你的禮盒專案",
  subtitle_zh:
    "提供數量、時程與大致方向，我們會回覆結構建議與估價範圍，協助你快速啟動專案。",
  style: {
    backgroundMode: "color" as "color" | "image",
    backgroundColor: "#000000",
    backgroundImageUrl: "",
    overlayOpacity: 0.4,
    textTone: "light" as "light" | "dark",
  },
  buttons: [
    {
      label_en: "Get a Quote",
      label_zh: "取得報價",
      actionType: "link" as CtaActionType,
      value: "/contact",
    },
    {
      label_en: "Email Your Brief",
      label_zh: "寄信給我們",
      actionType: "email" as CtaActionType,
      value: "info@example.com",
    },
  ],
};

type CtaActionType =
  | "link"
  | "email"
  | "phone"
  | "line"
  | "whatsapp"
  | "telegram"
  | "wechat";

type CtaPayload = typeof defaultCtaPayload;

/** Server action：更新指定 CTA id 的 payload */
async function updateCtaPayload(formData: FormData) {
  "use server";

  const idRaw = formData.get("ctaId")?.toString();
  if (!idRaw) return;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) return;

  const section = await prisma.homeSection.findUnique({
    where: { id },
  });

  if (!section || section.type !== "CTA") {
    return;
  }

  const str = (name: string) =>
    formData.get(name)?.toString().trim() || "";

  const prev = (section.payload as any) || {};
  const prevStyle = (prev.style as any) || {};
  const prevButtons = (prev.buttons as any[]) || [];

  // 標題 / 副標
  const title_en = str("cta_title_en");
  const subtitle_en = str("cta_subtitle_en");
  const title_zh = str("cta_title_zh");
  const subtitle_zh = str("cta_subtitle_zh");

  // 背景樣式
  const backgroundModeRaw = str("backgroundMode");
  const backgroundMode: "color" | "image" =
    backgroundModeRaw === "image" ? "image" : "color";

  const backgroundColor =
    str("backgroundColor") || prevStyle.backgroundColor || "#000000";

  const backgroundImageUrl =
    str("backgroundImageUrl") || prevStyle.backgroundImageUrl || "";

  const overlayOpacityRaw = str("overlayOpacity");
  const overlayOpacityNumber = Number(overlayOpacityRaw || "0.4");
  const overlayOpacity =
    Number.isFinite(overlayOpacityNumber) && overlayOpacityNumber >= 0 && overlayOpacityNumber <= 0.95
      ? overlayOpacityNumber
      : 0.4;

  const textToneRaw = str("textTone");
  const textTone: "light" | "dark" =
    textToneRaw === "dark" ? "dark" : "light";

  // CTA 按鈕
  const slotsRaw = formData.get("buttonSlots")?.toString() ?? "0";
  const slots = Number(slotsRaw);
  const buttons: {
    label_en: string;
    label_zh: string;
    actionType: CtaActionType;
    value: string;
  }[] = [];

  for (let i = 0; i < slots; i++) {
    const labelEn = str(`btn_${i}_label_en`);
    const labelZh = str(`btn_${i}_label_zh`);
    const actionTypeRaw = str(`btn_${i}_actionType`);
    const value = str(`btn_${i}_value`);

    const allEmpty = !labelEn && !labelZh && !actionTypeRaw && !value;
    if (allEmpty) continue;

    const actionType: CtaActionType =
      actionTypeRaw === "email" ||
      actionTypeRaw === "phone" ||
      actionTypeRaw === "line" ||
      actionTypeRaw === "whatsapp" ||
      actionTypeRaw === "telegram" ||
      actionTypeRaw === "wechat"
        ? (actionTypeRaw as CtaActionType)
        : "link";

    buttons.push({
      label_en: labelEn,
      label_zh: labelZh,
      actionType,
      value,
    });
  }

  const newPayload: CtaPayload = {
    ...(defaultCtaPayload as any),
    ...prev,
    title_en,
    subtitle_en,
    title_zh,
    subtitle_zh,
    style: {
      ...(defaultCtaPayload.style as any),
      ...prevStyle,
      backgroundMode,
      backgroundColor,
      backgroundImageUrl,
      overlayOpacity,
      textTone,
    },
    buttons: buttons.length > 0 ? buttons : prevButtons,
  };

  await prisma.homeSection.update({
    where: { id: section.id },
    data: { payload: newPayload },
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export default async function AdminCtaEditPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          編輯 CTA 區塊
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

  if (!section || section.type !== "CTA") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          編輯 CTA 區塊
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          找不到這個 ID 對應的 CTA 區塊。
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
  const style = (payload.style as any) || {};
  const buttons: any[] =
    (payload.buttons as any[]) ||
    (defaultCtaPayload.buttons as any[]);

  const getText = <
    K extends "title_en" | "subtitle_en" | "title_zh" | "subtitle_zh"
  >(
    key: K,
  ) =>
    (payload[key] as string) ??
    (defaultCtaPayload as any)[key];

  const backgroundMode: "color" | "image" =
    style.backgroundMode === "image" ? "image" : "color";

  const backgroundColor: string =
    style.backgroundColor || defaultCtaPayload.style.backgroundColor;

  const backgroundImageUrl: string =
    style.backgroundImageUrl || defaultCtaPayload.style.backgroundImageUrl;

  const overlayOpacity: number =
    typeof style.overlayOpacity === "number"
      ? style.overlayOpacity
      : defaultCtaPayload.style.overlayOpacity;

  const textTone: "light" | "dark" =
    style.textTone === "dark" ? "dark" : "light";

  // Button slots：現有數量 + 3 個空的，讓你可以新增
  const baseCount = Math.max(buttons.length, 2);
  const slots = baseCount + 3;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            編輯 CTA 區塊
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

      <form action={updateCtaPayload} className="mt-6 space-y-6">
        <input
          type="hidden"
          name="ctaId"
          value={section.id.toString()}
        />
        <input type="hidden" name="buttonSlots" value={slots} />

        {/* 文案：標題 / 副標 */}
        <section className="space-y-3 rounded-md bg-zinc-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Text content
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Title (EN)
              </label>
              <input
                name="cta_title_en"
                defaultValue={getText("title_en")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                標題 (ZH)
              </label>
              <input
                name="cta_title_zh"
                defaultValue={getText("title_zh")}
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
                name="cta_subtitle_en"
                rows={3}
                defaultValue={getText("subtitle_en")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                副標說明 (ZH)
              </label>
              <textarea
                name="cta_subtitle_zh"
                rows={3}
                defaultValue={getText("subtitle_zh")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* 背景樣式設定 */}
        <section className="space-y-4 rounded-md bg-zinc-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Background & style
            </div>
            <p className="text-[11px] text-zinc-500">
              可選純色或底圖，文字顏色可切換深 / 淺，以利前台配色。
            </p>
          </div>

          {/* 背景模式 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              Background mode
            </label>
            <div className="flex flex-col gap-2 text-xs text-zinc-700">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="backgroundMode"
                  value="color"
                  defaultChecked={backgroundMode === "color"}
                  className="h-4 w-4 border-zinc-300"
                />
                純色底色
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="backgroundMode"
                  value="image"
                  defaultChecked={backgroundMode === "image"}
                  className="h-4 w-4 border-zinc-300"
                />
                底圖（可搭配遮罩）
              </label>
            </div>
          </div>

          {/* 背景色 & 底圖 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Background color
              </label>
              <div className="flex items-center gap-2">
                <input
    type="color"
    name="backgroundColor"
    defaultValue={backgroundColor}
    className="h-8 w-10 rounded border border-zinc-300 bg-white"
  />
  <input
    type="text"
    defaultValue={backgroundColor}
    className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs text-zinc-500"
    readOnly
  />
</div>
              <p className="text-[11px] text-zinc-500">
                前台可依照這個色碼決定整塊 CTA 的底色。
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Background image URL
              </label>
              <input
                name="backgroundImageUrl"
                defaultValue={backgroundImageUrl}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
              <p className="text-[11px] text-zinc-500">
                當背景模式為「底圖」時會使用；建議使用寬幅 hero 圖。
              </p>
            </div>
          </div>

          {/* 遮罩透明度 + 文字 tone */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Image overlay opacity（0–0.9）
              </label>
              <input
                type="number"
                name="overlayOpacity"
                step="0.05"
                min={0}
                max={0.95}
                defaultValue={overlayOpacity}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
              <p className="text-[11px] text-zinc-500">
                前台可在底圖上加一層黑 / 白透明遮罩，讓文字更清楚。
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700">
                Text tone
              </label>
              <select
                name="textTone"
                defaultValue={textTone}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="light">淺色文字（白色系）</option>
                <option value="dark">深色文字（黑色系）</option>
              </select>
              <p className="text-[11px] text-zinc-500">
                告訴前台這塊 CTA 的文字應該偏淺或偏深，以符合底色。
              </p>
            </div>
          </div>
        </section>

        {/* CTA 按鈕設定 */}
        <section className="space-y-4 rounded-md bg-zinc-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              CTA buttons
            </div>
            <p className="text-[11px] text-zinc-500">
              留白的按鈕會被忽略；一個區塊可以有多種 CTA，如 Line / WhatsApp / Email / 表單連結。
            </p>
          </div>

          <div className="space-y-3">
            {Array.from({ length: slots }).map((_, i) => {
              const existing = buttons[i] || {};
              const label =
                i < buttons.length
                  ? `Button #${i + 1}`
                  : `新增按鈕 #${i + 1}`;

              const actionType: CtaActionType =
                existing.actionType === "email" ||
                existing.actionType === "phone" ||
                existing.actionType === "line" ||
                existing.actionType === "whatsapp" ||
                existing.actionType === "telegram" ||
                existing.actionType === "wechat"
                  ? existing.actionType
                  : "link";

              return (
                <div
                  key={i}
                  className="space-y-2 rounded-md border border-zinc-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-700">
                      {label}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      文字全部留白 & 類型 / 值也留白 → 此按鈕不會出現在前台。
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">
                        Label (EN)
                      </label>
                      <input
                        name={`btn_${i}_label_en`}
                        defaultValue={existing.label_en || ""}
                        className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">
                        Label (ZH)
                      </label>
                      <input
                        name={`btn_${i}_label_zh`}
                        defaultValue={existing.label_zh || ""}
                        className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">
                        Action type
                      </label>
                      <select
                        name={`btn_${i}_actionType`}
                        defaultValue={actionType}
                        className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs"
                      >
                        <option value="link">一般連結（頁面 / 表單）</option>
                        <option value="email">Email（mailto）</option>
                        <option value="phone">電話（tel）</option>
                        <option value="line">Line</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="telegram">Telegram</option>
                        <option value="wechat">WeChat</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">
                        值（URL / Email / 電話 / Line Link...）
                      </label>
                      <input
                        name={`btn_${i}_value`}
                        defaultValue={existing.value || ""}
                        className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs"
                      />
                      <p className="text-[10px] text-zinc-500">
                        例如：/contact、mailto:info@...、tel:+886-...、
                        https://line.me/R/...、https://wa.me/....
                      </p>
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
            儲存 CTA 內容
          </button>
        </div>
      </form>
    </main>
  );
}
