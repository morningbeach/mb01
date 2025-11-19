// app/products/[slug]/ProductGallery.tsx

"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  coverImage,
  images,
}: {
  coverImage?: string | null;
  images: string[];
}) {
  const gallery = [
    ...(coverImage ? [coverImage] : []),
    ...images,
  ];

  const [active, setActive] = useState(0);

  if (gallery.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-10 text-center text-sm text-zinc-400">
        No images uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Large display */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100">
        <Image
          src={gallery[active]}
          alt="product gallery"
          fill
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-3">
        {gallery.map((src, index) => (
          <button
            key={src + index}
            onClick={() => setActive(index)}
            className={`relative aspect-square overflow-hidden rounded-md border ${
              index === active
                ? "border-zinc-900"
                : "border-transparent"
            }`}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
