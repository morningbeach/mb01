"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "zh";
type Region = "TW" | "INTL";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  region: Region;
  isTaiwan: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 讀取 cookie 的輔助函數
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) {
      return value;
    }
  }
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region>("INTL"); // 預設境外（英文）
  const [lang, setLangState] = useState<Language>("en"); // 預設英文
  const [initialized, setInitialized] = useState(false);

  // 初始化時讀取地區 cookie
  useEffect(() => {
    const checkRegion = () => {
      const geoRegion = getCookie("geo-region");
      console.log("[GeoRegion] Cookie value:", geoRegion); // 除錯用
      
      // 檢查是否為本地開發環境
      const isLocal = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      if (isLocal || geoRegion === "TW") {
        // 偵測到台灣或本地端 → 顯示中文，可切換
        setRegion("TW");
        if (!initialized) {
          setLangState("zh"); // 台灣/本地端預設中文
        }
      } else {
        // INTL 或沒有 cookie → 預設境外，強制英文
        setRegion("INTL");
        setLangState("en"); // 境外強制英文
      }
      setInitialized(true);
    };
    
    // 立即執行一次
    checkRegion();
    
    // 稍後再執行一次（確保 cookie 已被設定）
    const timer = setTimeout(checkRegion, 100);
    return () => clearTimeout(timer);
  }, []);

  // 設定語言的函數（境外用戶無法切換到中文）
  const setLang = (newLang: Language) => {
    if (region === "INTL" && newLang === "zh") {
      // 境外用戶不允許切換到中文
      return;
    }
    setLangState(newLang);
  };

  const isTaiwan = region === "TW";

  return (
    <LanguageContext.Provider value={{ lang, setLang, region, isTaiwan }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // 提供後備值：預設英文（境外）
    return { lang: "en" as Language, setLang: () => {}, region: "INTL" as Region, isTaiwan: false };
  }
  return context;
}
