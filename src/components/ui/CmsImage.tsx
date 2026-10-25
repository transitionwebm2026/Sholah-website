import Image from 'next/image';

type Props = {
  src: string | null | undefined;
  alt?: string;
  sizes: string;
  className?: string;
  /** Above-the-fold images (hero, featured article). */
  priority?: boolean;
};

/**
 * Fills its (relatively positioned, sized) parent with a CMS image: either an uploaded Supabase
 * Storage file or a bundled `/media/…` default. Renders nothing when empty, so the parent's
 * background shows instead of a broken image.
 */
export function CmsImage({src, alt = '', sizes, className, priority}: Props) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={priority}
      fetchPriority={priority ? 'high' : undefined}
      className={className}
    />
  );
}
