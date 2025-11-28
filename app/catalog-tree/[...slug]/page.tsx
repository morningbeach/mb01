// app/catalog-tree/[...slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { CatalogPageClient } from "./CatalogPageClient";

export default async function TreeCatalogPage({
  params,
  searchParams,
}: {
  params: { slug: string[] };
  searchParams: { displayMode?: string };
}) {
  
  // 取得最後一個 slug（當前節點）
  const currentSlug = params.slug[params.slug.length - 1];
  
  // 從資料庫查詢當前節點
  const currentNode = await prisma.categoryNode.findUnique({
    where: {
      slug: currentSlug,
      isActive: true,
    },
    include: {
      children: {
        where: {
          isActive: true,
          isHidden: false,
        },
        orderBy: {
          order: 'asc',
        },
      },
      parent: true,
    },
  });

  if (!currentNode) {
    return notFound();
  }

  // 如果節點標記為葉節點但還有子節點，只顯示產品不顯示子節點
  const hasChildren = !currentNode.isLeaf && currentNode.children && currentNode.children.length > 0;
  const effectiveChildren = hasChildren ? currentNode.children : [];
  
  // 建構麵包屑（根據 path 欄位）
  const breadcrumbSlugs = currentNode.path;
  const breadcrumbs = await prisma.categoryNode.findMany({
    where: {
      slug: {
        in: breadcrumbSlugs,
      },
      isActive: true,
    },
    orderBy: {
      depth: 'asc',
    },
  });

  // 查詢產品
  let products: any[] = [];
  let childrenWithProducts: any[] = [];
  
  if (currentNode.isLeaf && currentNode.tagIds && currentNode.tagIds.length > 0) {
    // 葉節點：直接查詢產品（需要包含所有TAG）
    products = await prisma.product.findMany({
      where: {
        version: 2,
        status: "ACTIVE",
        AND: currentNode.tagIds.map(tagId => ({
          tags: {
            some: {
              tagId: tagId,
            },
          },
        })),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  } else if (!currentNode.isLeaf && effectiveChildren.length > 0) {
    // 非葉節點：遞迴查詢所有子節點下的葉節點產品
    // 先獲取所有子孫節點
    const allDescendants = await prisma.categoryNode.findMany({
      where: {
        isActive: true,
        isHidden: false,
        path: {
          has: currentNode.slug, // 路徑包含當前節點
        },
        NOT: {
          slug: currentNode.slug, // 排除當前節點本身
        },
      },
      orderBy: [
        { depth: 'asc' },
        { order: 'asc' },
      ],
    });
    
    // 為每個直接子節點查詢其下所有葉節點的產品
    for (const child of effectiveChildren) {
      // 找出該子節點下的所有葉節點（包含自己如果是葉節點）
      const leafNodes = [];
      
      // 如果子節點本身是葉節點
      if (child.isLeaf && child.tagIds && child.tagIds.length > 0) {
        leafNodes.push(child);
      }
      
      // 找出該子節點下的所有後代葉節點
      const childDescendants = allDescendants.filter(
        (d) => d.path.includes(child.slug) && d.slug !== child.slug && d.isLeaf
      );
      leafNodes.push(...childDescendants.filter(d => d.tagIds && d.tagIds.length > 0));
      
      // 收集所有葉節點的產品
      let childProducts: any[] = [];
      const productIds = new Set<string>(); // 用於去重
      
      for (const leafNode of leafNodes) {
        if (leafNode.tagIds && leafNode.tagIds.length > 0) {
          // 每個葉節點查詢需要包含其所有TAG的產品
          const leafProducts = await prisma.product.findMany({
            where: {
              version: 2,
              status: "ACTIVE",
              AND: leafNode.tagIds.map(tagId => ({
                tags: {
                  some: {
                    tagId: tagId,
                  },
                },
              })),
            },
            include: {
              tags: {
                include: {
                  tag: true,
                },
              },
            },
            orderBy: {
              name: 'asc',
            },
          });
          
          // 去重並合併產品
          for (const product of leafProducts) {
            if (!productIds.has(product.id)) {
              productIds.add(product.id);
              childProducts.push(product);
            }
          }
        }
      }
      
      // 加入子節點及其產品
      childrenWithProducts.push({
        ...child,
        products: childProducts,
      });
    }
  }

  // 只允許後台設定展示方式，最上層維持五格（HeroCardsLayout），其餘預設瀑布流
  let displayMode = currentNode.displayMode;
  if (currentNode.depth === 0) {
    displayMode = "hero-cards";
  } else if (!displayMode) {
    displayMode = "masonry";
  }

  // 建立有效的節點物件
  // 如果是非葉節點且有子節點產品資料，使用 childrenWithProducts
  const effectiveNode = {
    ...currentNode,
    children: childrenWithProducts.length > 0 ? childrenWithProducts : effectiveChildren,
  };

  return (
    <SiteShell>
      <CatalogPageClient 
        node={effectiveNode}
        breadcrumbs={breadcrumbs}
        displayMode={displayMode}
        currentPath={params.slug.join('/')}
        products={products}
        childrenWithProducts={childrenWithProducts}
      />
    </SiteShell>
  );
}


// Hero + Cards Layout (大分類)
function HeroCardsLayout({ node, lang }: { node: any; lang: string }) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative h-96">
          <Image
            src={node.heroImage || node.coverImage || '/placeholder.jpg'}
            alt={lang === 'zh' ? node.name_zh : node.name_en}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h1 className="text-4xl font-semibold tracking-tight">{lang === 'zh' ? node.name_zh : node.name_en}</h1>
            <p className="mt-2 text-base leading-relaxed opacity-90">{lang === 'zh' ? node.description_zh : node.description_en}</p>
          </div>
        </div>
      </div>

      {/* 子分類卡片 */}
      {node.children && node.children.length > 0 && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {node.children.map((child: any) => (
            <Link
              key={child.id}
              href={`/catalog-tree/${child.path.join("/")}`}
              className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg"
            >
              <div className="relative h-48">
                <Image
                  src={child.heroImage || child.coverImage || '/placeholder.jpg'}
                  alt={lang === 'zh' ? child.name_zh : child.name_en}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                  {lang === 'zh' ? child.name_zh : child.name_en}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {lang === 'zh' ? child.description_zh : child.description_en}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Grid Layout (中分類)
function GridLayout({ node, lang }: { node: any; lang: string }) {
  return (
    <div className="space-y-8">
      {/* 標題區 */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">{lang === 'zh' ? node.name_zh : node.name_en}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">{lang === 'zh' ? node.description_zh : node.description_en}</p>
      </div>

      {/* 網格內容 */}
      {node.children && node.children.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {node.children.map((child: any) => (
            <Link
              key={child.id}
              href={`/catalog-tree/${child.path.join("/")}`}
              className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={child.coverImage || child.heroImage || '/placeholder.jpg'}
                  alt={lang === 'zh' ? child.name_zh : child.name_en}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-zinc-900">{lang === 'zh' ? child.name_zh : child.name_en}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">{lang === 'zh' ? child.description_zh : child.description_en}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Masonry Layout (小分類 - 瀑布流)
function MasonryLayout({ node, lang }: { node: any; lang: string }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">{lang === 'zh' ? node.name_zh : node.name_en}</h1>
        <p className="mt-2 text-zinc-600">{lang === 'zh' ? node.description_zh : node.description_en}</p>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
          {node.children.map((child: any) => (
            <Link
              key={child.id}
              href={`/catalog-tree/${child.path.join("/")}`}
              className="mb-6 block break-inside-avoid overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={child.coverImage || child.heroImage || '/placeholder.jpg'}
                  alt={lang === 'zh' ? child.name_zh : child.name_en}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-zinc-900">{lang === 'zh' ? child.name_zh : child.name_en}</h3>
                <p className="mt-1 text-sm text-zinc-600">{lang === 'zh' ? child.description_zh : child.description_en}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Waterfall Layout
function WaterfallLayout({ node, lang }: { node: any; lang: string }) {
  return <MasonryLayout node={node} lang={lang} />;
}

// Carousel Layout
function CarouselLayout({ node, lang }: { node: any; lang: string }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">{lang === 'zh' ? node.name_zh : node.name_en}</h1>
        <p className="mt-2 text-zinc-600">{lang === 'zh' ? node.description_zh : node.description_en}</p>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4">
            {node.children.map((child: any) => (
              <Link
                key={child.id}
                href={`/catalog-tree/${child.path.join("/")}`}
                className="min-w-[300px] flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative h-48">
                  <Image
                    src={child.coverImage || child.heroImage || '/placeholder.jpg'}
                    alt={lang === 'zh' ? child.name_zh : child.name_en}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-900">{lang === 'zh' ? child.name_zh : child.name_en}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{lang === 'zh' ? child.description_zh : child.description_en}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Product Detail Layout (商品詳細頁)
function ProductDetailLayout({ node, lang }: { node: any; lang: string }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-12 md:grid-cols-2">
        {/* 左側：圖片 */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200">
            <Image
              src={node.coverImage || node.heroImage || '/placeholder.jpg'}
              alt={lang === 'zh' ? node.name_zh : node.name_en}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* 右側：資訊 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{lang === 'zh' ? node.name_zh : node.name_en}</h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">{lang === 'zh' ? node.description_zh : node.description_en}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <div className="text-sm font-medium text-zinc-600">產品資訊</div>
            <div className="mt-3 space-y-2 text-sm text-zinc-500">
              <p>產品編號: <span className="font-mono text-zinc-700">{node.slug}</span></p>
              <p>分類: {lang === 'zh' ? node.name_zh : node.name_en}</p>
            </div>
          </div>

          <button className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800">
            聯絡詢價
          </button>

          <div className="space-y-2 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
            <p>✓ 支援客製化 LOGO</p>
            <p>✓ 提供樣品確認</p>
            <p>✓ 大量訂購優惠</p>
          </div>
        </div>
      </div>
    </div>
  );
}
