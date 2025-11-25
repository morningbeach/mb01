// app/admin/homepage/products/[id]/ProductsLayoutPanel.tsx
"use client";

import { useEffect, useState } from "react";

type LayoutType = "grid" | "carousel" | "scroll";

type LayoutState = {
  type: LayoutType;
  showSectionTitle: boolean;
  showProductName: boolean;
  showSubtitle: boolean;
  showPriceHint: boolean;
  clickable: boolean;
  carousel: {
    itemsPerView: number;
    autoPlay: boolean;
    showArrows: boolean;
  };
};

export function ProductsLayoutPanel({
  initialLayout,
}: {
  initialLayout: LayoutState;
}) {
  const [layout, setLayout] = useState<LayoutState>(() => {
    const itemsPerView =
      initialLayout.carousel?.itemsPerView ?? 3;
    return {
      type: initialLayout.type ?? "grid",
      showSectionTitle:
        initialLayout.showSectionTitle !== false,
      showProductName:
        initialLayout.showProductName !== false,
      showSubtitle: initialLayout.showSubtitle !== false,
      showPriceHint: !!initialLayout.showPriceHint,
      clickable: initialLayout.clickable !== false,
      carousel: {
        itemsPerView:
          typeof itemsPerView === "number" && itemsPerView > 0
            ? itemsPerView
            : 3,
        autoPlay: !!initialLayout.carousel?.autoPlay,
        showArrows:
          initialLayout.carousel?.showArrows !== false,
      },
    };
  });

  // 讓 itemsPerView 保持在 3–10 範圍
  useEffect(() => {
    setLayout((prev) => {
      const v = prev.carousel.itemsPerView;
      const fixed = Math.min(Math.max(v || 3, 3), 10);
      if (fixed === v) return prev;
      return {
        ...prev,
        carousel: { ...prev.carousel, itemsPerView: fixed },
      };
    });
  }, []);

  const update = (patch: Partial<LayoutState>) => {
    setLayout((prev) => ({ ...prev, ...patch }));
  };

  const updateCarousel = (
    patch: Partial<LayoutState["carousel"]>,
  ) => {
    setLayout((prev) => ({
      ...prev,
      carousel: { ...prev.carousel, ...patch },
    }));
  };

  const onItemsPerViewChange = (value: string) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    const fixed = Math.min(Math.max(n, 3), 10);
    updateCarousel({ itemsPerView: fixed });
  };

  const layoutJson = JSON.stringify({
    type: layout.type,
    showSectionTitle: layout.showSectionTitle,
    showProductName: layout.showProductName,
    showSubtitle: layout.showSubtitle,
    showPriceHint: layout.showPriceHint,
    clickable: layout.clickable,
    carousel: {
      itemsPerView: layout.carousel.itemsPerView,
      autoPlay: layout.carousel.autoPlay,
      showArrows: layout.carousel.showArrows,
    },
  });

  return (
    <section className="space-y-4 rounded-md bg-zinc-50 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Display layout
        </div>
      </div>

      {/* hidden input 給 server action 用 */}
      <input type="hidden" name="layout_json" value={layoutJson} />

      {/* Layout type 切換 */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-700">
          Layout type
        </label>
        <div className="flex flex-wrap gap-3 text-[11px]">
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              name="layout_type_display"
              value="grid"
              checked={layout.type === "grid"}
              onChange={() => update({ type: "grid" })}
              className="h-3 w-3"
            />
            <span>Grid（三格一排，多行）</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              name="layout_type_display"
              value="carousel"
              checked={layout.type === "carousel"}
              onChange={() => update({ type: "carousel" })}
              className="h-3 w-3"
            />
            <span>Arrow Carousel（單排，可左右切換）</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              name="layout_type_display"
              value="scroll"
              checked={layout.type === "scroll"}
              onChange={() => update({ type: "scroll" })}
              className="h-3 w-3"
            />
            <span>Horizontal scroll（單排橫向卷軸）</span>
          </label>
        </div>
      </div>

      {/* 共用選項 */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-700">
          Card display options
        </label>
        <div className="flex flex-wrap gap-3 text-[11px]">
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={layout.showProductName}
              onChange={(e) =>
                update({ showProductName: e.target.checked })
              }
              className="h-3 w-3"
            />
            <span>顯示產品名稱</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={layout.showSubtitle}
              onChange={(e) =>
                update({ showSubtitle: e.target.checked })
              }
              className="h-3 w-3"
            />
            <span>顯示副標（shortDesc）</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={layout.showPriceHint}
              onChange={(e) =>
                update({ showPriceHint: e.target.checked })
              }
              className="h-3 w-3"
            />
            <span>顯示價錢提示（priceHint）</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={layout.clickable}
              onChange={(e) =>
                update({ clickable: e.target.checked })
              }
              className="h-3 w-3"
            />
            <span>允許點擊前往產品頁</span>
          </label>
        </div>
      </div>

      {/* 依照 layout.type 顯示不同設定（Option A） */}
      {layout.type === "grid" && (
        <div className="space-y-1 rounded-md border border-zinc-200 bg-white p-3 text-[11px] text-zinc-600">
          <div className="font-medium text-zinc-800">
            Grid（三格一排）
          </div>
          <p className="mt-1">
            桌機版每行固定最多三個卡片，手機版一列一個。
            最後一行若不足三個，會自動左對齊。
          </p>
        </div>
      )}

      {layout.type === "carousel" && (
        <div className="space-y-3 rounded-md border border-zinc-200 bg-white p-3 text-[11px] text-zinc-700">
          <div className="font-medium text-zinc-900">
            Arrow Carousel 設定
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium">
                每一畫面顯示幾個商品
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={layout.carousel.itemsPerView}
                onChange={(e) =>
                  onItemsPerViewChange(e.target.value)
                }
                className="w-full rounded-md border border-zinc-300 px-2 py-1 text-xs"
              />
              <p className="text-[11px] text-zinc-500">
                介於 3–10 之間，固定只有一排。
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium">
                播放控制
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={layout.carousel.showArrows}
                    onChange={(e) =>
                      updateCarousel({
                        showArrows: e.target.checked,
                      })
                    }
                    className="h-3 w-3"
                  />
                  <span>顯示左右箭頭</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={layout.carousel.autoPlay}
                    onChange={(e) =>
                      updateCarousel({
                        autoPlay: e.target.checked,
                      })
                    }
                    className="h-3 w-3"
                  />
                  <span>自動輪播（約 5 秒切換一次）</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {layout.type === "scroll" && (
        <div className="space-y-1 rounded-md border border-zinc-200 bg-white p-3 text-[11px] text-zinc-600">
          <div className="font-medium text-zinc-800">
            Horizontal scroll 設定
          </div>
          <p className="mt-1">
            單排橫向卷軸，卡片寬度固定，使用者可左右滑動。
            沒有箭頭與自動播放。
          </p>
        </div>
      )}
    </section>
  );
}
