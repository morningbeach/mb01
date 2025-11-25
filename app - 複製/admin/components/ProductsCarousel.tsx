// app/admin/components/ProductsCarousel.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type CarouselItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href?: string;
  priceHint?: string | null;
};

type CarouselLayout = {
  itemsPerView: number;
  autoPlay: boolean;
  showArrows: boolean;
  clickable: boolean;
  showProductName: boolean;
  showSubtitle: boolean;
  showPriceHint: boolean;
};

type ProductsCarouselProps = {
  items: CarouselItem[];
  layout: CarouselLayout;
};

export function ProductsCarousel({
  items,
  layout,
}: ProductsCarouselProps) {
  const {
    itemsPerView,
    autoPlay,
    showArrows,
    clickable,
    showProductName,
    showSubtitle,
    showPriceHint,
  } = layout;

  const [index, setIndex] = useState(0);

  // 最多可以往後滑到（總數 - 每頁顯示數），確保永遠一排
  const maxIndex =
    items.length > itemsPerView
      ? items.length - itemsPerView
      : 0;

  const clamp = (v: number) => {
    if (v < 0) return 0;
    if (v > maxIndex) return maxIndex;
    return v;
  };

  // 一次往前 / 往後「一格」
  const goPrev = () => setIndex((i) => clamp(i - 1));
  const goNext = () => setIndex((i) => clamp(i + 1));

  // 自動輪播：每 5 秒往後一格，到尾巴就回到 0
  useEffect(() => {
    if (!autoPlay || maxIndex === 0) return;

    const timer = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [autoPlay, maxIndex]);

  if (!items || items.length === 0) return null;

  // translateX 百分比：每往後一格，就多移動一個「卡片寬度」
  const translatePercent = (100 / itemsPerView) * index;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        {/* 左箭頭 */}
        {showArrows ? (
          <button
            type="button"
            onClick={goPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-xs text-zinc-700 disabled:opacity-40"
            disabled={index === 0}
            aria-label="Previous"
          >
            &lt;
          </button>
        ) : (
          <div className="w-8" />
        )}

        {/* 內容區：overflow-hidden + 單排 flex + translateX + transition */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex flex-nowrap transition-transform duration-500"
            style={{
              transform: `translateX(-${translatePercent}%)`,
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="shrink-0 px-3"
                style={{
                  // 一排固定，依 itemsPerView 平均切寬度
                  width: `${100 / itemsPerView}%`,
                }}
              >
                <CarouselProductCard
                  item={item}
                  clickable={clickable}
                  showProductName={showProductName}
                  showSubtitle={showSubtitle}
                  showPriceHint={showPriceHint}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 右箭頭 */}
        {showArrows ? (
          <button
            type="button"
            onClick={goNext}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-xs text-zinc-700 disabled:opacity-40"
            disabled={index === maxIndex}
            aria-label="Next"
          >
            &gt;
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </div>
  );
}

function CarouselProductCard({
  item,
  clickable,
  showProductName,
  showSubtitle,
  showPriceHint,
}: {
  item: CarouselItem;
  clickable: boolean;
  showProductName: boolean;
  showSubtitle: boolean;
  showPriceHint: boolean;
}) {
  const hasBody =
    (showSubtitle && item.subtitle) ||
    (showPriceHint && item.priceHint);

  const content = (
    <>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
        {item.image && (
          <Image
            src={item.image}
            alt={item.title || "Product"}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />
        )}
      </div>

      {showProductName && item.title && (
        <h3 className="mt-4 text-lg font-medium text-zinc-900">
          {item.title}
        </h3>
      )}

      {hasBody && (
        <p className="mt-1 text-sm text-zinc-600">
          {showSubtitle ? item.subtitle : ""}
          {showPriceHint && item.priceHint && (
            <span className="block text-xs text-zinc-500">
              {item.priceHint}
            </span>
          )}
        </p>
      )}
    </>
  );

  if (clickable && item.href) {
    return (
      <a href={item.href} className="group cursor-pointer">
        {content}
      </a>
    );
  }

  return <div className="group cursor-default">{content}</div>;
}
