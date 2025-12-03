'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ExternalLink, MessageCircle } from 'lucide-react';

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
  ProductTag?: Array<{
    Tag: {
      id: string;
      name_zh: string;
      name_en: string;
      slug: string;
      color?: string;
    };
  }>;
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  lang?: 'zh' | 'en';
}

export default function ProductModal({ product, onClose, lang = 'zh' }: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 取得所有圖片
  const allImages = product ? [
    product.coverImage,
    ...(product.images || [])
  ].filter(Boolean) as string[] : [];

  // ESC 關閉
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 重置圖片索引
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id]);

  if (!product) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const tags = product.ProductTag?.map(pt => pt.Tag) || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 關閉按鈕 */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex flex-col md:flex-row max-h-[90vh]">
            {/* 左側圖片區 */}
            <div className="relative w-full md:w-1/2 aspect-square bg-gray-100">
              {allImages.length > 0 ? (
                <>
                  <Image
                    src={allImages[currentImageIndex]}
                    alt={lang === 'zh' ? product.name_zh : product.name_en}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  {/* 圖片導航 */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      {/* 圖片指示器 */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentImageIndex 
                                ? 'bg-white w-6' 
                                : 'bg-white/50 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  無圖片
                </div>
              )}
            </div>

            {/* 右側內容區 */}
            <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
              {/* 標題 */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {lang === 'zh' ? product.name_zh : product.name_en}
              </h2>
              
              {/* 描述 */}
              {(product.shortDesc_zh || product.shortDesc_en) && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {lang === 'zh' ? product.shortDesc_zh : product.shortDesc_en}
                </p>
              )}

              {/* 規格資訊 */}
              <div className="space-y-4 mb-6">
                {product.material && (
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-500 w-20 shrink-0">材質</span>
                    <span className="text-gray-900">{product.material}</span>
                  </div>
                )}
                {product.specs && (
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-500 w-20 shrink-0">規格</span>
                    <span className="text-gray-900">{product.specs}</span>
                  </div>
                )}
                {product.moq && product.moq > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-500 w-20 shrink-0">MOQ</span>
                    <span className="text-gray-900">{product.moq.toLocaleString()} pcs</span>
                  </div>
                )}
              </div>

              {/* 標籤 */}
              {tags.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-500 mb-2">標籤</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 8).map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                          color: tag.color || '#6b7280',
                        }}
                      >
                        {lang === 'zh' ? tag.name_zh : tag.name_en}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 按鈕組 */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Link
                  href={`/products/${product.slug}`}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {lang === 'zh' ? '查看完整詳情' : 'View Details'}
                </Link>
                <Link
                  href="/contact"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {lang === 'zh' ? '詢價' : 'Inquiry'}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
