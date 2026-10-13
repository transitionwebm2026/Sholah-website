/**
 * Post-export fix for Next.js 16 per-segment prefetch files on static hosting.
 *
 * `next build` (output: 'export') writes segment payloads as nested folders, e.g.
 *   out/ar/about/__next.$d$locale/about/__PAGE__.txt
 * while the client router requests the dot-joined name:
 *   /ar/about/__next.$d$locale.about.__PAGE__.txt
 * Without this step every prefetch 404s (navigation still works, but wastes requests and
 * logs console errors). This script adds the dot-joined copies; originals are kept.
 */
import {copyFile, readdir} from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../out');

async function* files(dir, rel = []) {
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* files(full, [...rel, entry.name]);
    else yield {full, rel: [...rel, entry.name]};
  }
}

let created = 0;

async function visit(dir) {
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith('__next.')) {
      for await (const file of files(full)) {
        const flatName = [entry.name, ...file.rel].join('.');
        await copyFile(file.full, path.join(dir, flatName));
        created++;
      }
    } else {
      await visit(full);
    }
  }
}

try {
  await visit(OUT);
  console.log(`✓ RSC segments: ${created} prefetch files flattened`);
} catch (error) {
  if (error.code === 'ENOENT') console.log('• RSC segments: no `out/` folder, skipped');
  else throw error;
}
