"use client";

import { useEffect, useState } from "react";

type ImageInputFieldProps = {
  /** 真正要送到後端的 input name，例如 "coverImage" */
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
};

type ImageAssetItem = {
  id: string;
  url: string;
  label?: string | null;
};

export function ImageInputField({
  name,
  label = "Image",
  placeholder = "https://...",
  defaultValue = "",
}: ImageInputFieldProps) {
  const [mode, setMode] = useState<"upload" | "url" | "library">("upload");
  const [value, setValue] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const [library, setLibrary] = useState<ImageAssetItem[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  async function loadLibrary() {
    if (library.length > 0) return;
    setIsLibraryLoading(true);
    try {
      const res = await fetch("/api/admin/images");
      if (!res.ok) throw new Error("Failed to load images");
      const data = await res.json();
      setLibrary((data.images ?? []) as ImageAssetItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLibraryLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Upload failed");
        return;
      }

      const data = await res.json();
      if (data.url) {
        setValue(data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-700">{label}</label>
          <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-[11px]">
            <button
              type="button"
              className={
                "px-2 py-0.5 rounded-full " +
                (mode === "upload" ? "bg-white shadow-sm" : "text-zinc-500")
              }
              onClick={() => setMode("upload")}
            >
              Upload
            </button>
            <button
              type="button"
              className={
                "px-2 py-0.5 rounded-full " +
                (mode === "url" ? "bg-white shadow-sm" : "text-zinc-500")
              }
              onClick={() => setMode("url")}
            >
              URL
            </button>
            <button
              type="button"
              className={
                "px-2 py-0.5 rounded-full " +
                (mode === "library" ? "bg-white shadow-sm" : "text-zinc-500")
              }
              onClick={() => {
                setMode("library");
                loadLibrary();
              }}
            >
              Library
            </button>
          </div>
        </div>
      )}

      {/* 真正送給 /api/admin/products/create 的值 */}
      <input type="hidden" name={name} value={value} />

      {/* 目前選定的圖片預覽 */}
      {value && (
        <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
          <div className="h-16 w-16 overflow-hidden rounded-md bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 break-all text-[11px] text-zinc-600">
            {value}
          </div>
        </div>
      )}

      {/* 三種模式 */}

      {mode === "upload" && (
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-900 file:px-3 file:py-1 file:text-xs file:font-medium file:text-white hover:file:bg-zinc-800"
          />
          {isUploading && (
            <p className="text-[11px] text-zinc-500">Uploading…</p>
          )}
        </div>
      )}

      {mode === "url" && (
        <div className="space-y-1">
          <input
            type="text"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <p className="text-[11px] text-zinc-500">
            支援外部圖床 URL 或本站 /cdn、/uploads 開頭的路徑。
          </p>
        </div>
      )}

      {mode === "library" && (
        <div className="space-y-2">
          {isLibraryLoading && (
            <p className="text-[11px] text-zinc-500">Loading library…</p>
          )}

          {!isLibraryLoading && library.length === 0 && (
            <p className="text-[11px] text-zinc-500">
              圖庫目前是空的，可以先透過 Upload 建立一些圖。
            </p>
          )}

          {!isLibraryLoading && library.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {library.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setValue(img.url)}
                  className={
                    "group flex flex-col items-center gap-1 rounded-lg border p-1.5 " +
                    (value === img.url
                      ? "border-zinc-900 bg-zinc-900/5"
                      : "border-zinc-200 bg-white hover:border-zinc-400")
                  }
                >
                  <div className="h-16 w-full overflow-hidden rounded-md bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.label ?? ""}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <span className="line-clamp-1 w-full text-center text-[10px] text-zinc-600">
                    {img.label ?? img.url.split("/").pop()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
