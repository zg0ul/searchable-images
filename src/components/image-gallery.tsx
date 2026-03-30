"use client";

import { useState } from "react";
import Image from "next/image";
import { Tables } from "@/lib/supabase";

interface ImageGalleryProps {
  images: (Tables["images"] & {
    metadata: Tables["image_metadata"] | null;
  })[];
  onImageClick?: (
    image: Tables["images"] & {
      metadata: Tables["image_metadata"] | null;
    }
  ) => void;
}

export function ImageGallery({ images, onImageClick }: ImageGalleryProps) {
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
        <p className="text-lg">No images yet</p>
        <p className="text-sm mt-1">Upload some images to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative overflow-hidden bg-neutral-800 rounded-xl aspect-square group cursor-pointer"
          onMouseEnter={() => setHoveredImageId(image.id)}
          onMouseLeave={() => setHoveredImageId(null)}
          onClick={() => onImageClick?.(image)}
        >
          <Image
            src={image.url}
            alt={image.file_name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-all duration-300 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div
            className={`absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-200 ${
              hoveredImageId === image.id ? "opacity-100" : "opacity-0"
            }`}
          />

          {hoveredImageId === image.id && image.metadata && (
            <div className="absolute inset-0 flex flex-col justify-end p-3 text-white">
              <p className="text-sm font-medium line-clamp-2">
                {image.metadata.description}
              </p>
              {image.metadata.tags && image.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {image.metadata.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs bg-white/20 backdrop-blur-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
