# 跨類別標籤過濾清單

> 這些標籤同時屬於多個類別（如提袋、禮品、印刷品），在篩選器中被隱藏以避免混淆。
> 
> 檔案位置：`app/api/filter-dimensions/route.ts`

## 目前被過濾的標籤 (30個)

### 材質類
| Slug | 中文名稱 | 英文名稱 |
|------|---------|---------|
| `polyester` | 聚酯纖維 | Polyester |
| `nylon` | 尼龍 | Nylon |
| `leather` | 皮革 | Leather |
| `faux-leather` | 仿皮 | Faux Leather |
| `cork` | 軟木 | Cork |

### 印刷工藝類
| Slug | 中文名稱 | 英文名稱 |
|------|---------|---------|
| `embossing` | 壓印 | Embossing |
| `laser-engraving` | 雷射雕刻 | Laser Engraving |
| `screen-print` | 網版印刷 | Screen Printing |
| `heat-transfer` | 熱轉印 | Heat Transfer |
| `sublimation` | 熱昇華 | Sublimation |
| `dtg-print` | 數位直噴 | DTG Print |
| `offset-print` | 平版印刷 | Offset Printing |
| `embroidery` | 刺繡 | Embroidery |

### 功能特色類
| Slug | 中文名稱 | 英文名稱 |
|------|---------|---------|
| `waterproof` | 防水 | Waterproof |
| `insulated` | 保溫保冷 | Insulated |
| `foldable` | 可折疊 | Foldable |

### 環保認證類
| Slug | 中文名稱 | 英文名稱 |
|------|---------|---------|
| `grs-certified` | GRS認證 | GRS Certified |
| `recycled-material` | 回收材料 | Recycled Material |
| `biodegradable` | 可降解 | Biodegradable |
| `organic-cotton` | 有機棉 | Organic Cotton |
| `oeko-tex` | OEKO-TEX認證 | OEKO-TEX |
| `fsc-paper` | FSC認證紙 | FSC Paper |

### 應用場景類
| Slug | 中文名稱 | 英文名稱 |
|------|---------|---------|
| `fashion-apparel` | 服飾配件 | Fashion & Apparel |
| `retail-shopping` | 零售購物 | Retail Shopping |
| `travel-outdoor` | 旅行戶外 | Travel & Outdoor |
| `sports-fitness` | 運動健身 | Sports & Fitness |
| `baby-kids` | 母嬰用品 | Baby & Kids |
| `school-office` | 學校辦公 | School & Office |

### 其他
| Slug | 中文名稱 | 備註 |
|------|---------|------|
| `corporate-gift` | 企業禮品 | 跨類別通用 |
| `tag-1764169657523` | 禮品包裝 | 系統生成ID |

---

## 已移除的標籤（現在會顯示在篩選器）

| Slug | 中文名稱 | 移除日期 | 原因 |
|------|---------|---------|------|
| `canvas` | 帆布 | 2024-12-03 | 提袋材質篩選需要 |
| `cotton` | 棉布 | 2024-12-03 | 提袋材質篩選需要 |

---

## 如何修改

若要讓某個標籤重新顯示在篩選器中，請編輯：

```typescript
// app/api/filter-dimensions/route.ts

const CROSS_CATEGORY_TAG_SLUGS = [
  // 從這裡移除對應的 slug
];
```

修改後記得更新本文件！
