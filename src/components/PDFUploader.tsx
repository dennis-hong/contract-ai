"use client";

import { useCallback, useState } from "react";

interface PDFUploaderProps {
  onUploadComplete: (contractId: string) => void;
  isUploading: boolean;
  setIsUploading: (v: boolean) => void;
}

export default function PDFUploader({
  onUploadComplete,
  isUploading,
  setIsUploading,
}: PDFUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("PDF 파일만 업로드할 수 있습니다.");
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/contracts/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "업로드에 실패했습니다.");
        }

        const contract = await res.json();
        onUploadComplete(contract.id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "업로드에 실패했습니다."
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete, setIsUploading]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <div className="w-full">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center w-full h-52
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200
          ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <div className="flex flex-col items-center justify-center py-6">
          {isUploading ? (
            <>
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-600">
                업로드 및 파싱 중...
              </p>
            </>
          ) : (
            <>
              <svg
                className="w-10 h-10 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="text-sm font-medium text-gray-600 mb-1">
                PDF 파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-400">
                의료 데이터 구매 계약서 (PDF)
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
      </label>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
