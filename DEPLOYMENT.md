# MB Packaging - Cloudflare Pages 部署指南

## 📋 部署前準備清單

### 1️⃣ 安裝依賴
```bash
npm install
```

### 2️⃣ 測試本地建置
```bash
npm run build
```

### 3️⃣ 確認資料庫連線
- 確保 PostgreSQL 資料庫可從外部訪問
- 當前資料庫：`44.239.209.64:5432`
- 已設定 `sslmode=require`

### 4️⃣ 確認 R2 圖床設定
- R2 Bucket: `gift-images`
- Public URL: `https://img.mbpack.co`
- Access Key 已設定

---

## 🚀 部署到 Cloudflare Pages

### 方法一：透過 Cloudflare Dashboard（推薦）

1. **登入 Cloudflare Dashboard**
   - 前往：https://dash.cloudflare.com
   - 選擇您的帳號

2. **建立 Pages 專案**
   - 點擊左側 "Pages"
   - 點擊 "Create a project"
   - 選擇 "Connect to Git"

3. **連接 GitHub Repository**
   - 授權 Cloudflare 訪問您的 GitHub
   - 選擇 repository: `morningbeach/mb01`
   - 選擇 branch: `feature/gallery-and-static-pages` 或 `main`

4. **設定建置配置**
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   Root directory: (留空)
   ```

5. **設定環境變數**
   在 "Environment variables" 區塊添加：
   
   ```
   DATABASE_URL=postgresql://postgres:QWrr35437316@44.239.209.64:5432/postgres?sslmode=require
   
   R2_ACCOUNT_ID=c69e3d1a7fc921076100e851e398b5
   R2_ENDPOINT=https://c69e3d1a7fc921076100e85195e398b5.r2.cloudflarestorage.com
   R2_BUCKET_NAME=gift-images
   R2_PUBLIC_BASE_URL=https://img.mbpack.co
   R2_ACCESS_KEY_ID=946e9548fff3148bf3638a26083aac36
   R2_SECRET_ACCESS_KEY=3e33b5e0f8f6506a35f8709c869c7d09555c47e6dad44af730f31377182638f1
   
   ADMIN_BASIC_USER=mbadmin
   ADMIN_BASIC_PASS=35437316
   
   
   
   ```

6. **儲存並部署**
   - 點擊 "Save and Deploy"
   - 等待建置完成（約 2-5 分鐘）

---

### 方法二：使用 CLI（進階）

1. **安裝 Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **登入 Cloudflare**
   ```bash
   wrangler login
   ```

3. **建置專案**
   ```bash
   npm run build
   ```

4. **部署**
   ```bash
   wrangler pages deploy .next --project-name=mb-packaging
   ```

---

## ⚙️ 部署後設定

### 1. 設定自訂網域
- 在 Cloudflare Pages 專案設定中
- 前往 "Custom domains"
- 添加您的網域（如 `mbpack.co`）

### 2. 設定 HTTPS
- Cloudflare 自動提供免費 SSL 憑證
- 確認 SSL/TLS 模式設為 "Full" 或 "Full (strict)"

### 3. 設定快取規則（選用）
- Page Rules 設定靜態資源快取
- 建議快取 `/uploads/*` 和 `/_next/static/*`

### 4. 設定 R2 CORS（如果尚未設定）
```bash
wrangler r2 bucket cors put gift-images --rules '[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"]
  }
]'
```

---

## 🔍 驗證部署

部署完成後，測試以下功能：

- [ ] 首頁正常顯示
- [ ] 後台登入正常 (`/admin`)
- [ ] 圖片從 R2 正常載入
- [ ] 產品頁面正常顯示
- [ ] 分類樹狀結構正常運作
- [ ] 標籤篩選功能正常
- [ ] 靜態頁面（關於、聯絡）正常

---

## 🐛 常見問題

### 問題 1：建置失敗 "prisma generate"
**解決方法：**
- 確保 build command 包含 `prisma generate`
- 已在 package.json 中設定：`"build": "prisma generate && next build"`

### 問題 2：資料庫連線失敗
**解決方法：**
- 確認資料庫防火牆允許 Cloudflare IP
- 確認 `DATABASE_URL` 環境變數正確
- 確認包含 `?sslmode=require`

### 問題 3：圖片無法載入
**解決方法：**
- 確認 R2 bucket CORS 設定
- 確認 `R2_PUBLIC_BASE_URL` 正確
- 確認 next.config.js 中有設定 R2 hostname

### 問題 4：Server Actions 錯誤
**解決方法：**
- 在 next.config.js 中設定 `allowedOrigins`
- 加入您的 Cloudflare Pages 網域

---

## 📊 效能優化建議

1. **啟用 Cloudflare Cache**
   - 快取靜態資源
   - 設定適當的 Cache-Control headers

2. **使用 R2 CDN**
   - 確保圖片透過 R2 public URL 提供
   - 利用 Cloudflare 全球 CDN

3. **優化圖片**
   - 使用 Next.js Image 元件
   - 自動壓縮和格式轉換

4. **資料庫連線池**
   - 考慮使用 Prisma Data Proxy 或連線池
   - 減少冷啟動時間

---

## 🔐 安全性檢查

- [ ] 所有敏感環境變數已在 Cloudflare 設定（不在程式碼中）
- [ ] 後台有基本認證保護
- [ ] 資料庫連線使用 SSL
- [ ] R2 存取金鑰安全儲存
- [ ] CORS 設定限制來源網域

---

## 📝 持續部署

設定完成後，每次推送到 GitHub，Cloudflare Pages 會自動：
1. 拉取最新程式碼
2. 執行建置
3. 部署到生產環境

分支部署：
- `main` branch → 生產環境
- 其他 branch → 預覽環境（preview URL）

---

## 🆘 需要協助？

- Cloudflare Pages 文件：https://developers.cloudflare.com/pages
- Next.js on Cloudflare：https://developers.cloudflare.com/pages/framework-guides/nextjs
- Wrangler CLI 文件：https://developers.cloudflare.com/workers/wrangler
