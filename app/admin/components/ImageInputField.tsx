// app/admin/components/ImageInputField.tsx
"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";

type ImageInputFieldProps = {
  name: string; // 例如 "coverImage"
  label?: string;
  placeholder?: string;
  defaultValue?: string; // 編輯頁帶原本的 URL 進來
};

type GalleryImagesInputFieldProps = {
  name: string; // 通常 "images"
  label?: string;
  defaultValues?: string[]; // 編輯頁帶原本的小圖 URL 陣列進來
};

export type ImageAssetItem = {
  id: string;
  url: string;
  label?: string | null;
};

type Mode = "upload" | "url" | "library";

/* ----------------------------------------------------------
 * 共用的小元件：模式切換
 * --------------------------------------------------------*/
function ModeToggle({
  mode,
  setMode,
  onLibrary,
}: {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  onLibrary?: () => void;
}) {
  function handleClick(next: Mode) {
    setMode(next);
    if (next === "library" && onLibrary) onLibrary();
  }

  return (
    <div className="inline-flex items-center gap-px rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
      {[
        { id: "upload", label: "Upload" },
        { id: "url", label: "URL" },
        { id: "library", label: "Library" },
      ].map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleClick(item.id as Mode)}
          className={[
            "inline-flex min-w-[60px] items-center justify-center rounded px-2 py-1 text-[11px]",
            mode === item.id
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-100",
          ].join(" ")}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------
 * 共用的小元件：圖片 Library 網格
 * --------------------------------------------------------*/
function LibraryGrid({
  images,
  selected,
  multiple,
  onSelect,
}: {
  images: ImageAssetItem[];
  selected?: string | string[] | null;
  multiple?: boolean;
  onSelect: (url: string) => void;
}) {
  const selectedSet = new Set(
    Array.isArray(selected) ? selected : selected ? [selected] : []
  );

  if (!images.length) {
    return (
      <p className="rounded-md border border-dashed border-zinc-200 bg-zinc-50 p-3 text-[11px] text-zinc-500">
        Library 中目前沒有圖片。你可以先上傳幾張，之後再從這裡重複利用。
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
      {images.map((img) => {
        const isActive = selectedSet.has(img.url);
        return (
          <button
            key={img.id}
            type="button"
            onClick={() => onSelect(img.url)}
            className={[
              "group flex flex-col items-center gap-1 rounded-md border bg-white p-1 transition",
              isActive
                ? "border-zinc-900 ring-1 ring-zinc-900"
                : "border-zinc-200 hover:border-zinc-400",
            ].join(" ")}
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
            {multiple && isActive && (
              <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] font-medium text-white">
                Selected
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------
 * 單張圖片：封面用
 * --------------------------------------------------------*/
export function ImageInputField({
  name,
  label = "Image",
  placeholder = "https://...",
  defaultValue = "",
}: ImageInputFieldProps) {
  const [mode, setMode] = useState<Mode>("upload");
  const [value, setValue] = useState(defaultValue ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [library, setLibrary] = useState<ImageAssetItem[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(false);

  useEffect(() => {
    setValue(defaultValue ?? "");
  }, [defaultValue]);

  async function loadLibrary() {
    if (libraryLoaded || isLibraryLoading) return;
    setIsLibraryLoading(true);
    try {
      const res = await fetch("/api/admin/images");
      if (!res.ok) throw new Error("failed to load images");
      const data = await res.json();
      const items = (data.images ?? data.files ?? data) as ImageAssetItem[];
      setLibrary(items || []);
      setLibraryLoaded(true);
    } catch (err) {
      console.error("[R2_LIBRARY] error", err);
    } finally {
      setIsLibraryLoading(false);
    }
  }

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

  function handleUrlChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  function handlePickFromLibrary(url: string) {
    setValue(url);
  }

  return (
    <div className="space-y-2">
      {/* Label + 模式切換 */}
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-medium text-zinc-700">{label}</label>
        <ModeToggle mode={mode} setMode={setMode} onLibrary={loadLibrary} />
      </div>

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
            className="block w-full text-xs text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-zinc-800"
          />
          {isUploading && (
            <p className="text-[11px] text-zinc-500">Uploading…</p>
          )}
        </div>
      )}

      {mode === "url" && (
        <input
          type="url"
          name={`${name}-url-input`}
          className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/40"
          placeholder={placeholder}
          value={value}
          onChange={handleUrlChange}
        />
      )}

      {mode === "library" && (
        <div className="space-y-2">
          {isLibraryLoading && (
            <p className="text-[11px] text-zinc-500">Loading library…</p>
          )}
          <LibraryGrid
            images={library}
            selected={value}
            onSelect={handlePickFromLibrary}
          />
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------
 * 多張圖片：產品相簿小圖用
 * --------------------------------------------------------*/
export function GalleryImagesInputField({
  name,
  label = "Gallery images",
  defaultValues = [],
}: GalleryImagesInputFieldProps) {
  const [mode, setMode] = useState<Mode>("upload");
  const [images, setImages] = useState<string[]>(defaultValues ?? []);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [library, setLibrary] = useState<ImageAssetItem[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(false);

  useEffect(() => {
    setImages(defaultValues ?? []);
  }, [defaultValues]);

  async function loadLibrary() {
    if (libraryLoaded || isLibraryLoading) return;
    setIsLibraryLoading(true);
    try {
      const res = await fetch("/api/admin/images");
      if (!res.ok) throw new Error("failed to load images");
      const data = await res.json();
      const items = (data.images ?? data.files ?? data) as ImageAssetItem[];
      setLibrary(items || []);
      setLibraryLoaded(true);
    } catch (err) {
      console.error("[R2_LIBRARY] error", err);
    } finally {
      setIsLibraryLoading(false);
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          console.error("[UPLOAD_GALLERY] failed status", res.status);
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
      {/* Label + 模式切換 */}
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-medium text-zinc-700">{label}</label>
        <ModeToggle mode={mode} setMode={setMode} onLibrary={loadLibrary} />
      </div>

      {/* Hidden inputs：送去後端的真正值（多個同名） */}
      {images.map((url, idx) => (
        <input key={idx} type="hidden" name={name} value={url} />
      ))}

      {/* 已選圖片的縮圖列表 */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
          {images.map((url) => (
            <div
              key={url}
              className="group relative h-16 w-16 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover group-hover:opacity-80"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-[9px] text-white opacity-0 shadow-sm transition group-hover:opacity-100"
              >
                ✕
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
            onChange={handleFileChange}
            className="block w-full text-xs text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-zinc-800"
          />
          {isUploading && (
            <p className="text-[11px] text-zinc-500">Uploading…</p>
          )}
        </div>
      )}

      {mode === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/40"
            placeholder="https://... 一次一張，按下 Add 加入"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button
            type="button"
            onClick={addUrl}
            className="inline-flex items-center rounded-md bg-zinc-900 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800"
          >
            Add
          </button>
        </div>
      )}

      {mode === "library" && (
        <div className="space-y-2">
          {isLibraryLoading && (
            <p className="text-[11px] text-zinc-500">Loading library…</p>
          )}
          <LibraryGrid
            images={library}
            selected={images}
            multiple
            onSelect={toggleFromLibrary}
          />
        </div>
      )}
    </div>
  );
}
