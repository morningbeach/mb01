// app/admin/components/ImageInputField.tsx
"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

type ImageInputFieldProps = {
  name: string;          // 例如 "coverImage"
  label?: string;
  placeholder?: string;
  defaultValue?: string; // 編輯頁帶原本的 URL 進來
};

type GalleryImagesInputFieldProps = {
  name: string;           // 通常用 "images"
  label?: string;
  defaultValues?: string[];
};

type ImageAssetItem = {
  id: string;
  url: string;
  label?: string | null;
};

/* ----------------------------------------------------------
 * 單張圖片：封面用
 * --------------------------------------------------------*/
export function ImageInputField({
  name,
  label = "Image",
  placeholder = "https://...",
  defaultValue = "",
}: ImageInputFieldProps) {
  const [mode, setMode] = useState<"upload" | "url" | "library">("upload");
  const [value, setValue] = useState<string>(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const [library, setLibrary] = useState<ImageAssetItem[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // 讀圖庫
  async function loadLibrary() {
    try {
      if (library.length > 0) return;
      setIsLibraryLoading(true);

      const res = await fetch("/api/admin/images");
      if (!res.ok) {
        throw new Error(`Failed to load images, status ${res.status}`);
      }

      const data = await res.json();
      setLibrary((data.images ?? []) as ImageAssetItem[]);
    } catch (err) {
      console.error("[IMAGE_LIBRARY_ERROR]", err);
    } finally {
      setIsLibraryLoading(false);
    }
  }

  // 上傳單一檔案
  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
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
        console.error("[UPLOAD_IMAGE] failed status", res.status);
        alert("圖片上傳失敗，請稍後再試一次。");
        return;
      }

      const data = await res.json();
      if (data && data.url) {
        setValue(data.url); // ✅ 立刻更新預覽 + hidden input
      } else {
        alert("圖片上傳成功，但回傳格式不正確。");
      }
    } catch (err) {
      console.error("[UPLOAD_IMAGE] error", err);
      alert("圖片上傳失敗，請檢查 console。");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-700">
            {label}
          </label>
          <ModeToggle mode={mode} setMode={setMode} onLibrary={() => loadLibrary()} />
        </div>
      )}

      {/* 送去後端的真正值 */}
      <input type="hidden" name={name} value={value} />

      {/* 目前的封面預覽＋URL */}
      {value && (
        <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
          <div className="h-16 w-16 overflow-hidden rounded-md bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 break-all text-[11px] text-zinc-600">
            {value}
          </div>
        </div>
      )}

      {/* 三種模式 UI */}
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
            可以貼外部圖床 URL，或本機 /cdn /uploads 開頭路徑。
          </p>
        </div>
      )}

      {mode === "library" && (
        <LibraryGrid
          library={library}
          isLoading={isLibraryLoading}
          current={value}
          onSelect={(url) => setValue(url)}
        />
      )}
    </div>
  );
}

/* ----------------------------------------------------------
 * 多張圖片：Gallery 用
 * --------------------------------------------------------*/
export function GalleryImagesInputField({
  name,
  label = "Gallery images",
  defaultValues = [],
}: GalleryImagesInputFieldProps) {
  const [mode, setMode] = useState<"upload" | "url" | "library">("upload");
  const [images, setImages] = useState<string[]>(defaultValues);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [library, setLibrary] = useState<ImageAssetItem[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  useEffect(() => {
    setImages(defaultValues);
  }, [defaultValues]);

  // 讀圖庫
  async function loadLibrary() {
    try {
      if (library.length > 0) return;
      setIsLibraryLoading(true);

      const res = await fetch("/api/admin/images");
      if (!res.ok) {
        throw new Error(`Failed to load images, status ${res.status}`);
      }

      const data = await res.json();
      setLibrary((data.images ?? []) as ImageAssetItem[]);
    } catch (err) {
      console.error("[IMAGE_LIBRARY_ERROR]", err);
    } finally {
      setIsLibraryLoading(false);
    }
  }

  // 多檔上傳
  async function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          console.error("[UPLOAD_GALLERY] failed", res.status);
          continue;
        }
        const data = await res.json();
        if (data && data.url) newUrls.push(data.url);
      }

      if (newUrls.length === 0) {
        alert("圖片上傳失敗，請稍後再試一次。");
      } else {
        setImages((prev) => [...prev, ...newUrls]);
      }
    } catch (err) {
      console.error("[UPLOAD_GALLERY] error", err);
      alert("圖片上傳失敗，請檢查 console。");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setUrlInput("");
  }

  function toggleFromLibrary(url: string) {
    setImages((prev) =>
      prev.includes(url) ? prev.filter((x) => x !== url) : [...prev, url]
    );
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((x) => x !== url));
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-700">
            {label}
          </label>
          <ModeToggle mode={mode} setMode={setMode} onLibrary={() => loadLibrary()} />
        </div>
      )}

      {/* Hidden inputs：送去後端的真正值（多個同名） */}
      {images.map((url, idx) => (
        <input key={idx} type="hidden" name={name} value={url} />
      ))}

      {/* 已選圖片的縮圖列表 */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url) => (
            <div
              key={url}
              className="relative rounded-lg border border-zinc-200 bg-zinc-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-24 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-[10px] text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 三種模式 UI */}
      {mode === "upload" && (
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="block w-full text-xs text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-900 file:px-3 file:py-1 file:text-xs file:font-medium file:text-white hover:file:bg-zinc-800"
          />
          {isUploading && (
            <p className="text-[11px] text-zinc-500">Uploading…</p>
          )}
        </div>
      )}

      {mode === "url" && (
        <div className="space-y-1">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
              placeholder="https://... 一次一張，按下 Add 加入"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <button
              type="button"
              onClick={addUrl}
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
            >
              Add
            </button>
          </div>
          <p className="text-[11px] text-zinc-500">
            可以貼外部圖床 URL，或本機 /cdn /uploads 開頭路徑。
          </p>
        </div>
      )}

      {mode === "library" && (
        <LibraryGrid
          library={library}
          isLoading={isLibraryLoading}
          currentList={images}
          onSelect={toggleFromLibrary}
          multi
        />
      )}
    </div>
  );
}

/* ----------------------------------------------------------
 * 共用小元件：Mode 切換＋ Library 顯示
 * --------------------------------------------------------*/

function ModeToggle({
  mode,
  setMode,
  onLibrary,
}: {
  mode: "upload" | "url" | "library";
  setMode: (m: "upload" | "url" | "library") => void;
  onLibrary: () => void;
}) {
  return (
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
          onLibrary();
        }}
      >
        Library
      </button>
    </div>
  );
}

function LibraryGrid({
  library,
  isLoading,
  current,
  currentList,
  onSelect,
  multi = false,
}: {
  library: ImageAssetItem[];
  isLoading: boolean;
  current?: string;
  currentList?: string[];
  onSelect: (url: string) => void;
  multi?: boolean;
}) {
  if (isLoading) {
    return (
      <p className="text-[11px] text-zinc-500">
        Loading library…
      </p>
    );
  }

  if (!isLoading && library.length === 0) {
    return (
      <p className="text-[11px] text-zinc-500">
        尚未有圖庫圖片，可以先用 Upload 上傳。
      </p>
    );
  }

  const selectedSet = new Set(currentList ?? (current ? [current] : []));

  return (
    <div className="grid grid-cols-3 gap-2">
      {library.map((img) => {
        const isSelected = selectedSet.has(img.url);
        return (
          <button
            key={img.id}
            type="button"
            onClick={() => onSelect(img.url)}
            className={
              "group flex flex-col items-center gap-1 rounded-lg border p-1.5 " +
              (isSelected
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
        );
      })}
    </div>
  );
}
