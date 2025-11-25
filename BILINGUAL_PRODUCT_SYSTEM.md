# 產品多語系系統使用說明

## ✅ 已完成的功能

### 1. 資料庫 Schema 更新
- ✅ Product 模型新增完整的中英文欄位（`name_en`, `name_zh`, `shortDesc_en`, `shortDesc_zh` 等）
- ✅ Tag 模型新增多語系欄位（`name_en`, `name_zh`, `subtitle_en`, `subtitle_zh`）
- ✅ 保留原有單語言欄位以確保向下相容
- ✅ 資料庫已執行 migration（`npx prisma db push --accept-data-loss`）

### 2. AI 翻譯 API
- ✅ 翻譯接口：`POST /api/translate`
- ✅ 支援 OpenAI GPT-4o-mini 模型
- ✅ 上下文感知翻譯（產品名稱、描述、SEO 等不同類型有不同的翻譯提示）
- ✅ 優雅降級：未設定 API key 時回傳提示訊息

### 3. 後台管理組件
- ✅ `BilingualInput` - 雙語輸入欄位組件
- ✅ `TranslateButton` - AI 翻譯按鈕組件
- ✅ `ProductFormBilingual` - 完整的產品多語系表單

### 4. 前台顯示
- ✅ 產品詳情頁 (`/products/[slug]`) 支援中英文切換
- ✅ 使用 `?lang=zh` 或 `?lang=en` 參數切換語言
- ✅ 所有產品欄位、標籤、按鈕文字均已多語系化

## 📝 使用方式

### 設定 OpenAI API Key

在 `.env.local` 檔案中新增：

\`\`\`env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

### 後台編輯產品

1. 使用新的多語系表單：
   \`\`\`tsx
   import { ProductFormBilingual } from "../components/ProductFormBilingual";
   
   // 在編輯頁面使用
   <ProductFormBilingual product={product} />
   \`\`\`

2. 每個欄位都有：
   - 🇺🇸 英文輸入框
   - 🇹🇼 中文輸入框  
   - 翻譯按鈕（點擊自動翻譯）

3. 翻譯按鈕會根據欄位類型提供最佳翻譯：
   - 產品名稱：簡潔專業
   - 產品描述：電商用語
   - SEO 標題：包含關鍵字，< 60 字
   - SEO 描述：< 160 字

### 前台顯示

產品頁面會根據 URL 參數自動切換語言：

- 英文：`/products/corporate-gift-set-a?lang=en`
- 中文：`/products/corporate-gift-set-a?lang=zh`

所有文字包括：
- 產品名稱、描述
- 規格資訊（尺寸、材質、交期等）
- 標籤名稱
- 按鈕文字（"Request quotation" / "索取報價"）
- 表單標題（"Commercial specs" / "商業規格"）

## 🔧 整合到現有系統

### 方案 A：替換現有表單

將 `app/admin/products-v2/[id]/edit/page.tsx` 中的：

\`\`\`tsx
import { ProductForm } from "../../components/ProductForm";
\`\`\`

改為：

\`\`\`tsx
import { ProductFormBilingual } from "../../components/ProductFormBilingual";
\`\`\`

並將 `<ProductForm />` 改為 `<ProductFormBilingual />`

### 方案 B：並行使用（推薦）

保留原有表單，在特定產品使用多語系表單：

\`\`\`tsx
// 根據條件選擇使用哪個表單
{product.needsBilingual ? (
  <ProductFormBilingual product={product} />
) : (
  <ProductForm product={product} />
)}
\`\`\`

## 📊 資料遷移

### 將現有產品遷移到多語系

\`\`\`typescript
// 將現有的單語言資料複製到英文欄位
await prisma.product.updateMany({
  data: {
    name_en: { _ref: 'name' }, // Prisma 不支援這種語法
  }
});

// 實際需要用迴圈處理
const products = await prisma.product.findMany();
for (const product of products) {
  await prisma.product.update({
    where: { id: product.id },
    data: {
      name_en: product.name,
      shortDesc_en: product.shortDesc,
      description_en: product.description,
      // ... 其他欄位
    }
  });
}
\`\`\`

### 批次翻譯

\`\`\`typescript
// 批次翻譯所有產品名稱
for (const product of products) {
  if (product.name_en && !product.name_zh) {
    const response = await fetch('/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        text: product.name_en,
        from: 'en',
        to: 'zh',
        context: 'product_name'
      })
    });
    const { translatedText } = await response.json();
    
    await prisma.product.update({
      where: { id: product.id },
      data: { name_zh: translatedText }
    });
  }
}
\`\`\`

## 🎯 完整的欄位對照表

| 欄位用途 | 英文欄位 | 中文欄位 | 舊欄位（向下相容） |
|---------|---------|---------|------------------|
| 產品名稱 | name_en | name_zh | name |
| 簡短描述 | shortDesc_en | shortDesc_zh | shortDesc |
| 詳細描述 | description_en | description_zh | description |
| 尺寸 | dimensions_en | dimensions_zh | dimensions |
| 材質 | materials_en | materials_zh | materials |
| 交期 | leadTime_en | leadTime_zh | leadTime |
| 包裝資訊 | packagingInfo_en | packagingInfo_zh | packagingInfo |
| 單位 | unit_en | unit_zh | unit |
| 買家須知 | notesForBuyer_en | notesForBuyer_zh | notesForBuyer |
| 產地 | originCountry_en | originCountry_zh | originCountry |
| 價格提示 | priceHint_en | priceHint_zh | priceHint |
| SEO 標題 | seoTitle_en | seoTitle_zh | seoTitle |
| SEO 描述 | seoDescription_en | seoDescription_zh | seoDescription |

## 💰 OpenAI API 費用估算

使用 GPT-4o-mini 模型：
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens

平均每次翻譯（假設 100 tokens）：
- 成本約 $0.000075 USD（< 新台幣 0.003 元）
- 翻譯 1000 個產品欄位約 $0.075 USD（約新台幣 2.3 元）

非常便宜！

## 🚀 下一步

1. ✅ 資料庫已更新
2. ✅ 翻譯 API 已建立
3. ✅ 後台組件已完成
4. ✅ 前台顯示已多語系化
5. ⏳ 將多語系表單整合到編輯頁面
6. ⏳ 遷移現有產品資料
7. ⏳ 批次翻譯現有內容
8. ⏳ 在導航列加入語言切換按鈕

## 📁 相關檔案

### 後台組件
- `app/admin/products-v2/components/BilingualInput.tsx` - 雙語輸入欄位
- `app/admin/products-v2/components/TranslateButton.tsx` - 翻譯按鈕
- `app/admin/products-v2/components/ProductFormBilingual.tsx` - 多語系表單

### 前台
- `app/products/[slug]/page.tsx` - 產品詳情頁（已支援多語系）

### API
- `app/api/translate/route.ts` - AI 翻譯接口

### 資料庫
- `prisma/schema.prisma` - 已更新的 schema
