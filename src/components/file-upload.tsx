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
    [onFilesAccepted]
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
      className={`p-8 border-2 border-dashed rounded-lg 
      ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"} 
      ${isUploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <UploadCloud
          className={`w-10 h-10 ${
            isDragActive ? "text-blue-500" : "text-gray-400"
          }`}
        />
        <p className="text-sm font-medium">
          {isDragActive
            ? "Drop the images here"
            : "Drag & drop images here, or click to select"}
        </p>
        <p className="text-xs text-gray-500">
          Supported: JPG, PNG, GIF, WebP (max 10MB)
        </p>
        {isUploading && <p className="text-sm text-blue-500">Uploading...</p>}
      </div>
    </div>
  );
}
