// app/page.tsx
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "./components/SiteShell";
import { ProductsCarousel } from "./admin/components/ProductsCarousel";

export const dynamic = "force-dynamic";

type Lang = "en" | "zh";

type CtaActionType =
  | "link"
  | "email"
  | "phone"
  | "line"
  | "whatsapp"
  | "telegram"
  | "wechat";

export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const lang: Lang = searchParams?.lang === "zh" ? "zh" : "en";

  const sections = await prisma.homeSection.findMany({
    orderBy: { order: "asc" },
  });
  const visibleSections = sections.filter((s) => s.enabled);

  const productsSection = visibleSections.find(
    (s) => s.type === "PRODUCTS",
  );

  let productsForHomepage: any[] = [];
  let productsPayload: any = undefined;
  let productsLayout: any = undefined;

  if (productsSection) {
    productsPayload = (productsSection.payload as any) || {};
    const source = (productsPayload.source as any) || {};
    productsLayout = (productsPayload.layout as any) || {};

    const mode: "tags" | "latest" | "manual" =
      source.mode === "latest"
        ? "latest"
        : source.mode === "manual"
        ? "manual"
        : "tags";

    // limit: 支援 number 或 string
    const limitRaw = source.limit;
    let limit = 9;
    if (typeof limitRaw === "number" && limitRaw > 0) {
      limit = limitRaw;
    } else if (typeof limitRaw === "string") {
      const parsed = Number(limitRaw);
      if (Number.isFinite(parsed) && parsed > 0) {
        limit = parsed;
      }
    }

    if (mode === "latest") {
      productsForHomepage = await prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } else if (mode === "manual") {
      const rawIds: any[] = Array.isArray(source.manualProductIds)
        ? source.manualProductIds
        : [];
      const productIds: string[] = rawIds
        .map((v) => (v ?? "").toString())
        .filter((v) => v.length > 0);

      if (productIds.length > 0) {
        const rows = await prisma.product.findMany({
          where: {
            id: { in: productIds },
            status: "ACTIVE",
          },
        });

        // 依手動排序順序排列
        const orderMap = new Map<string, number>();
        productIds.forEach((id, index) => orderMap.set(id, index));
        rows.sort(
          (a, b) =>
            (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
        );

        productsForHomepage = rows.slice(0, limit);
      }
    } else {
      // mode === "tags"
      const rawTagIds: any[] = Array.isArray(source.tagIds)
        ? source.tagIds
        : [];
      const tagIds: string[] = rawTagIds
        .map((id) => (id ?? "").toString())
        .filter((id) => id.length > 0);

      if (tagIds.length > 0) {
        const mappings = await prisma.productTag.findMany({
          where: { tagId: { in: tagIds } },
          select: { productId: true },
        });

        const productIdSet = new Set<string>(
          mappings.map((m) => m.productId),
        );

        if (productIdSet.size > 0) {
          productsForHomepage = await prisma.product.findMany({
            where: {
              id: { in: Array.from(productIdSet) },
              status: "ACTIVE",
            },
            orderBy: { createdAt: "desc" },
            take: limit,
          });
        }
      }

      // 安全網：如果 tag 模式沒抓到，就退回 latest ACTIVE
      if (productsForHomepage.length === 0) {
        productsForHomepage = await prisma.product.findMany({
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: limit,
        });
      }
    }
  }

  return (
    <SiteShell>
      {visibleSections.map((section) => {
        const type = section.type;
        const payload = (section.payload as any) || {};

        switch (type) {
          case "HERO":
            return (
              <HeroSection
                key={section.id}
                lang={lang}
                payload={payload}
              />
            );
          case "WHY":
            return (
              <WhySection
                key={section.id}
                lang={lang}
                payload={payload}
              />
            );
          case "PRODUCTS":
            return (
              <ProductsSection
                key={section.id}
                lang={lang}
                payload={
                  section.id === productsSection?.id
                    ? productsPayload
                    : payload
                }
                layout={productsLayout}
                products={productsForHomepage}
              />
            );
          case "FACTORY":
            return (
              <FactorySection
                key={section.id}
                lang={lang}
                payload={payload}
              />
            );
          case "CTA":
            return (
              <CTASection
                key={section.id}
                lang={lang}
                payload={payload}
              />
            );
          case "RICH_TEXT":
            return (
              <RichTextSection
                key={section.id}
                lang={lang}
                payload={payload}
              />
            );
          default:
            return null;
        }
      })}
    </SiteShell>
  );
}

/* 共用小工具 */

function t(
  lang: Lang,
  en?: string | null,
  zh?: string | null,
  fallback?: string,
) {
  const v = lang === "en" ? en : zh;
  return (v && v.trim().length > 0 ? v : null) ?? fallback ?? "";
}

function Divider() {
  return <div className="my-20 border-t border-zinc-200" />;
}

/* HERO */

function HeroSection({
  lang,
  payload,
}: {
  lang: Lang;
  payload: any;
}) {
  const titleLine1 = t(
    lang,
    payload.titleLine1_en,
    payload.titleLine1_zh,
    "",
  );
  const titleLine2 = t(
    lang,
    payload.titleLine2_en,
    payload.titleLine2_zh,
    "",
  );
  const subtitle = t(
    lang,
    payload.subtitle_en,
    payload.subtitle_zh,
    "",
  );

  const primaryLabel = t(
    lang,
    payload.primaryLabel_en,
    payload.primaryLabel_zh,
    "",
  );
  const secondaryLabel = t(
    lang,
    payload.secondaryLabel_en,
    payload.secondaryLabel_zh,
    "",
  );

  const primaryUrl = payload.primaryUrl || "";
  const secondaryUrl = payload.secondaryUrl || "";
  const imageUrl = payload.imageUrl || "";

  if (!titleLine1 && !titleLine2 && !subtitle) return null;

  return (
    <section className="mt-4 text-center md:mt-6">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 md:text-6xl">
        {titleLine1}
        {titleLine2 && (
          <>
            <br />
            {titleLine2}
          </>
        )}
      </h1>

      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          {subtitle}
        </p>
      )}

      {(primaryLabel || secondaryLabel) && (
        <div className="mt-8 flex justify-center gap-4">
          {primaryLabel && primaryUrl && (
            <a
              href={primaryUrl}
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {primaryLabel}
            </a>
          )}
          {secondaryLabel && secondaryUrl && (
            <a
              href={secondaryUrl}
              className="rounded-full border border-zinc-300 px-6 py-3 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              {secondaryLabel}
            </a>
          )}
        </div>
      )}

      {imageUrl && (
        <div className="mt-16 flex justify-center">
          <div className="relative aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
            <Image
              src={imageUrl}
              alt="Hero"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      <Divider />
    </section>
  );
}

/* WHY */

function WhySection({
  lang,
  payload,
}: {
  lang: Lang;
  payload: any;
}) {
  const title = t(lang, payload.title_en, payload.title_zh, "");
  const subtitle = t(
    lang,
    payload.subtitle_en,
    payload.subtitle_zh,
    "",
  );

  const rawCards: any[] = Array.isArray(payload.cards)
    ? payload.cards
    : [];

  const cards = rawCards
    .map((c) => {
      const cardTitle = t(
        lang,
        c.title_en,
        c.title_zh,
        "",
      );
      const cardBody = t(lang, c.body_en, c.body_zh, "");
      return { title: cardTitle, body: cardBody };
    })
    .filter((c) => c.title);

  if (cards.length === 0) return null;

  const firstThree = cards.slice(0, 3);
  const rest = cards.slice(3);

  return (
    <section className="mt-6 md:mt-8">
      {title && (
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
          {subtitle}
        </p>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        {firstThree.map((c, i) => (
          <div key={i}>
            <h3 className="text-xl font-medium text-zinc-900">
              {c.title}
            </h3>
            {c.body && (
              <p className="mt-2 text-[15px] text-zinc-600">
                {c.body}
              </p>
            )}
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <div className="mt-6 -mx-4 overflow-x-auto pb-2">
          <div className="flex gap-4 px-4">
            {rest.map((c, i) => (
              <div
                key={i}
                className="w-64 flex-shrink-0 rounded-lg border border-zinc-200 bg-white p-4"
              >
                <h3 className="text-sm font-medium text-zinc-900">
                  {c.title}
                </h3>
                {c.body && (
                  <p className="mt-2 text-xs text-zinc-600">
                    {c.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Divider />
    </section>
  );
}

/* PRODUCTS */

function ProductsSection({
  lang,
  payload,
  layout,
  products,
}: {
  lang: Lang;
  payload: any;
  layout: any;
  products: any[];
}) {
  const rawLayout = layout || {};
  const layoutType: "grid" | "carousel" | "scroll" =
    rawLayout.type === "carousel"
      ? "carousel"
      : rawLayout.type === "scroll"
      ? "scroll"
      : "grid";

  const showSectionTitle =
    rawLayout.showSectionTitle !== false; // 預設 true
  const showProductName =
    rawLayout.showProductName !== false; // 預設 true
  const showSubtitle =
    rawLayout.showSubtitle !== false; // 預設 true
  const showPriceHint = !!rawLayout.showPriceHint;
  const clickable =
    rawLayout.clickable !== false; // 預設可以點

  const carouselConfig = rawLayout.carousel || {};
  const itemsPerViewRaw = carouselConfig.itemsPerView;
  let itemsPerView = 3;
  if (
    typeof itemsPerViewRaw === "number" &&
    itemsPerViewRaw >= 3 &&
    itemsPerViewRaw <= 10
  ) {
    itemsPerView = itemsPerViewRaw;
  }

  const carouselProps = {
    itemsPerView,
    autoPlay: !!carouselConfig.autoPlay,
    showArrows:
      carouselConfig.showArrows !== false, // 預設顯示箭頭
    clickable,
    showProductName,
    showSubtitle,
    showPriceHint,
  };

  const title = t(lang, payload.title_en, payload.title_zh, "");
  const subtitle = t(
    lang,
    payload.subtitle_en,
    payload.subtitle_zh,
    "",
  );

  const hasProducts =
    Array.isArray(products) && products.length > 0;

  let items: {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    href?: string;
    priceHint?: string | null;
  }[] = [];

  if (hasProducts) {
    items = products.map((p) => ({
      id: p.id,
      title: p.name || "",
      subtitle: p.shortDesc || "",
      image: p.coverImage || "",
      href: p.slug ? `/products/${p.slug}` : undefined,
      priceHint: p.priceHint ?? null,
    }));
  }

  // 若沒有產品資料，整區塊不顯示（暫時）
  if (!hasProducts || items.length === 0) return null;

  return (
    <section id="products" className="mt-6 md:mt-8">
      {showSectionTitle && (title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {layoutType === "carousel" ? (
        <ProductsCarousel items={items} layout={carouselProps} />
      ) : layoutType === "scroll" ? (
        <div className="mt-6 -mx-4 overflow-x-auto pb-2">
          <div className="flex gap-4 px-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="w-64 flex-shrink-0"
              >
                <ProductCard
                  title={showProductName ? item.title : ""}
                  subtitle={showSubtitle ? item.subtitle : ""}
                  image={item.image}
                  href={clickable ? item.href : undefined}
                  priceHint={showPriceHint ? item.priceHint : null}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        // GRID
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              title={showProductName ? item.title : ""}
              subtitle={showSubtitle ? item.subtitle : ""}
              image={item.image}
              href={clickable ? item.href : undefined}
              priceHint={showPriceHint ? item.priceHint : null}
            />
          ))}
        </div>
      )}

      <Divider />
    </section>
  );
}

/* FACTORY */

function FactorySection({
  lang,
  payload,
}: {
  lang: Lang;
  payload: any;
}) {
  const title = t(lang, payload.title_en, payload.title_zh, "");
  const subtitle = t(
    lang,
    payload.subtitle_en,
    payload.subtitle_zh,
    "",
  );

  const rawCards: any[] = Array.isArray(payload.cards)
    ? payload.cards
    : [];

  const cards = rawCards
    .map((c) => {
      const cardTitle = t(
        lang,
        c.title_en,
        c.title_zh,
        "",
      );
      const cardBody = t(lang, c.body_en, c.body_zh, "");
      const image =
        c.imageUrl || c.image || c.coverImage || "";
      return { title: cardTitle, body: cardBody, image };
    })
    .filter((c) => c.title || c.image);

  if (cards.length === 0) return null;

  const firstThree = cards.slice(0, 3);
  const rest = cards.slice(3);

  return (
    <section id="factory" className="mt-6 md:mt-8">
      {title && (
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-2 max-w-xl text-[15px] text-zinc-600">
          {subtitle}
        </p>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {firstThree.map((c, i) => (
          <FactoryCard
            key={i}
            title={c.title}
            body={c.body}
            image={c.image || ""}
          />
        ))}
      </div>

      {rest.length > 0 && (
        <div className="mt-6 -mx-4 overflow-x-auto pb-2">
          <div className="flex gap-4 px-4">
            {rest.map((c, i) => (
              <div key={i} className="w-72 flex-shrink-0">
                <FactoryCard
                  title={c.title}
                  body={c.body}
                  image={c.image || ""}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Divider />
    </section>
  );
}

/* CTA */

function resolveCtaHref(type: CtaActionType, value: string) {
  if (!value) return "#";
  switch (type) {
    case "email":
      return value.startsWith("mailto:") ? value : `mailto:${value}`;
    case "phone":
      return value.startsWith("tel:") ? value : `tel:${value}`;
    case "line":
    case "whatsapp":
    case "telegram":
    case "wechat":
    case "link":
    default:
      return value;
  }
}

function CTASection({
  lang,
  payload,
}: {
  lang: Lang;
  payload: any;
}) {
  const title = t(lang, payload.title_en, payload.title_zh, "");
  const subtitle = t(
    lang,
    payload.subtitle_en ?? payload.body_en,
    payload.subtitle_zh ?? payload.body_zh,
    "",
  );

  const style = (payload.style as any) || {};
  const backgroundMode: "color" | "image" =
    style.backgroundMode === "image" ? "image" : "color";
  const backgroundColor: string =
    style.backgroundColor ?? "#000000";
  const backgroundImageUrl: string | undefined =
    style.backgroundImageUrl || undefined;
  const overlayOpacityRaw = style.overlayOpacity;
  const overlayOpacity: number =
    typeof overlayOpacityRaw === "number"
      ? Math.min(Math.max(overlayOpacityRaw, 0), 0.95)
      : 0.4;
  const textTone: "light" | "dark" =
    style.textTone === "dark" ? "dark" : "light";
  const useImageBg =
    backgroundMode === "image" && !!backgroundImageUrl;

  const buttonsRaw: any[] = Array.isArray(payload.buttons)
    ? payload.buttons
    : [];

  let buttons: {
    label: string;
    href: string;
    actionType: CtaActionType;
  }[] = [];

  if (buttonsRaw.length > 0) {
    buttons = buttonsRaw
      .map((b: any) => {
        const label = t(lang, b.label_en, b.label_zh, "");
        const actionType: CtaActionType =
          b.actionType === "email" ||
          b.actionType === "phone" ||
          b.actionType === "line" ||
          b.actionType === "whatsapp" ||
          b.actionType === "telegram" ||
          b.actionType === "wechat"
            ? b.actionType
            : "link";

        const href = resolveCtaHref(actionType, b.value || "");
        return { label, href, actionType };
      })
      .filter((b) => b.label && b.href && b.href !== "#");
  }

  if (!title && !subtitle && buttons.length === 0) return null;

  const textColorClass =
    textTone === "light" ? "text-white" : "text-zinc-900";
  const subTextColorClass =
    textTone === "light"
      ? "text-zinc-100/80"
      : "text-zinc-600";

  return (
    <section id="contact" className="mt-10 md:mt-16">
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className={`relative px-6 py-12 md:px-10 md:py-16 text-center ${textColorClass}`}
          style={
            useImageBg
              ? {
                  backgroundImage: `url(${backgroundImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  backgroundColor,
                }
          }
        >
          {useImageBg && overlayOpacity > 0 && (
            <div
              className="pointer-events-none absolute inset-0 bg-black"
              style={{ opacity: overlayOpacity }}
            />
          )}

          <div className="relative mx-auto max-w-xl">
            {title && (
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={`mt-3 text-base md:text-lg ${subTextColorClass}`}
              >
                {subtitle}
              </p>
            )}

            {buttons.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {buttons.map((btn, index) => {
                  const isPrimary = index === 0;
                  const baseClasses =
                    "inline-flex items-center rounded-full px-6 py-3 text-sm font-medium transition";
                  const primaryClasses =
                    textTone === "light"
                      ? "bg-white text-zinc-900 hover:bg-zinc-100"
                      : "bg-zinc-900 text-white hover:bg-zinc-800";
                  const secondaryClasses =
                    textTone === "light"
                      ? "border border-white/80 text-zinc-50 hover:bg-white/10"
                      : "border border-zinc-300 text-zinc-800 hover:bg-zinc-100";

                  return (
                    <a
                      key={`${btn.label}-${index}`}
                      href={btn.href}
                      className={
                        baseClasses +
                        " " +
                        (isPrimary ? primaryClasses : secondaryClasses)
                      }
                    >
                      {btn.label}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* RICH TEXT */

function RichTextSection({
  lang,
  payload,
}: {
  lang: Lang;
  payload: any;
}) {
  const title = t(lang, payload.title_en, payload.title_zh, "");
  const body = t(lang, payload.body_en, payload.body_zh, "");

  if (!title && !body) return null;

  return (
    <section className="mt-6 md:mt-8">
      {title && (
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h2>
      )}
      {body && (
        <p className="mt-2 max-w-2xl text-[15px] text-zinc-600 whitespace-pre-line">
          {body}
        </p>
      )}
      <Divider />
    </section>
  );
}

/* 卡片元件 */

type ProductCardProps = {
  title: string;
  subtitle: string;
  image: string;
  href?: string;
  priceHint?: string | null;
};

function ProductCard({
  title,
  subtitle,
  image,
  href,
  priceHint,
}: ProductCardProps) {
  const bodyHasContent = subtitle || priceHint;
  const content = (
    <>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
        {image && (
          <Image
            src={image}
            alt={title || "Product"}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />
        )}
      </div>
      {title && (
        <h3 className="mt-4 text-lg font-medium text-zinc-900">
          {title}
        </h3>
      )}
      {bodyHasContent && (
        <p className="mt-1 text-sm text-zinc-600">
          {subtitle}
          {priceHint && (
            <span className="block text-xs text-zinc-500">
              {priceHint}
            </span>
          )}
        </p>
      )}
    </>
  );

  return href ? (
    <a href={href} className="group cursor-pointer">
      {content}
    </a>
  ) : (
    <div className="group cursor-default">{content}</div>
  );
}

function FactoryCard({
  title,
  body,
  image,
}: {
  title: string;
  body: string;
  image: string;
}) {
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
        {image && (
          <Image
            src={image}
            alt={title || "Factory"}
            fill
            className="object-cover"
          />
        )}
      </div>
      {title && (
        <h3 className="mt-4 text-lg font-medium text-zinc-900">
          {title}
        </h3>
      )}
      {body && (
        <p className="text-sm text-zinc-600">{body}</p>
      )}
    </div>
  );
}
