"use client";

import { useState, useCallback } from "react";
import { Upload, X, Star, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MediaFile {
  id: string;
  url: string;
  filename: string;
  type: "image" | "video";
  mimeType: string;
  size: number;
  isPrimary: boolean;
  alt?: string;
  caption?: string;
}

interface MediaUploaderProps {
  media: MediaFile[];
  onChange: (media: MediaFile[]) => void;
  maxFiles?: number;
}

export default function MediaUploader({ media, onChange, maxFiles = 10 }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // 디버깅: media 배열 변경 감지
  console.log("🎨 MediaUploader rendered, media count:", media.length, media);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check max files limit
    if (media.length + files.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const data = await response.json();
        return {
          id: Math.random().toString(36).substring(7),
          url: data.file.url,
          filename: data.file.filename,
          type: data.file.type,
          mimeType: data.file.mimeType,
          size: data.file.size,
          isPrimary: media.length === 0, // First image is primary by default
          alt: "",
          caption: "",
        } as MediaFile;
      });

      const newFiles = await Promise.all(uploadPromises);
      console.log("✅ 업로드 성공:", newFiles);
      console.log("📁 전체 미디어 목록:", [...media, ...newFiles]);
      onChange([...media, ...newFiles]);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }, [media, onChange, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const removeFile = useCallback((id: string) => {
    const newMedia = media.filter((m) => m.id !== id);
    // If removed file was primary, make first file primary
    if (newMedia.length > 0 && !newMedia.some((m) => m.isPrimary)) {
      newMedia[0].isPrimary = true;
    }
    onChange(newMedia);
  }, [media, onChange]);

  const setPrimary = useCallback((id: string) => {
    const newMedia = media.map((m) => ({
      ...m,
      isPrimary: m.id === id,
    }));
    onChange(newMedia);
  }, [media, onChange]);

  const moveFile = useCallback((id: string, direction: "left" | "right") => {
    const index = media.findIndex((m) => m.id === id);
    if (index === -1) return;

    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= media.length) return;

    const newMedia = [...media];
    [newMedia[index], newMedia[newIndex]] = [newMedia[newIndex], newMedia[index]];
    onChange(newMedia);
  }, [media, onChange]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-semibold text-gray-700 mb-2">
          이미지 또는 비디오를 드래그하여 업로드하세요
        </p>
        <p className="text-sm text-gray-500 mb-4">
          또는 클릭하여 파일을 선택하세요
        </p>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept="image/*,video/mp4,video/webm,video/quicktime"
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={uploading}
        />
        <label htmlFor="file-upload">
          <Button asChild disabled={uploading}>
            <span className="cursor-pointer">
              {uploading ? "업로드 중..." : "파일 선택"}
            </span>
          </Button>
        </label>
        <p className="text-xs text-gray-400 mt-3">
          이미지: JPEG, PNG, WebP, GIF (최대 10MB)<br />
          비디오: MP4, WebM, MOV (최대 50MB)
        </p>
      </div>

      {/* Media Gallery */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((file, index) => (
            <div
              key={file.id}
              className="relative group border-2 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              style={{
                borderColor: file.isPrimary ? "#FFD700" : "#e5e7eb",
              }}
            >
              {/* Media Preview */}
              <div className="aspect-video bg-gray-100 relative">
                {file.type === "image" ? (
                  <Image
                    src={file.url}
                    alt={file.alt || `Uploaded image ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                )}

                {/* Type Badge */}
                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  {file.type === "image" ? (
                    <ImageIcon className="w-3 h-3" />
                  ) : (
                    <Video className="w-3 h-3" />
                  )}
                  {file.type === "image" ? "이미지" : "비디오"}
                </div>

                {/* Primary Badge */}
                {file.isPrimary && (
                  <div className="absolute top-2 right-2 bg-[#FFD700] text-[#003366] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    대표
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!file.isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPrimary(file.id)}
                      className="text-xs"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      대표 지정
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeFile(file.id)}
                    className="text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* File Info */}
              <div className="p-2 bg-white">
                <p className="text-xs text-gray-600 truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* Move Buttons */}
              <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {index > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveFile(file.id, "left")}
                    className="h-6 w-6 p-0"
                  >
                    ←
                  </Button>
                )}
                {index < media.length - 1 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveFile(file.id, "right")}
                    className="h-6 w-6 p-0"
                  >
                    →
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {media.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>총 {media.length}개</strong>의 파일이 업로드되었습니다.
            {media.find((m) => m.isPrimary) && (
              <span className="ml-2">
                ⭐ 대표 미디어: {media.find((m) => m.isPrimary)?.filename}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
