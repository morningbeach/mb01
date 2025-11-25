"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TranslateButton } from "../[id]/edit/../../components/TranslateButton";

// 預設資料函數
function getDefaultAboutData() {
  return {
    story_zh: "我們支援全球品牌、代理商和採購商的專案型包裝：從季節性禮品活動到長期零售線。我們的團隊閱讀您的簡報，與您的內部利害關係人保持一致，並將所有內容轉化為結構、材料和生產就緒的規格。\n\n我們不推銷標準目錄，而是從您的限制出發：數量、時間、運輸和品牌指南。從那裡我們提出結構方向、粗略的預算範圍和對您的專案有意義的打樣計劃。\n\n隨著時間推移，我們幫助品牌建立可重複使用的盒子和袋子的結構「語言」，因此每個新專案都感覺一致但從不重複。",
    story_en: "We support global brands, agencies and buyers with project-based packaging: from seasonal gifting campaigns to long-term retail lines. Our team reads your brief, aligns with your internal stakeholders, and translates everything into structures, materials and production-ready specs.\n\nInstead of pushing standard catalogs, we start from your constraints: quantities, timing, shipping, and brand guidelines. From there we propose structural directions, rough budget ranges and sampling plans that make sense for your project.\n\nOver time, we help brands build reusable structural language for boxes and bags, so each new project feels consistent but never repetitive.",
    storyImage: "/cdn/about/studio.jpg",
    values: [
      { title_zh: "清晰", title_en: "Clarity", body_zh: "我們讓選項、權衡和成本易於內部解釋。", body_en: "We make the options, trade-offs and costs easy to explain internally." },
      { title_zh: "一致性", title_en: "Consistency", body_zh: "從打樣到量產，我們專注於可重複的結果。", body_en: "From sampling to mass production, we focus on repeatable results." },
      { title_zh: "可靠性", title_en: "Reliability", body_zh: "實際的時間表、透明的更新和誠實的溝通。", body_en: "Realistic timelines, transparent updates and honest communication." },
    ],
    stats: [
      { label_zh: "包裝經驗", label_en: "Years in packaging", value: "10+" },
      { label_zh: "年度專案", label_en: "Projects per year", value: "100+" },
      { label_zh: "服務區域", label_en: "Regions served", value: "Asia / EU / US" },
    ],
    experienceTitle_zh: "禮品包裝經驗",
    experienceTitle_en: "Experience in gifting",
    experience_zh: "・ FMCG 和零售品牌的季節性禮品套裝。\n・ 會員和 VIP 禮品計劃。\n・ 品牌包裝線的長期結構系統。",
    experience_en: "・ Seasonal gift sets for FMCG and retail brands.\n・ Membership and VIP gifting programs.\n・ Long-term structural systems for brand packaging lines.",
  };
}

function getDefaultFactoryData() {
  return {
    stats: [
      { label_zh: "工廠面積", label_en: "Factory area", value: "10,000 m²" },
      { label_zh: "員工", label_en: "People", value: "120+" },
      { label_zh: "月產能", label_en: "Monthly capacity", value: "300,000+ boxes" },
      { label_zh: "認證", label_en: "Certifications", value: "ISO / audited" },
    ],
    images: [
      { url: "/cdn/factory/floor.jpg", caption_zh: "生產車間", caption_en: "Production floor" },
      { url: "/cdn/factory/machine.jpg", caption_zh: "印刷設備", caption_en: "Printing equipment" },
      { url: "/cdn/factory/qc.jpg", caption_zh: "品質檢查", caption_en: "Quality control" },
    ],
    equipment_zh: "・ 4色和5色膠印機\n・ 自動精裝盒生產線\n・ 模切和壓痕機\n・ 燙金設備\n・ 覆膜線",
    equipment_en: "・ 4-color and 5-color offset printing\n・ Automatic rigid box lines\n・ Die-cutting machines\n・ Hot stamping equipment\n・ Lamination lines",
    qc_zh: "・ 內部結構工程師\n・ 量產前打樣\n・ 生產過程檢查\n・ 出貨前最終檢驗",
    qc_en: "・ In-house structural engineers\n・ Pre-production sampling\n・ In-process checks\n・ Final inspection before shipping",
    workflowTitle_zh: "從需求到出貨",
    workflowTitle_en: "From brief to shipment",
    workflow: [
      { title_zh: "工程", title_en: "Engineering", desc_zh: "確認結構和材料", desc_en: "Confirm structure and materials" },
      { title_zh: "打樣", title_en: "Sampling", desc_zh: "白樣和印刷樣品", desc_en: "White and printed samples" },
      { title_zh: "量產", title_en: "Mass production", desc_zh: "品控檢查", desc_en: "Production with QC" },
      { title_zh: "出貨", title_en: "Shipping", desc_zh: "最終檢驗和出貨", desc_en: "Final QC and shipping" },
    ],
    ctaTitle_zh: "想要查看更多工廠資訊？",
    ctaTitle_en: "Want to audit our factory?",
    ctaDesc_zh: "我們可以分享更多設備和流程資訊",
    ctaDesc_en: "We can share more information on equipment and processes",
  };
}

function getDefaultContactData() {
  return {
    formLabels: {
      name_zh: "姓名", name_en: "Name",
      email_zh: "電子郵件", email_en: "Email",
      company_zh: "公司", company_en: "Company",
      quantity_zh: "預估數量", quantity_en: "Estimated quantity",
      timeline_zh: "時間表", timeline_en: "Timeline",
      details_zh: "專案詳情", details_en: "Project details",
      submit_zh: "發送訊息", submit_en: "Send message",
      emailNote_zh: "或直接發送郵件至", emailNote_en: "Or email us directly at"
    },
    contactDetails: {
      title_zh: "聯絡方式", title_en: "Contact details",
      email: "info@example.com",
      whatsapp: "+86 000 0000 000"
    },
    officeInfo: {
      title_zh: "辦公室與工廠", title_en: "Office & factory",
      address_zh: "地址第一行\n城市，省份，國家",
      address_en: "Address line 1\nCity, Province, Country",
      note_zh: "可安排工廠參觀或線上會議",
      note_en: "We can arrange factory visits or online calls"
    },
    businessHours: {
      title_zh: "營業時間", title_en: "Business hours",
      hours_zh: "週一至週五，9:00-18:00 (GMT+8)",
      hours_en: "Monday–Friday, 9:00–18:00 (GMT+8)",
      note_zh: "我們會在一個工作日內回覆",
      note_en: "We aim to respond within one working day"
    }
  };
}

export function CreatePageFormNew() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // 基本資訊（包含 slug 編輯）
  const [slug, setSlug] = useState("");
  const [navLabel_zh, setNavLabel_zh] = useState("");
  const [navLabel_en, setNavLabel_en] = useState("");
  const [label_zh, setLabel_zh] = useState("");
  const [label_en, setLabel_en] = useState("");
  const [title_zh, setTitle_zh] = useState("");
  const [title_en, setTitle_en] = useState("");
  const [desc_zh, setDesc_zh] = useState("");
  const [desc_en, setDesc_en] = useState("");
  const [showInNav, setShowInNav] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);

  // 頁面內容資料（包含所有欄位）
  const [pageContentData, setPageContentData] = useState<any>({});

  // 當選擇類型時，載入預設內容
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    
    if (type === "ABOUT") {
      setPageContentData(getDefaultAboutData());
    } else if (type === "FACTORY") {
      setPageContentData(getDefaultFactoryData());
    } else if (type === "CONTACT") {
      setPageContentData(getDefaultContactData());
    } else {
      setPageContentData({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 建立基本資料物件
      const basicData = {
        slug,
        type: selectedType,
        navLabel_zh,
        navLabel_en,
        label_zh,
        label_en,
        title_zh,
        title_en,
        desc_zh,
        desc_en,
        showInNav,
        isEnabled,
      };

      // 先創建頁面
      const createRes = await fetch("/api/admin/pages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basicData),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || "建立失敗");
      }

      const result = await createRes.json();
      
      // 如果是 ABOUT/FACTORY/CONTACT，更新 pageData
      if (selectedType !== "CUSTOM" && Object.keys(pageContentData).length > 0) {
        const updateRes = await fetch(`/api/admin/pages/${result.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageData: pageContentData }),
        });
        
        if (!updateRes.ok) {
          throw new Error("內容儲存失敗");
        }
      }
      
      alert("頁面建立成功！");
      router.push("/admin-v2/pages");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">建立新頁面</h1>
        <p className="mt-1 text-sm text-zinc-600">
          選擇頁面類型後，直接編輯所有內容
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* 第一部分：選擇類型和基本資訊 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">基本設定</h2>

          {/* 頁面類型 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-zinc-900">頁面類型 *</label>
            <select
              required
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm"
            >
              <option value="">-- 選擇頁面類型 --</option>
              <option value="ABOUT">About（品牌故事）</option>
              <option value="FACTORY">Factory（工廠實力）</option>
              <option value="CONTACT">Contact（聯絡表單）</option>
              <option value="CUSTOM">Custom（自訂頁面）</option>
            </select>
          </div>

          {/* Slug（可編輯） */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">網址路徑 (slug) *</label>
            <input
              type="text"
              required
              pattern="[a-z0-9-]+"
              placeholder="about-us"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-zinc-500">
              只能使用小寫英文、數字和連字符（-）。頁面網址：/{slug || "..."}
            </p>
          </div>

          {/* 導覽列名稱 */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">導覽列名稱（中）*</label>
              <input
                type="text"
                required
                value={navLabel_zh}
                onChange={(e) => setNavLabel_zh(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">導覽列名稱（英）</label>
              <input
                type="text"
                value={navLabel_en}
                onChange={(e) => setNavLabel_en(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* 頁面標籤 */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">頁面標籤（中）</label>
              <input
                type="text"
                value={label_zh}
                onChange={(e) => setLabel_zh(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">頁面標籤（英）</label>
              <input
                type="text"
                value={label_en}
                onChange={(e) => setLabel_en(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* 標題 */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">頁面標題（中）*</label>
              <input
                type="text"
                required
                value={title_zh}
                onChange={(e) => setTitle_zh(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">頁面標題（英）</label>
              <input
                type="text"
                value={title_en}
                onChange={(e) => setTitle_en(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* 描述 */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">頁面描述（中）</label>
              <textarea
                rows={3}
                value={desc_zh}
                onChange={(e) => setDesc_zh(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">頁面描述（英）</label>
              <textarea
                rows={3}
                value={desc_en}
                onChange={(e) => setDesc_en(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* 設定 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showInNav}
                onChange={(e) => setShowInNav(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm">顯示在導航列</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm">立即啟用頁面</span>
            </label>
          </div>
        </div>

        {/* 第二部分：根據類型顯示完整編輯器 */}
        {selectedType === "ABOUT" && (
          <AboutInlineEditor data={pageContentData} onChange={setPageContentData} />
        )}

        {selectedType === "FACTORY" && (
          <FactoryInlineEditor data={pageContentData} onChange={setPageContentData} />
        )}

        {selectedType === "CONTACT" && (
          <ContactInlineEditor data={pageContentData} onChange={setPageContentData} />
        )}

        {selectedType === "CUSTOM" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <p className="text-sm text-blue-900">
              💡 CUSTOM 類型使用 Homepage Section 系統，建立後可在編輯頁面配置內容。
            </p>
          </div>
        )}

        {/* 提交按鈕 */}
        {selectedType && (
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-6">
            <Link
              href="/admin-v2/pages"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "建立中..." : "儲存並建立頁面"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

// About 完整內聯編輯器（包含所有欄位，包括圖片）
function AboutInlineEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      {/* 品牌故事 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">品牌故事</h2>
        <div className="mb-4">
          <label className="mb-2 block text-sm">圖片 URL</label>
          <input
            type="text"
            value={data.storyImage || ""}
            onChange={(e) => onChange({ ...data, storyImage: e.target.value })}
            placeholder="/cdn/about/studio.jpg"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-zinc-500">推薦尺寸: 800x600px 或更大</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">故事（中）</label>
            <textarea
              value={data.story_zh || ""}
              onChange={(e) => onChange({ ...data, story_zh: e.target.value })}
              rows={10}
              placeholder="輸入品牌故事..."
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 flex justify-between text-sm">
              <span>故事（英）</span>
              <TranslateButton sourceField="story_zh" targetField="story_en" />
            </label>
            <textarea
              value={data.story_en || ""}
              onChange={(e) => onChange({ ...data, story_en: e.target.value })}
              rows={10}
              placeholder="Enter brand story..."
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 核心價值 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">核心價值（3個）</h2>
        {data.values?.map((v: any, i: number) => (
          <div key={i} className="mb-4 rounded border p-3">
            <h3 className="mb-2 text-sm font-medium">價值 {i + 1}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs">標題（中）</label>
                <input
                  value={v.title_zh || ""}
                  onChange={(e) => {
                    const newValues = [...data.values];
                    newValues[i] = { ...newValues[i], title_zh: e.target.value };
                    onChange({ ...data, values: newValues });
                  }}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs">標題（英）</label>
                <input
                  value={v.title_en || ""}
                  onChange={(e) => {
                    const newValues = [...data.values];
                    newValues[i] = { ...newValues[i], title_en: e.target.value };
                    onChange({ ...data, values: newValues });
                  }}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs">說明（中）</label>
                <textarea
                  value={v.body_zh || ""}
                  onChange={(e) => {
                    const newValues = [...data.values];
                    newValues[i] = { ...newValues[i], body_zh: e.target.value };
                    onChange({ ...data, values: newValues });
                  }}
                  rows={2}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs">說明（英）</label>
                <textarea
                  value={v.body_en || ""}
                  onChange={(e) => {
                    const newValues = [...data.values];
                    newValues[i] = { ...newValues[i], body_en: e.target.value };
                    onChange({ ...data, values: newValues });
                  }}
                  rows={2}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 統計數據 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">統計數據（3個）</h2>
        {data.stats?.map((s: any, i: number) => (
          <div key={i} className="mb-3 grid gap-3 rounded border p-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs">標籤（中）</label>
              <input
                value={s.label_zh || ""}
                onChange={(e) => {
                  const newStats = [...data.stats];
                  newStats[i] = { ...newStats[i], label_zh: e.target.value };
                  onChange({ ...data, stats: newStats });
                }}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs">標籤（英）</label>
              <input
                value={s.label_en || ""}
                onChange={(e) => {
                  const newStats = [...data.stats];
                  newStats[i] = { ...newStats[i], label_en: e.target.value };
                  onChange({ ...data, stats: newStats });
                }}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs">數值</label>
              <input
                value={s.value || ""}
                onChange={(e) => {
                  const newStats = [...data.stats];
                  newStats[i] = { ...newStats[i], value: e.target.value };
                  onChange({ ...data, stats: newStats });
                }}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 經驗列表 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">經驗列表</h2>
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">標題（中）</label>
            <input
              value={data.experienceTitle_zh || ""}
              onChange={(e) => onChange({ ...data, experienceTitle_zh: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">標題（英）</label>
            <input
              value={data.experienceTitle_en || ""}
              onChange={(e) => onChange({ ...data, experienceTitle_en: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">列表（中）</label>
            <textarea
              value={data.experience_zh || ""}
              onChange={(e) => onChange({ ...data, experience_zh: e.target.value })}
              rows={5}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-zinc-500">每行一項，以 ・ 開頭</p>
          </div>
          <div>
            <label className="mb-2 flex justify-between text-sm">
              <span>列表（英）</span>
              <TranslateButton sourceField="experience_zh" targetField="experience_en" />
            </label>
            <textarea
              value={data.experience_en || ""}
              onChange={(e) => onChange({ ...data, experience_en: e.target.value })}
              rows={5}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Factory 完整內聯編輯器（包含所有欄位，特別是圖片）
function FactoryInlineEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      {/* 統計數據 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">工廠統計（4個）</h2>
        {data.stats?.map((s: any, i: number) => (
          <div key={i} className="mb-3 grid gap-3 rounded border p-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs">標籤（中）</label>
              <input
                value={s.label_zh || ""}
                onChange={(e) => {
                  const newStats = [...data.stats];
                  newStats[i] = { ...newStats[i], label_zh: e.target.value };
                  onChange({ ...data, stats: newStats });
                }}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs">標籤（英）</label>
              <input
                value={s.label_en || ""}
                onChange={(e) => {
                  const newStats = [...data.stats];
                  newStats[i] = { ...newStats[i], label_en: e.target.value };
                  onChange({ ...data, stats: newStats });
                }}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs">數值</label>
              <input
                value={s.value || ""}
                onChange={(e) => {
                  const newStats = [...data.stats];
                  newStats[i] = { ...newStats[i], value: e.target.value };
                  onChange({ ...data, stats: newStats });
                }}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 工廠圖片（重要！） */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">工廠圖片（3張）</h2>
        {data.images?.map((img: any, i: number) => (
          <div key={i} className="mb-4 rounded border p-3">
            <h3 className="mb-2 text-sm font-medium">圖片 {i + 1}</h3>
            <div className="mb-3">
              <label className="mb-1 block text-xs">圖片 URL *</label>
              <input
                value={img.url || ""}
                onChange={(e) => {
                  const newImages = [...data.images];
                  newImages[i] = { ...newImages[i], url: e.target.value };
                  onChange({ ...data, images: newImages });
                }}
                placeholder="/cdn/factory/floor.jpg"
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs">說明（中）</label>
                <input
                  value={img.caption_zh || ""}
                  onChange={(e) => {
                    const newImages = [...data.images];
                    newImages[i] = { ...newImages[i], caption_zh: e.target.value };
                    onChange({ ...data, images: newImages });
                  }}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs">說明（英）</label>
                <input
                  value={img.caption_en || ""}
                  onChange={(e) => {
                    const newImages = [...data.images];
                    newImages[i] = { ...newImages[i], caption_en: e.target.value };
                    onChange({ ...data, images: newImages });
                  }}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 設備和品控 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">設備與品質控制</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">設備（中）</label>
            <textarea
              value={data.equipment_zh || ""}
              onChange={(e) => onChange({ ...data, equipment_zh: e.target.value })}
              rows={6}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">設備（英）</label>
            <textarea
              value={data.equipment_en || ""}
              onChange={(e) => onChange({ ...data, equipment_en: e.target.value })}
              rows={6}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">品質控制（中）</label>
            <textarea
              value={data.qc_zh || ""}
              onChange={(e) => onChange({ ...data, qc_zh: e.target.value })}
              rows={6}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">品質控制（英）</label>
            <textarea
              value={data.qc_en || ""}
              onChange={(e) => onChange({ ...data, qc_en: e.target.value })}
              rows={6}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 工作流程（重要！） */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">工作流程（4步驟）</h2>
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">區塊標題（中）</label>
            <input
              value={data.workflowTitle_zh || ""}
              onChange={(e) => onChange({ ...data, workflowTitle_zh: e.target.value })}
              placeholder="從需求到出貨"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">區塊標題（英）</label>
            <input
              value={data.workflowTitle_en || ""}
              onChange={(e) => onChange({ ...data, workflowTitle_en: e.target.value })}
              placeholder="From brief to shipment"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
        {data.workflow?.map((w: any, i: number) => (
          <div key={i} className="mb-3 rounded border p-3">
            <h3 className="mb-2 text-sm font-medium">步驟 {i + 1}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs">標題（中）</label>
                <input
                  value={w.title_zh || ""}
                  onChange={(e) => {
                    const newWorkflow = [...data.workflow];
                    newWorkflow[i] = { ...newWorkflow[i], title_zh: e.target.value };
                    onChange({ ...data, workflow: newWorkflow });
                  }}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs">標題（英）</label>
                <input
                  value={w.title_en || ""}
                  onChange={(e) => {
                    const newWorkflow = [...data.workflow];
                    newWorkflow[i] = { ...newWorkflow[i], title_en: e.target.value };
                    onChange({ ...data, workflow: newWorkflow });
                  }}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs">說明（中）</label>
                <input
                  value={w.desc_zh || ""}
                  onChange={(e) => {
                    const newWorkflow = [...data.workflow];
                    newWorkflow[i] = { ...newWorkflow[i], desc_zh: e.target.value };
                    onChange({ ...data, workflow: newWorkflow });
                  }}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs">說明（英）</label>
                <input
                  value={w.desc_en || ""}
                  onChange={(e) => {
                    const newWorkflow = [...data.workflow];
                    newWorkflow[i] = { ...newWorkflow[i], desc_en: e.target.value };
                    onChange({ ...data, workflow: newWorkflow });
                  }}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">行動呼籲 (CTA)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">標題（中）</label>
            <input
              value={data.ctaTitle_zh || ""}
              onChange={(e) => onChange({ ...data, ctaTitle_zh: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">標題（英）</label>
            <input
              value={data.ctaTitle_en || ""}
              onChange={(e) => onChange({ ...data, ctaTitle_en: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">說明（中）</label>
            <input
              value={data.ctaDesc_zh || ""}
              onChange={(e) => onChange({ ...data, ctaDesc_zh: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">說明（英）</label>
            <input
              value={data.ctaDesc_en || ""}
              onChange={(e) => onChange({ ...data, ctaDesc_en: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Contact 完整內聯編輯器
function ContactInlineEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      {/* 表單標籤 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">表單標籤</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs">姓名（中）</label>
            <input
              value={data.formLabels?.name_zh || ""}
              onChange={(e) => onChange({ ...data, formLabels: { ...data.formLabels, name_zh: e.target.value } })}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs">姓名（英）</label>
            <input
              value={data.formLabels?.name_en || ""}
              onChange={(e) => onChange({ ...data, formLabels: { ...data.formLabels, name_en: e.target.value } })}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs">Email（中）</label>
            <input
              value={data.formLabels?.email_zh || ""}
              onChange={(e) => onChange({ ...data, formLabels: { ...data.formLabels, email_zh: e.target.value } })}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs">Email（英）</label>
            <input
              value={data.formLabels?.email_en || ""}
              onChange={(e) => onChange({ ...data, formLabels: { ...data.formLabels, email_en: e.target.value } })}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs">提交按鈕（中）</label>
            <input
              value={data.formLabels?.submit_zh || ""}
              onChange={(e) => onChange({ ...data, formLabels: { ...data.formLabels, submit_zh: e.target.value } })}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs">提交按鈕（英）</label>
            <input
              value={data.formLabels?.submit_en || ""}
              onChange={(e) => onChange({ ...data, formLabels: { ...data.formLabels, submit_en: e.target.value } })}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 聯絡資訊 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">聯絡資訊</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">標題（中）</label>
            <input
              value={data.contactDetails?.title_zh || ""}
              onChange={(e) => onChange({ ...data, contactDetails: { ...data.contactDetails, title_zh: e.target.value } })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">標題（英）</label>
            <input
              value={data.contactDetails?.title_en || ""}
              onChange={(e) => onChange({ ...data, contactDetails: { ...data.contactDetails, title_en: e.target.value } })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">Email</label>
            <input
              value={data.contactDetails?.email || ""}
              onChange={(e) => onChange({ ...data, contactDetails: { ...data.contactDetails, email: e.target.value } })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">WhatsApp</label>
            <input
              value={data.contactDetails?.whatsapp || ""}
              onChange={(e) => onChange({ ...data, contactDetails: { ...data.contactDetails, whatsapp: e.target.value } })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


