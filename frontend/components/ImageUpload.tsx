"use client";

import { useRef, useCallback } from "react";

interface ImageUploadProps {
  onImageSelect: (base64: string | null) => void;
  currentImage: string | null;
}

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export function ImageUpload({ onImageSelect, currentImage }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert("Please select a PNG, JPEG, GIF, or WebP image.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert("Image must be under 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        Image <span className="text-text-secondary font-normal">(optional)</span>
      </label>

      {currentImage ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={currentImage}
            alt="Preview"
            className="w-full h-40 object-cover"
          />
          <button
            type="button"
            onClick={() => {
              onImageSelect(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-background/80 text-foreground hover:bg-danger hover:text-white transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <p className="text-text-secondary text-sm">
            Click or drag to upload an image
          </p>
          <p className="text-text-secondary text-xs mt-1">
            PNG, JPEG, GIF, WebP — max 500KB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
