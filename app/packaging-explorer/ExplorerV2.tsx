'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { SiteHeader } from '../../components/SiteShell';
import { SiteFooter } from '../../components/SiteFooter';
import ProductModal from './ProductModal';
import {
  Package, ShoppingBag, Gift, Layers, Target, Sparkles,
  Paintbrush, Leaf, Star, ChevronDown, X, Search,
  ToggleLeft, ToggleRight, Grid3X3, LayoutGrid, Loader2,
  TreePine, SlidersHorizontal, Filter
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
  { id: 'print-packaging', name_zh: '印刷品', name_en: 'Print', icon: Package, color: 'bg-amber-500', disabled: false },
  { id: 'bag', name_zh: '提袋', name_en: 'Bags', icon: ShoppingBag, color: 'bg-emerald-500', disabled: false },
  { id: 'gift', name_zh: '禮品（暫未開放）', name_en: 'Gifts (Coming Soon)', icon: Gift, color: 'bg-violet-500', disabled: true },
  { id: 'all', name_zh: '全部（暫未開放）', name_en: 'All (Coming Soon)', icon: Grid3X3, color: 'bg-gray-700', disabled: true },
];

// 應用場景維度 slugs（用於全部模式）
const applicationDimensionSlugs = ['application', 'bag-application', 'gift-application'];

// ==========================================
// 主組件
// ==========================================
export default function PackagingExplorerV2() {
  const { lang } = useLanguage();
  
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
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [initialLoaded, setInitialLoaded] = useState(false); // 是否已完成初次載入
  const [usingCache, setUsingCache] = useState(false); // 是否正在使用快取（跳過 effect 載入）
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false); // 手機版篩選面板
  
  // 無限滾動觀察器 ref
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
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

        if (reset) {
          setProducts(dedupeProducts(newProducts));
        } else {
          setProducts(prev => {
            const merged = [...prev, ...newProducts];
            return dedupeProducts(merged);
          });
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
    
    // 如果已載入的產品還有剩餘，先顯示更多
    if (displayCount < products.length) {
      setDisplayCount(prev => Math.min(prev + 25, products.length));
    } 
    // 如果已顯示全部，且還有更多可載入，從 API 載入
    else if (hasMore) {
      loadProducts(false);
    }
  }, [displayCount, products.length, hasMore, loadingMore, loadProducts]);

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

  // 預載入的快取（永久保留，整個頁面生命週期內有效）
  const prefetchCache = useRef<Record<string, { products: Product[], dimensions: Dimension[], total: number }>>({});

  // 初次載入：並行載入維度和產品
  useEffect(() => {
    if (initialLoaded) return;
    
    const initialLoad = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('category', activeCategory);
        params.append('page', '1');
        params.append('limit', '30'); // 初次只載入 30 個，加快速度
        
        // 並行載入維度和產品
        const [dimensionsRes, productsRes] = await Promise.all([
          fetch(`/api/filter-dimensions?category=${activeCategory}`),
          fetch(`/api/products/filter?${params.toString()}`),
        ]);
        
        let loadedDimensions: Dimension[] = [];
        let loadedProducts: Product[] = [];
        let total = 0;
        
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
        
        if (productsRes.ok) {
          const data = await productsRes.json();
          const rawProducts = data.products || [];
          // 去重：移除相同 id 或相同 coverImage 的產品
          loadedProducts = dedupeProducts(rawProducts);
          total = data.pagination?.total || 0;
          setProducts(loadedProducts);
          setTotalProducts(total);
          setHasMore(rawProducts.length === 30);
        }
        
        // 存到快取（初次載入也存，已去重）
        prefetchCache.current[activeCategory] = {
          products: loadedProducts,
          dimensions: loadedDimensions,
          total: total,
        };
        
        setInitialLoaded(true);
        
        // 背景預載提袋類別（不影響主載入）
        prefetchCategory('bag');
      } catch (error) {
        console.error('初次載入失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initialLoad();
  }, []); // 只執行一次

  // 背景預載其他類別（只預載一次，永久保留）
  const prefetchCategory = async (categoryId: string) => {
    if (prefetchCache.current[categoryId]) return; // 已快取，不重複載入
    
    try {
      const params = new URLSearchParams();
      params.append('category', categoryId);
      params.append('page', '1');
      params.append('limit', '30'); // 預載 30 個（完整首頁量）
      
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
        
        prefetchCache.current[categoryId] = {
          products: dedupedProducts,
          dimensions: filteredDims,
          total: productsData.pagination?.total || 0,
        };
      }
    } catch (error) {
      // 預載失敗不影響使用
      console.log('預載失敗，切換時會重新載入');
    }
  };

  // 去重函數：移除相同 id 或相同 coverImage (jpg/png) 的產品，保留第一個出現者
  function dedupeProducts(items: any[]) {
    const seenIds = new Set<string>();
    const seenImages = new Set<string>();
    const result: any[] = [];
    for (const it of items) {
      if (!it) continue;
      if (seenIds.has(it.id)) continue;
      const imgRaw = (it.coverImage || '').split('?')[0] || '';
      const imgKey = imgRaw.trim().toLowerCase();
      if (imgKey && seenImages.has(imgKey)) continue;
      seenIds.add(it.id);
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
    // 只有在有篩選條件時才載入（類別切換由 handleCategoryChange 處理）
    if (selectedTags.size > 0 || searchQuery) {
      loadProducts(true);
    }
  }, [selectedTags, filterMode, searchQuery, usingCache, initialLoaded]);

  // 切換類別 - 使用預載快取加速（最大程度保留快取）
  const handleCategoryChange = async (categoryId: string) => {
    if (categoryId === activeCategory || transitioning) return;
    
    const previousCategory = activeCategory;
    
    // 永遠保存當前類別到快取（只要沒有篩選條件）
    if (products.length > 0 && selectedTags.size === 0) {
      prefetchCache.current[previousCategory] = {
        products: [...products],
        dimensions: [...dimensions],
        total: totalProducts,
      };
    }
    
    // 檢查是否有預載快取
    const cached = prefetchCache.current[categoryId];
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
      // 使用快取，瞬間切換
      setProducts(cached.products);
      setDimensions(cached.dimensions);
      setExpandedDimensions(new Set(cached.dimensions.slice(0, 2).map((d: Dimension) => d.slug)));
      setHasMore(cached.total > cached.products.length);
      setTotalProducts(cached.total);
      
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
    
    // 沒有快取，載入資料
    setTransitioning(true);
    
    try {
      const params = new URLSearchParams();
      params.append('category', categoryId);
      params.append('page', '1');
      params.append('limit', '30');
      
      const [productsRes, dimensionsRes] = await Promise.all([
        fetch(`/api/products/filter?${params.toString()}`),
        fetch(`/api/filter-dimensions?category=${categoryId}`),
      ]);
      
      if (productsRes.ok && dimensionsRes.ok) {
        const productsData = await productsRes.json();
        const dimensionsData = await dimensionsRes.json();
        
        const rawProducts = productsData.products || [];
        const total = productsData.pagination?.total || 0;
        // 去重：移除相同 id 或相同 coverImage 的產品
        const dedupedProducts = dedupeProducts(rawProducts);
        
        setProducts(dedupedProducts);
        setTotalProducts(total);
        setHasMore(rawProducts.length === 30);
        
        let filteredDims: Dimension[] = [];
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
        
        // 存到快取（已去重）
        prefetchCache.current[categoryId] = {
          products: dedupedProducts,
          dimensions: filteredDims,
          total: total,
        };
        
        // 預載相鄰類別
        setTimeout(() => prefetchAdjacentCategories(categoryId), 200);
      }
    } catch (error) {
      console.error('切換類別失敗:', error);
    } finally {
      setTransitioning(false);
    }
  };
  
  // 預載相鄰類別（所有可用類別都預載）
  const prefetchAdjacentCategories = (currentCategoryId: string) => {
    const categoryIds = ['print-packaging', 'bag'];
    categoryIds.forEach(id => {
      if (id !== currentCategoryId) {
        prefetchCategory(id);
      }
    });
  };

  // 不再需要 loadFullCategoryData，因為快取已經完整

  // 切換標籤
  const toggleTag = (slug: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
        // 如果刪除後沒有選中的標籤，恢復快取資料
        if (newSet.size === 0) {
          const cached = prefetchCache.current[activeCategory];
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
        newSet.add(slug);
      }
      return newSet;
    });
  };

  // 清除所有標籤 - 恢復快取資料
  const clearAllTags = () => {
    setSelectedTags(new Set());
    // 從快取恢復原始資料
    const cached = prefetchCache.current[activeCategory];
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
                
                {/* 篩選內容 - 獨立滾動區域 */}
                <div 
                  className="flex-1 overflow-y-auto overscroll-contain"
                  style={{ touchAction: 'pan-y' }}
                >
                  {dimensions.map((dimension) => {
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

        {/* 主內容區 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-5">
            {/* 左側篩選面板 - 桌面版 */}
            <div className="w-56 shrink-0 hidden lg:block">
              <div className="sticky top-[72px] space-y-3">
                {/* 類別選擇 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                  <div className="grid grid-cols-2 gap-1.5">
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
                            flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200
                            ${isDisabled 
                              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                              : isActive 
                                ? `${cat.color} text-white shadow-sm` 
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="truncate w-full text-center">
                            {lang === 'zh' ? cat.name_zh.replace('（暫未開放）', '') : cat.name_en.replace(' (Coming Soon)', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* 篩選模式 & 數量 */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs">
                        <button
                          onClick={() => setFilterMode('any')}
                          className={`px-2 py-1 rounded transition-colors ${filterMode === 'any' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          OR
                        </button>
                        <button
                          onClick={() => setFilterMode('all')}
                          className={`px-2 py-1 rounded ${filterMode === 'all' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          AND
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-900">{Math.min(displayCount, products.length)}</span>
                        {totalProducts > products.length && <span>/{totalProducts}</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 篩選維度 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* 已選標籤 */}
                  {selectedTags.size > 0 && (
                    <div className="p-2.5 bg-blue-50 border-b border-blue-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-blue-700">
                          {lang === 'zh' ? '已選' : 'Selected'} ({selectedTags.size})
                        </span>
                        <button
                          onClick={clearAllTags}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {lang === 'zh' ? '清除' : 'Clear'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(selectedTags).map(slug => {
                          const tag = dimensions.flatMap(d => d.tags).find(t => t.slug === slug);
                          return tag ? (
                            <button
                              key={slug}
                              onClick={() => toggleTag(slug)}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                              {lang === 'zh' ? tag.name_zh : tag.name_en}
                              <X className="w-2.5 h-2.5" />
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* 維度列表 */}
                  <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                    {dimensions.map((dimension) => {
                      const Icon = iconMap[dimension.icon || 'Package'] || Package;
                      const isExpanded = expandedDimensions.has(dimension.slug);
                      
                      return (
                        <div key={dimension.id} className="border-b border-gray-50 last:border-b-0">
                          <button
                            onClick={() => toggleDimension(dimension.slug)}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-medium text-gray-800 text-xs">
                                {lang === 'zh' ? dimension.name_zh : dimension.name_en}
                              </span>
                              <span className="text-xs text-gray-400">
                                {dimension.tags.length}
                              </span>
                            </div>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-100 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          
                          {isExpanded && (
                            <div className="px-2.5 pb-2 flex flex-wrap gap-1">
                              {dimension.tags.map((tag) => {
                                const isSelected = selectedTags.has(tag.slug);
                                return (
                                  <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.slug)}
                                    className={`
                                      px-1.5 py-0.5 rounded text-xs transition-colors
                                      ${isSelected
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }
                                    `}
                                  >
                                    {lang === 'zh' ? tag.name_zh : tag.name_en}
                                    {tag.productCount !== undefined && tag.productCount > 0 && (
                                      <span className={`ml-0.5 ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
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
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <TreePine className="w-3 h-3" />
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
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.slice(0, displayCount).map((product, index) => (
                      <div
                        key={product.id}
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
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {lang === 'zh' ? product.name_zh : product.name_en}
                          </h3>
                        </div>
                      </div>
                    ))}
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
      </div>

      {/* 所有產品載入完成後顯示 Footer */}
      {/* 條件：不在載入中、不在載入更多、已顯示所有產品、沒有更多可載入 */}
      {!loading && !loadingMore && displayCount >= products.length && !hasMore && (
        <SiteFooter />
      )}
    </>
  );
}
