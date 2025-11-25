// app/admin/products-v2/components/BilingualInput.tsx
"use client";

import { TranslateButton } from "./TranslateButton";

interface BilingualInputProps {
  label: string;
  name: string; // 例如 "name", "shortDesc"
  valueEn: string;
  valueZh: string;
  onChangeEn: (value: string) => void;
  onChangeZh: (value: string) => void;
  type?: "text" | "textarea";
  required?: boolean;
  placeholder?: { en?: string; zh?: string };
  context?: string; // 翻譯上下文
}

export function BilingualInput({
  label,
  name,
  valueEn,
  valueZh,
  onChangeEn,
  onChangeZh,
  type = "text",
  required = false,
  placeholder,
  context,
}: BilingualInputProps) {
  const InputComponent = type === "textarea" ? "textarea" : "input";

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {/* 英文輸入 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">🇺🇸 English</span>
          {valueEn && (
            <TranslateButton
              text={valueEn}
              from="en"
              to="zh"
              onTranslated={onChangeZh}
              context={context}
            />
          )}
        </div>
        <InputComponent
          name={`${name}_en`}
          value={valueEn}
          onChange={(e) => onChangeEn(e.target.value)}
          placeholder={placeholder?.en || `Enter ${label} in English`}
          required={required}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
          {...(type === "textarea" && { rows: 4 })}
        />
      </div>

      {/* 中文輸入 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">🇹🇼 繁體中文</span>
          {valueZh && (
            <TranslateButton
              text={valueZh}
              from="zh"
              to="en"
              onTranslated={onChangeEn}
              context={context}
            />
          )}
        </div>
        <InputComponent
          name={`${name}_zh`}
          value={valueZh}
          onChange={(e) => onChangeZh(e.target.value)}
          placeholder={placeholder?.zh || `輸入${label}（中文）`}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
          {...(type === "textarea" && { rows: 4 })}
        />
      </div>
    </div>
  );
}
