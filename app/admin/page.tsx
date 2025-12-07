// app/admin/page.tsx
"use client";

import { AdminPageHeader } from "./components/AdminPageHeader";
import { VersionSwitcher } from "./components/VersionSwitcher";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [showAIStudioDropdown, setShowAIStudioDropdown] = useState(false);

  return (
    <>
      <AdminPageHeader
        eyebrow="後台管理"
        title="控制面板"
        description="系統總覽與快速導航"
      />

      {/* 版本切換器 */}
      <VersionSwitcher />

      {/* 主要功能導航列 */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-bold text-zinc-900">🎯 主要功能</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Contact Inquiries - 獨立項目 */}
          <a
            href="/admin/contact-inquiries"
            className="group relative overflow-hidden rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="text-2xl">📧</span>
              <div className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">
                NEW
              </div>
            </div>
            <h3 className="mb-2 text-base font-bold text-zinc-900">
              客戶詢價管理
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-zinc-600">
              查看並處理來自網站的客戶詢價、報價需求與聯絡訊息
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-green-700">
              <span>立即查看</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </a>

          {/* Products V2 - 帶下拉選單 */}
          <div className="group relative">
            <div
              className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm transition-all hover:shadow-md"
              onClick={() => setShowProductsDropdown(!showProductsDropdown)}
            >
              <div className="mb-3 inline-flex items-center gap-2">
                <span className="text-2xl">📦</span>
                <div className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  V2
                </div>
              </div>
              <h3 className="mb-2 text-base font-bold text-zinc-900">
                商品管理系統
              </h3>
              <p className="mb-3 text-xs leading-relaxed text-zinc-600">
                商品、分類樹、標籤的完整管理介面
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-blue-700">
                <span>展開選單</span>
                <span className={`transition-transform ${showProductsDropdown ? 'rotate-90' : ''}`}>▼</span>
              </div>
            </div>
            
            {/* 下拉選單 */}
            {showProductsDropdown && (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-lg border border-blue-200 bg-white shadow-lg">
                <a
                  href="/admin/products-v2"
                  className="block border-b border-zinc-100 px-4 py-3 text-sm transition-colors hover:bg-blue-50"
                >
                  <div className="font-semibold text-zinc-900">📦 商品管理</div>
                  <div className="text-xs text-zinc-500">新增、編輯、管理所有商品</div>
                </a>
                <a
                  href="/admin/category-tree"
                  className="block border-b border-zinc-100 px-4 py-3 text-sm transition-colors hover:bg-blue-50"
                >
                  <div className="font-semibold text-zinc-900">🌳 分類樹管理</div>
                  <div className="text-xs text-zinc-500">多層級樹狀分類結構</div>
                </a>
                <a
                  href="/admin/tags-v2"
                  className="block px-4 py-3 text-sm transition-colors hover:bg-blue-50"
                >
                  <div className="font-semibold text-zinc-900">🏷️ 標籤管理</div>
                  <div className="text-xs text-zinc-500">標籤的組織與分類</div>
                </a>
              </div>
            )}
          </div>

          {/* AI Studio - 帶下拉選單 */}
          <div className="group relative">
            <div
              className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm transition-all hover:shadow-md"
              onClick={() => setShowAIStudioDropdown(!showAIStudioDropdown)}
            >
              <div className="mb-3 inline-flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div className="rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  AI
                </div>
              </div>
              <h3 className="mb-2 text-base font-bold text-zinc-900">
                AI Studio
              </h3>
              <p className="mb-3 text-xs leading-relaxed text-zinc-600">
                AI 驅動的智能工具集：趨勢掃描、禮盒雷達、批次處理
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-purple-700">
                <span>展開選單</span>
                <span className={`transition-transform ${showAIStudioDropdown ? 'rotate-90' : ''}`}>▼</span>
              </div>
            </div>
            
            {/* 下拉選單 */}
            {showAIStudioDropdown && (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-lg border border-purple-200 bg-white shadow-lg">
                <a
                  href="/admin/ai-prompts"
                  className="block border-b border-zinc-100 px-4 py-3 text-sm transition-colors hover:bg-purple-50"
                >
                  <div className="font-semibold text-zinc-900">✨ AI Design 範本</div>
                  <div className="text-xs text-zinc-500">管理 AI 包裝設計的提示詞範本</div>
                </a>
                <a
                  href="/admin/ai-usage"
                  className="block border-b border-zinc-100 px-4 py-3 text-sm transition-colors hover:bg-purple-50"
                >
                  <div className="font-semibold text-zinc-900">📈 AI Design 統計</div>
                  <div className="text-xs text-zinc-500">查看 AI 設計功能的使用統計</div>
                </a>
                <a
                  href="/admin/ai-studio/gift-box-radar"
                  className="block border-b border-zinc-100 px-4 py-3 text-sm transition-colors hover:bg-purple-50"
                >
                  <div className="font-semibold text-zinc-900">🎁 Gift Box Radar</div>
                  <div className="text-xs text-zinc-500">AI 禮盒商品發現與分析</div>
                </a>
                <a
                  href="/admin/ai-studio/trend-scanner"
                  className="block border-b border-zinc-100 px-4 py-3 text-sm transition-colors hover:bg-purple-50"
                >
                  <div className="font-semibold text-zinc-900">📊 Trend Scanner</div>
                  <div className="text-xs text-zinc-500">市場趨勢掃描與洞察</div>
                </a>
                <a
                  href="/admin/ai-studio/batch"
                  className="block px-4 py-3 text-sm transition-colors hover:bg-purple-50"
                >
                  <div className="font-semibold text-zinc-900">⚡ Batch Processing</div>
                  <div className="text-xs text-zinc-500">批次處理與自動化任務</div>
                </a>
              </div>
            )}
          </div>

          {/* Catalog V2 */}
          <a
            href="/admin/catalog-v2"
            className="group relative overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="text-2xl">📂</span>
              <div className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                V2
              </div>
            </div>
            <h3 className="mb-2 text-base font-bold text-zinc-900">
              分類管理
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-zinc-600">
              優化的分類邏輯，更靈活的標籤組織方式
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-700">
              <span>管理分類</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </a>
        </div>
      </div>

      {/* 內容與網站管理 */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-bold text-zinc-900">📝 內容與網站管理</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a
            href="/admin/homepage"
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-3 text-2xl">🏠</div>
            <h3 className="mb-2 text-base font-bold text-zinc-900">
              首頁編輯器
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-zinc-600">
              編輯首頁區塊、英雄橫幅與精選商品展示
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-700">
              <span>前往編輯</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </a>

          <a
            href="/admin/pages"
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-3 text-2xl">📄</div>
            <h3 className="mb-2 text-base font-bold text-zinc-900">
              頁面管理
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-zinc-600">
              管理靜態頁面：關於我們、聯絡方式、工廠介紹等
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-700">
              <span>前往管理</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </a>

          <a
            href="/admin/images"
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-3 text-2xl">🖼️</div>
            <h3 className="mb-2 text-base font-bold text-zinc-900">
              圖片庫
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-zinc-600">
              上傳、重新命名並管理商品與首頁圖片
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-700">
              <span>前往圖片庫</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </a>

          <a
            href="/admin/footer"
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-3 text-2xl">🦶</div>
            <h3 className="mb-2 text-base font-bold text-zinc-900">
              頁腳編輯器
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-zinc-600">
              管理公司資訊、聯絡方式與客戶名單
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-700">
              <span>編輯頁腳</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </a>
        </div>
      </div>
    </>
  );
}
