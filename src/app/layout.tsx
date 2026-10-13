import type {ReactNode} from 'react';

// The <html> element is rendered by `app/[locale]/layout.tsx` so `lang`/`dir` follow the locale.
// A root layout is still required because `app/page.tsx` and `app/not-found.tsx` live at the root.
export default function RootLayout({children}: {children: ReactNode}) {
  return children;
}
