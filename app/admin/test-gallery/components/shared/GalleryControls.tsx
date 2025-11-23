// app/admin/test-gallery/components/shared/GalleryControls.tsx
"use client";

interface GalleryControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  totalCount: number;
  showDots?: boolean;
  onDotClick?: (index: number) => void;
}

export function GalleryControls({
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
  showDots = true,
  onDotClick,
}: GalleryControlsProps) {
  return (
    <div className="mt-4 flex items-center justify-between">
      {/* 左側：播放控制 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="rounded-lg bg-zinc-900 p-2 text-white hover:bg-zinc-800 transition-colors"
          title="上一張"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={onPlayPause}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 transition-colors"
          title={isPlaying ? "暫停" : "播放"}
        >
          {isPlaying ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={onNext}
          className="rounded-lg bg-zinc-900 p-2 text-white hover:bg-zinc-800 transition-colors"
          title="下一張"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 中間：指示點 */}
      {showDots && totalCount > 1 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: totalCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => onDotClick?.(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex
                  ? "w-8 bg-zinc-900"
                  : "w-2 bg-zinc-300 hover:bg-zinc-400"
              }`}
              title={`第 ${i + 1} 張`}
            />
          ))}
        </div>
      )}

      {/* 右側：計數器 */}
      <div className="text-sm text-zinc-600">
        {currentIndex + 1} / {totalCount}
      </div>
    </div>
  );
}
