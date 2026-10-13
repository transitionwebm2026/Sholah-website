# Dr. Ahmed Shoulah — General & Laparoscopic Surgery website

Bilingual (Arabic RTL default / English LTR) static website built with **Next.js 16 (App Router)**,
**TypeScript**, **Tailwind CSS 4** and **next-intl 4**. It is exported as plain HTML/CSS/JS
(`output: 'export'`), so it runs on any static host — including Hostinger shared hosting — with no Node.js server.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local development at http://localhost:3000/ar/ |
| `npm run build` | Optimizes images → checks translations → builds the static site into `out/` |
| `npm run preview` | Serves `out/` locally (http://localhost:3000) exactly as the host will |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run images:placeholders` | Regenerates the placeholder artwork (overwrites `src/assets/images`) |

## Deploying to Hostinger

1. `npm run build`
2. In hPanel → **File Manager** (or FTP), open `public_html/` and upload **the contents of `out/`**
   (not the folder itself). Make sure the hidden `.htaccess` file is uploaded too.
3. Enable SSL in hPanel, then uncomment the HTTPS and HSTS lines in `public/.htaccess` and rebuild.

`.htaccess` handles: `/` → `/ar/` or `/en/` (saved choice → browser language → Arabic), `/about` → `/ar/about/`,
the custom `404.html`, security headers, caching and compression.

## Before going live — replace the placeholders

| What | Where |
| --- | --- |
| Domain (canonical URLs, hreflang, sitemap, JSON-LD) | `.env.production` → `NEXT_PUBLIC_SITE_URL=https://your-domain.com` (see `.env.example`) |
| Phones, WhatsApp number, email, social links, clinic coordinates, opening hours (JSON-LD), stats | `src/lib/site.ts` |
| Doctor name, bio, credentials, addresses, hours, all page text | `messages/ar.json` and `messages/en.json` (same keys in both) |
| Patient reviews | `Reviews.items` in both message files — **use real reviews with the patients' consent only** |
| YouTube video IDs | `src/lib/content.ts` (`videoMeta`, `featureVideos`); empty IDs show "coming soon" |
| Photos (doctor, services, articles, video posters, certificates) | Overwrite files in `src/assets/images/` keeping the same names; any size is fine — they are resized on build |
| Procedure photos (cards on /services) | `src/assets/images/procedures/<id>.jpg`, 3:2 — `<id>` is the procedure's `id` in `Services.categories` (e.g. `cholecystectomy.jpg`) |
| Logo, favicons, social share images | Replace `public/images/Ahmed Sholah logo 3.png` (doctor) or `logo-01.png` (Transition credit), then `npm run images:brand` — regenerates the header/footer logos, favicons and `og-ar.jpg` / `og-en.jpg` |
| Hero image (every page) | `src/assets/images/doctor/portrait.jpg`, centred behind the hero; a page can pass its own via `<PageHero image={...}>` |
| Arabic font (optional "KO Sans") | `src/lib/fonts.ts` — swap `Cairo(...)` for `localFont(...)` |

`npm run build` fails if `ar.json` and `en.json` get out of sync (`scripts/check-messages.mjs`).

## Project structure

```
messages/{ar,en}.json        All translatable text and content (pages, services, articles, FAQs, reviews)
public/.htaccess             Hostinger/Apache config (redirects, 404, headers, caching)
scripts/                     optimize-images (prebuild), check-messages (prebuild),
                             flatten-rsc-segments (postbuild), generate-placeholders
src/i18n/                    next-intl routing (ar default, always prefixed), request config, navigation
src/app/page.tsx             "/" language redirect (static replacement for the i18n middleware)
src/app/not-found.tsx        Bilingual 404 page (exported as 404.html)
src/app/[locale]/            Locale layout (lang/dir, fonts, JSON-LD) and all pages
src/app/{sitemap,robots,manifest}.ts
src/components/              layout (header, menu, switcher, footer), home sections, cards,
                             interactive client components (slider, journey, contact form), ui
src/lib/                     site config, content loaders, SEO metadata, JSON-LD builders
```

## Notes

- **Why no `middleware.ts`:** middleware (renamed `proxy.ts` in Next.js 16) needs a running server, which static
  hosting does not have. Locale routing is therefore fully static (`/ar/…`, `/en/…`); the bare `/` is redirected by
  `.htaccess` on the server and by `src/app/page.tsx` as a fallback.
- **Images:** static hosting has no image optimizer, so `next/image` runs with `unoptimized: true`. Images are statically
  imported (automatic dimensions + blur placeholders) and resized/compressed in place by `scripts/optimize-images.mjs`.
- **Client JavaScript** is limited to the header menu, language switcher, counters, testimonials slider, patient-journey
  tabs, video players and the booking form. The FAQ accordion uses native `<details>` (no JS).
- **Low-memory machines:** if `npm run build` crashes with "out of memory" or a worker exit code, free disk space on the
  system drive (Windows needs it for virtual memory) or close other heavy apps, then build again.
