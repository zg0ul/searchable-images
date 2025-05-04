"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Tables } from "@/lib/supabase";

interface ImageDetailViewProps {
  image: Tables["images"] & {
    metadata: Tables["image_metadata"] | null;
  };
  onClose: () => void;
}

export function ImageDetailView({ image, onClose }: ImageDetailViewProps) {
  // Close on escape key press
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white bg-black/50 rounded-full hover:bg-black/70"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative flex w-full max-w-5xl max-h-[90vh] bg-neutral-900 rounded-lg overflow-hidden">
        {/* Image container */}
        <div className="relative w-2/3 h-[90vh] overflow-hidden rounded-lg">
          <Image
            src={image.url}
            alt={image.file_name}
            fill
            priority
            className="object-contain overflow-hidden"
          />
        </div>

        {/* Metadata container */}
        <div className="w-1/3 p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold truncate">{image.file_name}</h2>
          <p className="mt-1 text-sm text-gray-500">
            Uploaded on {new Date(image.created_at).toLocaleDateString()}
          </p>

          {image.metadata ? (
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <p className="mt-1 text-sm">{image.metadata.description}</p>
              </div>

              {image.metadata.tags && image.metadata.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {image.metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {image.metadata.objects && image.metadata.objects.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Objects</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {image.metadata.objects.map((object, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full"
                      >
                        {object}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {image.metadata.scenes && image.metadata.scenes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Scenes</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {image.metadata.scenes.map((scene, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full"
                      >
                        {scene}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {image.metadata.colors && image.metadata.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Colors</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {image.metadata.colors.map((color, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-gray-500">
                No metadata available for this image.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
