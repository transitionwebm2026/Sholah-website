/*
 * Row shapes of the Supabase tables (see supabase/schema.sql). Translatable text is stored as
 * `{ar, en}` objects; `views.ts` turns rows into per-locale view models for the components.
 */

export type L10n = {ar: string; en: string};

export type PageKey = 'home' | 'about' | 'services' | 'reviews' | 'videos' | 'articles' | 'contact';

export type LinkRow = {label: L10n; href: string};
export type NavLinkRow = LinkRow & {visible?: boolean};
export type PhoneRow = {value: string; display: string};
export type SocialRow = {network: string; url: string};
export type BranchRow = {
  id: string;
  name: L10n;
  address: L10n;
  phone?: string;
  /** Google Maps "Embed a map" iframe src (or the whole iframe snippet). */
  map_embed_url?: string;
  directions_url?: string;
  lat?: number | null;
  lng?: number | null;
};
export type HoursRow = {days: L10n; time: L10n};
export type OpeningSpecRow = {days: string[]; opens: string; closes: string};

export type SettingsRow = {
  id: number;
  site_name: L10n;
  logo_header_url: string | null;
  logo_footer_url: string | null;
  phones: PhoneRow[];
  whatsapp_number: string;
  whatsapp_greeting: L10n;
  email: string | null;
  social_links: SocialRow[];
  branches: BranchRow[];
  working_hours: HoursRow[];
  opening_hours_spec: OpeningSpecRow[];
  nav_links: NavLinkRow[];
  footer: {about?: L10n; copyright?: L10n; disclaimer?: L10n; quick_links?: LinkRow[]};
  updated_at?: string;
};

export type Heading = {eyebrow?: L10n; title?: L10n; description?: L10n; cta?: L10n};

export type ButtonStyle = 'primary' | 'outline' | 'whatsapp';
/** `href`: a site path (`/contact`), an anchor (`#booking`), `whatsapp`, `tel` or a full URL. */
export type HeroButtonRow = {label: L10n; href: string; style: ButtonStyle};

export type HeroRow = {
  page: PageKey;
  eyebrow: L10n;
  title: L10n;
  description: L10n;
  image_url: string | null;
  buttons: HeroButtonRow[];
  cta_band: {eyebrow?: L10n; title?: L10n; text?: L10n};
  meta_title: L10n;
  meta_description: L10n;
  updated_at?: string;
};

/** A single embedded video (home "about" block, About intro): YouTube link or uploaded file. */
export type VideoEmbedRow = {title?: L10n; url?: string; thumbnail_url?: string};

export type IconItemRow = {icon?: string; title: L10n; description: L10n};
export type StepRow = {title: L10n; description: L10n};

export type SectionContents = {
  'home.about': Heading & {paragraphs?: L10n[]; points?: L10n[]; video?: VideoEmbedRow};
  'home.surgeries': Heading & {items?: Array<{title: L10n; description: L10n; image_url?: string; href?: string}>};
  'home.why': Heading & {items?: IconItemRow[]};
  'home.journey': Heading & {steps?: StepRow[]};
  'home.blocks': {reviews?: Heading; videos?: Heading; articles?: Heading; faq?: Heading};
  stats: {
    home_title?: L10n;
    items?: Array<{value: number; suffix?: string; label: L10n; icon?: string; show_on_home?: boolean}>;
  };
  'services.blocks': {fields?: Heading; process?: Heading & {steps?: StepRow[]}; faq?: Heading};
  'reviews.blocks': {grid?: Heading};
  'videos.blocks': {grid?: Heading};
  'articles.blocks': {grid?: Heading};
};

export type SectionKey = keyof SectionContents;
export type SectionRow = {key: string; content: Record<string, unknown>; updated_at?: string};

export type DoctorRow = {
  id: number;
  name: L10n;
  short_name: L10n;
  title: L10n;
  credentials: L10n;
  image_alt: L10n;
  photo_url: string | null;
  message_photo_url: string | null;
  message: {eyebrow?: L10n; title?: L10n; paragraphs?: L10n[]; signature?: L10n};
  timeline: Array<{year: string; title: L10n; place: L10n}>;
  certificates: Array<{title: L10n; issuer: L10n; year: string; image_url?: string}>;
  expertise: Array<IconItemRow & {href?: string}>;
  intro_video: VideoEmbedRow;
  headings: {
    career?: Heading;
    intro_video?: Heading;
    expertise?: Heading;
    certificates?: Heading;
    achievements?: Heading;
  };
  updated_at?: string;
};

export type ServiceRow = {
  id: string;
  slug: string;
  title: L10n;
  summary: L10n;
  description: L10n;
  image_url: string | null;
  sort_order: number;
  is_published?: boolean;
};

export type ProcedureRow = {
  id: string;
  service_id: string;
  slug: string;
  title: L10n;
  description: L10n;
  image_url: string | null;
  sort_order: number;
  is_published?: boolean;
};

/** ProseMirror/Tiptap JSON. */
export type RichMark = {type: string; attrs?: Record<string, unknown>};
export type RichNode = {type: string; attrs?: Record<string, unknown>; content?: RichNode[]; text?: string; marks?: RichMark[]};

export type ArticleCardRow = {
  id: string;
  slug: string;
  category: L10n;
  title: L10n;
  excerpt: L10n;
  cover_url: string | null;
  is_featured: boolean;
  published_at: string;
  read_minutes: number;
  updated_at?: string;
  status?: 'draft' | 'published';
};

export type ArticleRow = ArticleCardRow & {
  content: {ar: RichNode | null; en: RichNode | null};
  seo: {title?: L10n; description?: L10n};
};

export type VideoSource = 'upload' | 'youtube' | 'external';

export type VideoRow = {
  id: string;
  title: L10n;
  description: L10n;
  source: VideoSource;
  video_url: string;
  thumbnail_url: string;
  orientation: 'portrait' | 'landscape';
  duration: string | null;
  is_featured: boolean;
  is_published?: boolean;
  sort_order: number;
};

export type ReviewRow = {
  id: string;
  patient_name: L10n;
  procedure: L10n;
  review_text: L10n;
  rating: number;
  is_visible?: boolean;
  show_on_home: boolean;
  sort_order: number;
};

export type FaqRow = {
  id: string;
  page: 'home' | 'services';
  question: L10n;
  answer: L10n;
  is_visible?: boolean;
  sort_order: number;
};

export type LeadStatus = 'new' | 'contacted' | 'booked' | 'closed';

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  age: number | null;
  request_type: string | null;
  service: string | null;
  clinic: string | null;
  message: string | null;
  locale: 'ar' | 'en' | null;
  status: LeadStatus;
  admin_notes: string | null;
  created_at: string;
};
