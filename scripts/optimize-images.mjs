/**
 * Resizes and recompresses source images in place. Runs automatically before every build
 * (`prebuild`), because a static export has no image-optimization server: whatever is in
 * `src/assets/images` is exactly what visitors download.
 *
 * Idempotent: images that are already within the size and weight limits are left untouched,
 * so you can simply drop full-resolution photos into the folders and run `npm run build`.
 */
import sharp from 'sharp';
import {readdir, rename, stat} from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

/** Maximum rendered width per folder (×2 for high-density screens where it matters). */
const TARGETS = [
  {dir: 'src/assets/images/doctor', maxWidth: 1000},
  {dir: 'src/assets/images/services', maxWidth: 1200},
  {dir: 'src/assets/images/procedures', maxWidth: 900},
  {dir: 'src/assets/images/articles', maxWidth: 1400},
  {dir: 'src/assets/images/videos', maxWidth: 1600},
  {dir: 'src/assets/images/certificates', maxWidth: 1200},
  {dir: 'public/images', maxWidth: 1200}
];

/** Above this many bytes per pixel a file is almost certainly not web-compressed. */
const MAX_BYTES_PER_PIXEL = 0.3;
const SUPPORTED = /\.(jpe?g|png|webp)$/i;

async function* walk(dir) {
  let entries = [];
  try {
    entries = await readdir(dir, {withFileTypes: true});
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (SUPPORTED.test(entry.name)) yield full;
  }
}

function encoder(pipeline, file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') return pipeline.png({compressionLevel: 9, palette: true, quality: 85});
  if (ext === '.webp') return pipeline.webp({quality: 80});
  return pipeline.jpeg({quality: 80, mozjpeg: true, progressive: true});
}

let optimized = 0;
let savedBytes = 0;

for (const {dir, maxWidth} of TARGETS) {
  for await (const file of walk(path.join(ROOT, dir))) {
    const {size} = await stat(file);
    const meta = await sharp(file).metadata();
    const tooWide = (meta.width ?? 0) > maxWidth;
    const tooHeavy = size / ((meta.width ?? 1) * (meta.height ?? 1)) > MAX_BYTES_PER_PIXEL;
    if (!tooWide && !tooHeavy) continue;

    const tmp = `${file}.tmp`;
    // `.rotate()` applies the EXIF orientation of phone/camera photos before metadata is stripped.
    await encoder(sharp(file).rotate().resize({width: maxWidth, withoutEnlargement: true}), file).toFile(tmp);
    const {size: newSize} = await stat(tmp);
    await rename(tmp, file);

    optimized++;
    savedBytes += size - newSize;
    console.log(`  optimized ${path.relative(ROOT, file)}  ${(size / 1024).toFixed(0)} KB → ${(newSize / 1024).toFixed(0)} KB`);
  }
}

console.log(
  optimized
    ? `✓ Images: ${optimized} optimized, ${(savedBytes / 1024 / 1024).toFixed(2)} MB saved`
    : '✓ Images: all within limits'
);
