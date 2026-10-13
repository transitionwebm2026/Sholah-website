import type {MetadataRoute} from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'د. أحمد شولح — استشاري الجراحة العامة والمناظير',
    short_name: 'د. أحمد شولح',
    description: 'Consultant of General & Laparoscopic Surgery',
    start_url: '/ar/',
    scope: '/',
    display: 'standalone',
    lang: 'ar',
    dir: 'rtl',
    background_color: '#062553',
    theme_color: '#062553',
    icons: [
      {src: '/images/icon-192.png', sizes: '192x192', type: 'image/png'},
      {src: '/images/icon-512.png', sizes: '512x512', type: 'image/png'},
      {src: '/images/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'}
    ]
  };
}
