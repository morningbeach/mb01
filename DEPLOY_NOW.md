# 🚀 Cloudflare Pages 部署準備完成！

## ✅ 已完成的準備工作

1. ✅ 安裝 Cloudflare Pages 適配器
2. ✅ 更新 build scripts
3. ✅ 建立 wrangler.toml 配置
4. ✅ 設定 Node 版本 (18.17.0)
5. ✅ 更新 .gitignore
6. ✅ 優化 next.config.js

## 📝 下一步：在 Cloudflare Dashboard 部署

### 🔑 環境變數清單（複製到 Cloudflare Pages 設定）

```bash
# 資料庫
DATABASE_URL=postgresql://postgres:QWrr35437316@44.239.209.64:5432/postgres?sslmode=require

# R2 圖床
R2_ACCOUNT_ID=c69e3d1a7fc921076100e851e398b5
R2_ENDPOINT=https://c69e3d1a7fc921076100e85195e398b5.r2.cloudflarestorage.com
R2_BUCKET_NAME=gift-images
R2_PUBLIC_BASE_URL=https://img.mbpack.co
R2_ACCESS_KEY=946e9548fff3148bf3638a26083aac36
R2_SECRET_KEY=3e33b5e0f8f6506a35f8709c869c7d09555c47e6dad44af730f31377182638f1

# 後台認證
ADMIN_BASIC_USER=mbadmin
ADMIN_BASIC_PASS=35437316

# Node 版本
NODE_VERSION=18.17.0
```

### 📌 Cloudflare Pages 設定

**Framework preset:** Next.js

**Build command:** 
```
npm run build
```

**Build output directory:** 
```
.next
```

**Root directory:** 
```
(留空)
```

**Node version:**
```
18.17.0
```

### 🌐 部署步驟

1. **推送程式碼到 GitHub**
   ```bash
   git add .
   git commit -m "準備部署到 Cloudflare Pages"
   git push origin feature/gallery-and-static-pages
   ```

2. **前往 Cloudflare Dashboard**
   - 網址: https://dash.cloudflare.com
   - 選擇您的帳號

3. **建立 Pages 專案**
   - 點擊 "Pages" → "Create a project"
   - 選擇 "Connect to Git"
   - 授權並選擇 repository: `morningbeach/mb01`
   - 選擇 branch: `feature/gallery-and-static-pages`

4. **填入建置設定**
   - 使用上面提供的設定值

5. **添加環境變數**
   - 在 "Environment variables" 區塊
   - 複製貼上上面的環境變數清單
   - **重要：** 每個變數都要分別添加

6. **儲存並部署**
   - 點擊 "Save and Deploy"
   - 等待建置完成（3-5 分鐘）

### ✅ 部署後驗證

訪問您的 Cloudflare Pages URL，測試：
- [ ] 首頁正常載入
- [ ] `/admin` 後台可登入
- [ ] 圖片從 R2 正常顯示
- [ ] 產品頁面運作正常
- [ ] 分類樹狀結構正常
- [ ] 資料庫連線正常

### 🐛 如遇到問題

**建置失敗:**
- 檢查 Build logs
- 確認所有環境變數都已設定
- 確認 DATABASE_URL 包含 `?sslmode=require`

**資料庫連線失敗:**
- 確認資料庫防火牆允許 Cloudflare IP
- 或考慮使用 Prisma Data Proxy

**圖片無法載入:**
- 檢查 R2 CORS 設定
- 確認 R2_PUBLIC_BASE_URL 正確

### 📖 完整文件

詳細說明請參考: `DEPLOYMENT.md`

---

**準備完成！現在可以開始部署了 🎉**
