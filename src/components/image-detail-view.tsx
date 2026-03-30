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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="relative flex flex-col md:flex-row w-full max-w-5xl max-h-[90vh] bg-neutral-900/95 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image container */}
        <div className="relative w-full md:w-2/3 h-[40vh] md:h-[80vh] shrink-0">
          <Image
            src={image.url}
            alt={image.file_name}
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* Metadata container */}
        <div className="w-full md:w-1/3 p-4 md:p-6 overflow-y-auto bg-neutral-800/50">
          <h2 className="text-lg font-semibold text-white truncate">{image.file_name}</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Uploaded on {new Date(image.created_at).toLocaleDateString()}
          </p>

          {image.metadata ? (
            <div className="mt-6 space-y-5">
              <div>
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Description
                </h3>
                <p className="mt-2 text-sm text-neutral-300 leading-relaxed">{image.metadata.description}</p>
              </div>

              {image.metadata.tags && image.metadata.tags.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Tags</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {image.metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 text-xs font-medium text-blue-300 bg-blue-500/20 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {image.metadata.objects && image.metadata.objects.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Objects</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {image.metadata.objects.map((object, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-500/20 rounded-full"
                      >
                        {object}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {image.metadata.scenes && image.metadata.scenes.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Scenes</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {image.metadata.scenes.map((scene, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 text-xs font-medium text-purple-300 bg-purple-500/20 rounded-full"
                      >
                        {scene}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {image.metadata.colors && image.metadata.colors.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Colors</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {image.metadata.colors.map((color, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-500/20 rounded-full"
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
              <p className="text-neutral-500">
                No metadata available for this image.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
