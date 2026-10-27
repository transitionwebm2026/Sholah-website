/* Field definitions for every dashboard module (see fields.ts for the field types). */
import {SOCIAL_NETWORKS} from '@/components/ui/Icons';
import {youtubeId} from '@/lib/cms/media';
import {supabaseUrl} from '@/lib/cms/rest';
import {arOf, emptyL10n, SLUG_PATTERN, slugify, type Field} from './fields';

const L = emptyL10n;
const GOLD_HINT = 'ضع الكلمات المميزة بين نجمتين *هكذا* لتظهر باللون الذهبي.';
const SEO_HINT = 'يظهر في نتائج جوجل وتبويب المتصفح ومشاركات واتساب/فيسبوك. يُطبَّق بعد إعادة بناء الموقع ورفعه.';

const heading = (label: string, hint?: string): Field => ({type: 'heading', label, hint});

/** eyebrow + title (+ description / button text) of a section. */
const sectionHeading = (key: string, label: string, opts: {description?: boolean; cta?: boolean} = {}): Field => ({
  type: 'group',
  key,
  label,
  fields: [
    {type: 'l10n', key: 'eyebrow', label: 'العنوان الصغير (فوق العنوان)'},
    {type: 'l10n', key: 'title', label: 'العنوان'},
    ...(opts.description ? [{type: 'l10n', key: 'description', label: 'الوصف', multiline: true} as Field] : []),
    ...(opts.cta ? [{type: 'l10n', key: 'cta', label: 'نص الزر'} as Field] : [])
  ]
});

const stepsList = (key: string, label: string): Field => ({
  type: 'list',
  key,
  label,
  addLabel: 'إضافة خطوة',
  newItem: () => ({title: L(), description: L()}),
  itemTitle: (item) => arOf(item.title),
  fields: [
    {type: 'l10n', key: 'title', label: 'عنوان الخطوة', required: true},
    {type: 'l10n', key: 'description', label: 'الشرح', multiline: true}
  ]
});

const videoEmbed = (key: string, label: string, folder: string): Field => ({
  type: 'group',
  key,
  label,
  hint: 'ارفع فيديو من الجهاز أو الصق رابط يوتيوب، وارفع صورة الغلاف (الثامبنيل).',
  fields: [
    {type: 'l10n', key: 'title', label: 'عنوان الفيديو'},
    {type: 'video', key: 'url', label: 'الفيديو', folder},
    {type: 'image', key: 'thumbnail_url', label: 'صورة الغلاف (Thumbnail)', folder: `${folder}/thumbnails`, maxWidth: 1600, aspect: 'aspect-video'}
  ]
});

/* ---------- Global settings (site_settings) ---------- */

export const settingsTabs: Array<{id: string; label: string; fields: Field[]}> = [
  {
    id: 'brand',
    label: 'الهوية والشعار',
    fields: [
      {type: 'l10n', key: 'site_name', label: 'اسم الموقع', required: true, hint: 'يظهر في عنوان المتصفح ونتائج البحث.'},
      {type: 'image', key: 'logo_header_url', label: 'شعار الهيدر (أعلى الموقع)', folder: 'brand', maxWidth: 900, aspect: 'aspect-[4/1]', hint: 'نسخة فاتحة تناسب الخلفية الكحلية — PNG/SVG بخلفية شفافة.'},
      {type: 'image', key: 'logo_footer_url', label: 'شعار الفوتر', folder: 'brand', maxWidth: 900, aspect: 'aspect-[2/1]', hint: 'فارغ = نفس شعار الهيدر.'}
    ]
  },
  {
    id: 'contact',
    label: 'بيانات التواصل',
    fields: [
      {
        type: 'list',
        key: 'phones',
        label: 'أرقام الهاتف',
        hint: 'الرقم الأول يظهر في الهيدر وزر الاتصال العائم.',
        addLabel: 'إضافة رقم',
        newItem: () => ({value: '', display: ''}),
        itemTitle: (item) => String(item.display || item.value || ''),
        fields: [
          {type: 'text', key: 'value', label: 'الرقم للاتصال', dir: 'ltr', required: true, placeholder: '+201000000000', pattern: /^\+?[0-9]{6,15}$/, patternMessage: 'رقم الاتصال: أرقام فقط مع + في البداية (مثل ‎+201000000000)'},
          {type: 'text', key: 'display', label: 'طريقة العرض', dir: 'ltr', placeholder: '+20 100 000 0000'}
        ]
      },
      {type: 'text', key: 'whatsapp_number', label: 'رقم واتساب', dir: 'ltr', placeholder: '201000000000', hint: 'بالصيغة الدولية، أرقام فقط بدون + أو مسافات. تُرسل عليه طلبات الحجز.', pattern: /^[0-9]{8,15}$/, patternMessage: 'رقم واتساب: أرقام فقط بالصيغة الدولية (مثل 201000000000)'},
      {type: 'l10n', key: 'whatsapp_greeting', label: 'رسالة واتساب الافتراضية', hint: 'النص الذي يظهر جاهزًا عند الضغط على زر واتساب.'},
      {type: 'text', key: 'email', label: 'البريد الإلكتروني', dir: 'ltr'},
      {
        type: 'list',
        key: 'social_links',
        label: 'روابط السوشيال ميديا',
        addLabel: 'إضافة رابط',
        newItem: () => ({network: 'Facebook', url: ''}),
        itemTitle: (item) => String(item.network ?? ''),
        fields: [
          {type: 'select', key: 'network', label: 'المنصة', options: SOCIAL_NETWORKS.map((n) => ({value: n, label: n}))},
          {type: 'text', key: 'url', label: 'الرابط', dir: 'ltr', required: true, placeholder: 'https://'}
        ]
      }
    ]
  },
  {
    id: 'branches',
    label: 'الفروع والمواعيد',
    fields: [
      {
        type: 'list',
        key: 'branches',
        label: 'العيادات / الفروع',
        hint: 'الفرع الأول هو العيادة الرئيسية (يظهر عنوانه في الفوتر).',
        addLabel: 'إضافة فرع',
        newItem: () => ({id: `branch-${Date.now().toString(36)}`, name: L(), address: L(), phone: '', map_embed_url: '', directions_url: '', lat: null, lng: null}),
        itemTitle: (item) => arOf(item.name),
        fields: [
          {type: 'l10n', key: 'name', label: 'اسم الفرع', required: true},
          {type: 'l10n', key: 'address', label: 'العنوان', multiline: true},
          {type: 'text', key: 'phone', label: 'هاتف الفرع', dir: 'ltr', placeholder: '+201000000000'},
          {type: 'textarea', key: 'map_embed_url', label: 'خريطة جوجل (تضمين)', dir: 'ltr', rows: 3, hint: 'في خرائط جوجل: مشاركة ← تضمين خريطة ← نسخ HTML، ثم الصقه هنا كما هو.'},
          {type: 'text', key: 'directions_url', label: 'رابط الاتجاهات (اختياري)', dir: 'ltr', hint: 'رابط الموقع من خرائط جوجل. فارغ = يُحسب من الإحداثيات أو العنوان.'},
          {type: 'number', key: 'lat', label: 'خط العرض (اختياري)', hint: 'لخرائط جوجل ونتائج البحث المحلية، مثل 30.0566'},
          {type: 'number', key: 'lng', label: 'خط الطول (اختياري)'},
          {type: 'text', key: 'id', label: 'معرّف داخلي', dir: 'ltr', hint: 'لا تغيّره بعد الإنشاء.'}
        ]
      },
      {
        type: 'list',
        key: 'working_hours',
        label: 'مواعيد العمل (كما تظهر للزوار)',
        addLabel: 'إضافة سطر',
        newItem: () => ({days: L(), time: L()}),
        itemTitle: (item) => `${arOf(item.days)} — ${arOf(item.time)}`,
        fields: [
          {type: 'l10n', key: 'days', label: 'الأيام', required: true},
          {type: 'l10n', key: 'time', label: 'الوقت', required: true}
        ]
      },
      {
        type: 'list',
        key: 'opening_hours_spec',
        label: 'مواعيد العمل لجوجل (اختياري)',
        hint: 'نسخة منظمة من المواعيد تقرؤها محركات البحث (بتوقيت 24 ساعة).',
        addLabel: 'إضافة فترة',
        newItem: () => ({days: [], opens: '17:00', closes: '22:00'}),
        itemTitle: (item) => `${(item.days as string[] | undefined)?.length ?? 0} يوم · ${item.opens ?? ''}–${item.closes ?? ''}`,
        fields: [
          {type: 'weekdays', key: 'days', label: 'الأيام'},
          {type: 'text', key: 'opens', label: 'يفتح', dir: 'ltr', placeholder: '17:00', pattern: /^\d{2}:\d{2}$/, patternMessage: 'الوقت بصيغة 17:00'},
          {type: 'text', key: 'closes', label: 'يغلق', dir: 'ltr', placeholder: '22:00', pattern: /^\d{2}:\d{2}$/, patternMessage: 'الوقت بصيغة 22:00'}
        ]
      }
    ]
  },
  {
    id: 'nav',
    label: 'روابط النافبار',
    fields: [
      {
        type: 'list',
        key: 'nav_links',
        label: 'روابط القائمة الرئيسية',
        hint: 'رتّبها بالأسهم. أخفِ أي رابط بإلغاء «ظاهر».',
        addLabel: 'إضافة رابط',
        newItem: () => ({label: L(), href: '/', visible: true}),
        itemTitle: (item) => `${arOf(item.label)}${item.visible === false ? ' (مخفي)' : ''}`,
        fields: [
          {type: 'l10n', key: 'label', label: 'النص', required: true},
          {type: 'link', key: 'href', label: 'الرابط'},
          {type: 'toggle', key: 'visible', label: 'ظاهر'}
        ]
      }
    ]
  },
  {
    id: 'footer',
    label: 'الفوتر',
    fields: [
      {
        type: 'group',
        key: 'footer',
        label: 'محتوى الفوتر',
        fields: [
          {type: 'l10n', key: 'about', label: 'نبذة قصيرة تحت الشعار', multiline: true},
          {type: 'l10n', key: 'copyright', label: 'سطر حقوق النشر', hint: '{year} = السنة الحالية تلقائيًا، {name} = اسم الطبيب.'},
          {type: 'l10n', key: 'disclaimer', label: 'تنويه طبي', multiline: true},
          {
            type: 'list',
            key: 'quick_links',
            label: 'روابط سريعة',
            addLabel: 'إضافة رابط',
            newItem: () => ({label: L(), href: '/'}),
            itemTitle: (item) => arOf(item.label),
            fields: [
              {type: 'l10n', key: 'label', label: 'النص', required: true},
              {type: 'link', key: 'href', label: 'الرابط'}
            ]
          }
        ]
      }
    ]
  }
];

/* ---------- Page headers (hero_sections) ---------- */

export const heroFields: Field[] = [
  {type: 'l10n', key: 'eyebrow', label: 'العنوان الصغير (فوق العنوان)'},
  {type: 'l10n', key: 'title', label: 'العنوان الرئيسي (H1)', required: true, hint: GOLD_HINT},
  {type: 'l10n', key: 'description', label: 'الوصف', multiline: true},
  {type: 'image', key: 'image_url', label: 'صورة الخلفية', folder: 'heroes', maxWidth: 1400, aspect: 'aspect-[4/5]', hint: 'تظهر في منتصف الهيرو. فارغة = صورة الطبيب من ملفه الشخصي.'},
  {
    type: 'list',
    key: 'buttons',
    label: 'أزرار الهيرو',
    hint: 'فارغ = «احجز الآن» + «واتساب». الرابط: /contact أو whatsapp أو tel أو رابط كامل.',
    addLabel: 'إضافة زر',
    newItem: () => ({label: L(), href: '/contact', style: 'primary'}),
    itemTitle: (item) => arOf(item.label),
    fields: [
      {type: 'l10n', key: 'label', label: 'نص الزر', required: true},
      {type: 'link', key: 'href', label: 'الرابط'},
      {
        type: 'select',
        key: 'style',
        label: 'الشكل',
        options: [
          {value: 'primary', label: 'ذهبي (رئيسي)'},
          {value: 'outline', label: 'شفاف بإطار'},
          {value: 'whatsapp', label: 'أخضر واتساب'}
        ]
      }
    ]
  },
  heading('دعوة الحجز أسفل الصفحة'),
  {
    type: 'group',
    key: 'cta_band',
    label: 'الشريط السفلي',
    fields: [
      {type: 'l10n', key: 'eyebrow', label: 'العنوان الصغير'},
      {type: 'l10n', key: 'title', label: 'العنوان', hint: 'فارغ = إخفاء الشريط.'},
      {type: 'l10n', key: 'text', label: 'النص', multiline: true}
    ]
  },
  heading('تحسين محركات البحث (SEO)', SEO_HINT),
  {type: 'l10n', key: 'meta_title', label: 'عنوان الصفحة في جوجل', hint: 'حوالي 50–60 حرفًا. فارغ = العنوان الرئيسي.'},
  {type: 'l10n', key: 'meta_description', label: 'وصف الصفحة في جوجل', multiline: true, hint: 'حوالي 140–160 حرفًا.'}
];

/* ---------- Home page sections (page_sections) ---------- */

export const homeSections: Array<{id: string; label: string; key: string; fields: Field[]}> = [
  {
    id: 'about',
    label: 'نبذة عن الطبيب',
    key: 'home.about',
    fields: [
      {type: 'l10n', key: 'eyebrow', label: 'العنوان الصغير'},
      {type: 'l10n', key: 'title', label: 'العنوان', required: true},
      {type: 'l10nList', key: 'paragraphs', label: 'الفقرات', multiline: true, addLabel: 'إضافة فقرة'},
      {type: 'l10nList', key: 'points', label: 'نقاط مميزة (مؤهلات)', addLabel: 'إضافة نقطة'},
      {type: 'l10n', key: 'cta', label: 'نص زر «المزيد عن الطبيب»'},
      videoEmbed('video', 'الفيديو بجانب النبذة', 'videos/home')
    ]
  },
  {
    id: 'stats',
    label: 'الإحصائيات',
    key: 'stats',
    fields: [
      {type: 'l10n', key: 'home_title', label: 'عنوان شريط الإحصائيات في الرئيسية'},
      {
        type: 'list',
        key: 'items',
        label: 'العدّادات',
        hint: 'تظهر كلها في صفحة «عن الدكتور»، والمختار منها في الرئيسية.',
        addLabel: 'إضافة عدّاد',
        newItem: () => ({value: 0, suffix: '+', label: L(), icon: 'award', show_on_home: true}),
        itemTitle: (item) => `${item.value ?? 0}${item.suffix ?? ''} — ${arOf(item.label)}`,
        fields: [
          {type: 'number', key: 'value', label: 'الرقم', min: 0},
          {type: 'text', key: 'suffix', label: 'لاحقة', dir: 'ltr', placeholder: '+', hint: 'مثل + أو %'},
          {type: 'l10n', key: 'label', label: 'الوصف', required: true},
          {type: 'icon', key: 'icon', label: 'الأيقونة'},
          {type: 'toggle', key: 'show_on_home', label: 'يظهر في الصفحة الرئيسية'}
        ]
      }
    ]
  },
  {
    id: 'surgeries',
    label: 'الخدمات',
    key: 'home.surgeries',
    fields: [
      heading('البطاقات', 'كل بطاقة تُؤخذ من قسم «الخدمات والعمليات»: نفس اسم التخصص وصورته وملخصه، وتفتح تخصصها في صفحة الخدمات.'),
      {
        type: 'services',
        key: 'services',
        label: 'التخصصات المعروضة في الرئيسية',
        hint: 'اختر 3 لتظهر في صف واحد. تظهر بنفس ترتيب صفحة الخدمات. بدون اختيار = أول 3 تخصصات.'
      },
      heading('عنوان القسم'),
      {type: 'l10n', key: 'eyebrow', label: 'العنوان الصغير'},
      {type: 'l10n', key: 'title', label: 'العنوان'},
      {type: 'l10n', key: 'description', label: 'الوصف', multiline: true},
      {type: 'l10n', key: 'cta', label: 'نص زر «كل الخدمات»'}
    ]
  },
  {
    id: 'why',
    label: 'لماذا تختارنا',
    key: 'home.why',
    fields: [
      {type: 'l10n', key: 'eyebrow', label: 'العنوان الصغير'},
      {type: 'l10n', key: 'title', label: 'العنوان'},
      {
        type: 'list',
        key: 'items',
        label: 'النقاط',
        addLabel: 'إضافة نقطة',
        newItem: () => ({icon: 'award', title: L(), description: L()}),
        itemTitle: (item) => arOf(item.title),
        fields: [
          {type: 'icon', key: 'icon', label: 'الأيقونة'},
          {type: 'l10n', key: 'title', label: 'العنوان', required: true},
          {type: 'l10n', key: 'description', label: 'الوصف', multiline: true}
        ]
      }
    ]
  },
  {
    id: 'journey',
    label: 'رحلة المريض',
    key: 'home.journey',
    fields: [
      {type: 'l10n', key: 'eyebrow', label: 'العنوان الصغير'},
      {type: 'l10n', key: 'title', label: 'العنوان'},
      {type: 'l10n', key: 'description', label: 'الوصف', multiline: true},
      stepsList('steps', 'خطوات الرحلة')
    ]
  },
  {
    id: 'blocks',
    label: 'عناوين باقي الأقسام',
    key: 'home.blocks',
    fields: [
      sectionHeading('reviews', 'قسم آراء المرضى', {cta: true}),
      sectionHeading('videos', 'قسم الفيديوهات', {cta: true}),
      sectionHeading('articles', 'قسم المقالات', {cta: true}),
      sectionHeading('faq', 'قسم الأسئلة الشائعة', {description: true})
    ]
  }
];

/** Section headings shown on the simple list pages. */
export const gridBlockFields: Field[] = [sectionHeading('grid', 'عنوان قسم القائمة')];

/* ---------- Doctor profile (doctors_profile) ---------- */

export const doctorTabs: Array<{id: string; label: string; fields: Field[]}> = [
  {
    id: 'basics',
    label: 'البيانات والصور',
    fields: [
      {type: 'l10n', key: 'name', label: 'الاسم الكامل', required: true},
      {type: 'l10n', key: 'short_name', label: 'الاسم المختصر'},
      {type: 'l10n', key: 'title', label: 'المسمّى الوظيفي', required: true},
      {type: 'l10n', key: 'credentials', label: 'المؤهلات (سطر واحد)'},
      {type: 'image', key: 'photo_url', label: 'صورة الطبيب الرئيسية', folder: 'doctor', maxWidth: 1200, aspect: 'aspect-[4/5]', hint: 'تظهر في هيرو كل الصفحات. يفضَّل صورة رأسية بخلفية بسيطة.'},
      {type: 'image', key: 'message_photo_url', label: 'صورة قسم «رسالة الطبيب»', folder: 'doctor', maxWidth: 1000, aspect: 'aspect-[4/5]'},
      {type: 'l10n', key: 'image_alt', label: 'وصف الصورة (لقارئات الشاشة ومحركات البحث)'}
    ]
  },
  {
    id: 'message',
    label: 'رسالة الطبيب',
    fields: [
      {
        type: 'group',
        key: 'message',
        label: 'الرسالة الشخصية',
        fields: [
          {type: 'l10n', key: 'eyebrow', label: 'العنوان الصغير'},
          {type: 'l10n', key: 'title', label: 'العنوان'},
          {type: 'l10nList', key: 'paragraphs', label: 'الفقرات', multiline: true, addLabel: 'إضافة فقرة'},
          {type: 'l10n', key: 'signature', label: 'التوقيع'}
        ]
      }
    ]
  },
  {
    id: 'timeline',
    label: 'المسيرة المهنية',
    fields: [
      {
        type: 'list',
        key: 'timeline',
        label: 'محطات المسيرة',
        addLabel: 'إضافة محطة',
        newItem: () => ({year: '', title: L(), place: L()}),
        itemTitle: (item) => `${item.year ?? ''} — ${arOf(item.title)}`,
        fields: [
          {type: 'text', key: 'year', label: 'السنة', dir: 'ltr'},
          {type: 'l10n', key: 'title', label: 'الدرجة / المنصب', required: true},
          {type: 'l10n', key: 'place', label: 'الجهة'}
        ]
      }
    ]
  },
  {
    id: 'certificates',
    label: 'الشهادات',
    fields: [
      {
        type: 'list',
        key: 'certificates',
        label: 'الشهادات والاعتمادات',
        addLabel: 'إضافة شهادة',
        newItem: () => ({title: L(), issuer: L(), year: '', image_url: ''}),
        itemTitle: (item) => arOf(item.title),
        fields: [
          {type: 'l10n', key: 'title', label: 'اسم الشهادة', required: true},
          {type: 'l10n', key: 'issuer', label: 'الجهة المانحة'},
          {type: 'text', key: 'year', label: 'السنة', dir: 'ltr'},
          {type: 'image', key: 'image_url', label: 'صورة الشهادة', folder: 'certificates', maxWidth: 1400, aspect: 'aspect-[24/17]'}
        ]
      }
    ]
  },
  {
    id: 'expertise',
    label: 'مجالات الخبرة',
    fields: [
      {
        type: 'list',
        key: 'expertise',
        label: 'مجالات الخبرة',
        addLabel: 'إضافة مجال',
        newItem: () => ({icon: 'stethoscope', title: L(), description: L(), href: '/services'}),
        itemTitle: (item) => arOf(item.title),
        fields: [
          {type: 'icon', key: 'icon', label: 'الأيقونة'},
          {type: 'l10n', key: 'title', label: 'العنوان', required: true},
          {type: 'l10n', key: 'description', label: 'الوصف', multiline: true},
          {type: 'link', key: 'href', label: 'الرابط عند الضغط'}
        ]
      }
    ]
  },
  {
    id: 'video',
    label: 'الفيديو التعريفي',
    fields: [videoEmbed('intro_video', 'الفيديو التعريفي (صفحة عن الدكتور)', 'videos/about')]
  },
  {
    id: 'headings',
    label: 'عناوين الأقسام',
    fields: [
      {
        type: 'group',
        key: 'headings',
        label: 'عناوين أقسام صفحة «عن الدكتور»',
        fields: [
          sectionHeading('career', 'المسيرة المهنية'),
          sectionHeading('intro_video', 'الفيديو التعريفي', {description: true}),
          sectionHeading('expertise', 'مجالات الخبرة', {cta: true}),
          sectionHeading('certificates', 'الشهادات'),
          sectionHeading('achievements', 'الإنجازات (العدّادات)')
        ]
      }
    ]
  }
];

/* ---------- Services ---------- */

const slugField = (hint: string): Field => ({
  type: 'text',
  key: 'slug',
  label: 'المعرّف في الرابط (slug)',
  dir: 'ltr',
  hint,
  pattern: SLUG_PATTERN,
  patternMessage: 'المعرّف: حروف إنجليزية صغيرة وأرقام وشرطات فقط (مثل laparoscopic-surgery)'
});

export const serviceFields: Field[] = [
  {type: 'l10n', key: 'title', label: 'اسم التخصص', required: true},
  {type: 'l10n', key: 'summary', label: 'ملخص قصير (البطاقة)', multiline: true},
  {type: 'l10n', key: 'description', label: 'الوصف التفصيلي', multiline: true, rows: 5},
  {type: 'image', key: 'image_url', label: 'صورة التخصص', folder: 'services', maxWidth: 1400, aspect: 'aspect-[3/2]'},
  slugField('يُستخدم كرابط مباشر للقسم: /services#slug. فارغ = يُولَّد من الاسم الإنجليزي.'),
  {type: 'toggle', key: 'is_published', label: 'منشور على الموقع'}
];

export const procedureFields: Field[] = [
  {type: 'l10n', key: 'title', label: 'اسم العملية / الخدمة', required: true},
  {type: 'l10n', key: 'description', label: 'الوصف', multiline: true, rows: 5},
  {type: 'image', key: 'image_url', label: 'الصورة', folder: 'procedures', maxWidth: 1000, aspect: 'aspect-[3/2]', hint: 'فارغة = صورة التخصص.'},
  slugField('فارغ = يُولَّد تلقائيًا.'),
  {type: 'toggle', key: 'is_published', label: 'منشورة'}
];

export const servicesBlockFields: Field[] = [
  sectionHeading('fields', 'قسم اختيار التخصص'),
  {
    type: 'group',
    key: 'process',
    label: 'خطوات التشخيص وتحديد العلاج',
    fields: [
      {type: 'l10n', key: 'eyebrow', label: 'العنوان الصغير'},
      {type: 'l10n', key: 'title', label: 'العنوان'},
      {type: 'l10n', key: 'description', label: 'الوصف', multiline: true},
      stepsList('steps', 'الخطوات')
    ]
  },
  sectionHeading('faq', 'قسم الأسئلة الشائعة في صفحة الخدمات')
];

/** Fills an empty slug from the English (or Arabic) title. */
export function withSlug(row: Record<string, unknown>): Record<string, unknown> {
  const title = row.title as {ar?: string; en?: string} | undefined;
  const slug = String(row.slug ?? '').trim() || slugify(title?.en ?? '') || `item-${Date.now().toString(36)}`;
  return {...row, slug};
}

/* ---------- Articles (the body is edited separately with the rich-text editor) ---------- */

export const articleFields: Field[] = [
  {type: 'l10n', key: 'title', label: 'عنوان المقال', required: true},
  {type: 'l10n', key: 'excerpt', label: 'مقتطف قصير', multiline: true, hint: 'يظهر في بطاقة المقال وتحت العنوان في صفحته.'},
  {type: 'l10n', key: 'category', label: 'التصنيف', hint: 'مثل: جراحة المناظير، الفتق، الجهاز الهضمي…'},
  {type: 'image', key: 'cover_url', label: 'صورة الغلاف', folder: 'articles', maxWidth: 1600, aspect: 'aspect-video'},
  slugField('رابط المقال: /articles/slug. فارغ = يُولَّد من العنوان الإنجليزي. لا تغيّره بعد النشر حتى لا تتعطل الروابط القديمة.')
];

export const articleSeoFields: Field[] = [
  {type: 'l10n', key: 'title', label: 'عنوان المقال في جوجل', hint: 'حوالي 50–60 حرفًا. فارغ = عنوان المقال.'},
  {type: 'l10n', key: 'description', label: 'وصف المقال في جوجل', multiline: true, hint: 'حوالي 140–160 حرفًا. فارغ = المقتطف.'}
];

/* ---------- Videos ---------- */

export const videoFields: Field[] = [
  {type: 'l10n', key: 'title', label: 'عنوان الفيديو', required: true},
  {type: 'l10n', key: 'description', label: 'وصف قصير', multiline: true},
  {
    type: 'video',
    key: 'video_url',
    label: 'ملف الفيديو أو الرابط',
    folder: 'videos',
    durationKey: 'duration',
    orientationKey: 'orientation',
    hint: 'ارفع من الجهاز (تُقرأ المدة والاتجاه تلقائيًا) أو الصق رابط يوتيوب. فارغ = «متاح قريبًا».'
  },
  {type: 'image', key: 'thumbnail_url', label: 'صورة الغلاف (Thumbnail)', folder: 'videos/thumbnails', maxWidth: 1200, required: true, aspect: 'aspect-[9/16] max-h-80 mx-auto', hint: 'إلزامية — تظهر قبل تشغيل الفيديو.'},
  {
    type: 'select',
    key: 'orientation',
    label: 'اتجاه الفيديو',
    options: [
      {value: 'portrait', label: 'عمودي (ريلز / شورتس 9:16)'},
      {value: 'landscape', label: 'أفقي (16:9)'}
    ]
  },
  {type: 'text', key: 'duration', label: 'المدة', dir: 'ltr', placeholder: '1:45'},
  {type: 'toggle', key: 'is_featured', label: 'يظهر في الصفحة الرئيسية'},
  {type: 'toggle', key: 'is_published', label: 'منشور'}
];

/** Derives the `source` column from the URL. */
export function withVideoSource(row: Record<string, unknown>): Record<string, unknown> {
  const url = String(row.video_url ?? '').trim();
  const source = youtubeId(url) ? 'youtube' : url.startsWith(`${supabaseUrl}/storage/`) || !url ? 'upload' : 'external';
  return {...row, video_url: url, source};
}

/* ---------- Reviews & FAQs ---------- */

export const reviewFields: Field[] = [
  {type: 'l10n', key: 'patient_name', label: 'اسم المريض', required: true, hint: 'يفضَّل الاسم الأول + أول حرف من اسم العائلة، وبموافقة المريض.'},
  {type: 'l10n', key: 'procedure', label: 'العملية / الحالة'},
  {type: 'l10n', key: 'review_text', label: 'نص الرأي', required: true, multiline: true, rows: 4},
  {
    type: 'select',
    key: 'rating',
    label: 'التقييم',
    options: [5, 4, 3, 2, 1].map((n) => ({value: String(n), label: '★'.repeat(n)}))
  },
  {type: 'toggle', key: 'is_visible', label: 'ظاهر على الموقع'},
  {type: 'toggle', key: 'show_on_home', label: 'يظهر في سلايدر الصفحة الرئيسية'}
];

export const faqFields: Field[] = [
  {type: 'l10n', key: 'question', label: 'السؤال', required: true},
  {type: 'l10n', key: 'answer', label: 'الإجابة', required: true, multiline: true, rows: 5},
  {
    type: 'select',
    key: 'page',
    label: 'يظهر في',
    options: [
      {value: 'home', label: 'الصفحة الرئيسية'},
      {value: 'services', label: 'صفحة الخدمات'}
    ]
  },
  {type: 'toggle', key: 'is_visible', label: 'ظاهر'}
];
