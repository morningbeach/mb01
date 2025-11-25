"use client";

import { ClassicCarousel } from "../admin/test-gallery/components/effects/ClassicCarousel";
import { MultiCarousel } from "../admin/test-gallery/components/effects/MultiCarousel";
import { KenBurnsGallery } from "../admin/test-gallery/components/effects/KenBurnsGallery";
import { FadeCarousel } from "../admin/test-gallery/components/effects/FadeCarousel";
import { ZoomCarousel } from "../admin/test-gallery/components/effects/ZoomCarousel";
import { MasonryGallery } from "../admin/test-gallery/components/effects/MasonryGallery";
import { GridAnimationGallery } from "../admin/test-gallery/components/effects/GridAnimationGallery";
import BentoBoxGallery from "../admin/test-gallery/components/effects/BentoBoxGallery";
import MinimalGallery from "../admin/test-gallery/components/effects/MinimalGallery";
import { ParallaxGallery } from "../admin/test-gallery/components/effects/ParallaxGallery";
import { CubeCarousel } from "../admin/test-gallery/components/effects/CubeCarousel";
import { StackCarousel } from "../admin/test-gallery/components/effects/StackCarousel";
import { CoverflowCarousel } from "../admin/test-gallery/components/effects/CoverflowCarousel";
import { WaterfallGallery } from "../admin/test-gallery/components/effects/WaterfallGallery";
import { MagazineGallery } from "../admin/test-gallery/components/effects/MagazineGallery";
import { CircularCarousel } from "../admin/test-gallery/components/effects/CircularCarousel";
import { FlipCarousel } from "../admin/test-gallery/components/effects/FlipCarousel";
import { FullscreenSlider } from "../admin/test-gallery/components/effects/FullscreenSlider";

interface GalleryClientProps {
  images: any[];
  effect?: string;
}

export function GalleryClient({ images, effect = "masonry" }: GalleryClientProps) {
  const props = {
    images,
    autoPlaySpeed: 3000,
    enableSwipe: true,
    showControls: true,
    height: "h-96",
    aspectRatio: "16:9",
    clickMode: "none" as const,
    onImageClick: () => {},
    objectFit: "object-cover",
  };

  switch (effect) {
    case "classic":
      return <ClassicCarousel {...props} />;
    case "multi":
      return <MultiCarousel {...props} itemsPerView={3} />;
    case "kenburns":
      return <KenBurnsGallery {...props} />;
    case "fade":
      return <FadeCarousel {...props} />;
    case "flip":
      return <FlipCarousel {...props} />;
    case "zoom":
      return <ZoomCarousel {...props} />;
    case "fullscreen":
      return <FullscreenSlider {...props} />;
    case "masonry":
      return <MasonryGallery {...props} />;
    case "grid":
      return <GridAnimationGallery {...props} />;
    case "bento":
      return <BentoBoxGallery {...props} />;
    case "waterfall":
      return <WaterfallGallery {...props} />;
    case "magazine":
      return <MagazineGallery {...props} layout="top" />;
    case "parallax":
      return <ParallaxGallery {...props} />;
    case "coverflow":
      return <CoverflowCarousel {...props} />;
    case "circular":
      return <CircularCarousel {...props} />;
    case "cube":
      return <CubeCarousel {...props} />;
    case "stack":
      return <StackCarousel {...props} />;
    case "minimal":
      return <MinimalGallery {...props} height="500px" />;
    default:
      return <MasonryGallery {...props} />;
  }
}
