'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
import LandingPageClient from '@/app/landing-v2/LandingPageClient';

interface ShareData {
  resultUrl: string;
  prompt: string | null;
  createdAt: string;
  product: {
    id: string;
    slug: string;
    name_zh: string;
    name_en: string | null;
    coverImage: string | null;
  } | null;
}

interface AiSharePageClientProps {
  config: any;
  cases: any[];
  blogs: any[];
  shareData: ShareData;
}

export default function AiSharePageClient({ 
  config, 
  cases, 
  blogs, 
  shareData 
}: AiSharePageClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // 關閉彈窗後導向首頁
  const handleClose = () => {
    setShowModal(false);
    // 延遲導向，讓動畫完成
    setTimeout(() => {
      router.push('/');
    }, 300);
  };
  
  // 下載圖片
  const handleDownload = async () => {
    try {
      const response = await fetch(shareData.resultUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-design-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('下載失敗:', err);
    }
  };
  
  // 複製分享連結
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };
  
  // ESC 關閉
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="relative">
      {/* 首頁作為背景 */}
      <div className="pointer-events-none select-none">
        <LandingPageClient config={config} cases={cases} blogs={blogs} />
      </div>
      
      {/* 分享彈窗 */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 標題列 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      AI 包裝設計作品
                    </h2>
                    {shareData.product && (
                      <p className="text-sm text-gray-500">
                        {shareData.product.name_zh}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 內容區 */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* AI 生成圖片 */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-6">
                  <Image
                    src={shareData.resultUrl}
                    alt="AI Generated Design"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 600px"
                    priority
                  />
                </div>
                
                {/* 提示詞 */}
                {shareData.prompt && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">設計提示詞</p>
                    <p className="text-gray-700">{shareData.prompt}</p>
                  </div>
                )}
                
                {/* 操作按鈕 */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    下載圖片
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        已複製
                      </>
                    ) : (
                      <>
                        <Share2 className="w-5 h-5" />
                        分享連結
                      </>
                    )}
                  </button>
                </div>
                
                {/* 產品連結 */}
                {shareData.product && (
                  <Link
                    href={`/products/${shareData.product.slug}`}
                    className="flex items-center justify-center gap-2 w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    查看原產品
                  </Link>
                )}
              </div>
              
              {/* 底部 CTA */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                <Link
                  href="/packaging-explorer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  探索更多產品，試試 AI 設計
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
