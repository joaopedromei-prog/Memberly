'use client';

import { useState, useRef, useCallback } from 'react';
import type { LessonAttachment } from '@/types/database';

interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  attachment?: LessonAttachment;
}

interface BulkFileUploadProps {
  value: LessonAttachment[];
  onFilesChanged: (attachments: LessonAttachment[]) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function getFileIcon(type: string) {
  if (type === 'application/pdf') {
    return (
      <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 18h12a2 2 0 002-2V6l-4-4H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type.startsWith('image/')) {
    return (
      <svg className="h-5 w-5 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type.startsWith('video/')) {
    return (
      <svg className="h-5 w-5 flex-shrink-0 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function BulkFileUpload({ value, onFilesChanged }: BulkFileUploadProps) {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (fileState: FileUploadState, index: number) => {
      setUploads((prev) =>
        prev.map((u, i) =>
          i === index ? { ...u, status: 'uploading' as const, progress: 10 } : u
        )
      );

      try {
        const formData = new FormData();
        formData.append('file', fileState.file);
        formData.append('bucket', 'attachments');

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploads((prev) =>
            prev.map((u, i) =>
              i === index && u.status === 'uploading'
                ? { ...u, progress: Math.min(u.progress + 15, 85) }
                : u
            )
          );
        }, 300);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Erro ao fazer upload');
        }

        const data = await response.json();
        const attachment: LessonAttachment = {
          name: fileState.file.name,
          url: data.url,
          type: fileState.file.type || 'application/octet-stream',
          size: fileState.file.size,
        };

        setUploads((prev) =>
          prev.map((u, i) =>
            i === index
              ? { ...u, status: 'complete' as const, progress: 100, attachment }
              : u
          )
        );

        return attachment;
      } catch (err) {
        setUploads((prev) =>
          prev.map((u, i) =>
            i === index
              ? {
                  ...u,
                  status: 'error' as const,
                  progress: 0,
                  error:
                    err instanceof Error ? err.message : 'Erro ao fazer upload',
                }
              : u
          )
        );
        return null;
      }
    },
    []
  );

  const processFiles = useCallback(
    async (files: File[]) => {
      const validFiles: FileUploadState[] = [];
      const errors: string[] = [];

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`"${file.name}" excede o limite de 50MB`);
          continue;
        }
        validFiles.push({
          file,
          progress: 0,
          status: 'pending',
        });
      }

      if (errors.length > 0) {
        // Add error entries so user can see them
        const errorStates: FileUploadState[] = errors.map((msg, i) => ({
          file: files[i] || new File([], 'unknown'),
          progress: 0,
          status: 'error' as const,
          error: msg,
        }));
        setUploads((prev) => [...prev, ...errorStates]);
      }

      if (validFiles.length === 0) return;

      const startIndex = uploads.length + (errors.length > 0 ? errors.length : 0);
      setUploads((prev) => [...prev, ...validFiles]);

      const newAttachments: LessonAttachment[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        const result = await uploadFile(
          validFiles[i],
          startIndex + i
        );
        if (result) {
          newAttachments.push(result);
        }
      }

      if (newAttachments.length > 0) {
        onFilesChanged([...value, ...newAttachments]);
      }
    },
    [uploads.length, uploadFile, onFilesChanged, value]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) processFiles(files);
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) processFiles(files);
      if (inputRef.current) inputRef.current.value = '';
    },
    [processFiles]
  );

  const handleRemoveExisting = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onFilesChanged(updated);
  };

  const handleRemoveUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <svg
          className="mx-auto h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
          />
        </svg>
        <p className="mt-2 text-sm font-medium text-gray-700">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Qualquer tipo de arquivo - Max. 50MB por arquivo
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Existing attachments */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Arquivos anexados
          </p>
          {value.map((att, index) => (
            <div
              key={`existing-${index}`}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              {getFileIcon(att.type)}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-700">
                  {att.name}
                </p>
                {att.size > 0 && (
                  <p className="text-xs text-gray-500">
                    {formatFileSize(att.size)}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Salvo
              </span>
              <button
                type="button"
                onClick={() => handleRemoveExisting(index)}
                className="text-gray-400 hover:text-red-600"
                aria-label={`Remover ${att.name}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload queue */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Uploads
          </p>
          {uploads.map((upload, index) => (
            <div
              key={`upload-${index}`}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
            >
              {getFileIcon(upload.file.type)}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-700">
                  {upload.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(upload.file.size)}
                </p>
                {upload.status === 'uploading' && (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
                {upload.status === 'error' && (
                  <p className="mt-0.5 text-xs text-red-600">{upload.error}</p>
                )}
              </div>
              {upload.status === 'uploading' && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {upload.progress}%
                </span>
              )}
              {upload.status === 'complete' && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Enviado
                </span>
              )}
              {upload.status === 'error' && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  Erro
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveUpload(index)}
                className="text-gray-400 hover:text-red-600"
                aria-label={`Remover ${upload.file.name}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
