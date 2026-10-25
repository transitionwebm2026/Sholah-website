/**
 * Builds every brand asset from the two source logos in `public/images`:
 *
 *   - "Ahmed Sholah logo 3.png"  doctor's logo (navy + copper, made for light backgrounds)
 *   - "logo-01.png"              Transition mark (white on transparent), used in the footer credit
 *
 * Outputs
 *   public/media/brand/logo-stacked.png          on-dark logo, original layout (footer; CMS default)
 *   public/media/brand/logo-horizontal.png       on-dark logo, figure + one-line name/tagline (header; CMS default)
 *   src/assets/images/brand/mark.png             on-dark figure only (article byline)
 *   src/assets/images/brand/transition.png       trimmed Transition mark
 *   src/app/icon.png, src/app/apple-icon.png     favicons (original colours on white)
 *   public/images/icon-192.png, icon-512.png     web-app manifest + JSON-LD logo
 *   public/images/og-ar.jpg, og-en.jpg           link previews (1200×630)
 *
 * The site is dark navy, where the logo's navy lettering would disappear, so the on-dark variant
 * turns navy into white and lifts the charcoal swoosh to silver while keeping the copper as is.
 *
 * Usage: npm run images:brand   (re-run after replacing either source logo)
 */
import sharp from 'sharp';
import {mkdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public/images');
const BRAND = path.join(ROOT, 'src/assets/images/brand');
// The two logos are the dashboard's default header/footer logos, so they live at stable public URLs.
const MEDIA_BRAND = path.join(ROOT, 'public/media/brand');
const APP = path.join(ROOT, 'src/app');

const LOGO_SRC = path.join(PUBLIC, 'Ahmed Sholah logo 3.png');
const TRANSITION_SRC = path.join(PUBLIC, 'logo-01.png');

const NAVY_LIGHT = '#0d47a1';
const NAVY_DARK = '#062553';
const GOLD = '#dfa581';

/* ---------- Pixel helpers ---------- */

async function loadRaw(input) {
  const {data, info} = await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject: true});
  return {data, width: info.width, height: info.height};
}

const fromRaw = ({data, width, height}) => sharp(data, {raw: {width, height, channels: 4}});

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const mix = (a, b, t) => a + (b - a) * t;

/**
 * Navy → white, charcoal/grey → silver, copper untouched. Weights are continuous so the
 * anti-aliased edges and gradient transitions stay smooth.
 */
function toOnDark({data, width, height}) {
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] === 0) continue;
    const [r, g, b] = [out[i], out[i + 1], out[i + 2]];
    const warmth = clamp01((r - b - 12) / 40);
    const blueness = clamp01((b - r - 22) / 30);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const silver = 255 - (255 - lum) * 0.42;
    const cool = [mix(silver - 4, 255, blueness), mix(silver, 255, blueness), mix(silver + 6, 255, blueness)];
    out[i] = Math.round(mix(cool[0], r, warmth));
    out[i + 1] = Math.round(mix(cool[1], g, warmth));
    out[i + 2] = Math.round(mix(cool[2], b, warmth));
  }
  return {data: out, width, height};
}

/** Bounding boxes of the non-transparent runs along one axis inside a region. */
function bands(img, axis, {x0 = 0, x1 = img.width, y0 = 0, y1 = img.height} = {}) {
  const result = [];
  let start = -1;
  const [a0, a1] = axis === 'y' ? [y0, y1] : [x0, x1];
  for (let a = a0; a < a1; a++) {
    let hit = false;
    const [b0, b1] = axis === 'y' ? [x0, x1] : [y0, y1];
    for (let b = b0; b < b1 && !hit; b++) {
      const [x, y] = axis === 'y' ? [b, a] : [a, b];
      hit = img.data[(y * img.width + x) * 4 + 3] > 40;
    }
    if (hit && start < 0) start = a;
    if (!hit && start >= 0) {
      result.push([start, a]);
      start = -1;
    }
  }
  if (start >= 0) result.push([start, a1]);
  return result;
}

async function crop(img, {left, top, width, height}) {
  return fromRaw(img).extract({left, top, width, height}).png().toBuffer();
}

/* ---------- Logo geometry (measured from the source, so it survives small edits) ---------- */

const logo = await loadRaw(LOGO_SRC);
const [figureCols, textCols] = bands(logo, 'x');
const textLines = bands(logo, 'y', {x0: textCols[0], x1: textCols[1]});
if (textLines.length !== 5) throw new Error(`Expected 5 text lines in the logo, found ${textLines.length}`);
const figureRows = bands(logo, 'y', {x0: figureCols[0], x1: figureCols[1]});
const figure = {
  left: figureCols[0],
  top: figureRows[0][0],
  width: figureCols[1] - figureCols[0],
  height: figureRows.at(-1)[1] - figureRows[0][0]
};

// Lines 1–2: "DR. AHMED" / "SHOULAH". Lines 3–5: "Plastic" / "& hand surgery" / "consultant".
const [name1, name2, ...tagLines] = textLines;
// Tagline lines share one ascender-to-baseline height; "& hand surgery" also has descenders.
const ascender = tagLines[0][1] - tagLines[0][0];
const descender = Math.max(...tagLines.map(([t, b]) => b - t)) - ascender;

function lineBox([top, bottom], extraBottom = 0) {
  const cols = bands(logo, 'x', {x0: textCols[0], x1: textCols[1], y0: top, y1: bottom + extraBottom});
  return {left: cols[0][0], top, width: cols.at(-1)[1] - cols[0][0], height: bottom - top + extraBottom};
}

/* ---------- On-dark logo variants ---------- */

const onDark = toOnDark(logo);

async function stackedLogo() {
  const left = figure.left;
  const top = Math.min(figure.top, name1[0]);
  const width = textCols[1] - left;
  const height = Math.max(figure.top + figure.height, tagLines.at(-1)[1]) - top;
  return fromRaw(onDark).extract({left, top, width, height}).resize({height: 420}).png({compressionLevel: 9}).toBuffer();
}

/** Figure, then "DR. AHMED SHOULAH" on one line and the tagline on one line below it. */
async function horizontalLogo() {
  const nameBoxes = [lineBox(name1), lineBox(name2)];
  const tagBoxes = tagLines.map(([t]) => lineBox([t, t + ascender], descender));
  const nameGap = Math.round((name1[1] - name1[0]) * 0.42);
  const tagGap = Math.round(ascender * 0.42);

  const row = async (boxes, gap) => {
    const width = boxes.reduce((sum, b) => sum + b.width, 0) + gap * (boxes.length - 1);
    const height = Math.max(...boxes.map((b) => b.height));
    let x = 0;
    const parts = [];
    for (const box of boxes) {
      parts.push({input: await crop(onDark, box), left: x, top: 0});
      x += box.width + gap;
    }
    const buffer = await sharp({create: {width, height, channels: 4, background: {r: 0, g: 0, b: 0, alpha: 0}}})
      .composite(parts)
      .png()
      .toBuffer();
    return {buffer, width, height};
  };

  const nameRow = await row(nameBoxes, nameGap);
  const tagRowFull = await row(tagBoxes, tagGap);
  // The tagline sits a little narrower than the name so the name stays dominant.
  const tagWidth = Math.round(nameRow.width * 0.86);
  const tagHeight = Math.round((tagRowFull.height * tagWidth) / tagRowFull.width);
  const tagRow = await sharp(tagRowFull.buffer).resize({width: tagWidth}).png().toBuffer();

  const lineGap = Math.round(nameRow.height * 0.34);
  const textHeight = nameRow.height + lineGap + tagHeight;
  const figHeight = Math.round(textHeight * 1.42);
  const figWidth = Math.round((figure.width * figHeight) / figure.height);
  const figBuffer = await fromRaw(onDark).extract(figure).resize({height: figHeight}).png().toBuffer();
  const gap = Math.round(figWidth * 0.36);

  const width = figWidth + gap + nameRow.width;
  const textTop = Math.round((figHeight - textHeight) / 2);
  return sharp({create: {width, height: figHeight, channels: 4, background: {r: 0, g: 0, b: 0, alpha: 0}}})
    .composite([
      {input: figBuffer, left: 0, top: 0},
      {input: nameRow.buffer, left: figWidth + gap, top: textTop},
      {input: tagRow, left: figWidth + gap, top: textTop + nameRow.height + lineGap}
    ])
    .png({compressionLevel: 9})
    .toBuffer();
}

async function markOnDark() {
  return fromRaw(onDark).extract(figure).resize({height: 160}).png({compressionLevel: 9}).toBuffer();
}

/* ---------- Icons: original colours on white, so they read on light and dark tab bars ---------- */

/** `fill` is the figure's height as a share of the tile; 0.62 keeps it inside the maskable safe zone. */
async function iconTile(size, {radius = 0, fill}) {
  const figHeight = Math.round(size * fill);
  const figBuffer = await fromRaw(logo).extract(figure).resize({height: figHeight}).png().toBuffer();
  const {width: figWidth} = await sharp(figBuffer).metadata();
  const tile = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#ffffff"/></svg>`
  );
  return sharp(tile)
    .composite([{input: figBuffer, left: Math.round((size - figWidth) / 2), top: Math.round((size - figHeight) / 2)}])
    .png({compressionLevel: 9})
    .toBuffer();
}

/* ---------- Open Graph: on-dark logo centred on the site's navy (WhatsApp crops to the centre) ---------- */

async function ogImage() {
  const w = 1200;
  const h = 630;
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${NAVY_LIGHT}"/>
        <stop offset="1" stop-color="${NAVY_DARK}"/>
      </linearGradient>
      <radialGradient id="glow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="${GOLD}" stop-opacity=".2"/>
        <stop offset=".6" stop-color="${GOLD}" stop-opacity=".05"/>
        <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity=".05"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <ellipse cx="${w / 2}" cy="${h / 2}" rx="520" ry="400" fill="url(#glow)"/>
    <circle cx="${w / 2}" cy="${h / 2}" r="285" fill="none" stroke="${GOLD}" stroke-opacity=".22" stroke-width="2"/>
    <rect x="0" y="${h - 10}" width="${w}" height="10" fill="${GOLD}"/>
  </svg>`);
  const logoHeight = 430;
  const logoBuffer = await sharp(await stackedLogo()).resize({height: logoHeight}).png().toBuffer();
  const {width: logoWidth} = await sharp(logoBuffer).metadata();
  return sharp(bg)
    .composite([{input: logoBuffer, left: Math.round((w - logoWidth) / 2), top: Math.round((h - logoHeight) / 2) - 5}])
    .jpeg({quality: 88, mozjpeg: true})
    .toBuffer();
}

/* ---------- Transition mark ---------- */

async function transitionMark() {
  return sharp(TRANSITION_SRC).trim({threshold: 1}).resize({height: 96, fit: 'inside'}).png({compressionLevel: 9}).toBuffer();
}

/* ---------- Output ---------- */

await mkdir(BRAND, {recursive: true});
await mkdir(MEDIA_BRAND, {recursive: true});

const outputs = [
  [path.join(MEDIA_BRAND, 'logo-stacked.png'), stackedLogo()],
  [path.join(MEDIA_BRAND, 'logo-horizontal.png'), horizontalLogo()],
  [path.join(BRAND, 'mark.png'), markOnDark()],
  [path.join(BRAND, 'transition.png'), transitionMark()],
  [path.join(APP, 'icon.png'), iconTile(192, {radius: 40, fill: 0.86})],
  [path.join(APP, 'apple-icon.png'), iconTile(180, {fill: 0.76})],
  [path.join(PUBLIC, 'icon-192.png'), iconTile(192, {fill: 0.62})],
  [path.join(PUBLIC, 'icon-512.png'), iconTile(512, {fill: 0.62})]
];

const og = ogImage();
outputs.push([path.join(PUBLIC, 'og-ar.jpg'), og], [path.join(PUBLIC, 'og-en.jpg'), og]);

for (const [file, buffer] of outputs) {
  await writeFile(file, await buffer);
  console.log('✓', path.relative(ROOT, file));
}

// `icon.png` replaces the old placeholder favicon; two icon files would both be linked.
await rm(path.join(APP, 'icon.svg'), {force: true});
