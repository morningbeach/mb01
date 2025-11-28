// app/admin/guide/page.tsx
import { AdminPageHeader } from "../components/AdminPageHeader";

export const dynamic = "force-dynamic";

export default function AdminGuidePage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="系統指南"
        title="後台操作說明"
        description="天玎包裝後台管理系統完整操作指南，適用於所有管理員與編輯人員。"
      />

      <div className="space-y-8 max-w-4xl">
        {/* 目錄 */}
        <nav className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">📋 目錄</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#login" className="text-blue-600 hover:underline">1. 登入系統</a></li>
            <li><a href="#products" className="text-blue-600 hover:underline">2. 產品管理</a></li>
            <li><a href="#category-tree" className="text-blue-600 hover:underline">3. 分類樹管理</a></li>
            <li><a href="#images" className="text-blue-600 hover:underline">4. 圖片管理</a></li>
            <li><a href="#homepage" className="text-blue-600 hover:underline">5. 首頁設定</a></li>
            <li><a href="#pages" className="text-blue-600 hover:underline">6. 頁面管理</a></li>
            <li><a href="#blog" className="text-blue-600 hover:underline">7. 部落格管理</a></li>
            <li><a href="#footer" className="text-blue-600 hover:underline">8. 頁尾設定</a></li>
            <li><a href="#tags" className="text-blue-600 hover:underline">9. 標籤管理</a></li>
          </ul>
        </nav>

        {/* 登入系統 */}
        <section id="login" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">1. 🔐 登入系統</h2>
          <div className="prose prose-sm prose-zinc max-w-none">
            <h3>登入方式</h3>
            <ol>
              <li>前往 <code>/admin/login</code></li>
              <li>輸入管理員 Email 和密碼</li>
              <li>點擊「登入」按鈕</li>
            </ol>
            
            <h3>Session 說明</h3>
            <ul>
              <li>登入後 Session 有效期為 <strong>8 小時</strong></li>
              <li>Session 儲存在資料庫中，登出後會自動清除</li>
              <li>如需變更密碼，請聯繫系統管理員</li>
            </ul>

            <h3>登出</h3>
            <p>點擊右上角的「登出」按鈕即可登出系統。</p>
          </div>
        </section>

        {/* 產品管理 */}
        <section id="products" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">2. 📦 產品管理</h2>
          <div className="prose prose-sm prose-zinc max-w-none">
            <h3>進入方式</h3>
            <p>點擊側邊欄「Products」或前往 <code>/admin/products</code></p>
            
            <h3>新增產品</h3>
            <ol>
              <li>點擊「Create Product」按鈕</li>
              <li>填寫產品基本資訊（名稱、Slug、分類等）</li>
              <li>上傳產品圖片</li>
              <li>填寫中英文描述</li>
              <li>點擊「儲存」</li>
            </ol>

            <h3>雙語系統</h3>
            <p>所有產品支援中英文雙語：</p>
            <ul>
              <li><code>name_zh</code> / <code>name_en</code> - 產品名稱</li>
              <li><code>description_zh</code> / <code>description_en</code> - 產品描述</li>
              <li><code>shortDesc_zh</code> / <code>shortDesc_en</code> - 簡短描述</li>
            </ul>

            <h3>產品狀態</h3>
            <ul>
              <li><strong>ACTIVE</strong> - 上架中，前台可見</li>
              <li><strong>DRAFT</strong> - 草稿，僅後台可見</li>
              <li><strong>ARCHIVED</strong> - 已封存</li>
            </ul>

            <h3>圖片上傳</h3>
            <ul>
              <li>支援 JPG、PNG、WebP 格式</li>
              <li>建議尺寸：800x800 像素以上</li>
              <li>圖片會自動上傳至 R2 雲端儲存</li>
            </ul>
          </div>
        </section>

        {/* 分類樹管理 */}
        <section id="category-tree" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">3. 🌳 分類樹管理</h2>
          <div className="prose prose-sm prose-zinc max-w-none">
            <h3>進入方式</h3>
            <p>點擊側邊欄「Category Tree」或前往 <code>/admin/category-tree</code></p>
            
            <h3>分類結構</h3>
            <p>分類樹支援多層級結構：</p>
            <ul>
              <li>第一層：主分類（如：紙包材、塑膠包材）</li>
              <li>第二層：子分類（如：紙盒、紙袋）</li>
              <li>第三層：細分類（如：天地蓋盒、書型盒）</li>
            </ul>

            <h3>新增分類</h3>
            <ol>
              <li>點擊「新增分類」按鈕</li>
              <li>填寫 Slug（網址路徑，只能使用英文小寫和連字號）</li>
              <li>填寫中英文名稱</li>
              <li>選擇父分類（若為根分類則留空）</li>
              <li>上傳分類圖片</li>
              <li>設定顯示順序</li>
            </ol>

            <h3>產品關聯</h3>
            <p>每個分類可以關聯多個產品，在分類編輯頁面中設定 <code>productIds</code>。</p>
          </div>
        </section>

        {/* 圖片管理 */}
        <section id="images" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">4. 🖼️ 圖片管理</h2>
          <div className="prose prose-sm prose-zinc max-w-none">
            <h3>進入方式</h3>
            <p>點擊側邊欄「Images」或前往 <code>/admin/images</code></p>
            
            <h3>上傳圖片</h3>
            <ol>
              <li>點擊「上傳」按鈕或拖拽圖片到上傳區域</li>
              <li>支援批次上傳多張圖片</li>
              <li>圖片會自動上傳至 Cloudflare R2</li>
            </ol>

            <h3>圖片網址</h3>
            <p>所有圖片都使用 <code>img.mbpack.co</code> 網域，例如：</p>
            <code>https://img.mbpack.co/uploads/product-name.jpg</code>

            <h3>圖片管理功能</h3>
            <ul>
              <li>複製圖片網址</li>
              <li>刪除圖片</li>
              <li>瀏覽已上傳的所有圖片</li>
            </ul>
          </div>
        </section>

        {/* 首頁設定 */}
        <section id="homepage" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">5. 🏠 首頁設定</h2>
          <div className="prose prose-sm prose-zinc max-w-none">
            <h3>進入方式</h3>
            <p>點擊側邊欄「Homepage」或前往 <code>/admin/homepage</code></p>
            
            <h3>可編輯區塊</h3>
            <ul>
              <li><strong>Hero 區塊</strong> - 首頁頂部大圖和標語</li>
              <li><strong>Why Us 區塊</strong> - 為什麼選擇我們</li>
              <li><strong>精選產品</strong> - 首頁展示的產品列表</li>
              <li><strong>CTA 區塊</strong> - 行動呼籲按鈕</li>
            </ul>
          </div>
        </section>

        {/* 頁面管理 */}
        <section id="pages" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">6. 📄 頁面管理</h2>
          <div className="prose prose-sm prose-zinc max-w-none">
            <h3>進入方式</h3>
            <p>點擊側邊欄「Pages」或前往 <code>/admin/pages</code></p>
            
            <h3>可編輯頁面</h3>
            <ul>
              <li><strong>關於我們</strong> - /about</li>
              <li><strong>工廠介紹</strong> - /factory</li>
              <li><strong>生產流程</strong> - /process</li>
              <li><strong>常見問題</strong> - /faq</li>
              <li><strong>聯絡我們</strong> - /contact</li>
            </ul>

            <h3>頁面結構</h3>
            <p>每個頁面包含：</p>
            <ul>
              <li>SEO 標題和描述</li>
              <li>Hero 區塊（標題、副標題、背景圖）</li>
              <li>多個內容區塊</li>
            </ul>
          </div>
        </section>

        {/* 部落格管理 */}
        <section id="blog" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">7. ✍️ 部落格管理</h2>
          <div className="prose prose-sm prose-zinc max-w-none">
            <h3>進入方式</h3>
            <p>點擊側邊欄「Blog」或前往 <code>/admin/blog</code></p>
            
            <h3>新增文章</h3>
            <ol>
              <li>點擊「新增文章」</li>
              <li>填寫標題、Slug</li>
              <li>上傳封面圖片</li>
              <li>編寫文章內容（支援 Markdown）</li>
              <li>設定標籤</li>
              <li>選擇發布或儲存為草稿</li>
            </ol>
          </div>
        </section>

        {/* 頁尾設定 */}
        <section id="footer" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">8. 📍 頁尾設定</h2>
          <div className="prose prose-sm prose-zinc max-w-none">
            <h3>進入方式</h3>
            <p>點擊側邊欄「Footer」或前往 <code>/admin/footer</code></p>
            
            <h3>可編輯內容</h3>
            <ul>
              <li>公司資訊（名稱、地址、電話、Email）</li>
              <li>社群媒體連結</li>
              <li>版權聲明</li>
            </ul>
          </div>
        </section>

        {/* 標籤管理 */}
        <section id="tags" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">9. 🏷️ 標籤管理</h2>
          <div className="prose prose-sm prose-zinc max-w-none">
            <h3>進入方式</h3>
            <p>點擊側邊欄「Tags」或前往 <code>/admin/tags</code></p>
            
            <h3>標籤用途</h3>
            <ul>
              <li>產品標籤 - 用於產品分類和篩選</li>
              <li>部落格標籤 - 用於文章分類</li>
            </ul>

            <h3>新增標籤</h3>
            <ol>
              <li>點擊「新增標籤」</li>
              <li>填寫 Slug 和名稱（中英文）</li>
              <li>選擇標籤顏色</li>
              <li>儲存</li>
            </ol>
          </div>
        </section>

        {/* 技術支援 */}
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-amber-900 mb-4">💡 技術支援</h2>
          <div className="prose prose-sm prose-amber max-w-none">
            <p>如遇到任何問題，請聯繫：</p>
            <ul>
              <li>Email: <a href="mailto:morningbeachtw@gmail.com">morningbeachtw@gmail.com</a></li>
            </ul>
            
            <h3>常見問題</h3>
            <ul>
              <li><strong>圖片上傳失敗</strong> - 確認圖片大小不超過 10MB</li>
              <li><strong>無法儲存</strong> - 確認所有必填欄位已填寫</li>
              <li><strong>頁面載入慢</strong> - 清除瀏覽器快取後重試</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
