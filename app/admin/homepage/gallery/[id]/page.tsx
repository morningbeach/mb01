"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { GalleryShowcase } from "@/app/admin/test-gallery/components/GalleryShowcase";

type Album = {
  id: string;
  name: string;
  description?: string;
  coverImage?: { url: string };
  _count: { items: number };
};

type Section = {
  id: number;
  type: string;
  payload: any;
};

type AlbumImageItem = {
  storageKey: string;
  url: string;
  title?: string;
  subtitle?: string;
  imageId?: string;
};

type LibraryImageOption = {
  id: string;
  url: string;
  label: string;
  folder?: string;
  size?: number;
  lastModified?: string;
};

const mapAlbumItems = (items: any[] = []): AlbumImageItem[] => {
  return items.map((item: any, index: number) => {
    const image = item.image || item;
    const storageKey = image?.storageKey || image?.url || `image-${index}`;
    return {
      storageKey,
      url: image?.url || "",
      title:
        image?.title ||
        image?.storageKey?.split("/").pop() ||
        `Image ${index + 1}`,
      subtitle: image?.alt || "",
      imageId: image?.id,
    };
  });
};

export default function GalleryEditorPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = parseInt(params.id as string);

  const [section, setSection] = useState<Section | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [albumImages, setAlbumImages] = useState<AlbumImageItem[]>([]);
  const [albumImagesLoading, setAlbumImagesLoading] = useState(false);
  const [albumImagesDirty, setAlbumImagesDirty] = useState(false);
  const [albumImagesSaving, setAlbumImagesSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Form state
  const [title_zh, setTitleZh] = useState("");
  const [title_en, setTitleEn] = useState("");
  const [subtitle_zh, setSubtitleZh] = useState("");
  const [subtitle_en, setSubtitleEn] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [effect, setEffect] = useState("masonry");
  const [imageLimit, setImageLimit] = useState("");

  useEffect(() => {
    loadData();
  }, [sectionId]);

  const loadData = async () => {
    try {
      // Load section
      const sectionRes = await fetch(`/api/admin/homepage/sections/${sectionId}`);
      const sectionData = await sectionRes.json();
      
      if (!sectionData.section || sectionData.section.type !== "GALLERY") {
        router.push("/admin/homepage");
        return;
      }

      setSection(sectionData.section);
      const payload = sectionData.section.payload || {};
      setTitleZh(payload.title_zh || "");
      setTitleEn(payload.title_en || "");
      setSubtitleZh(payload.subtitle_zh || "");
      setSubtitleEn(payload.subtitle_en || "");
      setAlbumId(payload.albumId || "");
      setEffect(payload.effect || "masonry");
      setImageLimit(payload.imageLimit || "");

      // Load albums
      const albumsRes = await fetch("/api/admin/albums");
      const albumsData = await albumsRes.json();
      setAlbums(albumsData.albums || []);

      setLoading(false);
    } catch (error) {
      console.error("Failed to load data:", error);
      setLoading(false);
    }
  };

  const fetchAlbumDetails = async (targetAlbumId: string) => {
    if (!targetAlbumId) {
      setSelectedAlbum(null);
      setAlbumImages([]);
      setAlbumImagesDirty(false);
      return;
    }

    setAlbumImagesLoading(true);
    try {
      const response = await fetch(`/api/admin/albums/${targetAlbumId}`);
      if (!response.ok) throw new Error("Failed to fetch album");
      const data = await response.json();
      if (!data.album) throw new Error("Album not found");

      setSelectedAlbum(data.album);
      setAlbumImages(mapAlbumItems(data.album.items || []));
      setAlbumImagesDirty(false);
    } catch (error) {
      console.error("Failed to load album details:", error);
      alert("載入相簿圖片失敗，請稍後再試");
      setSelectedAlbum(null);
      setAlbumImages([]);
    } finally {
      setAlbumImagesLoading(false);
    }
  };

  useEffect(() => {
    if (!albumId) {
      setSelectedAlbum(null);
      setAlbumImages([]);
      setAlbumImagesDirty(false);
      return;
    }
    fetchAlbumDetails(albumId);
  }, [albumId]);

  const moveAlbumImage = (fromIndex: number, toIndex: number) => {
    setAlbumImages((prev) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      setAlbumImagesDirty(true);
      return next;
    });
  };

  const removeAlbumImage = (index: number) => {
    setAlbumImages((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = prev.filter((_, idx) => idx !== index);
      setAlbumImagesDirty(true);
      return next;
    });
  };

  const addAlbumImages = (imagesToAdd: LibraryImageOption[]) => {
    if (!imagesToAdd || imagesToAdd.length === 0) return;
    setAlbumImages((prev) => {
      const existing = new Set(prev.map((img) => img.storageKey));
      const additions = imagesToAdd
        .filter((img) => !existing.has(img.id))
        .map((img) => ({
          storageKey: img.id,
          url: img.url,
          title: img.label,
          subtitle: img.folder || "",
        }));
      if (additions.length === 0) return prev;
      setAlbumImagesDirty(true);
      return [...prev, ...additions];
    });
  };

  const handleSaveAlbumImages = async () => {
    if (!albumId) return;
    if (albumImages.length === 0) {
      alert("請至少保留一張圖片");
      return;
    }

    setAlbumImagesSaving(true);
    try {
      const payload = {
        images: albumImages.map((img, index) => ({
          imageId: img.storageKey,
          position: index,
        })),
      };

      const response = await fetch(`/api/admin/albums/${albumId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("更新相簿圖片失敗");
      }

      const data = await response.json();
      if (data.album) {
        setSelectedAlbum(data.album);
        setAlbumImages(mapAlbumItems(data.album.items || []));
        setAlbumImagesDirty(false);
      }
    } catch (error) {
      console.error("Failed to save album images:", error);
      alert("儲存相簿圖片失敗，請稍後再試");
    } finally {
      setAlbumImagesSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title_zh,
        title_en,
        subtitle_zh,
        subtitle_en,
        albumId,
        effect,
        imageLimit: imageLimit ? parseInt(imageLimit) : null,
      };

      const response = await fetch(`/api/admin/homepage/sections/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });

      if (!response.ok) throw new Error("Save failed");

      router.push("/admin/homepage");
    } catch (error) {
      console.error("Failed to save:", error);
      alert("儲存失敗，請稍後再試");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          編輯相簿展示區塊
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Section ID: {sectionId} · Type: GALLERY
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* 區塊標題 */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            區塊標題
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                標題 (中文)
              </label>
              <input
                type="text"
                value={title_zh}
                onChange={(e) => setTitleZh(e.target.value)}
                placeholder="例如：作品展示"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Title (English)
              </label>
              <input
                type="text"
                value={title_en}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g., Our Work"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                副標題 (中文)
              </label>
              <input
                type="text"
                value={subtitle_zh}
                onChange={(e) => setSubtitleZh(e.target.value)}
                placeholder="選填"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Subtitle (English)
              </label>
              <input
                type="text"
                value={subtitle_en}
                onChange={(e) => setSubtitleEn(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 相簿選擇 */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              選擇相簿
            </h2>
            <button
              type="button"
              onClick={() => setShowCreateAlbum(true)}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              ➕ 快速新增相簿
            </button>
          </div>
          
          {albums.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
              <p className="text-sm text-zinc-600">
                目前沒有可用的相簿，請點擊上方按鈕建立
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <select
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">-- 請選擇相簿 --</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name} ({album._count?.items || 0} 張圖片)
                  </option>
                ))}
              </select>

              {/* 預覽已選相簿 */}
              {albumId && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-900">
                    目前選擇：
                    {albums.find((a) => a.id === albumId)?.name ||
                      "相簿已刪除"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {albumId && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  圖片清單管理
                </h2>
                <p className="text-sm text-zinc-500">
                  調整順序、移除或加入新的圖片。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowImagePicker(true)}
                  className="rounded-lg border border-green-500 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                >
                  ➕ 新增圖片
                </button>
                <button
                  type="button"
                  onClick={() => fetchAlbumDetails(albumId)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  重新載入相簿
                </button>
              </div>
            </div>

            {albumImagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
              </div>
            ) : albumImages.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-sm text-zinc-600">
                此相簿沒有圖片，請加入圖片。
              </div>
            ) : (
              <ul className="space-y-3">
                {albumImages.map((img, index) => (
                  <li
                    key={`${img.storageKey}-${index}`}
                    className="flex items-center gap-4 rounded-lg border border-zinc-200 p-3"
                  >
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-zinc-100">
                      {img.url ? (
                        <img src={img.url} alt={img.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-zinc-500">無預覽</span>
                      )}
                    </div>
                    <div className="w-10 text-center text-xs font-semibold text-zinc-500">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900">{img.title}</p>
                      <p className="text-xs text-zinc-500 break-all">{img.storageKey}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveAlbumImage(index, index - 1)}
                        disabled={index === 0}
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 disabled:opacity-40"
                      >
                        ↑ 上移
                      </button>
                      <button
                        type="button"
                        onClick={() => moveAlbumImage(index, index + 1)}
                        disabled={index === albumImages.length - 1}
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 disabled:opacity-40"
                      >
                        ↓ 下移
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAlbumImage(index)}
                        className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        ✕ 移除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-zinc-500">
                {albumImagesDirty ? (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">
                    尚未儲存
                  </span>
                ) : (
                  <span className="text-zinc-400">已與相簿同步</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveAlbumImages}
                disabled={!albumImagesDirty || albumImagesSaving}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {albumImagesSaving ? "儲存中..." : "儲存圖片排序"}
              </button>
            </div>
          </div>
        )}

        {/* 展示效果 */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            展示效果
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                展示風格
              </label>
              <select
                value={effect}
                onChange={(e) => setEffect(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <optgroup label="網格佈局">
                  <option value="masonry">瀑布流 (Masonry)</option>
                  <option value="waterfall">瀑布式展示</option>
                  <option value="bento">Bento Box 格子</option>
                  <option value="magazine">雜誌風格</option>
                </optgroup>
                <optgroup label="輪播效果">
                  <option value="classic">經典橫向輪播</option>
                  <option value="multi">多圖橫向輪播</option>
                  <option value="fade">淡入淡出</option>
                </optgroup>
                <optgroup label="動態效果">
                  <option value="kenburns">Ken Burns 電影感</option>
                  <option value="fullscreen">全螢幕瀏覽</option>
                  <option value="parallax">視差滾動</option>
                </optgroup>
                <optgroup label="3D 特效">
                  <option value="cube">3D 立方體</option>
                  <option value="coverflow">Coverflow 翻頁</option>
                  <option value="flip">3D 翻轉</option>
                  <option value="stack">堆疊卡片</option>
                </optgroup>
                <optgroup label="進階風格">
                  <option value="minimal">極簡無印風</option>
                  <option value="grid-animation">網格動畫</option>
                </optgroup>
              </select>
              <p className="mt-1 text-xs text-zinc-500">
                選擇相簿的展示方式
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                圖片數量限制
              </label>
              <input
                type="number"
                value={imageLimit}
                onChange={(e) => setImageLimit(e.target.value)}
                placeholder="不限制"
                min="1"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-zinc-500">
                留空表示顯示相簿內所有圖片
              </p>
            </div>
          </div>
        </div>

        {/* 即時預覽 */}
        {albumId && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">
              即時預覽
            </h2>
            <div className="rounded-lg bg-zinc-50 p-4">
              <GalleryPreview
                images={albumImages}
                effect={effect}
                loading={albumImagesLoading}
              />
            </div>
          </div>
        )}

        {/* 儲存按鈕 */}
        <div className="flex justify-end gap-3">
          <a
            href="/admin/homepage"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            取消
          </a>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-zinc-400"
          >
            {saving ? "儲存中..." : "儲存變更"}
          </button>
        </div>
      </form>

      {/* Quick Album Creation Modal */}
      {showCreateAlbum && (
        <QuickAlbumCreator
          onClose={() => setShowCreateAlbum(false)}
          onSuccess={(newAlbum) => {
            setAlbums([newAlbum, ...albums]);
            setAlbumId(newAlbum.id);
            setShowCreateAlbum(false);
          }}
        />
      )}

      {/* Image Picker for existing album */}
      {showImagePicker && (
        <ImagePickerModal
          existingKeys={new Set(albumImages.map((img) => img.storageKey))}
          onClose={() => setShowImagePicker(false)}
          onConfirm={(images) => {
            addAlbumImages(images);
            setShowImagePicker(false);
          }}
        />
      )}
    </main>
  );
}

// Quick Album Creator Component

function ImagePickerModal({
  existingKeys,
  onClose,
  onConfirm,
}: {
  existingKeys: Set<string>;
  onClose: () => void;
  onConfirm: (images: LibraryImageOption[]) => void;
}) {
  const [allImages, setAllImages] = useState<LibraryImageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/images?prefix=")
      .then((res) => res.json())
      .then((data) => {
        const files = data.files || [];
        const normalized: LibraryImageOption[] = files.map((file: any) => {
          const parts = file.key.split("/");
          const filename = parts.pop() || file.key;
          return {
            id: file.key,
            url: file.url,
            label: filename,
            folder: parts.join("/") || "root",
            size: file.size,
            lastModified: file.lastModified,
          };
        });
        normalized.sort((a, b) => {
          const aTs = a.lastModified ? Date.parse(a.lastModified) : 0;
          const bTs = b.lastModified ? Date.parse(b.lastModified) : 0;
          return bTs - aTs;
        });
        setAllImages(normalized);
      })
      .catch((error) => {
        console.error("Failed to load images:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredImages = useMemo(() => {
    if (!searchText.trim()) return allImages;
    const keyword = searchText.toLowerCase();
    return allImages.filter(
      (img) =>
        img.label.toLowerCase().includes(keyword) ||
        (img.folder && img.folder.toLowerCase().includes(keyword))
    );
  }, [allImages, searchText]);

  const toggleSelect = (img: LibraryImageOption) => {
    if (existingKeys.has(img.id)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(img.id)) {
        next.delete(img.id);
      } else {
        next.add(img.id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedIds.size === 0) {
      alert("請先選擇要加入的圖片");
      return;
    }
    const selectedImages = allImages.filter((img) => selectedIds.has(img.id));
    onConfirm(selectedImages);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">從圖片庫新增</h2>
            <p className="text-sm text-zinc-500">
              已在相簿內的圖片會顯示為不可選取狀態。
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-zinc-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜尋檔名或資料夾"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <div className="text-sm text-zinc-600">
              已選擇 {selectedIds.size} 張
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filteredImages.map((img) => {
                const isExisting = existingKeys.has(img.id);
                const isSelected = selectedIds.has(img.id);
                return (
                  <button
                    key={img.id}
                    type="button"
                    disabled={isExisting}
                    onClick={() => toggleSelect(img)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 text-left transition-all ${
                      isExisting
                        ? "cursor-not-allowed border-zinc-200 opacity-40"
                        : isSelected
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                    <div className="absolute left-1 right-1 top-1 rounded bg-black/40 px-1 text-[10px] font-medium text-white">
                      {img.folder}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[10px] text-white">
                      <div className="flex justify-between">
                        <span>{formatFileSize(img.size)}</span>
                        <span>{formatDateLabel(img.lastModified)}</span>
                      </div>
                    </div>
                    {isExisting && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">
                        已在相簿
                      </div>
                    )}
                    {isSelected && !isExisting && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                        <div className="rounded-full bg-blue-500 p-1">
                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}

              {filteredImages.length === 0 && (
                <div className="col-span-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-10 text-center text-sm text-zinc-500">
                  找不到符合的圖片
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-200 p-5">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            加入所選圖片
          </button>
        </div>
      </div>
    </div>
  );
}
function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDateLabel(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
  });
}

function QuickAlbumCreator({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (album: Album) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [effect, setEffect] = useState("masonry");
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [allImages, setAllImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetch("/api/admin/images?prefix=")
      .then((res) => res.json())
      .then((data) => {
        const files = data.files || [];
        const normalized = files.map((file: any) => {
          const segments = file.key.split("/");
          const filename = segments.pop() || file.key;
          return {
            id: file.key,
            url: file.url,
            label: filename,
            folder: segments.join("/") || "root",
            size: file.size ?? null,
            lastModified: file.lastModified ?? null,
            modifiedTs: file.lastModified ? Date.parse(file.lastModified) : 0,
          };
        });
        normalized.sort((a: any, b: any) => (b.modifiedTs || 0) - (a.modifiedTs || 0));
        setAllImages(normalized);
        setLoading(false);
      });
  }, []);

  const filteredImages = useMemo(() => {
    if (!searchText.trim()) return allImages;
    const keyword = searchText.toLowerCase();
    return allImages.filter((img) =>
      img.label.toLowerCase().includes(keyword) ||
      (img.folder && img.folder.toLowerCase().includes(keyword))
    );
  }, [allImages, searchText]);

  const toggleImage = (img: any) => {
    setSelectedImages((prev) => {
      const exists = prev.find((i) => i.id === img.id);
      if (exists) {
        return prev.filter((i) => i.id !== img.id);
      }
      return [...prev, img];
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("請輸入相簿名稱");
      return;
    }
    if (selectedImages.length === 0) {
      alert("請至少選擇一張圖片");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name,
        description,
        effect,
        images: selectedImages.map((img, idx) => ({
          imageId: img.id,
          position: idx,
        })),
      };

      console.log("Creating album with payload:", payload);

      const response = await fetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("API response:", result);

      if (!response.ok) {
        throw new Error(result.details || result.error || "創建失敗");
      }

      onSuccess(result.album);
    } catch (error: any) {
      console.error("Failed to create album:", error);
      alert(`創建失敗：${error.message || "請稍後再試"}`);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white p-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              快速新增相簿
            </h2>
            <p className="text-sm text-zinc-600">
              選擇圖片並設定相簿資訊
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-zinc-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 相簿資訊 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                相簿名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：2024春季新品"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                相簿描述
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="簡短描述"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* 預設效果 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              預設展示效果
            </label>
            <select
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="masonry">瀑布流 (Masonry)</option>
              <option value="waterfall">瀑布式展示</option>
              <option value="bento">Bento Box 格子</option>
              <option value="magazine">雜誌風格</option>
              <option value="classic">經典橫向輪播</option>
              <option value="minimal">極簡無印風</option>
            </select>
          </div>

          {/* 圖片選擇 */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-zinc-700">
                選擇圖片 ({selectedImages.length} 張已選)
              </label>
              <input
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="輸入檔名或資料夾"
                className="w-48 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto rounded-lg border border-zinc-200 p-3">
                {filteredImages.map((img) => {
                  const isSelected = selectedImages.find((i) => i.id === img.id);
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => toggleImage(img)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute left-1 right-1 top-1 rounded bg-black/40 px-1 text-[10px] font-medium text-white">
                        {img.folder}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[10px] text-white">
                        <div className="flex justify-between">
                          <span>{formatFileSize(img.size)}</span>
                          <span>{formatDateLabel(img.lastModified)}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                          <div className="rounded-full bg-blue-500 p-1">
                            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}

                {filteredImages.length === 0 && (
                  <div className="col-span-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-10 text-center text-sm text-zinc-500">
                    找不到符合的圖片，試試其他關鍵字
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-zinc-200 bg-white p-6">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-zinc-400"
          >
            {saving ? "建立中..." : "建立相簿"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Gallery Preview Component
function GalleryPreview({
  images,
  effect,
  loading,
}: {
  images: AlbumImageItem[];
  effect: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
        <p className="text-sm text-zinc-600">此相簿沒有圖片</p>
      </div>
    );
  }

  const showcaseImages = images.map((img, index) => ({
    id: img.storageKey || `preview-${index}`,
    url: img.url,
    label: img.title || `Image ${index + 1}`,
    title: img.title || `Image ${index + 1}`,
    subtitle: img.subtitle || "",
  }));

  return <GalleryShowcase images={showcaseImages} selectedEffect={effect} />;
}
