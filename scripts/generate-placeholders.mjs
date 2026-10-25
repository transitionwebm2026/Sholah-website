/**
 * Generates branded placeholder artwork (navy gradient + gold line motifs).
 *
 * Every file is written as a JPG under `public/media`, where the CMS seed content points to them.
 * Real photos are normally uploaded from the dashboard instead of replacing these files.
 *
 * Usage: npm run images:placeholders
 */
import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ASSETS = path.join(ROOT, 'public/media');

const GOLD = '#dfa581';
const NAVY_LIGHT = '#0d47a1';
const NAVY_DARK = '#062553';

// Deterministic pseudo-random so re-running produces identical files.
function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* ---------- Motifs (drawn in a ~400x400 box centred on 0,0) ---------- */

const motifs = {
  laparoscopy: () => `
    <circle r="150" stroke-opacity=".35" stroke-width="3"/>
    <circle r="34" fill="${GOLD}" fill-opacity=".18"/>
    <circle r="34"/>
    <path d="M-250 -190 L-26 -20" stroke-width="10"/>
    <path d="M0 -280 L0 -34" stroke-width="10"/>
    <path d="M250 -190 L26 -20" stroke-width="10"/>
    <circle cx="-120" cy="-91" r="12" fill="${GOLD}"/>
    <circle cx="0" cy="-150" r="12" fill="${GOLD}"/>
    <circle cx="120" cy="-91" r="12" fill="${GOLD}"/>`,

  hernia: () => {
    const r = 160;
    let lines = '';
    for (let x = -140; x <= 140; x += 28) {
      const y = Math.sqrt(r * r - x * x).toFixed(1);
      lines += `<path d="M${x} -${y} L${x} ${y}"/><path d="M-${y} ${x} L${y} ${x}"/>`;
    }
    return `
      <circle r="${r + 26}" stroke-opacity=".35" stroke-width="3"/>
      <g transform="rotate(45)" stroke-width="3" stroke-opacity=".75">${lines}</g>
      <circle r="${r}" stroke-width="6"/>`;
  },

  anorectal: () => {
    let dots = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      dots += `<circle cx="${(Math.cos(a) * 200).toFixed(1)}" cy="${(Math.sin(a) * 200).toFixed(1)}" r="7" fill="${GOLD}" stroke="none"/>`;
    }
    return `
      <circle r="56" stroke-width="8"/>
      <circle r="104" stroke-width="4" stroke-opacity=".8"/>
      <circle r="152" stroke-width="3" stroke-dasharray="14 12" stroke-opacity=".6"/>
      ${dots}`;
  },

  endocrine: () => `
    <path d="M0 -230 L0 230" stroke-width="5" stroke-opacity=".45"/>
    ${[-180, -130, -80, 80, 130, 180].map((y) => `<path d="M-26 ${y} L26 ${y}" stroke-width="4" stroke-opacity=".45"/>`).join('')}
    <ellipse cx="-88" cy="0" rx="66" ry="138" transform="rotate(-16 -88 0)" fill="${GOLD}" fill-opacity=".12" stroke-width="7"/>
    <ellipse cx="88" cy="0" rx="66" ry="138" transform="rotate(16 88 0)" fill="${GOLD}" fill-opacity=".12" stroke-width="7"/>
    <rect x="-40" y="20" width="80" height="44" rx="22" fill="${GOLD}" fill-opacity=".25" stroke-width="6"/>`,

  pulse: () => `
    <circle r="190" stroke-opacity=".25" stroke-width="3"/>
    <path d="M-300 0 H-110 L-80 -50 L-50 80 L-10 -170 L30 130 L64 0 H300" stroke-width="10" stroke-linejoin="round"/>`,

  cross: () => `
    <circle r="190" stroke-opacity=".3" stroke-width="3"/>
    <circle r="150" stroke-width="5"/>
    <path d="M-40 -110 H40 V-40 H110 V40 H40 V110 H-40 V40 H-110 V-40 H-40 Z" fill="${GOLD}" fill-opacity=".15" stroke-width="7" stroke-linejoin="round"/>`,

  leaf: () => `
    <circle r="190" stroke-opacity=".3" stroke-width="3"/>
    <path d="M-120 130 C-140 -40 -20 -160 150 -150 C160 20 40 150 -120 130 Z" fill="${GOLD}" fill-opacity=".14" stroke-width="7"/>
    <path d="M-120 130 C-40 40 40 -40 110 -110" stroke-width="5"/>
    <path d="M-40 52 L-60 -10 M10 2 L-4 -70 M60 -50 L50 -110 M-10 30 L60 40 M40 -14 L110 -6" stroke-width="4" stroke-opacity=".8"/>`,

  checklist: () => `
    <rect x="-130" y="-170" width="260" height="340" rx="24" stroke-width="7" fill="${GOLD}" fill-opacity=".08"/>
    <rect x="-50" y="-196" width="100" height="52" rx="14" stroke-width="6" fill="${NAVY_DARK}"/>
    ${[-80, -10, 60].map((y) => `<path d="M-90 ${y} l18 18 l32 -36" stroke-width="7" stroke-linejoin="round"/><path d="M-10 ${y} H90" stroke-width="7" stroke-opacity=".7"/>`).join('')}
    <path d="M-90 130 H90" stroke-width="7" stroke-opacity=".4"/>`,

  shield: () => `
    <circle r="190" stroke-opacity=".3" stroke-width="3"/>
    <path d="M0 -170 L140 -115 V10 C140 100 70 150 0 180 C-70 150 -140 100 -140 10 V-115 Z" fill="${GOLD}" fill-opacity=".12" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-60 0 L-15 45 L70 -50" stroke-width="10" stroke-linejoin="round"/>`,

  scalpel: () => `
    <circle r="190" stroke-opacity=".3" stroke-width="3"/>
    <g transform="rotate(-40)">
      <rect x="-26" y="-20" width="52" height="230" rx="18" fill="${GOLD}" fill-opacity=".15" stroke-width="6"/>
      <path d="M-18 -20 L-18 -150 C-18 -210 30 -230 30 -170 L18 -20 Z" fill="${GOLD}" fill-opacity=".3" stroke-width="6" stroke-linejoin="round"/>
      ${[30, 70, 110, 150].map((y) => `<path d="M-14 ${y} H14" stroke-width="4" stroke-opacity=".7"/>`).join('')}
    </g>`
};

/* ---------- Base composition ---------- */

function background({w, h, seed}) {
  const r = rng(seed);
  const gx = (0.15 + r() * 0.7).toFixed(2);
  const gy = (0.1 + r() * 0.5).toFixed(2);
  const dots = Array.from({length: 26}, () => {
    const x = (r() * w).toFixed(0);
    const y = (r() * h).toFixed(0);
    const rad = (1 + r() * 2.5).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="${rad}" fill="${GOLD}" fill-opacity="${(0.15 + r() * 0.35).toFixed(2)}"/>`;
  }).join('');
  return `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${NAVY_LIGHT}"/>
        <stop offset="1" stop-color="${NAVY_DARK}"/>
      </linearGradient>
      <radialGradient id="glow" cx="${gx}" cy="${gy}" r="0.75">
        <stop offset="0" stop-color="${GOLD}" stop-opacity=".28"/>
        <stop offset=".55" stop-color="${GOLD}" stop-opacity=".05"/>
        <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity=".05"/>
      </pattern>
      <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
        <stop offset=".55" stop-color="#031633" stop-opacity="0"/>
        <stop offset="1" stop-color="#031633" stop-opacity=".55"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <rect width="100%" height="100%" fill="url(#glow)"/>
    ${dots}
    <path d="M${-w * 0.1} ${h * 0.95} L${w * 1.1} ${h * 0.15}" stroke="${GOLD}" stroke-opacity=".08" stroke-width="${Math.round(w * 0.12)}"/>`;
}

function artwork({w, h, motif, seed, scale}) {
  const s = scale ?? Math.min(w, h) / 620;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${background({w, h, seed})}
    <g transform="translate(${w / 2} ${h / 2}) scale(${s.toFixed(3)})" fill="none" stroke="${GOLD}" stroke-linecap="round">
      ${motifs[motif]()}
    </g>
    <rect width="100%" height="100%" fill="url(#vignette)"/>
  </svg>`;
}

function portrait({w, h, seed}) {
  const s = (w / 960).toFixed(3);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${background({w, h, seed})}
    <circle cx="${w / 2}" cy="${h * 0.42}" r="${w * 0.4}" fill="none" stroke="${GOLD}" stroke-opacity=".35" stroke-width="3"/>
    <defs>
      <linearGradient id="sil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0f4fae"/>
        <stop offset="1" stop-color="#041a3d"/>
      </linearGradient>
    </defs>
    <g transform="translate(${w / 2} ${h * 0.5}) scale(${s})" stroke-linecap="round" stroke-linejoin="round">
      <path d="M-330 620 C-330 300 -210 190 0 190 C210 190 330 300 330 620 Z" fill="url(#sil)" stroke="${GOLD}" stroke-opacity=".7" stroke-width="4"/>
      <path d="M-120 205 L0 440 L120 205" stroke="${GOLD}" stroke-opacity=".55" stroke-width="5" fill="none"/>
      <path d="M-62 196 L0 330 L62 196" stroke="${GOLD}" stroke-opacity=".35" stroke-width="3" fill="none"/>
      <rect x="-56" y="104" width="112" height="116" rx="44" fill="url(#sil)"/>
      <ellipse cx="0" cy="-10" rx="128" ry="152" fill="url(#sil)" stroke="${GOLD}" stroke-opacity=".7" stroke-width="4"/>
      <path d="M-110 236 C-150 330 -80 420 0 400 M110 236 C150 330 90 410 0 400" stroke="${GOLD}" stroke-width="10" fill="none"/>
      <circle cx="0" cy="416" r="22" fill="${NAVY_DARK}" stroke="${GOLD}" stroke-width="9"/>
    </g>
    <rect width="100%" height="100%" fill="url(#vignette)"/>
  </svg>`;
}

function certificate({w, h, seed}) {
  const r = rng(seed);
  const lines = [0.42, 0.5, 0.56, 0.62]
    .map((y, i) => {
      const len = i === 0 ? 0.5 : 0.36 + r() * 0.2;
      return `<rect x="${(w * (1 - len)) / 2}" y="${h * y}" width="${w * len}" height="${i === 0 ? 16 : 9}" rx="4" fill="${i === 0 ? NAVY_DARK : '#8a8f9c'}" fill-opacity="${i === 0 ? 0.85 : 0.45}"/>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${background({w, h, seed})}
    <rect x="${w * 0.07}" y="${h * 0.08}" width="${w * 0.86}" height="${h * 0.84}" rx="10" fill="#fbf7f2"/>
    <rect x="${w * 0.1}" y="${h * 0.12}" width="${w * 0.8}" height="${h * 0.76}" rx="6" fill="none" stroke="${GOLD}" stroke-width="5"/>
    <rect x="${w * 0.115}" y="${h * 0.14}" width="${w * 0.77}" height="${h * 0.72}" rx="4" fill="none" stroke="${GOLD}" stroke-opacity=".5" stroke-width="2"/>
    <rect x="${w * 0.36}" y="${h * 0.22}" width="${w * 0.28}" height="14" rx="6" fill="${GOLD}"/>
    <rect x="${w * 0.3}" y="${h * 0.3}" width="${w * 0.4}" height="24" rx="8" fill="${NAVY_LIGHT}" fill-opacity=".9"/>
    ${lines}
    <g transform="translate(${w * 0.72} ${h * 0.74})">
      <path d="M-26 20 L-40 92 L-12 76 L0 104 L12 30 Z M26 20 L40 92 L12 76 L0 104 L-12 30 Z" fill="${NAVY_DARK}" fill-opacity=".85"/>
      <circle r="52" fill="${GOLD}"/>
      <circle r="40" fill="none" stroke="#fbf7f2" stroke-width="3" stroke-dasharray="6 5"/>
    </g>
    <rect x="${w * 0.2}" y="${h * 0.76}" width="${w * 0.22}" height="4" rx="2" fill="${NAVY_DARK}" fill-opacity=".6"/>
  </svg>`;
}

/* ---------- Output ---------- */
// Open Graph covers and favicons are made from the real logo: see `generate-brand-assets.mjs`.

async function write(svg, file, {quality = 82} = {}) {
  await mkdir(path.dirname(file), {recursive: true});
  await sharp(Buffer.from(svg)).jpeg({quality, mozjpeg: true}).toFile(file);
  console.log('✓', path.relative(ROOT, file));
}

const jobs = [];
// Optional folder filter, so real photos elsewhere are never overwritten:
// `npm run images:placeholders -- procedures` regenerates only `src/assets/images/procedures`.
const only = process.argv[2];
const img = (rel, svg) => {
  if (only && !rel.startsWith(`${only}/`)) return;
  jobs.push(write(svg, path.join(ASSETS, rel)));
};

// Doctor
img('doctor/portrait.jpg', portrait({w: 960, h: 1200, seed: 1}));
img('doctor/message.jpg', portrait({w: 960, h: 1200, seed: 2}));

// Services (3:2)
['laparoscopy', 'hernia', 'anorectal', 'endocrine'].forEach((m, i) =>
  img(`services/${m === 'laparoscopy' ? 'laparoscopic' : m}.jpg`, artwork({w: 1200, h: 800, motif: m, seed: 10 + i}))
);

// Procedures (3:2, same frame as the specialty images). File names = procedure `id` in the message files.
const procedureMotifs = {
  cholecystectomy: 'laparoscopy',
  appendectomy: 'scalpel',
  'anti-reflux': 'shield',
  'diagnostic-laparoscopy': 'pulse',
  'inguinal-hernia': 'hernia',
  'umbilical-hernia': 'cross',
  'incisional-hernia': 'checklist',
  'diastasis-recti': 'leaf',
  'hemorrhoids-laser': 'anorectal',
  'anal-fissure': 'shield',
  'anal-fistula': 'scalpel',
  'pilonidal-sinus': 'leaf',
  'total-thyroidectomy': 'endocrine',
  hemithyroidectomy: 'pulse',
  parathyroidectomy: 'cross',
  adrenalectomy: 'checklist'
};
Object.entries(procedureMotifs).forEach(([id, motif], i) =>
  img(`procedures/${id}.jpg`, artwork({w: 900, h: 600, motif, seed: 80 + i}))
);

// Articles (16:9)
['laparoscopy', 'hernia', 'anorectal', 'endocrine', 'checklist', 'pulse', 'leaf'].forEach((m, i) =>
  img(`articles/article-${i + 1}.jpg`, artwork({w: 1200, h: 675, motif: m, seed: 20 + i}))
);

// Videos: two landscape posters + nine portrait posters (9:16)
img('videos/about.jpg', artwork({w: 1280, h: 720, motif: 'scalpel', seed: 30}));
img('videos/intro.jpg', artwork({w: 1600, h: 900, motif: 'pulse', seed: 31}));
['pulse', 'laparoscopy', 'hernia', 'anorectal', 'endocrine', 'checklist', 'cross', 'shield', 'leaf'].forEach((m, i) =>
  img(`videos/short-${i + 1}.jpg`, artwork({w: 720, h: 1280, motif: m, seed: 40 + i, scale: 0.85}))
);

// Certificates (landscape)
for (let i = 1; i <= 6; i++) img(`certificates/certificate-${i}.jpg`, certificate({w: 1200, h: 850, seed: 60 + i}));

await Promise.all(jobs);
