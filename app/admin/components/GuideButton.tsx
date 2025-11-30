"use client";

import { useState } from "react";
import Link from "next/link";
import { Book, X } from "lucide-react";

export default function GuideButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 浮動按鈕 */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          title="系統技術文件"
        >
          <Book className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
            ?
          </span>
        </button>
      </div>

      {/* 彈出視窗 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <div className="mb-2 inline-flex rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 p-3">
                <Book className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">系統技術文件</h2>
              <p className="mt-1 text-sm text-zinc-600">
                完整的前後台操作說明與開發文件
              </p>
            </div>

            <div className="space-y-3">
              <InfoItem
                title="📋 系統概述"
                description="了解系統架構與核心功能"
              />
              <InfoItem
                title="🛠️ 產品上架"
                description="完整的產品上架操作教學"
              />
              <InfoItem
                title="🌍 多語系管理"
                description="中英文內容與 AI 翻譯"
              />
              <InfoItem
                title="🖼️ 圖片管理"
                description="R2 圖床上傳與管理"
              />
              <InfoItem
                title="🚀 部署指南"
                description="Cloudflare Pages 部署步驟"
              />
              <InfoItem
                title="❓ 故障排除"
                description="常見問題解決方案"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href="/admin/guide"
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition-transform hover:scale-105"
                onClick={() => setIsOpen(false)}
              >
                開啟完整文件
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                稍後查看
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-zinc-500">
              💡 提示：可隨時點擊右下角按鈕開啟文件
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function InfoItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <h4 className="mb-0.5 text-sm font-semibold text-zinc-900">{title}</h4>
      <p className="text-xs text-zinc-600">{description}</p>
    </div>
  );
}
