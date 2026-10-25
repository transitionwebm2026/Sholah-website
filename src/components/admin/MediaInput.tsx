'use client';

import {Film, ImageUp, Link2, RefreshCw, Trash2, UploadCloud} from 'lucide-react';
import {useId, useRef, useState, useSyncExternalStore, type DragEvent} from 'react';
import {youtubeId} from '@/lib/cms/media';
import {ACCEPT, MAX_BYTES, prepareImage, readVideoMeta, uploadFile, type Bucket} from '@/lib/admin/upload';
import {cn} from '@/lib/utils';
import {Button, inputClass, useToast} from './ui';

/* ---------- Uploads in progress (Save buttons wait for them) ---------- */

let activeUploads = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useUploading(): boolean {
  return useSyncExternalStore(subscribe, () => activeUploads > 0, () => false);
}

/* ---------- Component ---------- */

type Props = {
  kind: 'image' | 'video';
  value: string;
  onChange: (url: string) => void;
  /** Storage folder inside the bucket, e.g. `articles` or `videos/thumbnails`. */
  folder: string;
  /** Images are resized to this width before upload. */
  maxWidth?: number;
  /** Tailwind aspect class for the preview, e.g. `aspect-video`. */
  aspect?: string;
  /** Video only: called with the duration/orientation read from a chosen file. */
  onVideoMeta?: (meta: {duration: string; orientation: 'portrait' | 'landscape'}) => void;
  id?: string;
};

/**
 * Drag & drop or pick a file from the computer → (images: resized in the browser) → uploaded to
 * the `images`/`videos` bucket as `timestamp-name.ext` → the public URL is put into the form.
 * A link can be pasted instead (YouTube or .mp4 for videos, any image URL for images).
 */
export function MediaInput({kind, value, onChange, folder, maxWidth = 1600, aspect, onVideoMeta, id}: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const linkId = useId();
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const bucket: Bucket = kind === 'image' ? 'images' : 'videos';

  async function handleFile(file: File) {
    const allowed = ACCEPT[bucket].split(',');
    if (!allowed.includes(file.type)) {
      toast(kind === 'image' ? 'اختر صورة (JPG أو PNG أو WebP أو SVG).' : 'اختر فيديو MP4 أو WebM أو MOV.', 'error');
      return;
    }
    activeUploads++;
    emit();
    setProgress(0);
    try {
      let upload = file;
      if (kind === 'image') upload = await prepareImage(file, maxWidth);
      else if (onVideoMeta) {
        const meta = await readVideoMeta(file);
        if (meta) onVideoMeta(meta);
      }
      if (upload.size > MAX_BYTES[bucket]) {
        throw new Error(`الملف (${(upload.size / 1024 / 1024).toFixed(1)} ميجابايت) أكبر من الحد المسموح ${MAX_BYTES[bucket] / 1024 / 1024} ميجابايت.`);
      }
      const url = await uploadFile(bucket, folder, upload, setProgress);
      onChange(url);
      toast(kind === 'image' ? 'تم رفع الصورة' : 'تم رفع الفيديو');
    } catch (error) {
      toast(error instanceof Error ? error.message : String(error), 'error');
    } finally {
      activeUploads--;
      emit();
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const uploading = progress !== null;
  const ytId = kind === 'video' ? youtubeId(value) : null;

  return (
    <div className="space-y-2">
      {value && !uploading ? (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-navy-950/70">
          <div className={cn('relative grid place-items-center bg-[repeating-conic-gradient(#0a1a33_0_25%,#0d2142_0_50%)] bg-[length:20px_20px]', aspect ?? (kind === 'video' ? 'aspect-video' : 'aspect-[16/9]'))}>
            {kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary URL
              <img src={value} alt="" className="absolute inset-0 size-full object-contain" />
            ) : ytId ? (
              // eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail preview
              <img src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <video src={value} controls preload="metadata" className="absolute inset-0 size-full bg-black object-contain" />
            )}
            {ytId && (
              <span className="absolute top-2 start-2 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">YouTube</span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
            <a href={value} target="_blank" rel="noreferrer" dir="ltr" className="max-w-[60%] truncate text-xs text-white/50 hover:text-gold-300">
              {value.split('/').pop()}
            </a>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => inputRef.current?.click()}>
                <RefreshCw aria-hidden className="size-4" />
                استبدال
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onChange('')} className="text-red-200 hover:text-red-100">
                <Trash2 aria-hidden className="size-4" />
                إزالة
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          id={id}
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition',
            dragging ? 'border-gold-400 bg-gold-400/10' : 'border-white/15 bg-navy-950/40 hover:border-gold-400/60 hover:bg-white/[0.03]'
          )}
        >
          {uploading ? (
            <>
              <UploadCloud aria-hidden className="size-8 animate-pulse text-gold-400" />
              <span className="text-sm font-semibold">جارٍ الرفع… {Math.round((progress ?? 0) * 100)}%</span>
              <span className="mt-1 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-gold-400 transition-[width]" style={{width: `${Math.round((progress ?? 0) * 100)}%`}} />
              </span>
            </>
          ) : (
            <>
              {kind === 'image' ? <ImageUp aria-hidden className="size-8 text-gold-400" /> : <Film aria-hidden className="size-8 text-gold-400" />}
              <span className="text-sm font-semibold">اسحب الملف هنا أو اضغط للاختيار من الجهاز</span>
              <span className="text-xs text-white/50">
                {kind === 'image'
                  ? 'JPG · PNG · WebP · SVG — تُصغَّر الصور تلقائيًا قبل الرفع'
                  : `MP4 · WebM · MOV — حتى ${MAX_BYTES.videos / 1024 / 1024} ميجابايت`}
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[bucket]}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <div>
        <button
          type="button"
          onClick={() => setShowLink((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/55 hover:text-gold-300"
          aria-expanded={showLink}
          aria-controls={linkId}
        >
          <Link2 aria-hidden className="size-3.5" />
          {kind === 'video' ? 'أو الصق رابط يوتيوب / رابط فيديو مباشر' : 'أو الصق رابط صورة'}
        </button>
        {showLink && (
          <input
            id={linkId}
            type="url"
            dir="ltr"
            value={value}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder={kind === 'video' ? 'https://www.youtube.com/watch?v=…' : 'https://…'}
            className={cn(inputClass, 'mt-2 text-sm')}
          />
        )}
      </div>
    </div>
  );
}
