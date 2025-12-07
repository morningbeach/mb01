'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  X, Sparkles, Download, Share2, Loader2, 
  AlertCircle, Mail, ChevronRight, Copy, Check
} from 'lucide-react';

interface Product {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  coverImage: string | null;
}

interface PromptTemplate {
  id: string;
  name_zh: string;
  name_en: string;
  prompt: string;
}

interface AiDesignModalProps {
  product: Product;
  onClose: () => void;
  lang?: 'zh' | 'en';
}

export default function AiDesignModal({ product, onClose, lang = 'zh' }: AiDesignModalProps) {
  // 狀態
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [userInput, setUserInput] = useState(''); // 範本中的 {input}
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    resultUrl: string;
    shareUrl: string;
    shareToken: string;
  } | null>(null);
  const [remainingUses, setRemainingUses] = useState<number | null>(null);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [limitReached, setLimitReached] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // 專業術語分析狀態
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // 詢價表單狀態
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // 載入範本和使用狀況
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 並行載入
        const [templatesRes, usageRes] = await Promise.all([
          fetch('/api/ai/prompts'),
          fetch('/api/ai/design'),
        ]);
        
        if (templatesRes.ok) {
          const data = await templatesRes.json();
          setTemplates(data.templates || []);
          if (data.templates?.length > 0) {
            setSelectedTemplate(data.templates[0].id);
          }
        }
        
        if (usageRes.ok) {
          const data = await usageRes.json();
          setRemainingUses(data.remainingUses);
          setDailyLimit(data.dailyLimit);
          setIsAdmin(data.isAdmin || false);
          // 只有非 admin 用戶才檢查限制
          if (!data.isAdmin && data.remainingUses === 0) {
            setLimitReached(true);
          }
        }
      } catch (err) {
        console.error('載入失敗:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // 取得完整提示詞
  const getFullPrompt = (): string => {
    if (customPrompt) {
      return customPrompt;
    }
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      return template.prompt.replace('{input}', userInput || '');
    }
    return '';
  };

  // 生成圖片
  const handleGenerate = async () => {
    const prompt = getFullPrompt();
    if (!prompt.trim()) {
      setError('請輸入或選擇提示詞');
      return;
    }
    
    if (!product.coverImage) {
      setError('此產品沒有封面圖片');
      return;
    }
    
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: product.coverImage,
          prompt,
          productId: product.id,
          productSlug: product.slug,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.limitReached) {
          setLimitReached(true);
          setShowInquiryForm(true);
        }
        throw new Error(data.error || '生成失敗');
      }
      
      setResult({
        resultUrl: data.resultUrl,
        shareUrl: data.shareUrl,
        shareToken: data.shareToken,
      });
      setRemainingUses(data.remainingUses);
      // 更新 admin 狀態（如果返回的話）
      if (typeof data.isAdmin === 'boolean') {
        setIsAdmin(data.isAdmin);
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // 下載圖片
  const handleDownload = async () => {
    if (!result?.resultUrl) return;
    
    try {
      const response = await fetch(result.resultUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-design-${result.shareToken}.png`;
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
    if (!result?.shareUrl) return;
    
    const fullUrl = window.location.origin + result.shareUrl;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  // 生成工廠專業術語
  const handleAnalyzePackaging = async () => {
    if (!result?.resultUrl) return;
    
    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    
    try {
      const response = await fetch('/api/ai/analyze-packaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: result.resultUrl,
          lang,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || '分析失敗');
      }
      
      if (!data.success) {
        throw new Error(data.error || '此圖片無法分析');
      }
      
      setAnalysisResult(data.analysis);
    } catch (err: any) {
      setAnalysisError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // 提交詢價
  const handleSubmitInquiry = async () => {
    if (!email.trim()) {
      setError('請輸入 Email');
      return;
    }
    
    setSubmittingInquiry(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          productId: product.id,
          message: message || `希望能使用更多 AI 設計功能 - 產品: ${product.name_zh}`,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '提交失敗');
      }
      
      setInquirySubmitted(true);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // ESC 關閉
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 確保在客戶端才渲染 Portal
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
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
                  {lang === 'zh' ? 'AI 包裝設計' : 'AI Packaging Design'} - {lang === 'zh' ? product.name_zh : product.name_en}
                </h2>
                <p className="text-sm text-gray-500">
                  {isAdmin 
                    ? (lang === 'zh' ? '🔓 管理員模式 - 無限制' : '🔓 Admin Mode - Unlimited')
                    : (lang === 'zh' 
                        ? `今日剩餘 ${remainingUses ?? '...'} / ${dailyLimit} 次` 
                        : `${remainingUses ?? '...'} / ${dailyLimit} uses remaining today`)
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 內容區 - 橫三欄佈局 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : showInquiryForm ? (
              /* 詢價表單 */
              <div className="max-w-md mx-auto space-y-6">
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-amber-600" />
                  </div>
                  {inquirySubmitted ? (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {lang === 'zh' ? '感謝您的詢問！' : 'Thank you!'}
                      </h3>
                      <p className="text-gray-600">
                        {lang === 'zh' 
                          ? '我們會盡快與您聯繫，提供更多 AI 設計服務。' 
                          : 'We will contact you soon with more AI design services.'
                        }
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {lang === 'zh' ? '今日使用次數已達上限' : 'Daily limit reached'}
                      </h3>
                      <p className="text-gray-600">
                        {lang === 'zh' 
                          ? '留下您的 Email，我們提供更多專業 AI 包裝設計服務！' 
                          : 'Leave your email for more professional AI packaging design services!'
                        }
                      </p>
                    </>
                  )}
                </div>
                
                {!inquirySubmitted && (
                  <div className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={lang === 'zh' ? '您的 Email' : 'Your email'}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={lang === 'zh' ? '留言（選填）' : 'Message (optional)'}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    
                    {error && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    )}
                    
                    <button
                      onClick={handleSubmitInquiry}
                      disabled={submittingInquiry}
                      className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submittingInquiry ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {lang === 'zh' ? '提交詢問' : 'Submit'}
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
              {/* 橫三欄設計區 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左欄：原圖 */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-xl p-4 h-full flex flex-col">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      {lang === 'zh' ? '原始圖片' : 'Original Image'}
                    </h3>
                    <div className="flex-1 flex items-center justify-center bg-white rounded-lg overflow-hidden min-h-[300px]">
                      {product.coverImage ? (
                        <Image
                          src={product.coverImage}
                          alt={product.name_zh}
                          width={400}
                          height={400}
                          className="object-contain max-h-[350px] w-auto"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm">無圖片</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 中欄：提示詞選擇器 */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-xl p-4 h-full flex flex-col">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      {lang === 'zh' ? '設計選項' : 'Design Options'}
                    </h3>
                    
                    <div className="space-y-4 flex-1">
                      {/* 下拉選擇範本 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {lang === 'zh' ? '選擇設計範本' : 'Choose Template'}
                        </label>
                        <select
                          value={selectedTemplate || ''}
                          onChange={(e) => {
                            setSelectedTemplate(e.target.value);
                            setCustomPrompt('');
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        >
                          {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {lang === 'zh' ? template.name_zh : template.name_en}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 範本輸入欄 */}
                      {selectedTemplate && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {lang === 'zh' ? '輸入設計內容' : 'Enter Design Content'}
                          </label>
                          <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={lang === 'zh' ? '例如：紅色、我的品牌...' : 'e.g., red, my brand...'}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500">
                            {(() => {
                              const template = templates.find(t => t.id === selectedTemplate);
                              if (template?.name_zh === '更換 Logo') {
                                return lang === 'zh' ? '將包裝上的 Logo 替換為您輸入的內容' : 'Replace the logo on packaging with your input';
                              }
                              if (template?.name_zh === '改變設計風格') {
                                return lang === 'zh' ? '改變設計風格為您輸入的風格' : 'Change design style to your input';
                              }
                              return template?.prompt?.replace('{input}', '...') || '';
                            })()}
                          </p>
                        </div>
                      )}

                      {/* 錯誤訊息 */}
                      {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {error}
                        </div>
                      )}

                      {/* 生成按鈕 */}
                      <button
                        onClick={handleGenerate}
                        disabled={generating || (!userInput.trim())}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {lang === 'zh' ? 'AI 設計中...' : 'Generating...'}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            {lang === 'zh' ? '開始 AI 設計' : 'Generate AI Design'}
                          </>
                        )}
                      </button>

                      {/* 完整功能預告 */}
                      <div className="p-3 bg-white rounded-xl border border-gray-200">
                        <div className="text-center">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded-full mb-1">
                            <span>🔒</span>
                            <span>{lang === 'zh' ? '完整功能開發中' : 'Coming Soon'}</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {lang === 'zh' ? '預計 12/15 前正式上線' : 'Expected Dec 15'}
                          </p>
                          <a
                            href="https://line.me/R/ti/p/@gya2047g"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-green-600 font-medium hover:text-green-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                            </svg>
                            {lang === 'zh' ? '加 LINE 開啟完整功能' : 'Add LINE'}
                          </a>
                          <p className="text-[10px] text-gray-400 mt-2">
                            {lang === 'zh' 
                              ? '🧪 本功能目前為 v0.1 測試版，如有錯誤請多包涵，歡迎加 LINE 與我們交流意見' 
                              : '🧪 This feature is currently v0.1 beta. Please bear with any errors and feel free to add LINE to share feedback'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右欄：產出圖 */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-xl p-4 h-full flex flex-col">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      {lang === 'zh' ? 'AI 設計結果' : 'AI Design Result'}
                    </h3>
                    <div className="flex-1 flex items-center justify-center bg-white rounded-lg overflow-hidden min-h-[300px]">
                      {generating ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                          <span className="text-sm text-gray-500">
                            {lang === 'zh' ? 'AI 正在設計中...' : 'AI is designing...'}
                          </span>
                        </div>
                      ) : result ? (
                        <Image
                          src={result.resultUrl}
                          alt="AI Generated"
                          width={400}
                          height={400}
                          className="object-contain max-h-[350px] w-auto"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                          <Sparkles className="w-10 h-10" />
                          <span className="text-sm">
                            {lang === 'zh' ? '設計結果將顯示在這裡' : 'Result will appear here'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 操作按鈕 */}
                    {result && (
                      <div className="mt-4 space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                          >
                            <Download className="w-4 h-4" />
                            {lang === 'zh' ? '下載' : 'Download'}
                          </button>
                          <button
                            onClick={handleCopyLink}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4" />
                                {lang === 'zh' ? '已複製' : 'Copied'}
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                {lang === 'zh' ? '分享' : 'Share'}
                              </>
                            )}
                          </button>
                        </div>
                        
                        {/* 生成工廠專業術語按鈕 */}
                        <button
                          onClick={handleAnalyzePackaging}
                          disabled={analyzing}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                          {analyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {lang === 'zh' ? '分析中...' : 'Analyzing...'}
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {lang === 'zh' ? '生成工廠專業術語' : 'Generate Factory Specs'}
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            setResult(null);
                            setAnalysisResult(null);
                            setAnalysisError(null);
                          }}
                          className="w-full py-2 text-purple-600 font-medium hover:bg-purple-50 rounded-lg transition-colors text-sm"
                        >
                          {lang === 'zh' ? '重新設計' : 'Try Again'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 專業術語分析結果 */}
              {(analysisResult || analysisError || analyzing) && (
                <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {lang === 'zh' ? '📋 工廠生產工藝單' : '📋 Factory Production Specs'}
                    </h3>
                  </div>
                  
                  {analyzing ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                      <span className="ml-3 text-gray-600">
                        {lang === 'zh' ? '正在分析包裝結構...' : 'Analyzing packaging structure...'}
                      </span>
                    </div>
                  ) : analysisError ? (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{analysisError}</span>
                    </div>
                  ) : analysisResult ? (
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: analysisResult
                            .replace(/## /g, '<h4 class="text-base font-bold text-gray-900 mt-4 mb-2 flex items-center gap-2">')
                            .replace(/\n- \*\*/g, '</h4><div class="ml-4 mb-1"><strong class="text-gray-800">')
                            .replace(/\*\*:/g, ':</strong>')
                            .replace(/\n- /g, '<br/>• ')
                            .replace(/\n\n/g, '</div><div class="mb-3">')
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
