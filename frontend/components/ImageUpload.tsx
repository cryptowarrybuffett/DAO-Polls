"use client";

import { useRef, useCallback, useState } from "react";

interface ImageUploadProps {
  onImageSelect: (url: string | null) => void;
  currentImage: string | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for IPFS
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export function ImageUpload({ onImageSelect, currentImage }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToIPFS = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = (await response.json()) as { error: string };
          throw new Error(data.error || "Upload failed");
        }

        const data = (await response.json()) as { imageUrl: string };
        onImageSelect(data.imageUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
        console.error("IPFS upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [onImageSelect]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Please select a PNG, JPEG, GIF, or WebP image.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Image must be under 5MB.");
        return;
      }
      uploadToIPFS(file);
    },
    [uploadToIPFS]
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
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors ${
            uploading ? "opacity-60 cursor-wait" : "cursor-pointer hover:border-primary/50"
          }`}
        >
          {uploading ? (
            <p className="text-primary text-sm">Uploading to IPFS...</p>
          ) : (
            <>
              <p className="text-text-secondary text-sm">
                Click or drag to upload an image
              </p>
              <p className="text-text-secondary text-xs mt-1">
                PNG, JPEG, GIF, WebP — max 5MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-danger text-xs mt-1.5">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleChange}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}
