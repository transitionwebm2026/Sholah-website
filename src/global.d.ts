import type {routing} from '@/i18n/routing';
import type messages from '../messages/en.json';

// Strongly typed locales and message keys for `useTranslations` / `getTranslations`.
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
