"use client";

import { useState, useEffect } from "react";
import ImagePicker from "@/app/admin/components/ImagePicker";
import { useRouter } from "next/navigation";

// --- Types ---

type Copy = { en: string; zh: string };

interface LandingPageConfig {
  heroStyle: "style1" | "style2" | "style3" | "style4" | "style5";
  heroData: {
    headline: Copy;
    subheadline: Copy;
    support: Copy;
    videoUrl: string;
    backgroundImage: string;
    backgroundOpacity: number;
    overlayOpacity: number;
    galleryImages: string[];
  };
  selectedCaseIds: string[];
  trustedBy: {
    text: Copy;
    images: string[];
  };
  selectedBlogIds: string[];
  featuredProductCategory: "print-packaging" | "bag" | "gift" | "none"; // 新增：最新商品輪播的類別
  solutions: {
    image: string;
    imageOpacity: number;
    overlayOpacity: number;
    title: Copy;
    description: Copy;
    link: string;
  }[];
  services: {
    image: string;
    imageOpacity: number;
    overlayOpacity: number;
    title: Copy;
    description: Copy;
    aiPrompt: string;
  }[];
  aiSettings: {
    openaiKey: string;
    geminiKey: string;
  };
}

const HERO_STYLE_LABELS: Record<string, { name: string; desc: string }> = {
  style1: { name: "置中全屏", desc: "Video背景 + 文字置中" },
  style2: { name: "左右分割", desc: "左文字 + 右三圖" },
  style3: { name: "大標題", desc: "超大字體 + 簡潔佈局" },
  style4: { name: "卡片堆疊", desc: "文字卡片 + 背景圖" },
  style5: { name: "雙欄對比", desc: "左圖右文 + 漸層" },
};

const DEFAULT_SOLUTIONS = [
  {
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
    imageOpacity: 40,
    overlayOpacity: 50,
    title: { en: "Premium Gift Boxes", zh: "高級禮盒" },
    description: { en: "International paper stock, structural precision.", zh: "國際紙材、結構工程、精緻加工。" },
    link: "/catalog-tree/gift-box",
  },
  {
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    imageOpacity: 40,
    overlayOpacity: 50,
    title: { en: "Custom Bags", zh: "客製提袋" },
    description: { en: "Canvas, jute, premium paper bags.", zh: "帆布袋、麻布袋、高級紙袋。" },
    link: "/catalog-tree/bag",
  },
  {
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800",
    imageOpacity: 40,
    overlayOpacity: 50,
    title: { en: "Holiday Gifts", zh: "節慶禮盒" },
    description: { en: "Mid-autumn, New Year, multi-material sets.", zh: "中秋、年節、多材質禮品。" },
    link: "/catalog-tree/gift-box",
  },
  {
    image: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800",
    imageOpacity: 40,
    overlayOpacity: 50,
    title: { en: "Corporate Gifts", zh: "企業贈禮" },
    description: { en: "Large-volume stable production.", zh: "大批量穩定生產、文件合規。" },
    link: "/catalog-tree/gift-box",
  },
  {
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
    imageOpacity: 40,
    overlayOpacity: 50,
    title: { en: "Eco Packaging", zh: "環保包裝" },
    description: { en: "rPET, recycled papers, sustainable materials.", zh: "rPET、再生紙、永續材質。" },
    link: "/catalog-tree/print-packaging",
  },
];

const DEFAULT_SERVICES = [
  {
    image: "",
    imageOpacity: 30,
    overlayOpacity: 40,
    title: { en: "Premium Packaging Engineering", zh: "高級包裝工程" },
    description: { en: "Structural engineering for premium gift boxes and carrier bags.", zh: "高級禮盒、提袋、複合材料的結構工程與打樣。" },
    aiPrompt: "Premium luxury gift box packaging, elegant structural design, high-end materials, professional product photography, dark background",
  },
  {
    image: "",
    imageOpacity: 30,
    overlayOpacity: 40,
    title: { en: "Gift Set Manufacturing", zh: "禮贈品製造" },
    description: { en: "Holiday sets, corporate gifting, mixed-material packaging.", zh: "節慶禮盒、企業贈禮、複合材質套組製造。" },
    aiPrompt: "Holiday gift set packaging, corporate gifts, festive packaging design, multiple boxes arrangement, professional studio lighting",
  },
  {
    image: "",
    imageOpacity: 30,
    overlayOpacity: 40,
    title: { en: "Cross-Regional Production Management", zh: "跨區製造管理" },
    description: { en: "AI-assisted production + human supervision.", zh: "AI 協作與人工監督並行的跨國製造管理。" },
    aiPrompt: "Modern factory production line, packaging manufacturing, industrial automation, clean factory environment, professional industrial photography",
  },
];

const DEFAULT_CONFIG: LandingPageConfig = {
  heroStyle: "style1",
  heroData: {
    headline: { en: "AI-First Packaging Production Center", zh: "AI 驅動的國際包裝生產中心" },
    subheadline: { en: "Global packaging manufacturing powered by AI-driven workflows, unified material intelligence, and cross-regional production networks.", zh: "由 AI 工作流、材料資料庫、跨區製造網絡所驅動的全球包裝生產體系。" },
    support: { en: "From material decisions to sampling, from mass production to cross-border delivery — MBPACK integrates Taiwan service teams with Shenzhen/Wenzhou/Guangzhou factories into a single AI-accelerated production chain.", zh: "從材料選擇、打樣，到量產與跨境出貨 —— MBPACK 以 AI 串聯台灣服務團隊與深圳、溫州、廣州生產工廠，打造一條完整、快速的跨國供應鏈。" },
    videoUrl: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
    backgroundImage: "",
    backgroundOpacity: 100,
    overlayOpacity: 30,
    galleryImages: [
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=600",
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=600",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    ],
  },
  selectedCaseIds: [],
  trustedBy: { text: { zh: "科技,金融,美妝,文創,零售,餐飲,旅遊,禮品通路", en: "Tech,Finance,Beauty,Creative,Retail,F&B,Travel,Gift Channels" }, images: [] },
  selectedBlogIds: [],
  featuredProductCategory: "none", // 新增預設值
  solutions: DEFAULT_SOLUTIONS,
  services: DEFAULT_SERVICES,
  aiSettings: { openaiKey: "", geminiKey: "" },
};

// --- Main Component ---

export default function LandingEditorPage() {
  const [config, setConfig] = useState<LandingPageConfig>(DEFAULT_CONFIG);
  const [cases, setCases] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/landing-config");
      const data = await res.json();
      if (data.config && Object.keys(data.config).length > 0) {
        setConfig({ ...DEFAULT_CONFIG, ...data.config });
      }
      setCases(data.cases || []);
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error("Failed to fetch config", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      // Trigger revalidation of the landing page
      await fetch("/api/revalidate?path=/landing-v2", { method: "POST" });
      alert("Saved successfully!");
    } catch (error) {
      console.error("Failed to save", error);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof LandingPageConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-900 p-8 text-white">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Landing Page Editor</h1>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="rounded-full bg-emerald-500 px-6 py-2 font-bold text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* AI Settings - Gemini API Key with Lock */}
        <Section title="🔑 AI 圖片生成設定">
          <GeminiKeyInput 
            value={config.aiSettings.geminiKey}
            onChange={(v) => updateConfig("aiSettings", { ...config.aiSettings, geminiKey: v })}
          />
        </Section>

        {/* Hero Style */}
        <Section title="1. Hero Style">
          <div className="grid grid-cols-5 gap-4">
            {(["style1", "style2", "style3", "style4", "style5"] as const).map((style) => (
              <button
                key={style}
                onClick={() => updateConfig("heroStyle", style)}
                className={`rounded-xl border-2 p-4 transition ${
                  config.heroStyle === style
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-lg font-bold">{HERO_STYLE_LABELS[style].name}</span>
                  <span className="text-xs text-zinc-400">{HERO_STYLE_LABELS[style].desc}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-4">
             <div className="grid gap-4 md:grid-cols-2">
                <Input label="Headline (EN)" value={config.heroData.headline.en} onChange={(v) => updateConfig("heroData", {...config.heroData, headline: {...config.heroData.headline, en: v}})} />
                <Input label="Headline (ZH)" value={config.heroData.headline.zh} onChange={(v) => updateConfig("heroData", {...config.heroData, headline: {...config.heroData.headline, zh: v}})} />
             </div>
             <div className="grid gap-4 md:grid-cols-2">
                <Input label="Subheadline (EN)" value={config.heroData.subheadline.en} onChange={(v) => updateConfig("heroData", {...config.heroData, subheadline: {...config.heroData.subheadline, en: v}})} />
                <Input label="Subheadline (ZH)" value={config.heroData.subheadline.zh} onChange={(v) => updateConfig("heroData", {...config.heroData, subheadline: {...config.heroData.subheadline, zh: v}})} />
             </div>
             <div className="grid gap-4 md:grid-cols-2">
                <Input label="Support Text (EN)" value={config.heroData.support.en} onChange={(v) => updateConfig("heroData", {...config.heroData, support: {...config.heroData.support, en: v}})} />
                <Input label="Support Text (ZH)" value={config.heroData.support.zh} onChange={(v) => updateConfig("heroData", {...config.heroData, support: {...config.heroData.support, zh: v}})} />
             </div>
             <Input label="Video URL" value={config.heroData.videoUrl} onChange={(v) => updateConfig("heroData", {...config.heroData, videoUrl: v})} />
             
             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Background Image</label>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <ImagePicker 
                            value={config.heroData.backgroundImage} 
                            onChange={(url) => updateConfig("heroData", {...config.heroData, backgroundImage: url})} 
                            showUpload={true}
                        />
                    </div>
                    <AIGenerator 
                        config={config} 
                        onGenerate={(url) => updateConfig("heroData", {...config.heroData, backgroundImage: url})} 
                    />
                </div>
             </div>

             {/* Background Opacity */}
             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  背景圖亮度: {config.heroData.backgroundOpacity ?? 100}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.heroData.backgroundOpacity ?? 100}
                  onChange={(e) => updateConfig("heroData", {...config.heroData, backgroundOpacity: parseInt(e.target.value)})}
                  className="w-full accent-emerald-500"
                />
             </div>

             {/* Overlay Opacity */}
             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  遮罩深度: {config.heroData.overlayOpacity ?? 30}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={config.heroData.overlayOpacity ?? 30}
                  onChange={(e) => updateConfig("heroData", {...config.heroData, overlayOpacity: parseInt(e.target.value)})}
                  className="w-full accent-purple-500"
                />
                <p className="text-xs text-zinc-500">調整黑色遮罩深度（0%=無遮罩，建議 20-40% 以確保文字清晰）</p>
             </div>
             
             {/* Gallery Images for style2 */}
             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Gallery Images (for 左右分割 style)</label>
                <ImagePicker
                  multiple
                  multiValue={config.heroData.galleryImages || []}
                  onMultiChange={(urls) => updateConfig("heroData", {...config.heroData, galleryImages: urls.slice(0, 3)})}
                  showUpload={true}
                />
             </div>
          </div>
          
          {/* Hero Preview */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-bold text-emerald-400">Hero Preview</label>
              <span className="text-sm text-zinc-500">Current: {HERO_STYLE_LABELS[config.heroStyle].name}</span>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10" style={{ height: "400px" }}>
              <HeroPreview config={config} />
            </div>
          </div>
        </Section>

        {/* Case Studies */}
        <Section title="2. Case Studies">
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">Select cases to display on the landing page.</p>
            <div className="grid max-h-60 gap-2 overflow-y-auto rounded-xl border border-white/10 p-4">
              {cases.map((c) => (
                <label key={c.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={config.selectedCaseIds.includes(c.id)}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...config.selectedCaseIds, c.id]
                        : config.selectedCaseIds.filter((id) => id !== c.id);
                      updateConfig("selectedCaseIds", newIds);
                    }}
                    className="h-5 w-5 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="flex-1">{c.title_zh}</span>
                  {c.coverImage && (
                    <img src={c.coverImage} alt="" className="h-8 w-8 rounded object-cover" />
                  )}
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* Trusted By */}
        <Section title="3. Trusted By">
          <div className="space-y-6">
            <Input
              label="客戶名稱 (中文，逗號分隔)"
              value={config.trustedBy.text.zh}
              onChange={(v) =>
                updateConfig("trustedBy", { ...config.trustedBy, text: { ...config.trustedBy.text, zh: v } })
              }
            />
            <Input
              label="Brand Names (English, comma separated)"
              value={config.trustedBy.text.en}
              onChange={(v) =>
                updateConfig("trustedBy", { ...config.trustedBy, text: { ...config.trustedBy.text, en: v } })
              }
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Brand Logos (Max 10)</label>
              <ImagePicker
                multiple
                multiValue={config.trustedBy.images}
                onMultiChange={(urls) =>
                  updateConfig("trustedBy", { ...config.trustedBy, images: urls.slice(0, 10) })
                }
                showUpload={true}
              />
            </div>
          </div>
        </Section>

        {/* Featured Products Carousel - 最新商品輪播 */}
        <Section title="3.5 最新商品輪播">
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">選擇要在首頁展示的商品類別（隨機顯示該類別12項商品）</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "none", label: "不顯示", desc: "關閉商品輪播" },
                { value: "print-packaging", label: "包裝盒", desc: "紙器包裝、卡紙盒等" },
                { value: "bag", label: "提袋", desc: "帆布袋、紙袋、布袋等" },
                { value: "gift", label: "禮品", desc: "禁品、贈品、配件等" },
              ].map((option) => (
                <label 
                  key={option.value}
                  className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    config.featuredProductCategory === option.value
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-white/10 hover:border-white/30 bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="featuredProductCategory"
                    value={option.value}
                    checked={config.featuredProductCategory === option.value}
                    onChange={(e) => updateConfig("featuredProductCategory", e.target.value as any)}
                    className="sr-only"
                  />
                  <span className="text-lg font-medium">{option.label}</span>
                  <span className="text-xs text-zinc-500 mt-1 text-center">{option.desc}</span>
                  {config.featuredProductCategory === option.value && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full" />
                  )}
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* Blog */}
        <Section title="4. Blog Section">
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">Select blog posts to display.</p>
            <div className="grid max-h-60 gap-2 overflow-y-auto rounded-xl border border-white/10 p-4">
              {blogs.map((b) => (
                <label key={b.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={config.selectedBlogIds.includes(b.id)}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...config.selectedBlogIds, b.id]
                        : config.selectedBlogIds.filter((id) => id !== b.id);
                      updateConfig("selectedBlogIds", newIds);
                    }}
                    className="h-5 w-5 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="flex-1">{b.title}</span>
                  {b.coverImage && (
                    <img src={b.coverImage} alt="" className="h-8 w-8 rounded object-cover" />
                  )}
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* Services - 三大服務體系 */}
        <Section title="4.5 三大服務體系">
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => updateConfig("services", DEFAULT_SERVICES)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-zinc-400 hover:border-white/40 hover:text-white"
            >
              Reset to Defaults
            </button>
          </div>
          <div className="space-y-4">
            {(config.services || DEFAULT_SERVICES).map((svc, idx) => (
              <div key={idx} className="relative rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                  <div className="space-y-2">
                    <ImagePicker
                      value={svc.image}
                      onChange={(url) => {
                        const newSvcs = [...(config.services || DEFAULT_SERVICES)];
                        newSvcs[idx] = { ...newSvcs[idx], image: url };
                        updateConfig("services", newSvcs);
                      }}
                      showUpload={true}
                    />
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400">圖片亮度: {svc.imageOpacity ?? 30}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={svc.imageOpacity ?? 30}
                        onChange={(e) => {
                          const newSvcs = [...(config.services || DEFAULT_SERVICES)];
                          newSvcs[idx] = { ...newSvcs[idx], imageOpacity: parseInt(e.target.value) };
                          updateConfig("services", newSvcs);
                        }}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400">遮罩深度: {svc.overlayOpacity ?? 40}%</label>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={svc.overlayOpacity ?? 40}
                        onChange={(e) => {
                          const newSvcs = [...(config.services || DEFAULT_SERVICES)];
                          newSvcs[idx] = { ...newSvcs[idx], overlayOpacity: parseInt(e.target.value) };
                          updateConfig("services", newSvcs);
                        }}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    {/* AI Generate with Preset Prompt */}
                    <AIGeneratorWithPrompt
                      config={config}
                      defaultPrompt={svc.aiPrompt || ""}
                      onGenerate={(url) => {
                        const newSvcs = [...(config.services || DEFAULT_SERVICES)];
                        newSvcs[idx] = { ...newSvcs[idx], image: url };
                        updateConfig("services", newSvcs);
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Title (EN)"
                        value={svc.title.en}
                        onChange={(v) => {
                          const newSvcs = [...(config.services || DEFAULT_SERVICES)];
                          newSvcs[idx] = { ...newSvcs[idx], title: { ...newSvcs[idx].title, en: v } };
                          updateConfig("services", newSvcs);
                        }}
                      />
                      <Input
                        label="Title (ZH)"
                        value={svc.title.zh}
                        onChange={(v) => {
                          const newSvcs = [...(config.services || DEFAULT_SERVICES)];
                          newSvcs[idx] = { ...newSvcs[idx], title: { ...newSvcs[idx].title, zh: v } };
                          updateConfig("services", newSvcs);
                        }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Description (EN)"
                        value={svc.description.en}
                        onChange={(v) => {
                          const newSvcs = [...(config.services || DEFAULT_SERVICES)];
                          newSvcs[idx] = { ...newSvcs[idx], description: { ...newSvcs[idx].description, en: v } };
                          updateConfig("services", newSvcs);
                        }}
                      />
                      <Input
                        label="Description (ZH)"
                        value={svc.description.zh}
                        onChange={(v) => {
                          const newSvcs = [...(config.services || DEFAULT_SERVICES)];
                          newSvcs[idx] = { ...newSvcs[idx], description: { ...newSvcs[idx].description, zh: v } };
                          updateConfig("services", newSvcs);
                        }}
                      />
                    </div>
                    <Input
                      label="AI Prompt (一鍵生圖提示詞)"
                      value={svc.aiPrompt || ""}
                      onChange={(v) => {
                        const newSvcs = [...(config.services || DEFAULT_SERVICES)];
                        newSvcs[idx] = { ...newSvcs[idx], aiPrompt: v };
                        updateConfig("services", newSvcs);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Solutions */}
        <Section title="5. Product Solutions">
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => updateConfig("solutions", DEFAULT_SOLUTIONS)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-zinc-400 hover:border-white/40 hover:text-white"
            >
              Reset to Defaults
            </button>
          </div>
          <div className="space-y-4">
            {config.solutions.map((sol, idx) => (
              <div key={idx} className="relative rounded-xl border border-white/10 bg-white/5 p-4">
                <button
                  onClick={() => {
                    const newSols = [...config.solutions];
                    newSols.splice(idx, 1);
                    updateConfig("solutions", newSols);
                  }}
                  className="absolute right-4 top-4 text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
                <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                  <div className="space-y-2">
                    <ImagePicker
                      value={sol.image}
                      onChange={(url) => {
                        const newSols = [...config.solutions];
                        newSols[idx].image = url;
                        updateConfig("solutions", newSols);
                      }}
                      showUpload={true}
                    />
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400">圖片亮度: {sol.imageOpacity ?? 40}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sol.imageOpacity ?? 40}
                        onChange={(e) => {
                          const newSols = [...config.solutions];
                          newSols[idx].imageOpacity = parseInt(e.target.value);
                          updateConfig("solutions", newSols);
                        }}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400">遮罩深度: {sol.overlayOpacity ?? 50}%</label>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={sol.overlayOpacity ?? 50}
                        onChange={(e) => {
                          const newSols = [...config.solutions];
                          newSols[idx].overlayOpacity = parseInt(e.target.value);
                          updateConfig("solutions", newSols);
                        }}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <AIGenerator 
                        config={config} 
                        onGenerate={(url) => {
                            const newSols = [...config.solutions];
                            newSols[idx].image = url;
                            updateConfig("solutions", newSols);
                        }} 
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                        label="Title (EN)"
                        value={sol.title.en}
                        onChange={(v) => {
                            const newSols = [...config.solutions];
                            newSols[idx].title.en = v;
                            updateConfig("solutions", newSols);
                        }}
                        />
                        <Input
                        label="Title (ZH)"
                        value={sol.title.zh}
                        onChange={(v) => {
                            const newSols = [...config.solutions];
                            newSols[idx].title.zh = v;
                            updateConfig("solutions", newSols);
                        }}
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                        label="Description (EN)"
                        value={sol.description?.en || ""}
                        onChange={(v) => {
                            const newSols = [...config.solutions];
                            newSols[idx].description = { ...newSols[idx].description, en: v };
                            updateConfig("solutions", newSols);
                        }}
                        />
                        <Input
                        label="Description (ZH)"
                        value={sol.description?.zh || ""}
                        onChange={(v) => {
                            const newSols = [...config.solutions];
                            newSols[idx].description = { ...newSols[idx].description, zh: v };
                            updateConfig("solutions", newSols);
                        }}
                        />
                    </div>
                    <Input
                      label="Link URL"
                      value={sol.link}
                      onChange={(v) => {
                        const newSols = [...config.solutions];
                        newSols[idx].link = v;
                        updateConfig("solutions", newSols);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                updateConfig("solutions", [
                  ...config.solutions,
                  { image: "", imageOpacity: 40, overlayOpacity: 50, title: { en: "", zh: "" }, description: { en: "", zh: "" }, link: "" },
                ])
              }
              className="w-full rounded-xl border border-dashed border-white/20 py-4 text-center text-zinc-400 hover:border-emerald-500 hover:text-emerald-500"
            >
              + Add Solution
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

// --- Helper Components ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-black p-8 shadow-2xl ring-1 ring-white/10">
      <h2 className="mb-6 text-xl font-bold text-emerald-400">{title}</h2>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>
  );
}

// Gemini API Key Input with Lock functionality
function GeminiKeyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [isLocked, setIsLocked] = useState(!!value);
  const [inputValue, setInputValue] = useState("");

  const handleLock = () => {
    if (inputValue.trim()) {
      onChange(inputValue.trim());
      setIsLocked(true);
      setInputValue("");
    }
  };

  const handleUnlock = () => {
    if (confirm("確定要解鎖並清除 API Key 嗎？")) {
      onChange("");
      setIsLocked(false);
    }
  };

  if (isLocked && value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
        <span className="text-2xl">🔒</span>
        <div className="flex-1">
          <p className="font-medium text-emerald-400">Gemini API Key 已鎖定</p>
          <p className="text-sm text-zinc-400">Key: {value.substring(0, 8)}...{value.substring(value.length - 4)}</p>
        </div>
        <button
          onClick={handleUnlock}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
        >
          解鎖
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-400">輸入 Gemini API Key 以啟用 AI 圖片生成功能（使用 Gemini 2.0 Flash）</p>
      <div className="flex gap-2">
        <input
          type="password"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="輸入您的 Gemini API Key"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
        />
        <button
          onClick={handleLock}
          disabled={!inputValue.trim()}
          className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-black hover:bg-emerald-400 disabled:opacity-50"
        >
          🔐 鎖定
        </button>
      </div>
      <p className="text-xs text-zinc-500">提示：API Key 會儲存在設定中，登出後需重新輸入</p>
    </div>
  );
}

function AIGenerator({ config, onGenerate }: { config: LandingPageConfig; onGenerate: (url: string) => void }) {
    const [prompt, setPrompt] = useState("");
    const [generating, setGenerating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleGenerate = async () => {
        if (!config.aiSettings.geminiKey) {
            alert("請先在 AI 設定區塊輸入並鎖定 Gemini API Key");
            return;
        }
        setGenerating(true);
        try {
            // Call Gemini API for image generation
            const res = await fetch("/api/admin/gemini-generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apiKey: config.aiSettings.geminiKey,
                    prompt: prompt,
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || "生成失敗");
            
            onGenerate(data.url);
            setIsOpen(false);
            setPrompt("");
        } catch (e: any) {
            alert("生成失敗: " + e.message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 hover:bg-purple-500/20"
            >
                ✨ Generate with AI
            </button>
            {isOpen && (
                <div className="mt-2 space-y-2 rounded-lg border border-white/10 bg-black/50 p-3">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the image..."
                        className="w-full rounded border border-white/10 bg-transparent p-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                        rows={3}
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={generating || !prompt}
                        className="w-full rounded bg-purple-600 py-2 text-sm font-bold text-white hover:bg-purple-500 disabled:opacity-50"
                    >
                        {generating ? "Generating..." : "Generate"}
                    </button>
                </div>
            )}
        </>
    );
}

// AI Generator with Pre-filled Prompt (一鍵生圖) - Using Gemini
function AIGeneratorWithPrompt({ config, defaultPrompt, onGenerate }: { config: LandingPageConfig; defaultPrompt: string; onGenerate: (url: string) => void }) {
    const [prompt, setPrompt] = useState(defaultPrompt);
    const [generating, setGenerating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleGenerate = async () => {
        if (!config.aiSettings.geminiKey) {
            alert("請先在 AI 設定區塊輸入並鎖定 Gemini API Key");
            return;
        }
        if (!prompt) {
            alert("請輸入提示詞");
            return;
        }
        setGenerating(true);
        try {
            const res = await fetch("/api/admin/gemini-generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apiKey: config.aiSettings.geminiKey,
                    prompt: prompt,
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || "生成失敗");
            
            onGenerate(data.url);
            setIsOpen(false);
        } catch (e: any) {
            alert("生成失敗: " + e.message);
        } finally {
            setGenerating(false);
        }
    };

    // One-click generate with default prompt - Using Gemini
    const handleOneClick = async () => {
        if (!config.aiSettings.geminiKey) {
            alert("請先在 AI 設定區塊輸入並鎖定 Gemini API Key");
            return;
        }
        if (!defaultPrompt) {
            setIsOpen(true);
            return;
        }
        setPrompt(defaultPrompt);
        setGenerating(true);
        try {
            const res = await fetch("/api/admin/gemini-generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apiKey: config.aiSettings.geminiKey,
                    prompt: defaultPrompt,
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || "生成失敗");
            
            onGenerate(data.url);
        } catch (e: any) {
            alert("生成失敗: " + e.message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <button 
                    onClick={handleOneClick}
                    disabled={generating}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-sm font-bold text-white hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
                >
                    {generating ? "⏳ 生成中..." : "⚡ 一鍵生圖"}
                </button>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="rounded-lg border border-white/20 px-3 py-2 text-sm text-zinc-400 hover:border-white/40 hover:text-white"
                >
                    ✏️
                </button>
            </div>
            {isOpen && (
                <div className="space-y-2 rounded-lg border border-white/10 bg-black/50 p-3">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Edit AI prompt..."
                        className="w-full rounded border border-white/10 bg-transparent p-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                        rows={3}
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={generating || !prompt}
                        className="w-full rounded bg-purple-600 py-2 text-sm font-bold text-white hover:bg-purple-500 disabled:opacity-50"
                    >
                        {generating ? "Generating..." : "Generate with Custom Prompt"}
                    </button>
                </div>
            )}
        </div>
    );
}

// --- Hero Preview Component ---
function HeroPreview({ config }: { config: LandingPageConfig }) {
  const { heroStyle, heroData } = config;
  
  const galleryImages = heroData.galleryImages || [
    "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=600",
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=600",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
  ];

  // Style 1: Centered Full Screen with Video
  if (heroStyle === "style1") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroData.videoUrl ? (
            <video className="h-full w-full object-cover opacity-60" autoPlay loop muted playsInline poster={heroData.backgroundImage}>
              <source src={heroData.videoUrl} type="video/mp4" />
            </video>
          ) : heroData.backgroundImage ? (
            <div className="h-full w-full bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${heroData.backgroundImage})` }} />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-emerald-900/50 to-black" />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">MBPACK.CO</p>
          <h1 className="mt-2 text-xl font-bold text-white md:text-2xl">{heroData.headline.zh}</h1>
          <p className="mt-2 max-w-md text-xs text-white/80">{heroData.subheadline.zh}</p>
        </div>
      </div>
    );
  }

  // Style 2: Left Text + Right Gallery
  if (heroStyle === "style2") {
    return (
      <div className="relative flex h-full overflow-hidden bg-black p-4">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-0" />
        <div className="relative z-10 grid h-full w-full grid-cols-[1.2fr_0.8fr] gap-4 items-center">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">MBPACK.CO</p>
            <h1 className="text-lg font-bold text-white md:text-xl">{heroData.headline.zh}</h1>
            <p className="text-xs text-white/80">{heroData.subheadline.zh}</p>
          </div>
          <div className="flex flex-col gap-2">
            {galleryImages.slice(0, 3).map((src, i) => (
              <div key={i} className="relative h-20 overflow-hidden rounded-xl border border-white/10">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Style 3: Giant Title
  if (heroStyle === "style3") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">MBPACK.CO</p>
          <h1 className="mt-2 text-3xl font-black tracking-tighter text-white md:text-4xl">{heroData.headline.zh}</h1>
          <p className="mx-auto mt-2 max-w-sm text-xs text-white/60">{heroData.subheadline.zh}</p>
        </div>
      </div>
    );
  }

  // Style 4: Card Stack
  if (heroStyle === "style4") {
    const bgOpacity = (heroData as any).backgroundOpacity ?? 100;
    const overlayOpacity = (heroData as any).overlayOpacity ?? 30;
    return (
      <div className="relative h-full overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          {heroData.backgroundImage ? (
            <img src={heroData.backgroundImage} alt="" className="h-full w-full object-cover" style={{ opacity: bgOpacity / 100 }} />
          ) : galleryImages[0] ? (
            <img src={galleryImages[0]} alt="" className="h-full w-full object-cover" style={{ opacity: bgOpacity / 100 }} />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-black" />
          )}
          {/* 可控制的遮罩 */}
          <div 
            className="absolute inset-0" 
            style={{ background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity/100}), transparent, rgba(0,0,0,${overlayOpacity/100 + 0.2}))` }}
          />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center p-4">
          <div className="max-w-sm rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">MBPACK.CO</p>
            <h1 className="mt-2 text-center text-lg font-bold text-white">{heroData.headline.zh}</h1>
            <p className="mt-2 text-center text-xs text-white/80">{heroData.subheadline.zh}</p>
          </div>
        </div>
      </div>
    );
  }

  // Style 5: Two Column
  if (heroStyle === "style5") {
    return (
      <div className="relative h-full overflow-hidden bg-black">
        <div className="grid h-full grid-cols-2">
          <div className="relative">
            {heroData.backgroundImage ? (
              <img src={heroData.backgroundImage} alt="" className="h-full w-full object-cover" />
            ) : galleryImages[0] ? (
              <img src={galleryImages[0]} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-emerald-900/30 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black" />
          </div>
          <div className="flex items-center p-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">MBPACK.CO</p>
              <h1 className="text-lg font-bold text-white">{heroData.headline.zh}</h1>
              <p className="text-xs text-white/80">{heroData.subheadline.zh}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="flex h-full items-center justify-center text-zinc-500">Select a style</div>;
}
