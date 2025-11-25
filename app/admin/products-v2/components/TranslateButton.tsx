// app/admin/products-v2/components/TranslateButton.tsx
"use client";

import { useState } from "react";

interface TranslateButtonProps {
  text: string;
  from: "en" | "zh";
  to: "en" | "zh";
  onTranslated: (translatedText: string) => void;
  context?: string;
  disabled?: boolean;
}

export function TranslateButton({
  text,
  from,
  to,
  onTranslated,
  context,
  disabled,
}: TranslateButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text || !text.trim() || disabled) return;

    setLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to, context }),
      });

      const data = await response.json();

      if (data.success && data.translatedText) {
        onTranslated(data.translatedText);
      } else {
        alert(data.error || "翻譯失敗");
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("翻譯請求失敗");
    } finally {
      setLoading(false);
    }
  };

  const label = to === "zh" ? "翻譯成中文" : "Translate to EN";
  const icon = to === "zh" ? "🇹🇼" : "🇺🇸";

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={disabled || loading || !text?.trim()}
      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
      title={label}
    >
      {loading ? (
        <>
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
          翻譯中...
        </>
      ) : (
        <>
          <span>{icon}</span>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
