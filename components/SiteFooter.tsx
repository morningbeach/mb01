"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import ContactForm from "@/app/contact/ContactForm";

type FooterData = {
  id?: string;
  companyInfo: {
    taiwan: {
      name: string;
      nameEn: string;
      taxId: string;
    };
    china: {
      name: string;
      nameEn: string;
    };
  };
  addresses: {
    taiwan: string;
    taiwanEn: string;
    china: string;
    chinaEn: string;
  };
  contact: {
    phone: string[];
    mobile: string;
    email: string;
  };
  clientLogos: Array<{
    id: string;
    url: string;
    name: string;
  }>;
  qrCodes: {
    line: {
      enabled: boolean;
      url: string;
      imageUrl: string;
      description: string;
      descriptionEn: string;
    };
    whatsapp: {
      enabled: boolean;
      url: string;
      imageUrl: string;
      description: string;
      descriptionEn: string;
    };
  };
  socialLinks: {
    youtube: string;
    pinterest: string;
    instagram: string;
    facebook: string;
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
      taiwan: { 
        name: "明日島嶼有限公司", 
        nameEn: "Morning Beach Co., Ltd.",
        taxId: "89188386" 
      },
      china: { 
        name: "天玎纸品包装有限公司",
        nameEn: "Tianding Paper Packaging Co., Ltd."
      }
    },
    addresses: {
      taiwan: "台灣高雄市左營區立大路377巷6弄3號 (來訪請先預約)",
      taiwanEn: "No. 3, Aly. 6, Ln. 377, Lida Rd., Zuoying Dist., Kaohsiung City, Taiwan (By appointment only)",
      china: "广东省深圳市龙岗区平湖镇峨公岭湖田路16号盈冠工业园1栋3楼",
      chinaEn: "3F, Building 1, Yingguan Industrial Park, No.16 Hutian Road, Egongling, Pinghu Town, Longgang District, Shenzhen, Guangdong, China"
    },
    contact: {
      phone: ["(07)3450928"],
      mobile: "0963581855",
      email: "morningbeachtw@gmail.com"
    },
    clientLogos: [],
    qrCodes: {
      line: {
        enabled: true,
        url: "https://lin.ee/JRPBhOm",
        imageUrl: "https://img.mbpack.co/uploads/1764581109210-2d829e59.png",
        description: "掃碼加 LINE 好友",
        descriptionEn: "Scan to add LINE friend"
      },
      whatsapp: {
        enabled: true,
        url: "https://wa.me/886963581855",
        imageUrl: "",
        description: "掃碼聯絡 WhatsApp",
        descriptionEn: "Scan to contact via WhatsApp"
      }
    },
    socialLinks: {
      youtube: "",
      pinterest: "",
      instagram: "",
      facebook: ""
    }
  };

  const data = footerData || defaultData;

  // 根據語言選擇顯示哪個 QR Code
  const qrCode = lang === 'zh' ? data.qrCodes?.line : data.qrCodes?.whatsapp;
  const qrCodeEnabled = qrCode?.enabled;
  const qrCodeImageUrl = qrCode?.imageUrl;
  const qrCodeDescription = lang === 'zh' ? qrCode?.description : qrCode?.descriptionEn;
  const qrCodeLabel = lang === 'zh' ? 'LINE' : 'WhatsApp';

  // 社群連結圖示
  const SocialIcon = ({ type }: { type: 'youtube' | 'pinterest' | 'instagram' | 'facebook' }) => {
    const icons = {
      youtube: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      pinterest: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
        </svg>
      ),
      instagram: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      facebook: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    };
    return icons[type];
  };

  // 社群連結（有值才顯示）
  const socialLinks = data.socialLinks || {};
  const hasSocialLinks = Object.values(socialLinks).some(v => v && v.trim());

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
                <p>{lang === 'zh' ? data.companyInfo.taiwan.name : data.companyInfo.taiwan.nameEn}</p>
                <p>{lang === 'zh' ? '統編' : 'Tax ID'}｜{data.companyInfo.taiwan.taxId}</p>
              </div>
              <div>
                <p className="font-medium text-zinc-900">
                  {lang === 'zh' ? '中國' : 'China'}
                </p>
                <p>{lang === 'zh' ? data.companyInfo.china.name : data.companyInfo.china.nameEn}</p>
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
                <p className="leading-relaxed">
                  {lang === 'zh' ? data.addresses.taiwan : data.addresses.taiwanEn}
                </p>
              </div>
              <div>
                <p className="font-medium text-zinc-900">
                  {lang === 'zh' ? '中國' : 'China'}
                </p>
                <p className="leading-relaxed">
                  {lang === 'zh' ? data.addresses.china : data.addresses.chinaEn}
                </p>
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
                  Phone / WhatsApp / LINE
                </p>
                <p>
                  <span className="text-zinc-500 text-xs">Taiwan: </span>
                  <a href="tel:+88673450928" className="hover:text-zinc-900">
                    +886-7-345-0928
                  </a>
                </p>
                <p>
                  <span className="text-zinc-500 text-xs">Mobile: </span>
                  <a href="tel:+886963581855" className="hover:text-zinc-900">
                    +886-963-581-855
                  </a>
                </p>
                <p>
                  <span className="text-zinc-500 text-xs">China: </span>
                  <a href="tel:+861992872496" className="hover:text-zinc-900">
                    +86-199-2872-496
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
              
              {/* 社群連結 */}
              {hasSocialLinks && (
                <div className="pt-3">
                  <p className="font-medium text-zinc-900 mb-2">
                    {lang === 'zh' ? '社群媒體' : 'Social Media'}
                  </p>
                  <div className="flex gap-3">
                    {socialLinks.youtube && (
                      <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-red-600 transition-colors">
                        <SocialIcon type="youtube" />
                      </a>
                    )}
                    {socialLinks.pinterest && (
                      <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-red-500 transition-colors">
                        <SocialIcon type="pinterest" />
                      </a>
                    )}
                    {socialLinks.instagram && (
                      <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-pink-600 transition-colors">
                        <SocialIcon type="instagram" />
                      </a>
                    )}
                    {socialLinks.facebook && (
                      <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-600 transition-colors">
                        <SocialIcon type="facebook" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR Code - 根據語言顯示 LINE 或 WhatsApp */}
          {qrCodeEnabled && qrCodeImageUrl && (
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900">
                {lang === 'zh' ? '聯絡我們' : 'Contact Us'}
              </h3>
              <div className="text-center">
                <div className="inline-block rounded-lg bg-white p-3 shadow-sm">
                  <Image
                    src={qrCodeImageUrl}
                    alt={`${qrCodeLabel} QR Code`}
                    width={120}
                    height={120}
                    className="rounded"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-600">{qrCodeDescription}</p>
                <p className="text-xs text-zinc-400">{qrCodeLabel}</p>
              </div>
            </div>
          )}
        </div>

        {/* 詢價表單區塊 */}
        <div className="mt-12 border-t border-zinc-200 pt-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">
                {lang === 'zh' ? '📦 立即詢價' : '📦 Request a Quote'}
              </h3>
              <p className="text-zinc-600">
                {lang === 'zh' 
                  ? '填寫表單，我們將在 24 小時內回覆您' 
                  : 'Fill out the form and we\'ll respond within 24 hours'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 shadow-lg">
              <ContactForm 
                variant="full" 
                source="footer-form"
              />
            </div>
          </div>
        </div>

        {/* 客戶 Logo 牆 */}
        {data.clientLogos && data.clientLogos.length > 0 && (
          <div className="mt-12 border-t border-zinc-200 pt-8">
            <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-zinc-900">
              {lang === 'zh' ? '我們的客戶' : 'Our Clients'}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {data.clientLogos.map((logo) => (
                <div
                  key={logo.id}
                  className="relative h-12 w-24 grayscale hover:grayscale-0 transition-all"
                  title={logo.name}
                >
                  <Image
                    src={logo.url}
                    alt={logo.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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