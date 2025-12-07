// app/ai-share/[token]/page.tsx
// AI 設計分享頁面 - 首頁背景 + 彈窗覆蓋
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import AiSharePageClient from "./AiSharePageClient";

// Default config matching the homepage
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

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

// Generate metadata for OG image preview
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  
  const usageLog = await prisma.aiUsageLog.findUnique({
    where: { shareToken: token },
    include: {
      product: {
        select: { name_zh: true, name_en: true },
      },
    },
  });
  
  if (!usageLog || !usageLog.resultUrl) {
    return {
      title: "AI 包裝設計",
      description: "清晨沙灘 AI 包裝工廠",
    };
  }
  
  const title = usageLog.product?.name_zh 
    ? `${usageLog.product.name_zh} - AI 包裝設計`
    : "AI 包裝設計作品";
  
  const description = usageLog.prompt 
    ? `${usageLog.prompt.substring(0, 100)}...`
    : "由 AI 生成的包裝設計作品 | mbpack.co 清晨沙灘 AI包裝工廠";
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: usageLog.resultUrl,
          width: 1024,
          height: 1024,
          alt: title,
        },
      ],
      type: "website",
      siteName: "MBPACK 清晨沙灘 AI包裝工廠",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [usageLog.resultUrl],
    },
  };
}

export default async function AiSharePage({ params }: PageProps) {
  const { token } = await params;
  
  if (!token) {
    notFound();
  }
  
  // 取得分享資料
  const usageLog = await prisma.aiUsageLog.findUnique({
    where: {
      shareToken: token,
    },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          name_zh: true,
          name_en: true,
          coverImage: true,
        },
      },
    },
  });
  
  if (!usageLog || !usageLog.resultUrl) {
    notFound();
  }
  
  // 取得首頁設定
  const configRecord = await prisma.siteSetting.findUnique({
    where: { key: "landing-v2-config" },
  });
  
  const config = configRecord?.value 
    ? { ...DEFAULT_CONFIG, ...(configRecord.value as any) } 
    : DEFAULT_CONFIG;
  
  // 取得 Cases 和 Blogs
  const [cases, blogs] = await Promise.all([
    prisma.caseProject.findMany({
      where: { isPublished: true },
      select: { id: true, title_zh: true, coverImage: true, slug: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, coverImage: true, slug: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  
  const shareData = {
    resultUrl: usageLog.resultUrl,
    prompt: usageLog.prompt,
    createdAt: usageLog.createdAt.toISOString(),
    product: usageLog.product,
  };
  
  return (
    <AiSharePageClient 
      config={config} 
      cases={cases} 
      blogs={blogs}
      shareData={shareData}
    />
  );
}
