// app/help/page.tsx
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "網站使用指南 | 天玎包裝",
  description: "天玎包裝網站完整使用指南，幫助您快速找到需要的包裝產品和服務資訊。",
};

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Hero Section */}
      <section className="bg-zinc-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            網站使用指南
          </h1>
          <p className="text-zinc-300 text-lg">
            歡迎來到天玎包裝！本指南將幫助您快速了解如何使用我們的網站。
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* 快速導覽 */}
        <nav className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span>📋</span> 快速導覽
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <a href="#browse" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
              <span className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-sm">1</span>
              瀏覽產品目錄
            </a>
            <a href="#search" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
              <span className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-sm">2</span>
              搜尋產品
            </a>
            <a href="#inquiry" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
              <span className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-sm">3</span>
              詢價與聯繫
            </a>
            <a href="#about" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
              <span className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-sm">4</span>
              了解我們
            </a>
            <a href="#language" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
              <span className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-sm">5</span>
              語言切換
            </a>
            <a href="#faq" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
              <span className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-sm">6</span>
              常見問題
            </a>
          </div>
        </nav>

        {/* 瀏覽產品目錄 */}
        <section id="browse" className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span>📦</span> 1. 瀏覽產品目錄
          </h2>
          <div className="prose prose-zinc max-w-none">
            <p>我們提供多種包裝產品，您可以透過以下方式瀏覽：</p>
            
            <h3>產品分類</h3>
            <p>點擊導覽列的「產品目錄」，您會看到完整的產品分類樹：</p>
            <ul>
              <li><strong>紙類包裝</strong> - 紙盒、紙袋、紙管等</li>
              <li><strong>塑膠包裝</strong> - PP袋、PE袋、收縮膜等</li>
              <li><strong>禮盒包裝</strong> - 天地蓋盒、書型盒、抽屜盒等</li>
              <li><strong>環保包裝</strong> - 可回收材質包裝</li>
            </ul>

            <h3>產品詳情</h3>
            <p>點擊任一產品可查看：</p>
            <ul>
              <li>產品規格與尺寸</li>
              <li>材質說明</li>
              <li>適用場景</li>
              <li>產品圖片庫</li>
            </ul>
          </div>
          <div className="mt-4">
            <Link 
              href="/catalog-tree" 
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              前往產品目錄 →
            </Link>
          </div>
        </section>

        {/* 搜尋產品 */}
        <section id="search" className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span>🔍</span> 2. 搜尋產品
          </h2>
          <div className="prose prose-zinc max-w-none">
            <p>如果您知道想要的產品名稱，可以使用搜尋功能：</p>
            <ol>
              <li>點擊頁面右上角的搜尋圖示</li>
              <li>輸入產品名稱或關鍵字</li>
              <li>按 Enter 或點擊搜尋按鈕</li>
            </ol>
            
            <h3>搜尋技巧</h3>
            <ul>
              <li>使用產品類型搜尋，如：「紙盒」、「禮盒」</li>
              <li>使用材質搜尋，如：「牛皮紙」、「PP」</li>
              <li>使用用途搜尋，如：「化妝品包裝」、「食品包裝」</li>
            </ul>
          </div>
        </section>

        {/* 詢價與聯繫 */}
        <section id="inquiry" className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span>💬</span> 3. 詢價與聯繫
          </h2>
          <div className="prose prose-zinc max-w-none">
            <h3>快速詢價</h3>
            <p>您可以透過以下方式與我們聯繫：</p>
            <ul>
              <li>
                <strong>LINE 諮詢</strong> - 點擊頁面右下角的 LINE 圖示，直接與我們的業務人員對話
              </li>
              <li>
                <strong>聯絡表單</strong> - 前往「聯絡我們」頁面填寫詢價表單
              </li>
              <li>
                <strong>電話</strong> - 直接撥打我們的服務專線
              </li>
            </ul>

            <h3>詢價時請準備</h3>
            <p>為了更快速地為您報價，請準備以下資訊：</p>
            <ul>
              <li>產品類型和規格（尺寸、材質）</li>
              <li>預估數量</li>
              <li>是否需要印刷</li>
              <li>預計交貨時間</li>
            </ul>
          </div>
          <div className="mt-4 flex gap-3">
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              聯絡我們 →
            </Link>
          </div>
        </section>

        {/* 了解我們 */}
        <section id="about" className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span>🏭</span> 4. 了解我們
          </h2>
          <div className="prose prose-zinc max-w-none">
            <p>想更了解天玎包裝？您可以瀏覽以下頁面：</p>
            <ul>
              <li>
                <Link href="/about" className="text-zinc-900 font-medium hover:underline">關於我們</Link> 
                {" "}- 了解公司歷史與理念
              </li>
              <li>
                <Link href="/factory" className="text-zinc-900 font-medium hover:underline">工廠介紹</Link>
                {" "}- 參觀我們的生產設備與環境
              </li>
              <li>
                <Link href="/process" className="text-zinc-900 font-medium hover:underline">生產流程</Link>
                {" "}- 了解從設計到交貨的完整流程
              </li>
              <li>
                <Link href="/case" className="text-zinc-900 font-medium hover:underline">成功案例</Link>
                {" "}- 查看我們服務過的客戶案例
              </li>
            </ul>
          </div>
        </section>

        {/* 語言切換 */}
        <section id="language" className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span>🌐</span> 5. 語言切換
          </h2>
          <div className="prose prose-zinc max-w-none">
            <p>本網站支援中文和英文兩種語言：</p>
            <ol>
              <li>點擊頁面右上角的語言切換按鈕</li>
              <li>選擇「繁體中文」或「English」</li>
              <li>頁面會自動切換至您選擇的語言</li>
            </ol>
            <p>語言設定會被記住，下次訪問時會自動使用您偏好的語言。</p>
          </div>
        </section>

        {/* 常見問題 */}
        <section id="faq" className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span>❓</span> 6. 常見問題
          </h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                <span className="font-medium">最少訂購量是多少？</span>
                <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 px-3 text-zinc-600">
                最少訂購量依產品類型而異，一般紙盒類約 500-1000 個起訂，詳細資訊請直接詢價。
              </p>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                <span className="font-medium">生產週期需要多久？</span>
                <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 px-3 text-zinc-600">
                標準訂單約 7-14 個工作天，急單可加急處理。實際時間依訂單複雜度和數量而定。
              </p>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                <span className="font-medium">可以客製化印刷嗎？</span>
                <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 px-3 text-zinc-600">
                是的！我們提供全彩印刷、燙金、燙銀、UV 上光等多種加工選項，歡迎提供您的設計檔案。
              </p>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                <span className="font-medium">提供打樣服務嗎？</span>
                <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 px-3 text-zinc-600">
                是的，我們提供打樣服務，確認樣品後再進行量產，確保成品符合您的需求。
              </p>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                <span className="font-medium">如何取得報價？</span>
                <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 px-3 text-zinc-600">
                請透過 LINE、聯絡表單或電話與我們聯繫，提供產品規格和數量，我們會在 1-2 個工作天內回覆報價。
              </p>
            </details>
          </div>
          <div className="mt-6">
            <Link 
              href="/faq" 
              className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              查看更多常見問題 →
            </Link>
          </div>
        </section>

        {/* 需要協助 */}
        <section className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-3">還有其他問題嗎？</h2>
          <p className="text-zinc-300 mb-6">
            我們的客服團隊隨時為您服務，歡迎透過任何方式與我們聯繫！
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-white text-zinc-900 px-6 py-3 rounded-lg font-medium hover:bg-zinc-100 transition-colors"
            >
              聯絡我們
            </Link>
            <a 
              href="https://line.me/ti/p/~@mbpack" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#06C755] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#05b34d] transition-colors"
            >
              LINE 諮詢
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
