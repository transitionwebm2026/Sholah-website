import '../globals.css';
import type {Metadata, Viewport} from 'next';
import type {ReactNode} from 'react';
import {AdminShell} from '@/components/admin/AdminShell';
import {arabicFont} from '@/lib/fonts';

/*
 * The CMS dashboard: a client-side app exported as static HTML shells (`out/admin/...`).
 * Every read and write goes straight from the browser to Supabase and is authorised by the
 * signed-in admin's session + RLS, so it needs no server on Hostinger.
 */

export const metadata: Metadata = {
  title: {default: 'لوحة التحكم', template: '%s | لوحة التحكم'},
  robots: {index: false, follow: false, nocache: true, googleBot: {index: false, follow: false}}
};

export const viewport: Viewport = {
  themeColor: '#031633',
  colorScheme: 'dark'
};

export default function AdminLayout({children}: {children: ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className={arabicFont.variable}>
      <body className="min-h-dvh bg-navy-950 bg-[radial-gradient(ellipse_at_top,rgb(13_71_161/0.25),transparent_60%)] font-sans text-white antialiased">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
