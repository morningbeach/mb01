'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { SiteHeader } from '../../components/SiteShell';
import { SiteFooter } from '../../components/SiteFooter';
import ProductModal from './ProductModal';
import AiDesignModal from './AiDesignModal';
import {
  Package, ShoppingBag, Gift, Layers, Target, Sparkles,
  Paintbrush, Leaf, Star, ChevronDown, ChevronRight, X, Search,
  ToggleLeft, ToggleRight, Grid3X3, LayoutGrid, Loader2,
  TreePine, SlidersHorizontal, Filter, Copy, Check
} from 'lucide-react';

// ==========================================
// 類型定義
// ==========================================
interface Tag {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  productCount?: number;
  color?: string;
}

interface Dimension {
  id: string;
  slug: string;
  category: string;
  name_zh: string;
  name_en: string;
  icon: string | null;
  order: number;
  tags: Tag[];
}

interface Product {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  shortDesc_zh?: string;
  shortDesc_en?: string;
  coverImage: string | null;
  images: string[];
  material?: string;
  specs?: string;
  moq?: number;
  enableAiGen?: boolean;
  ProductTag?: Array<{ Tag: Tag }>;
}

// Icon 對照
const iconMap: Record<string, any> = {
  Package, Layers, Target, Sparkles, Paintbrush, Leaf, Star, ShoppingBag, Gift,
};

// ==========================================
// 類別配置
// ==========================================
const categories = [
  { id: 'print-packaging', name_zh: '包裝盒', name_en: 'Boxes', icon: Package, color: 'bg-amber-500', colorLight: 'bg-amber-50', colorBorder: 'border-amber-200', colorText: 'text-amber-800', colorAccent: 'bg-amber-600', disabled: false },
  { id: 'bag', name_zh: '提袋', name_en: 'Bags', icon: ShoppingBag, color: 'bg-emerald-500', colorLight: 'bg-emerald-50', colorBorder: 'border-emerald-200', colorText: 'text-emerald-800', colorAccent: 'bg-emerald-600', disabled: false },
  { id: 'gift', name_zh: '禮品', name_en: 'Gifts', icon: Gift, color: 'bg-violet-500', colorLight: 'bg-violet-50', colorBorder: 'border-violet-200', colorText: 'text-violet-800', colorAccent: 'bg-violet-600', disabled: false },
  { id: 'all', name_zh: '全部（暫未開放）', name_en: 'All (Coming Soon)', icon: Grid3X3, color: 'bg-gray-700', colorLight: 'bg-gray-50', colorBorder: 'border-gray-200', colorText: 'text-gray-800', colorAccent: 'bg-gray-600', disabled: true },
];

// 每個品類對應的品項維度 slug
const categoryItemDimensions: Record<string, string[]> = {
  'print-packaging': ['folding-carton', 'rigid-box', 'other-print'],  // 包裝盒有三個品項維度
  'bag': ['bag-style'],                                                 // 提袋品項維度
  'gift': ['gift-type'],                                               // 禮品品項維度（前台只展開，不當標籤）
};

// 禮品品項 → 子維度的對應表
const giftItemToDimensionMap: Record<string, string> = {
  'drinkware': 'gift-drinkware',
  'gift-bags': 'gift-bag-type',
  'stationery': 'gift-stationery',
  'tech-accessories': 'gift-tech',
  'card-holders': 'gift-card-holder',
  'apparel-accessories': 'gift-apparel',
  'keychains-accessories': 'gift-keychain',
  'home-living': 'gift-home',
  'fragrance': 'gift-fragrance',
  'outdoor-sports': 'gift-outdoor',
  'toys-games': 'gift-toys',
  'office-business': 'gift-office',
};

// 應用場景維度 slugs（用於全部模式）
const applicationDimensionSlugs = ['application', 'bag-application', 'gift-application'];

// ==========================================
// 主組件
// ==========================================
export default function PackagingExplorerV2() {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 狀態
  const [activeCategory, setActiveCategory] = useState('print-packaging');
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [displayCount, setDisplayCount] = useState(20); // 初始顯示數量（減少為20）
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'any' | 'all'>('any'); // OR / AND
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [transitioning, setTransitioning] = useState(false); // 過渡動畫狀態
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [aiDesignProduct, setAiDesignProduct] = useState<Product | null>(null); // AI 設計專用
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [initialLoaded, setInitialLoaded] = useState(false); // 是否已完成初次載入
  const [usingCache, setUsingCache] = useState(false); // 是否正在使用快取（跳過 effect 載入）
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false); // 手機版篩選面板
  const [reachedBottom, setReachedBottom] = useState(false); // 是否滾動到底部
  const [urlCopied, setUrlCopied] = useState(false); // 複製網址成功提示
  const [selectedGiftItem, setSelectedGiftItem] = useState<string | null>(null); // 選中的禮品品項（如 drinkware）
  const [moreProductsStartIndex, setMoreProductsStartIndex] = useState<number>(0); // 「更多產品」的起始索引
  const [giftSubDimension, setGiftSubDimension] = useState<Dimension | null>(null); // 禮品品項的子維度
  // 禮品初始隨機產品狀態
  const [giftRandomProducts, setGiftRandomProducts] = useState<Product[]>([]);
  const [showingRandomPicks, setShowingRandomPicks] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false); // 篩選時的載入狀態
  
  // 從 URL 讀取初始類別（同步）
  const getInitialCategory = (): string => {
    const categoryParam = searchParams.get('cat') || searchParams.get('category');
    if (categoryParam && ['print-packaging', 'bag', 'gift'].includes(categoryParam)) {
      return categoryParam;
    }
    return 'print-packaging';
  };
  
  // 從 URL 讀取初始標籤和類別
  const urlInitializedRef = useRef(false);
  const initialCategoryRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (urlInitializedRef.current) return;
    urlInitializedRef.current = true;
    
    const tagsParam = searchParams.get('tags');
    const categoryParam = searchParams.get('cat') || searchParams.get('category');
    
    // 支援 gift 類別
    if (categoryParam && ['print-packaging', 'bag', 'gift'].includes(categoryParam)) {
      setActiveCategory(categoryParam);
      initialCategoryRef.current = categoryParam;
    }
    
    if (tagsParam) {
      const tagSlugs = tagsParam.split(',').filter(Boolean);
      if (tagSlugs.length > 0) {
        setSelectedTags(new Set(tagSlugs));
      }
    }
  }, [searchParams]);
  
  // 無限滾動觀察器 ref
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const footerTriggerRef = useRef<HTMLDivElement>(null);
  
  // 載入鎖 - 防止同一類別重複載入
  const loadingLockRef = useRef<string | null>(null);
  
  // 篩選面板開啟時鎖定背景滾動
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileFilterOpen]);

  // 載入維度資料
  const loadDimensions = useCallback(async () => {
    try {
      if (activeCategory === 'all') {
        // 全部模式：只載入應用場景維度並合併標籤
        const responses = await Promise.all(
          applicationDimensionSlugs.map(slug => 
            fetch(`/api/filter-dimensions?category=${slug.replace('-application', '') || 'print-packaging'}`)
          )
        );
        
        const allDims: Dimension[] = [];
        for (const res of responses) {
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              const appDim = data.data.find((d: Dimension) => 
                applicationDimensionSlugs.includes(d.slug)
              );
              if (appDim) allDims.push(appDim);
            }
          }
        }
        
        // 合併所有應用場景標籤（去重）
        const mergedTags = new Map<string, Tag>();
        allDims.forEach(dim => {
          dim.tags.forEach(tag => {
            if (!mergedTags.has(tag.slug)) {
              mergedTags.set(tag.slug, tag);
            }
          });
        });
        
        const mergedDimension: Dimension = {
          id: 'merged-application',
          slug: 'merged-application',
          category: 'all',
          name_zh: '應用場景',
          name_en: 'Application',
          icon: 'Target',
          order: 1,
          tags: Array.from(mergedTags.values()),
        };
        
        setDimensions([mergedDimension]);
        setExpandedDimensions(new Set(['merged-application']));
      } else {
        const res = await fetch(`/api/filter-dimensions?category=${activeCategory}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // 過濾掉沒有產品的標籤
            const filteredDims = data.data.map((dim: Dimension) => ({
              ...dim,
              tags: dim.tags.filter(tag => (tag.productCount || 0) > 0)
            })).filter((dim: Dimension) => dim.tags.length > 0);
            
            setDimensions(filteredDims);
            // 預設展開前兩個維度
            setExpandedDimensions(new Set(filteredDims.slice(0, 2).map((d: Dimension) => d.slug)));
          }
        }
      }
    } catch (error) {
      console.error('載入維度失敗:', error);
    }
  }, [activeCategory]);

  // 載入產品資料（初次載入或篩選變更時）
  const loadProducts = useCallback(async (reset = true) => {
    if (reset) {
      setLoading(true);
      setPage(1);
      setDisplayCount(25);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const tagSlugs = Array.from(selectedTags);
      let url = '/api/products/filter';
      
      const params = new URLSearchParams();
      if (tagSlugs.length > 0) {
        params.append('tags', tagSlugs.join(','));
        params.append('mode', filterMode);
        params.append('includeMore', 'true'); // 包含更多其他產品
      }
      if (activeCategory !== 'all') {
        params.append('category', activeCategory);
      }
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      // 預載入 50 個，但可以載入更多
      const currentPage = reset ? 1 : page;
      params.append('page', currentPage.toString());
      params.append('limit', '50');
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const newProducts = data.products || [];
        const moreProducts = data.moreProducts || [];
        
        // 設置分隔線位置（符合 tag 的產品數量）
        const matchedCount = data.matchedCount || newProducts.length;
        setMoreProductsStartIndex(matchedCount);

        if (reset) {
          // 合併符合的產品和其他產品
          const allProducts = [...newProducts, ...moreProducts];
          const dedupedProducts = dedupeProducts(allProducts);
          setProducts(dedupedProducts);
          // 預載新產品的圖片
          preloadImagesRef.current(dedupedProducts, 'high');
        } else {
          setProducts(prev => {
            const merged = [...prev, ...newProducts];
            return dedupeProducts(merged);
          });
          // 預載新增的產品圖片
          preloadImagesRef.current(newProducts, 'low');
        }

        setTotalProducts(data.pagination?.total || 0);
        setHasMore(newProducts.length === 50);
        if (!reset) {
          setPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('載入產品失敗:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedTags, filterMode, activeCategory, searchQuery, page]);

  // 載入更多（增加顯示數量或從 API 載入更多）
  const loadMore = useCallback(() => {
    if (loadingMore) return;
    
    // 如果正在顯示隨機推薦，且滾到底部，載入完整產品列表
    if (showingRandomPicks && ['gift', 'print-packaging', 'bag'].includes(activeCategory)) {
      // 直接從 ref 讀取快取
      let cached = null;
      if (activeCategory === 'gift' && giftCache.current.products.length > 0) {
        cached = giftCache.current;
      } else if (activeCategory === 'print-packaging' && printPackagingCache.current.products.length > 0) {
        cached = printPackagingCache.current;
      } else if (activeCategory === 'bag' && bagCache.current.products.length > 0) {
        cached = bagCache.current;
      }
      
      if (cached && cached.products.length > 0) {
        // 排除已顯示的隨機產品，把剩餘產品接在後面
        const currentIds = new Set(products.map(p => p.id));
        const remainingProducts = cached.products.filter(p => !currentIds.has(p.id));
        
        if (remainingProducts.length > 0) {
          setProducts(prev => [...prev, ...remainingProducts]);
          setTotalProducts(cached.total);
          setShowingRandomPicks(false); // 不再是隨機模式
          setHasMore(false);
          setDisplayCount(prev => prev + 25); // 顯示更多
          return;
        }
      }
    }
    
    // 如果已載入的產品還有剩餘，先顯示更多
    if (displayCount < products.length) {
      setDisplayCount(prev => Math.min(prev + 25, products.length));
    } 
    // 如果已顯示全部，且還有更多可載入，從 API 載入
    else if (hasMore) {
      loadProducts(false);
    }
  }, [displayCount, products.length, hasMore, loadingMore, loadProducts, showingRandomPicks, activeCategory, products]);

  // 無限滾動 - IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, loading, loadingMore]);

  // Footer 觸發器 - 滾動到底部時顯示 Footer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setReachedBottom(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerTriggerRef.current) {
      observer.observe(footerTriggerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 切換類別或篩選時重置 reachedBottom
  useEffect(() => {
    setReachedBottom(false);
  }, [activeCategory, selectedTags, searchQuery]);

  // 三個獨立的快取區塊，互不污染
  const printPackagingCache = useRef<{ products: Product[], dimensions: Dimension[], total: number, locked: boolean }>({ products: [], dimensions: [], total: 0, locked: false });
  const bagCache = useRef<{ products: Product[], dimensions: Dimension[], total: number, locked: boolean }>({ products: [], dimensions: [], total: 0, locked: false });
  const giftCache = useRef<{ products: Product[], dimensions: Dimension[], total: number, locked: boolean }>({ products: [], dimensions: [], total: 0, locked: false });
  
  // 圖片預載快取 - 已預載的圖片 URL
  const preloadedImages = useRef<Set<string>>(new Set());
  
  // 預載圖片（背景執行，不阻塞 UI）- 使用 ref 存放避免依賴問題
  const preloadImagesRef = useRef((products: Product[], priority: 'high' | 'low' = 'low') => {
    products.forEach((product, index) => {
      if (product.coverImage && !preloadedImages.current.has(product.coverImage)) {
        const delay = priority === 'high' ? index * 50 : index * 100 + 500;
        setTimeout(() => {
          const img = new window.Image();
          img.src = product.coverImage!;
          img.onload = () => {
            preloadedImages.current.add(product.coverImage!);
          };
        }, delay);
      }
      if (product.images && product.images.length > 0) {
        product.images.slice(0, 3).forEach((imgUrl, imgIndex) => {
          if (!preloadedImages.current.has(imgUrl)) {
            setTimeout(() => {
              const img = new window.Image();
              img.src = imgUrl;
              img.onload = () => {
                preloadedImages.current.add(imgUrl);
              };
            }, (priority === 'high' ? 1000 : 2000) + index * 100 + imgIndex * 200);
          }
        });
      }
    });
  });
  
  // 取得指定類別的快取
  const getCategoryCache = (categoryId: string) => {
    if (categoryId === 'print-packaging' && printPackagingCache.current.products.length > 0) {
      return printPackagingCache.current;
    }
    if (categoryId === 'bag' && bagCache.current.products.length > 0) {
      return bagCache.current;
    }
    if (categoryId === 'gift' && giftCache.current.products.length > 0) {
      return giftCache.current;
    }
    return null;
  };
  
  // 檢查快取是否已鎖定
  const isCacheLocked = (categoryId: string) => {
    if (categoryId === 'print-packaging') return printPackagingCache.current.locked;
    if (categoryId === 'bag') return bagCache.current.locked;
    if (categoryId === 'gift') return giftCache.current.locked;
    return false;
  };
  
  // 設定指定類別的快取
  const setCategoryCache = (categoryId: string, data: { products: Product[], dimensions: Dimension[], total: number }, lock = false) => {
    if (categoryId === 'print-packaging') {
      printPackagingCache.current = { ...data, locked: lock };
    } else if (categoryId === 'bag') {
      bagCache.current = { ...data, locked: lock };
    } else if (categoryId === 'gift') {
      giftCache.current = { ...data, locked: lock };
    }
  };
  
  // 鎖定快取（防止被覆蓋）
  const lockCache = (categoryId: string) => {
    if (categoryId === 'print-packaging') {
      printPackagingCache.current.locked = true;
    } else if (categoryId === 'bag') {
      bagCache.current.locked = true;
    }
  };

  // 初次載入：漸進式載入 - 先載 20 個快速展示，背景載入全部
  useEffect(() => {
    if (initialLoaded) return;
    
    // 等待 URL 參數初始化完成
    if (!urlInitializedRef.current) return;
    
    // 防止重複載入
    if (loadingLockRef.current === activeCategory) return;
    loadingLockRef.current = activeCategory;
    
    // 禮品類別初次載入：先載入維度，再載入隨機產品，背景預載全部
    if (activeCategory === 'gift') {
      const loadGiftInitial = async () => {
        setLoading(true);
        let loadedDimensions: Dimension[] = [];
        
        try {
          // 第一步：先載入維度（左側控制器）
          const dimensionsRes = await fetch(`/api/filter-dimensions?category=gift`);
          if (dimensionsRes.ok) {
            const dimensionsData = await dimensionsRes.json();
            if (dimensionsData.success) {
              loadedDimensions = dimensionsData.data.map((dim: Dimension) => ({
                ...dim,
                tags: dim.tags.filter(tag => (tag.productCount || 0) > 0)
              })).filter((dim: Dimension) => dim.tags.length > 0);
              
              setDimensions(loadedDimensions);
              setExpandedDimensions(new Set(loadedDimensions.slice(0, 2).map((d: Dimension) => d.slug)));
            }
          }
          
          // 第二步：載入隨機產品
          const randomProductsRes = await fetch(`/api/products/filter?category=gift&random=true&limit=15`);
          if (randomProductsRes.ok) {
            const productsData = await randomProductsRes.json();
            const randomProducts = dedupeProducts(productsData.products || []);
            setGiftRandomProducts(randomProducts);
            setProducts(randomProducts);
            setTotalProducts(randomProducts.length);
            setShowingRandomPicks(true);
            setHasMore(true); // 還有更多產品可載入
          }
          
          setLoading(false);
          setInitialLoaded(true);
          
          // 背景預載所有禮品產品
          const fullProductsRes = await fetch(`/api/products/filter?category=gift&page=1&limit=500`);
          if (fullProductsRes.ok) {
            const fullData = await fullProductsRes.json();
            const allProducts = dedupeProducts(fullData.products || []);
            
            // 存到快取並鎖定
            setCategoryCache('gift', {
              products: allProducts,
              dimensions: loadedDimensions,
              total: allProducts.length,
            }, true);
            
            // 預載圖片
            preloadImagesRef.current(allProducts, 'low');
            console.log(`[禮品預載完成] ${allProducts.length} 個產品已快取`);
          }
          
          // 背景預載其他類別
          setTimeout(() => {
            prefetchCategory('print-packaging');
            prefetchCategory('bag');
          }, 500);
        } catch (error) {
          console.error('禮品初次載入失敗:', error);
          setLoading(false);
          setInitialLoaded(true);
        }
      };
      loadGiftInitial();
      return;
    }
    
    const initialLoad = async () => {
      setLoading(true);
      try {
        // 第一步：先載入維度（左側控制器）
        const dimensionsRes = await fetch(`/api/filter-dimensions?category=${activeCategory}`);
        
        let loadedDimensions: Dimension[] = [];
        
        if (dimensionsRes.ok) {
          const data = await dimensionsRes.json();
          if (data.success) {
            loadedDimensions = data.data.map((dim: Dimension) => ({
              ...dim,
              tags: dim.tags.filter(tag => (tag.productCount || 0) > 0)
            })).filter((dim: Dimension) => dim.tags.length > 0);
            
            setDimensions(loadedDimensions);
            setExpandedDimensions(new Set(loadedDimensions.slice(0, 2).map((d: Dimension) => d.slug)));
          }
        }
        
        // 第二步：載入隨機 20 個產品（包裝盒/提袋也隨機推薦）
        const quickParams = new URLSearchParams();
        quickParams.append('category', activeCategory);
        quickParams.append('random', 'true');
        quickParams.append('limit', '20');
        
        const quickProductsRes = await fetch(`/api/products/filter?${quickParams.toString()}`);
        
        let quickProducts: Product[] = [];
        
        if (quickProductsRes.ok) {
          const data = await quickProductsRes.json();
          const rawProducts = data.products || [];
          quickProducts = dedupeProducts(rawProducts);
          // 先顯示隨機 20 個
          setProducts(quickProducts);
          setTotalProducts(quickProducts.length);
          setShowingRandomPicks(true); // 顯示隨機推薦 banner
          setHasMore(true); // 還有更多
        }
        
        // 預載前 20 個圖片（高優先級）
        preloadImagesRef.current(quickProducts, 'high');
        
        setLoading(false);
        setInitialLoaded(true);
        
        // 第二階段：背景載入全部產品
        const fullParams = new URLSearchParams();
        fullParams.append('category', activeCategory);
        fullParams.append('page', '1');
        fullParams.append('limit', '500');
        
        const fullProductsRes = await fetch(`/api/products/filter?${fullParams.toString()}`);
        if (fullProductsRes.ok) {
          const data = await fullProductsRes.json();
          const rawProducts = data.products || [];
          const allProducts = dedupeProducts(rawProducts);
          const total = allProducts.length;
          
          // 更新為全部產品
          setProducts(allProducts);
          setTotalProducts(total);
          setHasMore(false);
          
          // 存到快取並鎖定
          setCategoryCache(activeCategory, {
            products: allProducts,
            dimensions: loadedDimensions,
            total: total,
          }, true);
          
          // 預載剩餘圖片（低優先級）
          preloadImagesRef.current(allProducts.slice(20), 'low');
          
          console.log(`[載入完成] ${activeCategory}: ${total} 個產品`);
        }
        
        // 背景預載其他類別（排除當前類別）
        setTimeout(() => {
          if (activeCategory !== 'bag') prefetchCategory('bag');
          if (activeCategory !== 'print-packaging') prefetchCategory('print-packaging');
          if (activeCategory !== 'gift') prefetchCategory('gift');
        }, 500);
      } catch (error) {
        console.error('初次載入失敗:', error);
        setLoading(false);
      }
    };
    
    initialLoad();
  }, [activeCategory]); // 當 activeCategory 變化時重新執行

  // 正在預載的類別（防止並發）
  const prefetchingRef = useRef<Set<string>>(new Set());
  
  // 背景預載其他類別（載入全部產品，鎖定後不再更新）
  const prefetchCategory = async (categoryId: string) => {
    // 已快取且鎖定，不重複載入
    if (getCategoryCache(categoryId) && isCacheLocked(categoryId)) return;
    // 正在預載中，跳過
    if (prefetchingRef.current.has(categoryId)) return;
    prefetchingRef.current.add(categoryId);
    
    try {
      const params = new URLSearchParams();
      params.append('category', categoryId);
      params.append('page', '1');
      params.append('limit', '500'); // 載入全部產品
      
      const [productsRes, dimensionsRes] = await Promise.all([
        fetch(`/api/products/filter?${params.toString()}`),
        fetch(`/api/filter-dimensions?category=${categoryId}`),
      ]);
      
      if (productsRes.ok && dimensionsRes.ok) {
        const productsData = await productsRes.json();
        const dimensionsData = await dimensionsRes.json();
        
        const filteredDims = dimensionsData.success 
          ? dimensionsData.data
              .map((dim: Dimension) => ({
                ...dim,
                tags: dim.tags.filter(tag => (tag.productCount || 0) > 0)
              }))
              .filter((dim: Dimension) => dim.tags.length > 0)
          : [];
        
        // 儲存到快取時去重，避免重複的 product id 或重複的圖片
        const rawProducts = productsData.products || [];
        const dedupedProducts = dedupeProducts(rawProducts);
        
        // 設定並鎖定快取，總數使用去重後的實際數量
        setCategoryCache(categoryId, {
          products: dedupedProducts,
          dimensions: filteredDims,
          total: dedupedProducts.length,
        }, true); // 鎖定
        
        // 背景預載圖片（低優先級）
        preloadImagesRef.current(dedupedProducts, 'low');
        
        console.log(`[預載] ${categoryId}: ${dedupedProducts.length} 個產品已快取`);
      }
    } catch (error) {
      // 預載失敗不影響使用
      console.log('預載失敗，切換時會重新載入');
    } finally {
      prefetchingRef.current.delete(categoryId);
    }
  };

  // 去重函數：移除相同 id、slug 或相同 coverImage 的產品，保留第一個出現者
  function dedupeProducts(items: any[]) {
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();
    const seenImages = new Set<string>();
    const result: any[] = [];
    for (const it of items) {
      if (!it) continue;
      // 檢查 ID
      if (seenIds.has(it.id)) continue;
      // 檢查 slug
      if (it.slug && seenSlugs.has(it.slug)) continue;
      // 檢查圖片
      const imgRaw = (it.coverImage || '').split('?')[0] || '';
      const imgKey = imgRaw.trim().toLowerCase();
      if (imgKey && seenImages.has(imgKey)) continue;
      // 記錄已見
      seenIds.add(it.id);
      if (it.slug) seenSlugs.add(it.slug);
      if (imgKey) seenImages.add(imgKey);
      result.push(it);
    }
    return result;
  }

  // 用 ref 追蹤是否應該跳過下一次 effect（比 state 更可靠）
  const skipNextEffectRef = useRef(false);

  // 篩選變更時載入（初次載入後）- 但使用快取時跳過
  useEffect(() => {
    if (!initialLoaded || usingCache || skipNextEffectRef.current) {
      skipNextEffectRef.current = false;
      return;
    }
    // 只有在有篩選條件時才重新載入維度
    if (selectedTags.size > 0) {
      loadDimensions();
    }
  }, [loadDimensions, initialLoaded, usingCache, selectedTags.size]);

  useEffect(() => {
    if (!initialLoaded || usingCache || skipNextEffectRef.current) {
      return;
    }
    
    // 禮品類別特殊處理：從 API 載入產品
    if (activeCategory === 'gift') {
      const tagSlugs = Array.from(selectedTags);
      if (tagSlugs.length > 0) {
        // 有選擇品項時，從 API 載入產品
        const loadGiftProducts = async () => {
          setFilterLoading(true); // 開始載入
          try {
            const params = new URLSearchParams();
            params.append('category', 'gift');
            params.append('tags', tagSlugs.join(','));
            params.append('page', '1');
            params.append('limit', '500');
            
            const res = await fetch(`/api/products/filter?${params.toString()}`);
            if (res.ok) {
              const data = await res.json();
              const dedupedProducts = dedupeProducts(data.products || []);
              setProducts(dedupedProducts);
              setTotalProducts(dedupedProducts.length);
              setHasMore(false);
              setDisplayCount(20);
            }
          } catch (error) {
            console.error('載入禮品產品失敗:', error);
          } finally {
            setFilterLoading(false); // 結束載入
          }
        };
        loadGiftProducts();
      }
      return; // 禮品類別不使用本地過濾
    }
    
    // 本地過濾（標籤 + 搜尋都在本地完成）
    const cached = getCategoryCache(activeCategory);
    if (cached && cached.products.length > 0) {
      const tagSlugs = Array.from(selectedTags);
      const query = searchQuery.toLowerCase().trim();
      
      let filtered = cached.products;
      
      // 標籤過濾
      if (tagSlugs.length > 0) {
        filtered = filtered.filter(product => {
          const productTagSlugs = product.ProductTag?.map(pt => pt.Tag?.slug).filter(Boolean) || [];
          if (filterMode === 'all') {
            // AND 模式：必須符合所有選中的標籤
            return tagSlugs.every(slug => productTagSlugs.includes(slug));
          } else {
            // OR 模式：符合任一選中的標籤
            return tagSlugs.some(slug => productTagSlugs.includes(slug));
          }
        });
      }
      
      // 搜尋過濾（本地全文搜尋）
      if (query) {
        filtered = filtered.filter(product => {
          const searchFields = [
            product.name_zh,
            product.name_en,
            product.shortDesc_zh,
            product.shortDesc_en,
            product.material,
            product.specs,
            // 也搜尋標籤名稱
            ...(product.ProductTag?.map(pt => pt.Tag?.name_zh) || []),
            ...(product.ProductTag?.map(pt => pt.Tag?.name_en) || []),
          ].filter(Boolean).map(s => s!.toLowerCase());
          
          return searchFields.some(field => field.includes(query));
        });
      }
      
      // 如果有任何篩選條件，更新產品列表
      if (tagSlugs.length > 0 || query) {
        setProducts(filtered);
        setTotalProducts(filtered.length);
        setHasMore(false);
        setDisplayCount(20);
      }
      return;
    }
  }, [selectedTags, filterMode, searchQuery, usingCache, initialLoaded, activeCategory]);

  // 切換類別 - 使用預載快取加速（最大程度保留快取）
  const handleCategoryChange = async (categoryId: string) => {
    // 禮品類別特殊處理：如果已經在禮品且沒有選擇標籤，重新隨機
    if (categoryId === 'gift' && activeCategory === 'gift' && selectedTags.size === 0 && !transitioning) {
      const giftCached = getCategoryCache('gift');
      if (giftCached && giftCached.products.length > 0) {
        // 從快取隨機選擇15個新產品
        const allProducts = giftCached.products;
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
        const randomFromCache = shuffled.slice(0, 15);
        
        setProducts(randomFromCache);
        setTotalProducts(randomFromCache.length);
        // 不需要重設 setShowingRandomPicks，它已經是 true
        setHasMore(true); // 還有更多產品可載入
        console.log(`[禮品重新隨機] 從快取隨機選擇 ${randomFromCache.length} 個新產品`);
        return;
      }
      // 如果快取還沒準備好，什麼都不做
      return;
    }
    
    // 包裝盒/提袋類別：如果已經在同一類別且沒有選擇標籤，重新隨機
    if ((categoryId === 'print-packaging' || categoryId === 'bag') && 
        categoryId === activeCategory && selectedTags.size === 0 && !transitioning) {
      const cached = getCategoryCache(categoryId);
      if (cached && cached.products.length > 0) {
        // 從快取隨機選擇20個新產品
        const allProducts = cached.products;
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
        const randomFromCache = shuffled.slice(0, 20);
        
        setProducts(randomFromCache);
        setTotalProducts(randomFromCache.length);
        setShowingRandomPicks(true); // 顯示隨機推薦 banner
        setHasMore(true); // 還有更多產品可載入
        console.log(`[${categoryId}重新隨機] 從快取隨機選擇 ${randomFromCache.length} 個新產品`);
        return;
      }
    }
    
    if (categoryId === activeCategory || transitioning) return;
    
    const previousCategory = activeCategory;
    
    // 保存當前類別到快取並鎖定（只要沒有篩選條件且未鎖定）
    if (products.length > 0 && selectedTags.size === 0 && !isCacheLocked(previousCategory)) {
      setCategoryCache(previousCategory, {
        products: [...products],
        dimensions: [...dimensions],
        total: totalProducts,
      }, true); // 鎖定
    }
    
    // 禮品類別特殊處理
    if (categoryId === 'gift') {
      setActiveCategory(categoryId);
      setSelectedTags(new Set());
      setSelectedGiftItem(null);
      setGiftSubDimension(null);
      setDisplayCount(15);
      setPage(1);
      
      // 檢查是否已有快取
      const giftCached = getCategoryCache('gift');
      
      if (giftCached && giftCached.products.length > 0) {
        // 從快取隨機選擇15個產品
        const allProducts = giftCached.products;
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
        const randomFromCache = shuffled.slice(0, 15);
        
        setDimensions(giftCached.dimensions);
        setExpandedDimensions(new Set(giftCached.dimensions.slice(0, 2).map((d: Dimension) => d.slug)));
        setProducts(randomFromCache);
        setTotalProducts(randomFromCache.length);
        setShowingRandomPicks(true);
        setHasMore(true); // 還有更多產品可載入
        console.log(`[禮品切換] 從快取隨機選擇 ${randomFromCache.length} 個產品`);
        return;
      }
      
      // 沒有快取，從 API 載入
      setLoading(true);
      
      try {
        // 同時載入維度和隨機15個產品
        const [dimensionsRes, randomProductsRes] = await Promise.all([
          fetch(`/api/filter-dimensions?category=${categoryId}`),
          fetch(`/api/products/filter?category=gift&random=true&limit=15`),
        ]);
        
        let loadedDimensions: Dimension[] = [];
        
        if (dimensionsRes.ok) {
          const dimensionsData = await dimensionsRes.json();
          if (dimensionsData.success) {
            // 過濾掉沒有產品的維度和標籤
            loadedDimensions = dimensionsData.data.map((dim: Dimension) => ({
              ...dim,
              tags: dim.tags.filter(tag => (tag.productCount || 0) > 0)
            })).filter((dim: Dimension) => dim.tags.length > 0);
            
            setDimensions(loadedDimensions);
            setExpandedDimensions(new Set(loadedDimensions.slice(0, 2).map((d: Dimension) => d.slug)));
          }
        }
        
        if (randomProductsRes.ok) {
          const productsData = await randomProductsRes.json();
          const randomProducts = dedupeProducts(productsData.products || []);
          setGiftRandomProducts(randomProducts);
          setProducts(randomProducts);
          setTotalProducts(randomProducts.length);
          setShowingRandomPicks(true);
          setHasMore(true); // 還有更多產品可載入
        }
        
        // 背景預載所有禮品產品
        const fullProductsRes = await fetch(`/api/products/filter?category=gift&page=1&limit=500`);
        if (fullProductsRes.ok) {
          const fullData = await fullProductsRes.json();
          const allProducts = dedupeProducts(fullData.products || []);
          setCategoryCache('gift', {
            products: allProducts,
            dimensions: loadedDimensions,
            total: allProducts.length,
          }, true);
          console.log(`[禮品切換] 預載 ${allProducts.length} 個產品到快取`);
        }
      } catch (error) {
        console.error('載入禮品頁面失敗:', error);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // 重置禮品相關狀態
    setShowingRandomPicks(false);
    setGiftRandomProducts([]);
    
    // 檢查是否有預載快取（兩個獨立快取區塊，互不污染）
    const cached = getCategoryCache(categoryId);
    const hasCache = cached && cached.products.length > 0;
    
    // 標記使用快取模式
    if (hasCache) {
      setUsingCache(true);
    }
    
    // 立即更新狀態
    setActiveCategory(categoryId);
    setSelectedTags(new Set());
    setDisplayCount(20);
    setPage(1);
    
    if (hasCache) {
      // 使用快取，從快取隨機選擇 20 個產品顯示
      const shuffled = [...cached.products].sort(() => Math.random() - 0.5);
      const randomFromCache = shuffled.slice(0, 20);
      
      setProducts(randomFromCache);
      setDimensions(cached.dimensions);
      setExpandedDimensions(new Set(cached.dimensions.slice(0, 2).map((d: Dimension) => d.slug)));
      setTotalProducts(randomFromCache.length);
      setShowingRandomPicks(true); // 顯示隨機推薦 banner
      setHasMore(true); // 還有更多產品可載入
      
      // 延遲解除快取模式，確保 React 完成本次更新
      requestAnimationFrame(() => {
        setTimeout(() => {
          setUsingCache(false);
        }, 100);
      });
      
      // 背景預載其他類別
      setTimeout(() => prefetchAdjacentCategories(categoryId), 200);
      return;
    }
    
    // 沒有快取，漸進式載入
    setTransitioning(true);
    
    try {
      // 第一階段：隨機載入 20 個產品
      const quickParams = new URLSearchParams();
      quickParams.append('category', categoryId);
      quickParams.append('random', 'true');
      quickParams.append('limit', '20');
      
      const [quickProductsRes, dimensionsRes] = await Promise.all([
        fetch(`/api/products/filter?${quickParams.toString()}`),
        fetch(`/api/filter-dimensions?category=${categoryId}`),
      ]);
      
      let filteredDims: Dimension[] = [];
      if (dimensionsRes.ok) {
        const dimensionsData = await dimensionsRes.json();
        if (dimensionsData.success) {
          filteredDims = dimensionsData.data
            .map((dim: Dimension) => ({
              ...dim,
              tags: dim.tags.filter(tag => (tag.productCount || 0) > 0)
            }))
            .filter((dim: Dimension) => dim.tags.length > 0);
          setDimensions(filteredDims);
          setExpandedDimensions(new Set(filteredDims.slice(0, 2).map((d: Dimension) => d.slug)));
        }
      }
      
      if (quickProductsRes.ok) {
        const data = await quickProductsRes.json();
        const rawProducts = data.products || [];
        const quickProducts = dedupeProducts(rawProducts);
        
        // 先顯示隨機 20 個
        setProducts(quickProducts);
        setTotalProducts(quickProducts.length);
        setShowingRandomPicks(true); // 顯示隨機推薦 banner
        setHasMore(true);
        setTransitioning(false);
        
        // 預載前 20 個圖片
        preloadImagesRef.current(quickProducts, 'high');
        
        // 第二階段：背景載入全部
        const fullParams = new URLSearchParams();
        fullParams.append('category', categoryId);
        fullParams.append('page', '1');
        fullParams.append('limit', '500');
        
        const fullProductsRes = await fetch(`/api/products/filter?${fullParams.toString()}`);
        if (fullProductsRes.ok) {
          const fullData = await fullProductsRes.json();
          const allProducts = dedupeProducts(fullData.products || []);
          const total = allProducts.length;
          
          setProducts(allProducts);
          setTotalProducts(total);
          setHasMore(false);
          
          // 存到快取並鎖定
          setCategoryCache(categoryId, {
            products: allProducts,
            dimensions: filteredDims,
            total: total,
          }, true);
          
          // 預載剩餘圖片
          preloadImagesRef.current(allProducts.slice(20), 'low');
          
          console.log(`[切換載入完成] ${categoryId}: ${total} 個產品`);
        }
      }
      
      // 預載相鄰類別
      setTimeout(() => prefetchAdjacentCategories(categoryId), 200);
    } catch (error) {
      console.error('切換類別失敗:', error);
    } finally {
      setTransitioning(false);
    }
  };
  
  // 預載相鄰類別（所有可用類別都預載）
  const prefetchAdjacentCategories = (currentCategoryId: string) => {
    const categoryIds = ['print-packaging', 'bag', 'gift'];
    categoryIds.forEach(id => {
      if (id !== currentCategoryId) {
        prefetchCategory(id);
      }
    });
  };

  // 從快取中隨機抽取禮品產品
  const getRandomGiftProducts = (count: number = 15): Product[] => {
    const cached = getCategoryCache('gift');
    if (!cached || cached.products.length === 0) return [];
    
    // Fisher-Yates 洗牌算法
    const shuffled = [...cached.products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // 不再需要 loadFullCategoryData，因為快取已經完整

  // 切換標籤
  const toggleTag = (slug: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
        // 如果刪除後沒有選中的標籤
        if (newSet.size === 0) {
          // 禮品類別特殊處理：從快取隨機抽取新的15個產品
          if (activeCategory === 'gift') {
            const randomProducts = getRandomGiftProducts(15);
            if (randomProducts.length > 0) {
              setGiftRandomProducts(randomProducts);
              setProducts(randomProducts);
              setTotalProducts(randomProducts.length);
              setShowingRandomPicks(true);
            } else if (giftRandomProducts.length > 0) {
              // 快取還沒載入完成，使用之前的隨機產品
              setProducts(giftRandomProducts);
              setTotalProducts(giftRandomProducts.length);
              setShowingRandomPicks(true);
            } else {
              setProducts([]);
              setTotalProducts(0);
            }
            setHasMore(true); // 還有更多產品可載入
            setDisplayCount(15);
          } else {
            // 其他類別：恢復快取資料
            const cached = getCategoryCache(activeCategory);
            if (cached) {
              setUsingCache(true);
              setProducts(cached.products);
              setDimensions(cached.dimensions);
              setTotalProducts(cached.total);
              setHasMore(cached.total > cached.products.length);
              setDisplayCount(20);
              requestAnimationFrame(() => {
                setTimeout(() => setUsingCache(false), 100);
              });
            } else {
              // 沒有快取，重新載入
              loadProducts(true);
            }
          }
        } else {
          // 禮品類別：還有其他標籤，清除隨機顯示標記
          if (activeCategory === 'gift') {
            setShowingRandomPicks(false);
          }
        }
      } else {
        newSet.add(slug);
        // 禮品類別：選擇標籤時，清除隨機顯示標記
        if (activeCategory === 'gift') {
          setShowingRandomPicks(false);
        }
      }
      return newSet;
    });
  };

  // 更新 URL（不刷新頁面）
  const updateUrlWithTags = useCallback((tags: Set<string>) => {
    const params = new URLSearchParams();
    if (activeCategory !== 'print-packaging') {
      params.set('cat', activeCategory);
    }
    if (tags.size > 0) {
      params.set('tags', Array.from(tags).join(','));
    }
    const queryString = params.toString();
    const newUrl = queryString ? `/packaging-explorer?${queryString}` : '/packaging-explorer';
    window.history.replaceState({}, '', newUrl);
  }, [activeCategory]);

  // 監聽 selectedTags 變化，同步更新 URL
  useEffect(() => {
    if (urlInitializedRef.current) {
      updateUrlWithTags(selectedTags);
    }
  }, [selectedTags, updateUrlWithTags]);

  // 複製當前網址
  const copyCurrentUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    });
  };

  // 清除所有標籤 - 恢復快取資料
  const clearAllTags = () => {
    setSelectedTags(new Set());
    
    // 禮品類別特殊處理：從快取隨機選擇新的15個產品
    if (activeCategory === 'gift') {
      setSelectedGiftItem(null);
      setGiftSubDimension(null);
      
      // 從快取隨機選擇15個不同的產品
      const randomProducts = getRandomGiftProducts(15);
        if (randomProducts.length > 0) {
        setProducts(randomProducts);
        setTotalProducts(randomProducts.length);
        setShowingRandomPicks(true);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
      setHasMore(true); // 還有更多產品可載入
      setDisplayCount(15);
      return;
    }
    
    // 其他類別：從快取恢復原始資料
    const cached = getCategoryCache(activeCategory);
    if (cached) {
      setUsingCache(true);
      setProducts(cached.products);
      setDimensions(cached.dimensions);
      setTotalProducts(cached.total);
      setHasMore(cached.total > cached.products.length);
      setDisplayCount(20);
      requestAnimationFrame(() => {
        setTimeout(() => setUsingCache(false), 100);
      });
    }
  };

  // 選擇禮品品項，載入對應子維度
  const handleGiftItemSelect = async (itemSlug: string) => {
    setSelectedGiftItem(itemSlug);
    // 不清空已選標籤，允許跨品項多選
    // setSelectedTags(new Set());
    // setProducts([]);
    // setTotalProducts(0);
    
    // 取得對應的子維度 slug
    const subDimSlug = giftItemToDimensionMap[itemSlug];
    if (!subDimSlug) {
      console.error('找不到品項對應的子維度:', itemSlug);
      return;
    }
    
    // 從 API 載入子維度
    try {
      const res = await fetch(`/api/filter-dimensions?category=gift`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const subDim = data.data.find((d: Dimension) => d.slug === subDimSlug);
          if (subDim) {
            setGiftSubDimension(subDim);
          } else {
            console.error('找不到子維度:', subDimSlug);
          }
        }
      }
    } catch (error) {
      console.error('載入子維度失敗:', error);
    }
  };

  // 切換維度展開
  const toggleDimension = (slug: string) => {
    setExpandedDimensions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
      } else {
        newSet.add(slug);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* 使用全站統一的 Header */}
      <SiteHeader />

      <div className="min-h-screen bg-gray-50/50">
        {/* ==================== 手機版頂部欄 ==================== */}
        <div className="lg:hidden sticky top-[56px] z-30 bg-white shadow-sm">
          {/* 單層：類別 + 篩選 + OR/AND + 數量 */}
          <div className="flex items-center justify-between px-3 py-2">
            {/* 左側：類別切換 */}
            <div className="flex gap-1">
              {categories.filter(c => !c.disabled).map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`
                      flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? `${cat.color} text-white` 
                        : 'text-gray-500 active:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{lang === 'zh' ? cat.name_zh : cat.name_en}</span>
                  </button>
                );
              })}
            </div>
            
            {/* 右側：篩選 + OR/AND + 數量 */}
            <div className="flex items-center gap-2">
              {/* 超級醒目的篩選按鈕 */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-2xl text-base font-bold transition-all
                  ${selectedTags.size > 0 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-300 ring-2 ring-blue-300' 
                    : 'bg-black text-white shadow-lg shadow-gray-400 animate-pulse'
                  }
                `}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>{lang === 'zh' ? '篩選' : 'Filter'}</span>
                {selectedTags.size > 0 && (
                  <span className="px-2 py-0.5 bg-white text-blue-600 rounded-full text-sm font-bold">
                    {selectedTags.size}
                  </span>
                )}
              </button>
              
              {/* OR/AND 切換 */}
              <div className="flex items-center text-xs bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setFilterMode('any')}
                  className={`px-2 py-1 rounded-md transition-colors ${filterMode === 'any' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                >
                  OR
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2 py-1 rounded-md transition-colors ${filterMode === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                >
                  AND
                </button>
              </div>
              
              {/* 數量 */}
              <span className="text-sm text-gray-500 tabular-nums">
                {products.length}
              </span>
            </div>
          </div>
          
          {/* 已選標籤條 - 只在選了標籤時顯示 */}
          {selectedTags.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-t border-blue-100 overflow-x-auto scrollbar-hide">
              {Array.from(selectedTags).map(slug => {
                const tag = dimensions.flatMap(d => d.tags).find(t => t.slug === slug);
                return tag ? (
                  <button
                    key={slug}
                    onClick={() => toggleTag(slug)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-sm whitespace-nowrap"
                  >
                    {lang === 'zh' ? tag.name_zh : tag.name_en}
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null;
              })}
              <button
                onClick={clearAllTags}
                className="shrink-0 px-2 py-1 text-sm text-blue-600 font-medium whitespace-nowrap"
              >
                {lang === 'zh' ? '清除' : 'Clear'}
              </button>
              {/* 複製網址按鈕 */}
              <button
                onClick={copyCurrentUrl}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm whitespace-nowrap transition-colors"
              >
                {urlCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600">{lang === 'zh' ? '已複製' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '複製網址' : 'Copy URL'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ==================== 手機版篩選面板（底部彈出，可滑動關閉） ==================== */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <>
              {/* 背景遮罩 - 點擊關閉 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFilterOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/60 z-40"
              />
              
              {/* 篩選面板 - 支援上下滑動關閉 */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                drag="y"
                dragDirectionLock
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.3, bottom: 0.5 }}
                onDragEnd={(_, info) => {
                  // 上滑或下滑超過 80px，或速度夠快就關閉
                  const shouldClose = 
                    Math.abs(info.offset.y) > 80 || 
                    Math.abs(info.velocity.y) > 400;
                  if (shouldClose) {
                    setMobileFilterOpen(false);
                  }
                }}
                className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] flex flex-col overflow-hidden"
              >
                {/* 拖曳區域 - 上下滑動都可關閉 */}
                <div 
                  className="flex flex-col items-center pt-4 pb-2 cursor-grab active:cursor-grabbing select-none bg-gray-50 rounded-t-3xl"
                  style={{ touchAction: 'none' }}
                >
                  {/* 拖曳提示條 - 更明顯 */}
                  <div className="w-16 h-2 bg-gray-400 rounded-full mb-2" />
                  <p className="text-xs text-gray-500 font-medium">{lang === 'zh' ? '↑↓ 滑動關閉' : '↑↓ Swipe to close'}</p>
                </div>
                
                {/* 標題列 */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {lang === 'zh' ? '篩選條件' : 'Filters'}
                  </h3>
                  {selectedTags.size > 0 && (
                    <button
                      onClick={clearAllTags}
                      className="text-sm text-blue-600 font-medium"
                    >
                      {lang === 'zh' ? '清除全部' : 'Clear'}
                    </button>
                  )}
                </div>
                
                {/* 搜尋框 - 手機版 */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={lang === 'zh' ? '搜尋產品名稱、材質...' : 'Search products...'}
                      className="w-full pl-10 pr-10 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          if (selectedTags.size === 0) {
                            const cached = getCategoryCache(activeCategory);
                            if (cached) {
                              setProducts(cached.products);
                              setTotalProducts(cached.total);
                            }
                          }
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 active:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* 篩選內容 - 獨立滾動區域 */}
                <div 
                  className="flex-1 overflow-y-auto overscroll-contain"
                  style={{ touchAction: 'pan-y' }}
                >
                  {/* 禮品品項選擇器 - 僅禮品類別顯示 - 手機版 */}
                  {activeCategory === 'gift' && (
                    <div className="border-b-4 border-violet-200 bg-gradient-to-r from-violet-50 to-white">
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="w-5 h-5 text-violet-600" />
                          <span className="font-semibold text-violet-800">
                            {lang === 'zh' ? '選擇品項' : 'Select Items'}
                          </span>
                        </div>
                        {selectedGiftItem && (
                          <button
                            onClick={() => {
                              setSelectedGiftItem(null);
                              setGiftSubDimension(null);
                              // 保留已選標籤和產品，不清空
                            }}
                            className="text-sm text-violet-600 hover:text-violet-800"
                          >
                            {lang === 'zh' ? '返回' : 'Back'}
                          </button>
                        )}
                      </div>
                      
                      {/* 已選標籤顯示區 */}
                      {selectedTags.size > 0 && (
                        <div className="px-4 pb-3">
                          <div className="text-xs text-gray-500 mb-2">
                            {lang === 'zh' ? `已選 ${selectedTags.size} 項` : `${selectedTags.size} selected`}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.from(selectedTags).map(tagSlug => {
                              // 從所有維度中找到對應的標籤
                              const tagInfo = dimensions.flatMap(d => d.tags).find(t => t.slug === tagSlug);
                              if (!tagInfo) return null;
                              return (
                                <button
                                  key={tagSlug}
                                  onClick={() => toggleTag(tagSlug)}
                                  className="flex items-center gap-1 px-2 py-1 bg-violet-600 text-white text-xs rounded-full"
                                >
                                  <span>{lang === 'zh' ? tagInfo.name_zh : tagInfo.name_en}</span>
                                  <X className="w-3 h-3" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div className="px-4 pb-4">
                        {!selectedGiftItem ? (
                          // 品項列表（第一層）- 只顯示子維度有產品的品項
                          <div className="grid grid-cols-3 gap-2">
                            {dimensions.find(d => d.slug === 'gift-type')?.tags
                              .filter(tag => {
                                // 檢查對應子維度是否有任何有產品的標籤
                                const subDimSlug = giftItemToDimensionMap[tag.slug];
                                if (!subDimSlug) return false;
                                const subDim = dimensions.find(d => d.slug === subDimSlug);
                                return subDim && subDim.tags.some(t => (t.productCount || 0) > 0);
                              })
                              .map((tag) => (
                              <button
                                key={tag.id}
                                onClick={() => handleGiftItemSelect(tag.slug)}
                                className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-all bg-white text-gray-700 border border-gray-200 active:bg-violet-50 hover:border-violet-300"
                              >
                                <span className="text-center leading-tight">
                                  {lang === 'zh' ? tag.name_zh : tag.name_en}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          // 子維度標籤列表（第二層）- 只顯示有產品的標籤
                          <div>
                            <div className="mb-2 text-sm text-violet-600 font-medium">
                              {dimensions.find(d => d.slug === 'gift-type')?.tags.find(t => t.slug === selectedGiftItem)?.name_zh}
                            </div>
                            {giftSubDimension ? (
                              <div className="grid grid-cols-3 gap-2">
                                {giftSubDimension.tags
                                  .filter(tag => (tag.productCount || 0) > 0)
                                  .map((tag) => {
                                  const isSelected = selectedTags.has(tag.slug);
                                  return (
                                    <button
                                      key={tag.id}
                                      onClick={() => toggleTag(tag.slug)}
                                      className={`
                                        flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-all
                                        ${isSelected
                                          ? 'bg-violet-600 text-white shadow-md'
                                          : 'bg-white text-gray-700 border border-gray-200 active:bg-violet-50'
                                        }
                                      `}
                                    >
                                      <span className="text-center leading-tight">
                                        {lang === 'zh' ? tag.name_zh : tag.name_en}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center text-gray-400 py-4">
                                {lang === 'zh' ? '載入中...' : 'Loading...'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 其他篩選維度 */}
                  {dimensions
                    .filter(dimension => {
                      // 隱藏所有標籤都沒有產品的維度
                      const hasProductsInTags = dimension.tags.some(tag => (tag.productCount || 0) > 0);
                      if (!hasProductsInTags) return false;
                      
                      // 禮品類別：過濾品項維度和所有子維度
                      if (activeCategory === 'gift') {
                        // gift-type 是品項選擇器，不顯示在篩選列表
                        if (dimension.slug === 'gift-type') return false;
                        // 所有子維度也不顯示（它們只在品項選擇器內顯示）
                        if (Object.values(giftItemToDimensionMap).includes(dimension.slug)) return false;
                      }
                      return true;
                    })
                    .map((dimension) => {
                    const Icon = iconMap[dimension.icon || 'Package'] || Package;
                    const isExpanded = expandedDimensions.has(dimension.slug);
                    
                    return (
                      <div key={dimension.id} className="border-b border-gray-100">
                        <button
                          onClick={() => toggleDimension(dimension.slug)}
                          className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-800">
                              {lang === 'zh' ? dimension.name_zh : dimension.name_en}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              {dimension.tags.filter(t => selectedTags.has(t.slug)).length > 0 && (
                                <span className="text-blue-600 font-medium">
                                  {dimension.tags.filter(t => selectedTags.has(t.slug)).length}/
                                </span>
                              )}
                              {dimension.tags.length}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div className="px-4 pb-3 flex flex-wrap gap-2">
                            {dimension.tags.map((tag) => {
                              const isSelected = selectedTags.has(tag.slug);
                              return (
                                <button
                                  key={tag.id}
                                  onClick={() => toggleTag(tag.slug)}
                                  className={`
                                    px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                                    ${isSelected
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                                    }
                                  `}
                                >
                                  {lang === 'zh' ? tag.name_zh : tag.name_en}
                                  {tag.productCount !== undefined && tag.productCount > 0 && (
                                    <span className={`ml-1.5 ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                                      {tag.productCount}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* 底部按鈕 - 固定且醒目 */}
                <div className="px-4 py-4 border-t border-gray-100 bg-white safe-area-bottom">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-base shadow-lg"
                  >
                    {lang === 'zh' 
                      ? `查看 ${products.length} 個產品` 
                      : `View ${products.length} Products`
                    }
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 主內容區 - 全寬版面，左右只留少許留白 */}
        <div className="w-full mx-auto px-2 sm:px-3 lg:px-4 py-4">
          <div className="flex gap-4">
            {/* 左側篩選面板 - 桌面版 */}
            <div className="w-72 shrink-0 hidden lg:block">
              <div className="sticky top-[72px] space-y-3">
                {/* 類別選擇 - 原版樣式 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = activeCategory === cat.id;
                      const isDisabled = cat.disabled;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => !isDisabled && handleCategoryChange(cat.id)}
                          disabled={isDisabled}
                          className={`
                            flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                            ${isDisabled 
                              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                              : isActive 
                                ? `${cat.color} text-white shadow-sm` 
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="truncate w-full text-center">
                            {lang === 'zh' ? cat.name_zh.replace('（暫未開放）', '') : cat.name_en.replace(' (Coming Soon)', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* 篩選模式 & 數量 */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <button
                          onClick={() => setFilterMode('any')}
                          className={`px-3 py-1.5 rounded transition-colors ${filterMode === 'any' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          OR
                        </button>
                        <button
                          onClick={() => setFilterMode('all')}
                          className={`px-3 py-1.5 rounded ${filterMode === 'all' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          AND
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">{totalProducts}</span>
                        <span> {lang === 'zh' ? '個產品' : ' products'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 禮品品項選擇器 - 僅禮品類別顯示 */}
                {activeCategory === 'gift' && (
                  <div className="bg-white rounded-xl shadow-sm border border-violet-200 overflow-hidden">
                    <div className="px-3 py-2.5 bg-gradient-to-r from-violet-50 to-violet-100 border-b border-violet-200">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-violet-600" />
                        <span className="font-semibold text-violet-800 text-sm">
                          {selectedGiftItem 
                            ? dimensions.find(d => d.slug === 'gift-type')?.tags.find(t => t.slug === selectedGiftItem)?.name_zh
                            : (lang === 'zh' ? '選擇品項' : 'Select Items')
                          }
                        </span>
                        {selectedGiftItem && (
                          <button
                            onClick={() => {
                              setSelectedGiftItem(null);
                              setGiftSubDimension(null);
                              // 保留已選標籤和產品，不清空
                            }}
                            className="ml-auto text-xs text-violet-600 hover:text-violet-800"
                          >
                            ← {lang === 'zh' ? '返回' : 'Back'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* 已選標籤顯示區 - 桌面版 */}
                    {selectedTags.size > 0 && (
                      <div className="px-2.5 py-2 border-b border-violet-100 bg-violet-50/50">
                        <div className="text-[10px] text-gray-500 mb-1.5">
                          {lang === 'zh' ? `已選 ${selectedTags.size} 項` : `${selectedTags.size} selected`}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(selectedTags).map(tagSlug => {
                            // 從所有維度中找到對應的標籤
                            const tagInfo = dimensions.flatMap(d => d.tags).find(t => t.slug === tagSlug);
                            if (!tagInfo) return null;
                            return (
                              <button
                                key={tagSlug}
                                onClick={() => toggleTag(tagSlug)}
                                className="flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-600 text-white text-[10px] rounded-full hover:bg-violet-700"
                              >
                                <span>{lang === 'zh' ? tagInfo.name_zh : tagInfo.name_en}</span>
                                <X className="w-2.5 h-2.5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-2.5 max-h-64 overflow-y-auto">
                      {!selectedGiftItem ? (
                        // 品項列表（第一層）- 只顯示子維度有產品的品項
                        <div className="grid grid-cols-2 gap-1.5">
                          {dimensions.find(d => d.slug === 'gift-type')?.tags
                            .filter(tag => {
                              // 檢查對應子維度是否有任何有產品的標籤
                              const subDimSlug = giftItemToDimensionMap[tag.slug];
                              if (!subDimSlug) return false;
                              const subDim = dimensions.find(d => d.slug === subDimSlug);
                              return subDim && subDim.tags.some(t => (t.productCount || 0) > 0);
                            })
                            .map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => handleGiftItemSelect(tag.slug)}
                              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all bg-gray-50 text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                            >
                              <span className="truncate">
                                {lang === 'zh' ? tag.name_zh : tag.name_en}
                              </span>
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        // 子維度標籤列表（第二層）- 只顯示有產品的標籤
                        giftSubDimension ? (
                          <div className="grid grid-cols-2 gap-1.5">
                            {giftSubDimension.tags
                              .filter(tag => (tag.productCount || 0) > 0)
                              .map((tag) => {
                              const isSelected = selectedTags.has(tag.slug);
                              return (
                                <button
                                  key={tag.id}
                                  onClick={() => toggleTag(tag.slug)}
                                  className={`
                                    flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all
                                    ${isSelected
                                      ? 'bg-violet-600 text-white shadow-sm'
                                      : 'bg-gray-50 text-gray-700 hover:bg-violet-50 hover:text-violet-700'
                                    }
                                  `}
                                >
                                  <span className="truncate">
                                    {lang === 'zh' ? tag.name_zh : tag.name_en}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 py-4 text-sm">
                            {lang === 'zh' ? '載入中...' : 'Loading...'}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 篩選維度 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* 搜尋框 */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={lang === 'zh' ? '搜尋產品...' : 'Search...'}
                        className="w-full pl-10 pr-10 py-2.5 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            // 恢復快取資料
                            if (selectedTags.size === 0) {
                              const cached = getCategoryCache(activeCategory);
                              if (cached) {
                                setProducts(cached.products);
                                setTotalProducts(cached.total);
                              }
                            }
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* 已選標籤 */}
                  {selectedTags.size > 0 && (
                    <div className="p-3 bg-blue-50 border-b border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">
                          {lang === 'zh' ? '已選' : 'Selected'} ({selectedTags.size})
                        </span>
                        <button
                          onClick={clearAllTags}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {lang === 'zh' ? '清除' : 'Clear'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from(selectedTags).map(slug => {
                          const tag = dimensions.flatMap(d => d.tags).find(t => t.slug === slug);
                          return tag ? (
                            <button
                              key={slug}
                              onClick={() => toggleTag(slug)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              {lang === 'zh' ? tag.name_zh : tag.name_en}
                              <X className="w-3.5 h-3.5" />
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* 維度列表 */}
                  <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                    {dimensions
                      .filter(dimension => {
                        // 隱藏所有標籤都沒有產品的維度
                        const hasProductsInTags = dimension.tags.some(tag => (tag.productCount || 0) > 0);
                        if (!hasProductsInTags) return false;
                        
                        // 禮品類別：過濾品項維度和所有子維度
                        if (activeCategory === 'gift') {
                          // gift-type 是品項選擇器，不顯示在篩選列表
                          if (dimension.slug === 'gift-type') return false;
                          // 所有子維度也不顯示（它們只在品項選擇器內顯示）
                          if (Object.values(giftItemToDimensionMap).includes(dimension.slug)) return false;
                        }
                        return true;
                      })
                      .map((dimension) => {
                      const Icon = iconMap[dimension.icon || 'Package'] || Package;
                      const isExpanded = expandedDimensions.has(dimension.slug);
                      
                      return (
                        <div key={dimension.id} className="border-b border-gray-50 last:border-b-0">
                          <button
                            onClick={() => toggleDimension(dimension.slug)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-800 text-sm">
                                {lang === 'zh' ? dimension.name_zh : dimension.name_en}
                              </span>
                              <span className="text-sm text-gray-400">
                                {dimension.tags.length}
                              </span>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform duration-100 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          
                          {isExpanded && (
                            <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                              {dimension.tags.map((tag) => {
                                const isSelected = selectedTags.has(tag.slug);
                                return (
                                  <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.slug)}
                                    className={`
                                      px-2 py-1 rounded text-sm transition-colors
                                      ${isSelected
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }
                                    `}
                                  >
                                    {lang === 'zh' ? tag.name_zh : tag.name_en}
                                    {tag.productCount !== undefined && tag.productCount > 0 && (
                                      <span className={`ml-1 ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {tag.productCount}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* 舊版瀏覽按鈕 - 在篩選面板底部 */}
                <Link
                  href="/catalog-tree"
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <TreePine className="w-4 h-4" />
                  <span>{lang === 'zh' ? '舊版瀏覽' : 'Classic'}</span>
                </Link>
              </div>
            </div>

            {/* 右側產品網格 */}
            <div className="flex-1 min-w-0 relative">
              {/* 類別切換過渡遮罩 */}
              <div 
                className={`
                  absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center
                  transition-opacity duration-200
                  ${transitioning ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  <span className="text-sm text-gray-500">
                    {lang === 'zh' ? '載入中...' : 'Loading...'}
                  </span>
                </div>
              </div>
              
              {loading && !transitioning ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              ) : filterLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                  <span className="mt-3 text-sm text-gray-500">
                    {lang === 'zh' ? '篩選中...' : 'Filtering...'}
                  </span>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Package className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">
                    {lang === 'zh' ? '找不到符合的產品' : 'No products found'}
                  </p>
                  {selectedTags.size > 0 && (
                    <button
                      onClick={clearAllTags}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      {lang === 'zh' ? '清除篩選' : 'Clear filters'}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* AI 功能提示（禮品 / 包裝盒 / 提袋） */}
                  {['gift','print-packaging','bag'].includes(activeCategory) && showingRandomPicks && (
                    <div className="mb-4 px-6 py-5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                      {/* AI 功能提示 - 更大更顯眼 */}
                      <div className="flex items-center justify-center gap-3 text-center">
                        <span className="text-violet-800 font-semibold text-lg">
                          {lang === 'zh' 
                            ? '點擊產品上的' 
                            : 'Click'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-base rounded-xl font-bold shadow-lg animate-pulse">
                          ✨ {lang === 'zh' ? '一鍵設計' : 'AI Design'}
                        </span>
                        <span className="text-violet-800 font-semibold text-lg">
                          {lang === 'zh' 
                            ? '試試智慧包裝設計' 
                            : 'for instant AI design'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {(() => {
                      // 渲染前再次去重，確保不會顯示重複產品
                      const seenIds = new Set<string>();
                      const uniqueProducts: Product[] = [];
                      for (const p of products.slice(0, displayCount)) {
                        if (!seenIds.has(p.id)) {
                          seenIds.add(p.id);
                          uniqueProducts.push(p);
                        }
                      }
                      
                      // 檢查是否需要顯示分隔線
                      const showDivider = selectedTags.size > 0 && moreProductsStartIndex > 0 && moreProductsStartIndex < uniqueProducts.length;
                      
                      const elements: React.ReactNode[] = [];
                      
                      uniqueProducts.forEach((product, index) => {
                        // 在分隔線位置插入
                        if (showDivider && index === moreProductsStartIndex) {
                          elements.push(
                            <div key="more-divider" className="col-span-full flex items-center gap-4 py-6 my-2">
                              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-300"></div>
                              <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full whitespace-nowrap">
                                {lang === 'zh' ? '更多其他商品' : 'More Products'}
                              </span>
                              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-gray-300"></div>
                            </div>
                          );
                        }
                        
                        elements.push(
                          <div
                            key={`${product.id}-${index}`}
                            onClick={() => setSelectedProduct(product)}
                            className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
                          >
                            <div className="relative aspect-square bg-gray-50">
                              {product.coverImage ? (
                                <Image
                                  src={product.coverImage}
                                  alt={lang === 'zh' ? product.name_zh : product.name_en}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  loading={index < 12 ? 'eager' : 'lazy'}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Package className="w-10 h-10 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 flex items-start justify-between gap-2">
                              <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                                {lang === 'zh' ? product.name_zh : product.name_en}
                              </h3>
                              {/* AI 設計按鈕 - 點擊直接開啟 AI Modal */}
                              {product.enableAiGen && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAiDesignProduct(product);
                                  }}
                                  className="shrink-0 px-2 py-1 rounded bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium flex items-center gap-1 hover:from-purple-600 hover:to-blue-600 transition-all"
                                  title={lang === 'zh' ? '一鍵設計' : 'AI Design'}
                                >
                                  <span>✨</span>
                                  <span>{lang === 'zh' ? '一鍵設計' : 'AI Design'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      });
                      
                      return elements;
                    })()}
                  </div>
                  
                  {/* 載入更多 */}
                  {(displayCount < products.length || hasMore) && (
                    <div ref={loadMoreRef} className="flex justify-center py-6">
                      {loadingMore ? (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      ) : (
                        <button
                          onClick={loadMore}
                          className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          {lang === 'zh' ? '載入更多' : 'Load more'}
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Footer 觸發器 - 所有產品載入完成後出現 */}
                  {!loading && !loadingMore && displayCount >= products.length && !hasMore && (
                    <div ref={footerTriggerRef} className="h-1" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 產品 Modal */}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            lang={lang}
          />
        )}

        {/* AI 設計 Modal - 從產品卡片 AI 按鈕直接開啟 */}
        {aiDesignProduct && (
          <AiDesignModal
            product={aiDesignProduct}
            onClose={() => setAiDesignProduct(null)}
            lang={lang}
          />
        )}
      </div>

      {/* Footer - 只有滾動到底部 + 載入完成才顯示 */}
      {reachedBottom && !loading && !loadingMore && displayCount >= products.length && !hasMore && (
        <SiteFooter />
      )}
    </>
  );
}
