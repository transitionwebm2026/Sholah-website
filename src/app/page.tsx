import type {Metadata} from 'next';
import {routing} from '@/i18n/routing';
import {languageAlternates, localizedUrl} from '@/lib/urls';

/*
 * Static replacement for the i18n middleware at "/" (middleware cannot run on static hosting).
 * Picks the visitor's language from the NEXT_LOCALE cookie (set by the language switcher),
 * then the browser language, falling back to Arabic. `public/.htaccess` performs the same
 * redirect on the server, so this page is only a fallback.
 */

export const metadata: Metadata = {
  title: 'د. أحمد شولح | Dr. Ahmed Shoulah',
  robots: {index: false, follow: true},
  alternates: {
    canonical: localizedUrl(routing.defaultLocale),
    languages: languageAlternates()
  }
};

const redirectScript = `(function(){var l='${routing.defaultLocale}';try{var m=document.cookie.match(/(?:^|;\\s*)NEXT_LOCALE=(ar|en)/);if(m){l=m[1]}else{var n=((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();if(n.indexOf('en')===0){l='en'}}}catch(e){}location.replace('/'+l+'/'+location.hash)})();`;

const linkStyle = {color: '#dfa581', fontWeight: 700, textDecoration: 'none', padding: '0.5rem 1rem'};

/* eslint-disable @next/next/no-html-link-for-pages -- this page renders its own <html> outside the
   locale layout, so a full page load into /ar/ or /en/ is intended (no client-side transition). */

export default function RootRedirectPage() {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, #0d47a1, #062553)',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif'
        }}
      >
        <script dangerouslySetInnerHTML={{__html: redirectScript}} />
        <noscript>
          <meta httpEquiv="refresh" content={`0; url=/${routing.defaultLocale}/`} />
        </noscript>
        <p>
          <a href="/ar/" style={linkStyle}>
            العربية
          </a>
          ·
          <a href="/en/" lang="en" style={linkStyle}>
            English
          </a>
        </p>
      </body>
    </html>
  );
}
