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
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>No images found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative overflow-hidden bg-gray-100 rounded-lg aspect-square group"
          onMouseEnter={() => setHoveredImageId(image.id)}
          onMouseLeave={() => setHoveredImageId(null)}
          onClick={() => onImageClick?.(image)}
        >
          <Image
            src={image.url}
            alt={image.file_name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {hoveredImageId === image.id && image.metadata && (
            <div className="absolute inset-0 flex flex-col justify-end p-3 text-white bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <p className="text-sm font-medium line-clamp-2">
                {image.metadata.description}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {image.metadata.tags &&
                  image.metadata.tags.length > 0 &&
                  image.metadata.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 text-xs bg-white/20 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
