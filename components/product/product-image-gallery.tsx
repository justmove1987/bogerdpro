"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ProductImagePlaceholder } from "@/components/catalog/product-image-placeholder";

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
};

type GalleryLabels = {
  enlargeImage: string;
  closeImage: string;
  previousImage: string;
  nextImage: string;
  imagePending: string;
};

const fallbackImage = "/images/products/product-image-pending.svg";
const productImageSelectEvent = "bogerdpro:product-image-select";

export function ProductImageGallery({
  images,
  productName,
  labels,
}: {
  images: GalleryImage[];
  productName: string;
  labels: GalleryLabels;
}) {
  const galleryImages = useMemo(() => images, [images]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedImage = galleryImages[selectedIndex] ?? galleryImages[0];
  const hasImages = galleryImages.length > 0;

  useEffect(() => {
    function handleImageSelect(event: Event) {
      const imageUrl = (event as CustomEvent<{ imageUrl?: string | null }>).detail?.imageUrl;
      if (!imageUrl) return;

      const nextIndex = galleryImages.findIndex((image) => image.url === imageUrl);
      if (nextIndex >= 0) {
        setSelectedIndex(nextIndex);
      }
    }

    window.addEventListener(productImageSelectEvent, handleImageSelect);
    return () => window.removeEventListener(productImageSelectEvent, handleImageSelect);
  }, [galleryImages]);

  const showPrevious = () => {
    setSelectedIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  };

  const showNext = () => {
    setSelectedIndex((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  };

  return (
    <div className="rounded-[24px] border border-[#e7e2d8] bg-white p-4">
      <button
        type="button"
        className="premium-focus group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[18px] bg-[#efebe3]"
        onClick={() => {
          if (hasImages) setIsExpanded(true);
        }}
        aria-label={labels.enlargeImage}
        aria-disabled={!hasImages}
      >
        {selectedImage ? (
          <>
            <ImageWithFallback
              src={selectedImage.url}
              fallbackSrc={fallbackImage}
              alt={selectedImage.alt ?? productName}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover transition duration-300 group-hover:scale-[1.01]"
            />
            <span className="pointer-events-none absolute bottom-4 right-4 inline-flex h-10 items-center gap-2 rounded-full bg-white/92 px-4 text-sm font-semibold text-[#151515] shadow-[0_10px_24px_rgb(21_21_21/0.14)] opacity-0 transition group-hover:opacity-100">
              <Expand size={16} />
              {labels.enlargeImage}
            </span>
          </>
        ) : (
          <ProductImagePlaceholder label={labels.imagePending} />
        )}
      </button>

      {galleryImages.length > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {galleryImages.map((image, index) => {
            const isSelected = index === selectedIndex;

            return (
              <button
                type="button"
                key={image.id}
                className={`premium-focus relative aspect-square cursor-pointer overflow-hidden rounded-[var(--radius-sm)] border bg-[#f7f5f0] transition ${
                  isSelected ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]" : "border-[#e7e2d8] hover:border-[var(--accent)]"
                }`}
                onClick={() => setSelectedIndex(index)}
                aria-label={`${labels.enlargeImage} ${index + 1}`}
                aria-current={isSelected ? "true" : undefined}
              >
                <ImageWithFallback
                  src={image.url}
                  fallbackSrc={fallbackImage}
                  alt={image.alt ?? productName}
                  fill
                  sizes="140px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {isExpanded && selectedImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4">
          <button
            type="button"
            className="premium-focus absolute right-4 top-4 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-[#151515] shadow-[0_14px_32px_rgb(0_0_0/0.22)] transition hover:bg-[#f7f5f0]"
            onClick={() => setIsExpanded(false)}
            aria-label={labels.closeImage}
          >
            <X size={22} />
          </button>

          {galleryImages.length > 1 ? (
            <button
              type="button"
              className="premium-focus absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#151515] shadow-[0_14px_32px_rgb(0_0_0/0.22)] transition hover:bg-[#f7f5f0]"
              onClick={showPrevious}
              aria-label={labels.previousImage}
            >
              <ChevronLeft size={24} />
            </button>
          ) : null}

          <div className="relative h-[88vh] w-full max-w-5xl overflow-hidden rounded-[18px] bg-white">
            <ImageWithFallback
              src={selectedImage.url}
              fallbackSrc={fallbackImage}
              alt={selectedImage.alt ?? productName}
              fill
              sizes="96vw"
              className="object-contain"
            />
          </div>

          {galleryImages.length > 1 ? (
            <button
              type="button"
              className="premium-focus absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#151515] shadow-[0_14px_32px_rgb(0_0_0/0.22)] transition hover:bg-[#f7f5f0]"
              onClick={showNext}
              aria-label={labels.nextImage}
            >
              <ChevronRight size={24} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
