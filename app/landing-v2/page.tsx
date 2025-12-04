import { prisma } from "@/lib/prisma";
import LandingPageClient from "./LandingPageClient";

// Default config matching the one in Admin Editor
const DEFAULT_CONFIG = {
  heroStyle: "style1",
  heroData: {
    headline: { en: "AI-First Packaging Production Center", zh: "AI 驅動的國際包裝生產中心" },
    subheadline: {
      en: "Global packaging manufacturing powered by AI-driven workflows, unified material intelligence, and cross-regional production networks.",
      zh: "由 AI 工作流、材料資料庫、跨區製造網絡所驅動的全球包裝生產體系。",
    },
    support: {
      en: "From material decisions to sampling, from mass production to cross-border delivery — MBPACK integrates Taiwan service teams with Shenzhen/Wenzhou/Guangzhou factories into a single AI-accelerated production chain.",
      zh: "從材料選擇、打樣，到量產與跨境出貨 —— MBPACK 以 AI 串聯台灣服務團隊與深圳、溫州、廣州生產工廠，打造一條完整、快速的跨國供應鏈。",
    },
    videoUrl: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
    backgroundImage: "",
    galleryImages: [],
  },
  selectedCaseIds: [],
  trustedBy: { text: "", images: [] },
  selectedBlogIds: [],
  solutions: [],
  aiSettings: { openaiKey: "", geminiKey: "" },
};

export const dynamic = "force-dynamic"; // Always fetch fresh data
export const revalidate = 0; // Disable caching

export default async function LandingPageV2() {
  // Fetch Config
  const configRecord = await prisma.siteSetting.findUnique({
    where: { key: "landing-v2-config" },
  });

  const config = configRecord?.value 
    ? { ...DEFAULT_CONFIG, ...(configRecord.value as any) } 
    : DEFAULT_CONFIG;

  // Fetch Cases
  const cases = await prisma.caseProject.findMany({
    where: { isPublished: true },
    select: { id: true, title_zh: true, coverImage: true, slug: true },
    orderBy: { createdAt: "desc" },
  });

  // Fetch Blogs
  const blogs = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { id: true, title: true, coverImage: true, slug: true },
    orderBy: { createdAt: "desc" },
  });

  return <LandingPageClient config={config} cases={cases} blogs={blogs} />;
}
