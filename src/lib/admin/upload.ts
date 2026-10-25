'use client';

import {supabaseKey, supabaseUrl} from '@/lib/cms/rest';
import {getAdminClient} from './supabase';

export type Bucket = 'images' | 'videos';

/** Matches `file_size_limit` of the buckets in supabase/schema.sql. */
export const MAX_BYTES: Record<Bucket, number> = {images: 10 * 1024 * 1024, videos: 50 * 1024 * 1024};

export const ACCEPT: Record<Bucket, string> = {
  images: 'image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml',
  videos: 'video/mp4,video/webm,video/quicktime'
};

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov'
};

/** `timestamp-name.ext` with a URL-safe ASCII name (Arabic file names become "file"). */
export function storagePath(folder: string, file: File): string {
  const ext = EXTENSIONS[file.type] ?? file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const base =
    file.name
      .replace(/\.[^.]+$/, '')
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'file';
  return `${folder.replace(/^\/+|\/+$/g, '')}/${Date.now()}-${base}.${ext}`;
}

export function publicUrl(bucket: Bucket, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

/**
 * Static hosting has no image optimiser, so photos are resized and re-encoded in the browser
 * before upload: a 6 MB phone photo typically becomes a ~250 KB WebP. GIF/SVG/AVIF are kept as is.
 */
export async function prepareImage(file: File, maxWidth: number): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, maxWidth / bitmap.width);
  if (scale === 1 && file.size < 300 * 1024) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const encode = (type: string, quality?: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  // WebP keeps transparency (logos). Browsers that cannot encode it return PNG: fall back then.
  let blob = await encode('image/webp', 0.84);
  if (!blob || blob.type !== 'image/webp') blob = file.type === 'image/png' ? await encode('image/png') : await encode('image/jpeg', 0.85);
  if (!blob || (blob.size >= file.size && scale === 1)) return file;

  const ext = EXTENSIONS[blob.type] ?? 'jpg';
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + `.${ext}`, {type: blob.type});
}

/**
 * Uploads with progress (XHR, which fetch cannot report) and resolves with the public CDN URL.
 * File names are unique, so files are cached by browsers and the CDN for a year.
 */
export async function uploadFile(
  bucket: Bucket,
  folder: string,
  file: File,
  onProgress?: (fraction: number) => void
): Promise<string> {
  if (file.size > MAX_BYTES[bucket]) {
    throw new Error(`الملف أكبر من الحد المسموح (${Math.round(MAX_BYTES[bucket] / 1024 / 1024)} ميجابايت).`);
  }
  const {data} = await getAdminClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('انتهت الجلسة، سجّل الدخول مرة أخرى.');

  const path = storagePath(folder, file);
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${bucket}/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', supabaseKey);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('cache-control', 'max-age=31536000');
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = xhr.responseText;
      try {
        message = (JSON.parse(xhr.responseText) as {message?: string}).message ?? message;
      } catch {
        // Plain-text error.
      }
      if (xhr.status === 413 || /too large|exceeded/i.test(message)) message = 'الملف أكبر من الحد المسموح في Supabase.';
      else if (/mime type/i.test(message)) message = 'نوع الملف غير مسموح.';
      else if (xhr.status === 403 || /row-level security/i.test(message)) message = 'ليست لديك صلاحية رفع الملفات.';
      reject(new Error(message || `فشل الرفع (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('تعذّر الاتصال بالخادم أثناء الرفع.'));
    xhr.send(file);
  });
  onProgress?.(1);
  return publicUrl(bucket, path);
}

/** Reads a local video's duration ("m:ss") and orientation before upload. */
export function readVideoMeta(file: File): Promise<{duration: string; orientation: 'portrait' | 'landscape'} | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    const done = (value: {duration: string; orientation: 'portrait' | 'landscape'} | null) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    video.onloadedmetadata = () => {
      const total = Math.round(video.duration);
      if (!Number.isFinite(total)) return done(null);
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = String(total % 60).padStart(2, '0');
      done({
        duration: hours ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`,
        orientation: video.videoHeight > video.videoWidth ? 'portrait' : 'landscape'
      });
    };
    video.onerror = () => done(null);
    video.src = url;
  });
}
