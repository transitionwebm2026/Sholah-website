import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Fully static site (SSG): `npm run build` writes plain HTML/CSS/JS to `out/`,
  // ready to upload to any static host (e.g. Hostinger `public_html`) without Node.js.
  output: 'export',
  // `/ar/about/` → `out/ar/about/index.html`, which Apache/LiteSpeed serve natively.
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // There is no image-optimization server on static hosting. Source images are resized and
    // compressed at build time instead (see `scripts/optimize-images.mjs`, run on `prebuild`).
    unoptimized: true
  }
  // Security & caching headers live in `public/.htaccess` (headers() is not available in static export).
};

export default withNextIntl(nextConfig);
