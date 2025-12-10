"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { SiteHeader } from "@/components/SiteShell";
import { SiteFooter } from "@/components/SiteFooter";

type Copy = { en: string; zh: string };

interface LandingPageConfig {
  heroStyle: "style1" | "style2" | "style3" | "style4" | "style5";
  heroData: {
    headline: Copy;
    subheadline: Copy;
    support: Copy;
    videoUrl: string;
    backgroundImage: string;
    backgroundOpacity?: number;
    overlayOpacity?: number;
    galleryImages?: string[];
  };
  selectedCaseIds: string[];
  trustedBy: {
    text: string;
    images: string[];
  };
  selectedBlogIds: string[];
  featuredProductCategory?: "print-packaging" | "bag" | "gift" | "none"; // 新增：最新商品輪播的類別
  solutions: {
    image: string;
    imageOpacity?: number;
    overlayOpacity?: number;
    title: Copy;
    description?: Copy;
    link: string;
  }[];
  services?: {
    image: string;
    imageOpacity?: number;
    overlayOpacity?: number;
    title: Copy;
    description: Copy;
    aiPrompt?: string;
  }[];
}

interface LandingPageClientProps {
  config: LandingPageConfig;
  cases: any[];
  blogs: any[];
  featuredProducts?: any[]; // 新增：最新商品
  randomProducts?: any[]; // 新增：隨機產品
}

// --- Data & Copy (Defaults/Fallbacks) ---

const coreValues = [
  {
    title: { en: "AI-Powered Decisions", zh: "AI 決策加速" },
    description: {
      en: "AI material intelligence, automated sampling, predictive cost analysis.",
      zh: "AI 材料資料庫、快速打樣、預測式成本分析。",
    },
  },
  {
    title: { en: "Global Manufacturing Network", zh: "全球製造網絡" },
    description: {
      en: "Taiwan + Shenzhen + Wenzhou + Guangzhou, unified workflow.",
      zh: "台灣＋深圳＋溫州＋廣州，跨國協作如同一間工廠。",
    },
  },
  {
    title: { en: "Faster Delivery", zh: "更快速的交期" },
    description: {
      en: "Full-chain digitization enables faster and more predictable deliveries.",
      zh: "全鏈路數位化管理，交期更快、延誤可預測。",
    },
  },
  {
    title: { en: "Enterprise-Grade Quality", zh: "企業級品質" },
    description: {
      en: "Designed for batch sizes from 300 to 10,000+.",
      zh: "適用 300–10,000+ 的企業級生產需求。",
    },
  },
];

const services = [
  {
    image: "",
    imageOpacity: 30,
    title: { en: "Premium Packaging Engineering", zh: "高級包裝工程" },
    description: {
      en: "Structural engineering for premium gift boxes and carrier bags.",
      zh: "高級禮盒、提袋、複合材料的結構工程與打樣。",
    },
  },
  {
    image: "",
    imageOpacity: 30,
    title: { en: "Gift Set Manufacturing", zh: "禮贈品製造" },
    description: {
      en: "Holiday sets, corporate gifting, mixed-material packaging.",
      zh: "節慶禮盒、企業贈禮、複合材質套組製造。",
    },
  },
  {
    image: "",
    imageOpacity: 30,
    title: { en: "Cross-Regional Production Management", zh: "跨區製造管理" },
    description: {
      en: "AI-assisted production + human supervision.",
      zh: "AI 協作與人工監督並行的跨國製造管理。",
    },
  },
];

const workflow = [
  { title: { en: "Brief → Define Needs", zh: "Brief → 問題定義" } },
  { title: { en: "AI Sampling → AI-Assisted Sampling", zh: "AI Sampling → 打樣加速" } },
  { title: { en: "Mass Production → Cross-Regional Fabrication", zh: "Mass Production → 量產" } },
  { title: { en: "Delivery → Quality Check & Delivery", zh: "Delivery → 出貨" } },
];

const finalCTA = {
  heading: {
    en: "Start your next packaging project with MBPACK.",
    zh: "讓下一個包裝專案，以更快、更準的方式啟動。",
  },
  primary: { en: "Get Started Today", zh: "立即開始" },
  secondary: { en: "View Our Work", zh: "瀏覽案例" },
};

// Default solutions with descriptions
const defaultSolutions = [
  {
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
    imageOpacity: 40,
    title: { en: "Premium Gift Boxes", zh: "高級禮盒" },
    description: { en: "International paper stock, structural precision.", zh: "國際紙材、結構工程、精緻加工。" },
    link: "/catalog-tree/gift-box",
  },
  {
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    imageOpacity: 40,
    title: { en: "Custom Bags", zh: "客製提袋" },
    description: { en: "Canvas, jute, premium paper bags.", zh: "帆布袋、麻布袋、高級紙袋。" },
    link: "/catalog-tree/bag",
  },
  {
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800",
    imageOpacity: 40,
    title: { en: "Holiday Gifts", zh: "節慶禮盒" },
    description: { en: "Mid-autumn, New Year, multi-material sets.", zh: "中秋、年節、多材質禮品。" },
    link: "/catalog-tree/gift-box",
  },
  {
    image: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800",
    imageOpacity: 40,
    title: { en: "Corporate Gifts", zh: "企業贈禮" },
    description: { en: "Large-volume stable production.", zh: "大批量穩定生產、文件合規。" },
    link: "/catalog-tree/gift-box",
  },
  {
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
    imageOpacity: 40,
    title: { en: "Eco Packaging", zh: "環保包裝" },
    description: { en: "rPET, recycled papers, sustainable materials.", zh: "rPET、再生紙、永續材質。" },
    link: "/catalog-tree/print-packaging",
  },
];

// --- Components ---

export default function LandingPageClient({ config, cases, blogs, featuredProducts: initialProducts = [], randomProducts = [] }: LandingPageClientProps) {
  const { lang } = useLanguage();
  const t = (copy: Copy) => (lang === "zh" ? copy.zh : copy.en);
  
  // Debug: 檢查 randomProducts
  useEffect(() => {
    console.log('[Landing] randomProducts received:', randomProducts.length, randomProducts);
  }, [randomProducts]);
  
  // 在 Client 端獲取產品資料（與 packaging-explorer 一致的方式）
  const [featuredProducts, setFeaturedProducts] = useState<any[]>(initialProducts);
  const [productsLoading, setProductsLoading] = useState(false);

  // Debug: 顯示設定
  useEffect(() => {
    console.log('[Landing] featuredProductCategory:', config.featuredProductCategory);
  }, [config.featuredProductCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!config.featuredProductCategory || config.featuredProductCategory === "none") {
        console.log('[Landing] Category is none or empty, skipping fetch');
        setFeaturedProducts([]);
        return;
      }
      
      setProductsLoading(true);
      console.log('[Landing] Fetching products for category:', config.featuredProductCategory);
      try {
        const url = `/api/products/filter?category=${config.featuredProductCategory}&random=true&limit=12`;
        console.log('[Landing] Fetch URL:', url);
        const res = await fetch(url);
        console.log('[Landing] Response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('[Landing] Products received:', data.products?.length || 0);
          setFeaturedProducts(data.products || []);
        }
      } catch (e) {
        console.error('[Landing] Failed to fetch featured products:', e);
      } finally {
        setProductsLoading(false);
      }
    };
    
    // 每次都重新獲取（因為設定可能變了）
    if (config.featuredProductCategory && config.featuredProductCategory !== "none") {
      fetchProducts();
    }
  }, [config.featuredProductCategory]);

  // Filter selected cases
  const displayCases = cases.filter(c => config.selectedCaseIds.includes(c.id));
  // Filter selected blogs
  const displayBlogs = blogs.filter(b => config.selectedBlogIds.includes(b.id));
  // Use config solutions or defaults
  const displaySolutions = config.solutions.length > 0 ? config.solutions : defaultSolutions;
  
  // Parse trusted by brands
  const trustedBrands = config.trustedBy.text.split(",").map(s => s.trim()).filter(s => s);

  // 商品輪播類別標題
  const categoryLabels: Record<string, Copy> = {
    "print-packaging": { en: "Latest Packaging Boxes", zh: "最新包裝盒" },
    bag: { en: "Latest Bags", zh: "最新提袋" },
    gift: { en: "Latest Gift Items", zh: "最新禮品" },
  };
  
  const categoryLinks: Record<string, string> = {
    "print-packaging": "/packaging-explorer?category=print-packaging",
    bag: "/packaging-explorer?category=bag",
    gift: "/packaging-explorer?category=gift",
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-500/30">
      <SiteHeader />
      
      <main className="relative">
        {/* Hero Section - Dynamic based on heroStyle */}
        <HeroSection config={config} t={t} />

        {/* Core Values */}
        <section className="relative z-10 bg-gray-50 px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader 
              kicker={t({ en: "Core Values", zh: "核心價值" })} 
              title={t({ en: "Why MBPACK?", zh: "為什麼選擇 MBPACK？" })} 
            />
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {coreValues.map((item, i) => (
                <div 
                  key={i} 
                  className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition duration-500 hover:shadow-lg"
                >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <span className="text-xl font-bold">{i + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t(item.title)}</h3>
                  <p className="mt-4 text-base leading-relaxed text-gray-600 group-hover:text-gray-800">
                    {t(item.description)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Carousel - 最新商品輪播 */}
        {config.featuredProductCategory && config.featuredProductCategory !== "none" && (
          <section className="bg-white px-6 py-24 overflow-hidden">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between mb-12">
                <SectionHeader 
                  kicker={t({ en: "New Arrivals", zh: "最新商品" })} 
                  title={t(categoryLabels[config.featuredProductCategory] || { en: "Featured Products", zh: "精選商品" })} 
                />
                <Link 
                  href={categoryLinks[config.featuredProductCategory] || "/packaging-explorer"}
                  className="hidden md:inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-400"
                >
                  {t({ en: "View All", zh: "查看全部" })}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              {/* 輪播容器 */}
              <div className="relative">
                {productsLoading ? (
                  <div className="flex gap-6 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-none w-64">
                        <div className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
                        <div className="mt-4 h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : featuredProducts.length > 0 ? (
                  <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {featuredProducts.map((product) => (
                      <Link 
                        key={product.id}
                        href={`/products/${product.slug || product.id}`}
                        className="group flex-none w-64 snap-start"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                          {product.coverImage ? (
                            <Image 
                              src={product.coverImage} 
                              alt={lang === "zh" ? product.name_zh : product.name_en} 
                              fill 
                              className="object-cover transition duration-500 group-hover:scale-105" 
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-200">
                              <span className="text-gray-400 text-sm">No Image</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <h4 className="mt-4 text-base font-medium text-gray-900 group-hover:text-emerald-600 transition line-clamp-2">
                          {lang === "zh" ? product.name_zh : product.name_en}
                        </h4>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t({ en: "No products found", zh: "暫無商品" })}</p>
                )}
                
                {/* 漸層遮罩效果 */}
                {featuredProducts.length > 0 && (
                  <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                )}
              </div>
              
              {/* 手機版查看全部按鈕 */}
              <div className="mt-8 text-center md:hidden">
                <Link 
                  href={categoryLinks[config.featuredProductCategory] || "/packaging-explorer"}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700"
                >
                  {t({ en: "View All", zh: "查看全部" })}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        <section className="bg-white px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader 
              kicker={t({ en: "Services", zh: "服務" })} 
              title={t({ en: "Comprehensive Services", zh: "三大服務體系" })} 
            />
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {(config.services && config.services.length > 0 ? config.services : services).map((item, i) => {
                const overlayOpacity = (item as any).overlayOpacity ?? 40;
                return (
                  <div key={i} className="group relative overflow-hidden rounded-[2rem] bg-gray-900 p-10 shadow-xl">
                    {/* Background Image */}
                    {item.image && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-105" 
                        style={{ 
                          backgroundImage: `url(${item.image})`,
                          opacity: (item.imageOpacity ?? 30) / 100
                        }} 
                      />
                    )}
                    {/* Controllable Overlay */}
                    <div 
                      className="absolute inset-0" 
                      style={{ background: `linear-gradient(to top, rgba(0,0,0,${overlayOpacity/100 + 0.3}), rgba(0,0,0,${overlayOpacity/100}), transparent)` }}
                    />
                    <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                    <h3 className="relative text-2xl font-bold text-white">{t(item.title)}</h3>
                    <p className="relative mt-4 text-lg text-white/70">{t(item.description)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Solutions (Dynamic) */}
        <section className="bg-gray-50 px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader 
              kicker={t({ en: "Solutions", zh: "產品類別" })} 
              title={t({ en: "Packaging & Gift Solutions", zh: "產品解決方案" })} 
            />
            <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displaySolutions.map((item, i) => {
                const imgOpacity = (item.imageOpacity ?? 40) / 100;
                const overlayOpacity = ((item as any).overlayOpacity ?? 50) / 100;
                return (
                  <Link 
                    href={item.link || "#"}
                    key={i} 
                    className={`group relative flex flex-col justify-end overflow-hidden rounded-3xl p-8 transition-all hover:scale-[1.02] ${
                      i === 0 ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""
                    }`}
                    style={{ minHeight: i === 0 ? "400px" : "240px", backgroundColor: "#18181b" }}
                  >
                    {/* Background Image */}
                    {item.image && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                        style={{ 
                          backgroundImage: `url(${item.image})`,
                          opacity: imgOpacity
                        }} 
                      />
                    )}
                    {/* Controllable Dark Overlay */}
                    <div 
                      className="absolute inset-0 transition-opacity group-hover:opacity-70" 
                      style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
                    />
                    
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white">{t(item.title)}</h3>
                      {item.description && (
                        <p className="mt-2 text-white/70">{t(item.description)}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Random Products Showcase */}
        {randomProducts.length > 0 && (
          <section className="bg-white px-6 py-20">
            <div className="mx-auto max-w-7xl">
              <SectionHeader 
                kicker={t({ en: "Products", zh: "精選產品" })} 
                title={t({ en: "Explore Our Collection", zh: "瀏覽產品" })} 
              />
              
              {/* Desktop: 7 columns x 4 rows grid */}
              <div className="hidden md:grid mt-12 grid-cols-4 lg:grid-cols-7 gap-4">
                {randomProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
                      {product.coverImage && (
                        <Image
                          src={product.coverImage}
                          alt={lang === 'zh' ? product.name_zh : product.name_en}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 1024px) 25vw, 14vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {lang === 'zh' ? product.name_zh : product.name_en}
                      </h4>
                      {product.tags && product.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {product.tags.slice(0, 2).map((t: any, idx: number) => (
                            <span 
                              key={idx} 
                              className="inline-block px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded"
                            >
                              {lang === 'zh' ? t.tag.name_zh : t.tag.name_en}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile: Horizontal scroll carousel */}
              <div className="md:hidden mt-8 -mx-6 px-6 overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                  {randomProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group block w-36 flex-shrink-0"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                        {product.coverImage && (
                          <Image
                            src={product.coverImage}
                            alt={lang === 'zh' ? product.name_zh : product.name_en}
                            fill
                            className="object-cover"
                            sizes="144px"
                          />
                        )}
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {lang === 'zh' ? product.name_zh : product.name_en}
                        </h4>
                        {product.tags && product.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((t: any, idx: number) => (
                              <span 
                                key={idx} 
                                className="inline-block px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded"
                              >
                                {lang === 'zh' ? t.tag.name_zh : t.tag.name_en}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* View All Button */}
              <div className="mt-8 text-center">
                <Link
                  href="/packaging-explorer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  {t({ en: "View All Products", zh: "瀏覽所有產品" })}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="border-y border-gray-200 bg-white px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader 
              kicker={t({ en: "Process", zh: "流程" })} 
              title={t({ en: "How It Works", zh: "合作流程" })} 
            />
            <div className="mt-20 relative">
              <div className="absolute left-0 top-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-gray-300 to-transparent md:block" />
              
              <div className="grid gap-12 md:grid-cols-4">
                {workflow.map((step, i) => (
                  <div key={i} className="relative flex flex-col items-center text-center">
                    <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white text-xl font-bold text-gray-900 shadow-lg">
                      {i + 1}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">{t(step.title).split("→")[0].trim()}</h4>
                    <p className="mt-2 text-sm text-gray-500">{t(step.title).split("→")[1]?.trim()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies (Dynamic) */}
        {displayCases.length > 0 && (
            <section className="bg-white px-6 py-32">
            <div className="mx-auto max-w-7xl">
                <SectionHeader 
                kicker={t({ en: "Case Studies", zh: "案例" })} 
                title={t({ en: "Success Stories", zh: "成功案例" })} 
                />
                <div className="mt-16 grid gap-8 md:grid-cols-3">
                {displayCases.map((item, i) => (
                    <div key={item.id} className="group space-y-4">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gray-100 shadow-md">
                        {item.coverImage ? (
                            <Image src={item.coverImage} alt={item.title_zh} fill className="object-cover transition duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="h-full w-full bg-gray-200" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 transition group-hover:opacity-40" />
                        <div className="absolute bottom-0 left-0 p-8">
                        <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">Case Study</p>
                        <h3 className="mt-2 text-2xl font-bold text-white">{item.title_zh}</h3>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </section>
        )}

        {/* Blog Section (Dynamic) */}
        {displayBlogs.length > 0 && (
            <section className="bg-gray-50 px-6 py-32">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader 
                        kicker={t({ en: "Blog", zh: "部落格" })} 
                        title={t({ en: "Latest Insights", zh: "最新動態" })} 
                    />
                    <div className="mt-16 grid gap-8 md:grid-cols-3">
                        {displayBlogs.map((blog) => (
                            <Link href={`/blog/${blog.slug}`} key={blog.id} className="group block overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition">
                                <div className="relative aspect-video w-full overflow-hidden">
                                    {blog.coverImage ? (
                                        <Image src={blog.coverImage} alt={blog.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="h-full w-full bg-gray-100" />
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition">{blog.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        )}

        {/* Trusted By (Dynamic) */}
        <section className="border-t border-gray-200 bg-gray-50 px-6 py-24 text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            <h3 className="text-2xl font-semibold text-gray-900">
              {t({ en: "Trusted by forward-thinking brands across Asia.", zh: "深受亞洲領先品牌信任。" })}
            </h3>
            
            {/* Logos */}
            {config.trustedBy.images.length > 0 && (
                <div className="flex flex-wrap justify-center gap-8 mb-8">
                    {config.trustedBy.images.map((url, idx) => (
                        <div key={idx} className="relative h-12 w-32 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition">
                            <Image src={url} alt="Brand Logo" fill className="object-contain" />
                        </div>
                    ))}
                </div>
            )}

            {/* Text Tags */}
            <div className="flex flex-wrap justify-center gap-3">
              {trustedBrands.map((brand) => (
                <span 
                  key={brand} 
                  className="rounded-full border border-gray-200 bg-white px-6 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-900"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden px-6 py-40 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />
          <div className="relative z-10 mx-auto max-w-3xl space-y-10">
            <h2 className="text-5xl font-bold tracking-tight text-gray-900 md:text-6xl">
              {t(finalCTA.heading)}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <CTAButton href="/contact" variant="primary" size="lg">
                {t(finalCTA.primary)}
              </CTAButton>
              <CTAButton href="/packaging-explorer" variant="secondary" size="lg">
                {t(finalCTA.secondary)}
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
}

// --- Hero Section with 5 Layouts ---

function HeroSection({ config, t }: { config: LandingPageConfig; t: (copy: Copy) => string }) {
  const { heroStyle, heroData } = config;
  
  const galleryImages = heroData.galleryImages || [
    "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=600",
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=600",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
  ];

  // Style 1: Centered Full Screen with Video
  if (heroStyle === "style1") {
    return (
      <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroData.videoUrl ? (
            <video className="h-full w-full object-cover opacity-60" autoPlay loop muted playsInline poster={heroData.backgroundImage}>
              <source src={heroData.videoUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="h-full w-full bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${heroData.backgroundImage})` }} />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="space-y-8">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">MBPACK.CO</p>
            <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl">{t(heroData.headline)}</h1>
            <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-white/90 md:text-2xl">{t(heroData.subheadline)}</p>
            <p className="mx-auto max-w-2xl text-base text-white/70 md:text-lg">{t(heroData.support)}</p>
            <HeroCTAs t={t} />
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Left Text + Right Gallery (3 images)
  if (heroStyle === "style2") {
    return (
      <section className="relative min-h-screen overflow-hidden bg-black px-6 py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-0" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center min-h-[80vh]">
          <div className="space-y-8">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">MBPACK.CO</p>
            <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">{t(heroData.headline)}</h1>
            <p className="max-w-xl text-xl font-medium leading-relaxed text-white/90">{t(heroData.subheadline)}</p>
            <p className="max-w-lg text-base text-white/70">{t(heroData.support)}</p>
            <HeroCTAs t={t} />
          </div>
          <div className="space-y-4">
            {galleryImages.slice(0, 3).map((src, i) => (
              <div key={i} className="relative h-44 overflow-hidden rounded-3xl border border-white/10">
                <Image src={src} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Giant Title Minimal
  if (heroStyle === "style3") {
    return (
      <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <p className="mb-8 text-sm font-bold uppercase tracking-[0.5em] text-emerald-300">MBPACK.CO</p>
          <h1 className="text-6xl font-black tracking-tighter text-white md:text-8xl lg:text-[10rem] leading-none">{t(heroData.headline)}</h1>
          <p className="mx-auto mt-12 max-w-2xl text-lg text-white/60">{t(heroData.subheadline)}</p>
          <div className="mt-12">
            <HeroCTAs t={t} />
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Card Stack with Background
  if (heroStyle === "style4") {
    const bgOpacity = heroData.backgroundOpacity ?? 100;
    const overlayOpacity = heroData.overlayOpacity ?? 30;
    return (
      <section className="relative min-h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          {(heroData.backgroundImage || galleryImages[0]) && (
            <Image 
              src={heroData.backgroundImage || galleryImages[0]} 
              alt="" 
              fill 
              className="object-cover"
              style={{ opacity: bgOpacity / 100 }}
            />
          )}
          {/* 可控制的遮罩 */}
          <div 
            className="absolute inset-0" 
            style={{ background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity/100}), transparent, rgba(0,0,0,${overlayOpacity/100 + 0.2}))` }}
          />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-32">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-[3rem] border border-white/10 bg-black/60 p-12 backdrop-blur-xl md:p-16">
              <p className="text-center text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">MBPACK.CO</p>
              <h1 className="mt-8 text-center text-4xl font-bold tracking-tight text-white md:text-6xl">{t(heroData.headline)}</h1>
              <p className="mx-auto mt-8 max-w-2xl text-center text-lg text-white/80">{t(heroData.subheadline)}</p>
              <p className="mx-auto mt-4 max-w-xl text-center text-sm text-white/60">{t(heroData.support)}</p>
              <div className="mt-10 flex justify-center">
                <HeroCTAs t={t} />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 5: Two Column Left Image Right Text
  if (heroStyle === "style5") {
    return (
      <section className="relative min-h-screen overflow-hidden bg-black">
        <div className="grid min-h-screen lg:grid-cols-2">
          <div className="relative">
            <div className="absolute inset-0">
              {heroData.videoUrl ? (
                <video className="h-full w-full object-cover" autoPlay loop muted playsInline>
                  <source src={heroData.videoUrl} type="video/mp4" />
                </video>
              ) : (
                <Image src={heroData.backgroundImage || galleryImages[0]} alt="" fill className="object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black lg:block hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent lg:hidden" />
            </div>
          </div>
          <div className="relative flex items-center px-8 py-20 lg:px-16">
            <div className="space-y-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">MBPACK.CO</p>
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">{t(heroData.headline)}</h1>
              <p className="max-w-lg text-lg text-white/80">{t(heroData.subheadline)}</p>
              <p className="max-w-md text-sm text-white/60">{t(heroData.support)}</p>
              <HeroCTAs t={t} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback to style1
  return null;
}

function HeroCTAs({ t }: { t: (copy: Copy) => string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
      <CTAButton href="/contact" variant="primary" size="lg">
        {t({ en: "Start Your Project", zh: "開始專案" })}
      </CTAButton>
      <CTAButton href="/case" variant="secondary" size="lg">
        {t({ en: "View Case Studies", zh: "查看案例" })}
      </CTAButton>
    </div>
  );
}

// --- Helper Components ---

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="space-y-3 text-center md:text-left">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">{kicker}</p>
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">{title}</h2>
    </div>
  );
}

function CTAButton({ 
  href, 
  children, 
  variant = "primary",
  size = "md"
}: { 
  href: string; 
  children: React.ReactNode; 
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
}) {
  const base = "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300";
  
  const sizes = {
    md: "px-6 py-3 text-sm",
    lg: "px-10 py-4 text-lg",
  };

  const variants = {
    primary: "bg-gray-900 text-white hover:bg-emerald-600 hover:scale-105 hover:shadow-lg",
    secondary: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:scale-105",
  };

  return (
    <Link href={href} className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {children}
    </Link>
  );
}
