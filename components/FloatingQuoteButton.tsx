"use client";

import React from "react";
import { useLanguage } from "../app/contexts/LanguageContext";

export function FloatingQuoteButton() {
  const { language } = useLanguage();
  
  const handleClick = () => {
    window.open('https://lin.ee/JRPBhOm', '_blank');
  };

  const text = {
    zh: "即時詢價",
    en: "Get Quote"
  };

  return (
    <button
      onClick={handleClick}
      className="fixed z-50 group transition-all duration-300 md:right-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:translate-x-0 right-4 bottom-4 w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
      aria-label="即時詢價"
      style={{maxWidth: '100vw'}}
    >
      {/* Main button */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-full h-full rounded-full flex flex-col items-center justify-center gap-1">
        {/* LINE icon */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className="mb-1"
        >
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.630.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.032-.200.032-.199 0-.395-.081-.533-.229l-2.078-2.28v2.007c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.27.173-.51.432-.595.064-.021.134-.032.199-.032.197 0 .394.08.533.229l2.078 2.28V8.108c0-.345.282-.63.628-.63.348 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.630-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.630-.285-.630-.629V8.108c0-.345.285-.63.630-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.628-.629.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
        </svg>
        {/* Text */}
        <span className="text-xs font-medium leading-tight">
          即時詢價
        </span>
      </div>
      {/* Pulse animation - only on desktop */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full animate-ping opacity-20 -z-10"></div>
      {/* Glow effect - only on desktop */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
    </button>
  );
}