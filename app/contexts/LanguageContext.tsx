"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "zh";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 初始狀態：優先從 URL 讀取，其次從 localStorage，預設 "en"
  const [lang, setLangState] = useState<Language>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  // 初始化時從 URL 或 localStorage 讀取語言
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    const storedLang = localStorage.getItem("lang");
    
    if (urlLang === "zh" || urlLang === "en") {
      setLangState(urlLang);
      localStorage.setItem("lang", urlLang);
    } else if (storedLang === "zh" || storedLang === "en") {
      setLangState(storedLang);
    }
    setIsHydrated(true);
  }, []);

  // 設置語言時同時保存到 localStorage
  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // 提供後備值而不是拋出錯誤
    return { lang: "en" as Language, setLang: () => {} };
  }
  return context;
}
