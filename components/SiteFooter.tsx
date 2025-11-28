"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";

type FooterData = {
  companyInfo: {
    taiwan: {
      name: string;
      taxId: string;
    };
    china: {
      name: string;
    };
  };
  addresses: {
    taiwan: string;
    china: string;
  };
  contact: {
    phone: string[];
    mobile: string;
    email: string;
  };
  clients: string[];
  qrCode: {
    enabled: boolean;
    url: string;
    imageUrl?: string;
    description: string;
  };
};

export function SiteFooter() {
  const { lang } = useLanguage();
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    fetch("/api/footer")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.footer) {
          setFooterData(data.footer);
        }
      })
      .catch(console.error);
  }, []);

  // 預設資料（如果 API 失敗）
  const defaultData: FooterData = {
    companyInfo: {
      taiwan: { name: "明日島嶼有限公司", taxId: "89188386" },
      china: { name: "天玎纸品包装有限公司" }
    },
    addresses: {
      taiwan: "台灣高雄市左營區立大路377巷6弄3號 (來訪請先預約)",
      china: "广东省深圳市龙岗区平湖镇峨公岭湖田路16号盈冠工业园1栋3楼"
    },
    contact: {
      phone: ["(07)3450928"],
      mobile: "0963581855",
      email: "morningbeachtw@gmail.com"
    },
    clients: [
      "碳佐麻里", "斑鳩的窩", "鮮乳坊", "喫茶小舖", "老牛皮La New", 
      "91app", "四皇國際有限公司", "誠品生活", "迪卡儂", "薰衣草森林",
      "新北市政府文化局", "余靜萍工作室有限公司", "統一棒球隊股份有限公司"
    ],
    qrCode: {
      enabled: true,
      url: "https://lin.ee/JRPBhOm",
      imageUrl: "https://img.mbpack.co/uploads/homepage/1764300510856-73b4be9a.png",
      description: "掃碼加 LINE 好友"
    }
  };

  const data = footerData || defaultData;

  // QR Code 圖片 URL (優先使用設定的圖片，否則使用預設)
  const qrCodeImageUrl = data.qrCode.imageUrl || "https://img.mbpack.co/uploads/homepage/1764300510856-73b4be9a.png";

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          
          {/* 公司資訊 */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900">
              {lang === 'zh' ? '公司資訊' : 'Company Info'}
            </h3>
            <div className="space-y-3 text-sm text-zinc-600">
              <div>
                <p className="font-medium text-zinc-900">
                  {lang === 'zh' ? '台灣' : 'Taiwan'}
                </p>
                <p>{data.companyInfo.taiwan.name}</p>
                <p>{lang === 'zh' ? '統編' : 'Tax ID'}｜{data.companyInfo.taiwan.taxId}</p>
              </div>
              <div>
                <p className="font-medium text-zinc-900">
                  {lang === 'zh' ? '中國' : 'China'}
                </p>
                <p>{data.companyInfo.china.name}</p>
              </div>
            </div>
          </div>

          {/* 地址資訊 */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900">
              {lang === 'zh' ? '地址' : 'Address'}
            </h3>
            <div className="space-y-3 text-sm text-zinc-600">
              <div>
                <p className="font-medium text-zinc-900">
                  {lang === 'zh' ? '台灣' : 'Taiwan'}
                </p>
                <p className="leading-relaxed">{data.addresses.taiwan}</p>
              </div>
              <div>
                <p className="font-medium text-zinc-900">
                  {lang === 'zh' ? '中國' : 'China'}
                </p>
                <p className="leading-relaxed">{data.addresses.china}</p>
              </div>
            </div>
          </div>

          {/* 聯絡方式 */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900">
              {lang === 'zh' ? '聯絡方式' : 'Contact'}
            </h3>
            <div className="space-y-2 text-sm text-zinc-600">
              <div>
                <p className="font-medium text-zinc-900">
                  {lang === 'zh' ? '電話' : 'Phone'}
                </p>
                {data.contact.phone.map((phone, index) => (
                  <p key={index}>
                    <a href={`tel:${phone}`} className="hover:text-zinc-900">
                      {phone}
                    </a>
                  </p>
                ))}
                <p>
                  <a href={`tel:${data.contact.mobile}`} className="hover:text-zinc-900">
                    {data.contact.mobile}
                  </a>
                </p>
              </div>
              <div>
                <p className="font-medium text-zinc-900">
                  {lang === 'zh' ? '信箱' : 'Email'}
                </p>
                <p>
                  <a 
                    href={`mailto:${data.contact.email}`} 
                    className="hover:text-zinc-900"
                  >
                    {data.contact.email}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {data.qrCode.enabled && (
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900">
                {lang === 'zh' ? '聯絡我們' : 'Contact Us'}
              </h3>
              <div className="text-center">
                <div className="inline-block rounded-lg bg-white p-3 shadow-sm">
                  <Image
                    src={qrCodeImageUrl}
                    alt="LINE QR Code"
                    width={120}
                    height={120}
                    className="rounded"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-600">{data.qrCode.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* 客戶 Logo 牆 */}
        <div className="mt-12 border-t border-zinc-200 pt-8">
          <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-zinc-900">
            {lang === 'zh' ? '我們的客戶' : 'Our Clients'}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {data.clients.map((client, index) => (
              <div
                key={index}
                className="flex h-12 items-center justify-center text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                {client}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-zinc-500">
            {lang === 'zh' 
              ? '等各公/私/產/官/學單位' 
              : 'And various public, private, industrial, government, and academic organizations'
            }
          </p>
        </div>

        {/* 版權資訊 */}
        <div className="mt-8 border-t border-zinc-200 pt-8 text-center">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-zinc-600">
              © 2025 MorningBeach. 
              {lang === 'zh' ? 'Custom gifting・Packaging・Bags' : 'Custom gifting・Packaging・Bags'}
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-xs text-zinc-400 hover:text-zinc-600"
              >
                Admin
              </Link>
              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-400">Powered by</span>
                <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}