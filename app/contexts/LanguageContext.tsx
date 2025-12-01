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
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region>("TW"); // 預設台灣
  const [lang, setLangState] = useState<Language>("zh");

  // 初始化時讀取地區 cookie
  useEffect(() => {
    const geoRegion = getCookie("geo-region");
    if (geoRegion === "INTL") {
      setRegion("INTL");
      setLangState("en"); // 境外強制英文
    } else {
      setRegion("TW");
      setLangState("zh"); // 台灣預設中文
    }
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
    // 提供後備值而不是拋出錯誤
    return { lang: "zh" as Language, setLang: () => {}, region: "TW" as Region, isTaiwan: true };
  }
  return context;
}
