'use client';

import { useId, useRef, useState } from 'react';
import type { StorageBucket } from '@/lib/supabase/storage';

type UploadBucket = Exclude<StorageBucket, 'avatars'>;

export interface StorageUploadResult {
  bucket: UploadBucket;
  path: string;
  url?: string;
  name: string;
  size: number;
  contentType: string;
}

interface StorageUploadFieldProps {
  bucket: UploadBucket;
  folder: string;
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  accept?: string;
  required?: boolean;
  helperText?: string;
  onUploaded?: (result: StorageUploadResult) => void;
}

const inputClass =
  'w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none';

const labelClass =
  'mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan';

function isPreviewableUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://');
}

export function StorageUploadField({
  bucket,
  folder,
  label,
  name,
  defaultValue,
  placeholder,
  accept,
  required = false,
  helperText = 'Upload first. Paste a URL or storage path only if you need to override it.',
  onUploaded,
}: StorageUploadFieldProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(defaultValue ?? '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleUpload() {
    if (!selectedFile) {
      setError('Choose a file before uploading.');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.set('bucket', bucket);
      formData.set('folder', folder);
      formData.set('file', selectedFile);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const payload = (await response.json()) as
        | ({ error?: string } & Partial<StorageUploadResult>)
        | StorageUploadResult;
      const error = 'error' in payload ? payload.error : undefined;

      if (!response.ok || !payload.path || !payload.bucket || !payload.name) {
        setError(error ?? 'Upload failed. Please try again.');
        return;
      }

      const nextValue = payload.url ?? payload.path;
      setValue(nextValue);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMessage(`Uploaded ${payload.name}.`);
      onUploaded?.(payload as StorageUploadResult);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>

      <div className="grid grid-cols-1 gap-3 border border-bmj-tan/20 bg-bmj-black/30 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <label htmlFor={fileInputId} className="mb-1 block font-label text-[10px] uppercase tracking-widest text-bmj-tan">
              Upload File
            </label>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept={accept}
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null);
                setError('');
                setMessage('');
              }}
              className="block w-full font-body text-sm text-bmj-cream file:mr-4 file:border-0 file:bg-bmj-red file:px-4 file:py-2 file:font-label file:text-xs file:uppercase file:tracking-widest file:text-bmj-white"
            />
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>

        <div>
          <input
            id={name}
            name={name}
            type="text"
            required={required}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className={inputClass}
            placeholder={placeholder}
          />
          <p className="mt-2 font-body text-xs text-bmj-tan/80">{helperText}</p>
        </div>

        {message && (
          <p className="font-body text-xs text-bmj-amber">{message}</p>
        )}

        {error && (
          <p className="font-body text-xs text-bmj-red">{error}</p>
        )}

        {value && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-mono text-bmj-tan/80 break-all">{value}</span>
            {isPreviewableUrl(value) && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="font-label uppercase tracking-widest text-bmj-cream underline underline-offset-4"
              >
                Preview
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
