"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-stone-100 flex items-center justify-center text-stone-300 border border-stone-200">
        Pas d&apos;image
      </div>
    );
  }

  const activeImage = images[activeIdx];

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Active Image Preview */}
      <div className="relative aspect-[4/5] bg-stone-100 border border-stone-200 overflow-hidden shadow-sm group">
        <Image
          src={activeImage}
          alt={name}
          fill
          priority
          className="object-cover transition-all duration-300"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white text-[#2c302e] border border-stone-200 transition-all opacity-0 group-hover:opacity-100 rounded-full shadow"
              aria-label="Image précédente"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white text-[#2c302e] border border-stone-200 transition-all opacity-0 group-hover:opacity-100 rounded-full shadow"
              aria-label="Image suivante"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-300">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative w-20 h-20 bg-stone-100 border transition-all flex-shrink-0 ${
                idx === activeIdx
                  ? "border-[#8c7b65] ring-2 ring-[#8c7b65]/20"
                  : "border-stone-200 hover:border-[#8c7b65]/50"
              }`}
            >
              <Image
                src={img}
                alt={`${name} miniature ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
