"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "../app/contexts/LanguageContext";
import { fireContactConversion, fireMetaContactEvent } from "@/lib/analytics";

type ContactButtonsSettings = {
  line: { enabled: boolean; url: string; label_zh: string; label_en: string };
  whatsapp: { enabled: boolean; number: string; label_zh: string; label_en: string };
  email: { enabled: boolean; address: string; label_zh: string; label_en: string };
};

const defaultSettings: ContactButtonsSettings = {
  line: { enabled: true, url: "https://lin.ee/JRPBhOm", label_zh: "LINE 詢價", label_en: "LINE Quote" },
  whatsapp: { enabled: true, number: "+886963581855", label_zh: "WhatsApp", label_en: "WhatsApp" },
  email: { enabled: true, address: "morningbeachtw@gmail.com", label_zh: "Email", label_en: "Email" },
};

export function FloatingQuoteButton() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [settings, setSettings] = useState<ContactButtonsSettings>(defaultSettings);
  const [isExpanded, setIsExpanded] = useState(false);

  // 不在後台顯示
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    fetch("/api/contact-buttons")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(console.error);
  }, []);

  const handleLineClick = () => {
    fireContactConversion();
    fireMetaContactEvent("Lead");
    window.open(settings.line.url, "_blank");
  };

  const handleWhatsAppClick = () => {
    const cleanNumber = settings.whatsapp.number.replace(/[^0-9+]/g, "");
    fireContactConversion();
    fireMetaContactEvent("Lead");
    window.open(`https://wa.me/${cleanNumber.replace("+", "")}`, "_blank");
  };

  const handleEmailClick = () => {
    fireContactConversion();
    fireMetaContactEvent("Lead");
    window.location.href = `mailto:${settings.email.address}`;
  };

  const enabledButtons = [
    settings.line.enabled && "line",
    settings.whatsapp.enabled && "whatsapp",
    settings.email.enabled && "email",
  ].filter(Boolean);

  // If only one button is enabled, show it directly
  if (enabledButtons.length === 1) {
    const singleButton = enabledButtons[0];
    return (
      <button
        onClick={
          singleButton === "line"
            ? handleLineClick
            : singleButton === "whatsapp"
            ? handleWhatsAppClick
            : handleEmailClick
        }
        className="fixed z-50 group transition-all duration-300 md:right-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:translate-x-0 right-4 bottom-4 w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
        aria-label="聯絡我們"
      >
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-full h-full rounded-full flex flex-col items-center justify-center gap-1">
          {singleButton === "line" && <LineIcon />}
          {singleButton === "whatsapp" && <WhatsAppIcon />}
          {singleButton === "email" && <EmailIcon />}
          <span className="text-xs font-medium leading-tight">
            {lang === "zh" ? "即時詢價" : "Get Quote"}
          </span>
        </div>
        <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full animate-ping opacity-20 -z-10"></div>
      </button>
    );
  }

  // Multiple buttons - show expandable menu
  return (
    <div className="fixed z-50 md:right-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto right-4 bottom-4 flex flex-col-reverse items-center gap-3">
      {/* Expanded buttons */}
      {isExpanded && (
        <div className="flex flex-col gap-3 mb-2 animate-in slide-in-from-bottom-2 duration-200">
          {/* Email Button */}
          {settings.email.enabled && (
            <button
              onClick={handleEmailClick}
              className="group relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              aria-label={lang === "zh" ? settings.email.label_zh : settings.email.label_en}
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-full h-full rounded-full flex items-center justify-center">
                <EmailIcon />
              </div>
              {/* Tooltip */}
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {lang === "zh" ? settings.email.label_zh : settings.email.label_en}
              </span>
            </button>
          )}

          {/* WhatsApp Button */}
          {settings.whatsapp.enabled && (
            <button
              onClick={handleWhatsAppClick}
              className="group relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              aria-label={lang === "zh" ? settings.whatsapp.label_zh : settings.whatsapp.label_en}
            >
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-full h-full rounded-full flex items-center justify-center">
                <WhatsAppIcon />
              </div>
              {/* Tooltip */}
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {lang === "zh" ? settings.whatsapp.label_zh : settings.whatsapp.label_en}
              </span>
            </button>
          )}

          {/* LINE Button */}
          {settings.line.enabled && (
            <button
              onClick={handleLineClick}
              className="group relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              aria-label={lang === "zh" ? settings.line.label_zh : settings.line.label_en}
            >
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-full h-full rounded-full flex items-center justify-center">
                <LineIcon />
              </div>
              {/* Tooltip */}
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {lang === "zh" ? settings.line.label_zh : settings.line.label_en}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative w-16 h-16 rounded-full shadow-xl transition-all duration-300"
        aria-label="聯絡我們"
      >
        <div
          className={`bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-full h-full rounded-full flex flex-col items-center justify-center gap-1 transition-transform duration-300 ${
            isExpanded ? "rotate-45" : ""
          }`}
        >
          {isExpanded ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className="text-[10px] font-medium leading-tight">
                {lang === "zh" ? "即時詢價" : "Quote"}
              </span>
            </>
          )}
        </div>
        {/* Pulse animation - only when collapsed */}
        {!isExpanded && (
          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full animate-ping opacity-20 -z-10"></div>
        )}
      </button>
    </div>
  );
}

function LineIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.630.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.032-.200.032-.199 0-.395-.081-.533-.229l-2.078-2.28v2.007c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.27.173-.51.432-.595.064-.021.134-.032.199-.032.197 0 .394.08.533.229l2.078 2.28V8.108c0-.345.282-.63.628-.63.348 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.630-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.630-.285-.630-.629V8.108c0-.345.285-.63.630-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.628-.629.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}