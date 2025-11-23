"use client";

import { useState } from "react";

interface TranslateButtonProps {
  sourceField: string;
  targetField: string;
}

export function TranslateButton({ sourceField, targetField }: TranslateButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const sourceInput = document.querySelector(`[name="${sourceField}"]`) as HTMLInputElement | HTMLTextAreaElement;
      const targetInput = document.querySelector(`[name="${targetField}"]`) as HTMLInputElement | HTMLTextAreaElement;

      if (!sourceInput || !targetInput) {
        alert("找不到輸入框");
        return;
      }

      const sourceText = sourceInput.value.trim();
      if (!sourceText) {
        alert("來源文字不能為空");
        return;
      }

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          from: "zh",
          to: "en",
        }),
      });

      const data = await response.json();

      if (data.success) {
        targetInput.value = data.translatedText;
        targetInput.focus();
      } else {
        alert(data.error || "翻譯失敗");
      }
    } catch (error) {
      console.error("翻譯錯誤:", error);
      alert("翻譯時發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={loading}
      className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "翻譯中..." : "🌐 翻譯"}
    </button>
  );
}
