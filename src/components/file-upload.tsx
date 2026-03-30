"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void;
  isUploading?: boolean;
}

export function FileUpload({
  onFilesAccepted,
  isUploading = false,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.length > 0) {
        onFilesAccepted(acceptedFiles);
      }
    },
    [onFilesAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB max file size
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`h-[50px] px-4 border border-dashed rounded-xl transition-all flex items-center gap-3
      ${isDragActive ? "border-emerald-500 bg-emerald-500/10" : "border-neutral-700 hover:border-neutral-600"}
      ${isUploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <input {...getInputProps()} />
      <UploadCloud
        className={`w-5 h-5 shrink-0 ${
          isDragActive ? "text-emerald-500" : "text-neutral-500"
        }`}
      />
      <div className="flex items-center gap-2 overflow-hidden">
        {isUploading ? (
          <p className="text-sm text-emerald-400 animate-pulse">Uploading...</p>
        ) : (
          <>
            <p className="text-sm text-neutral-400 truncate">
              {isDragActive ? "Drop here" : "Upload"}
            </p>
            <p className="text-xs text-neutral-600 hidden sm:block">
              JPG, PNG, GIF, WebP
            </p>
          </>
        )}
      </div>
    </div>
  );
}
