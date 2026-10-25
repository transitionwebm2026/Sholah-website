import {
  Activity,
  Ambulance,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  Clock,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Hospital,
  Microscope,
  ScanLine,
  ShieldCheck,
  ShieldPlus,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Syringe,
  ThumbsUp,
  Users,
  type LucideIcon
} from 'lucide-react';

/** Icons the dashboard can assign to stats, "why choose us" points and areas of expertise. */
export const CMS_ICONS: Record<string, {icon: LucideIcon; label: string}> = {
  users: {icon: Users, label: 'مرضى'},
  activity: {icon: Activity, label: 'نبض / عمليات'},
  award: {icon: Award, label: 'جائزة / خبرة'},
  'book-open': {icon: BookOpen, label: 'كتاب / أبحاث'},
  'scan-line': {icon: ScanLine, label: 'مناظير'},
  'shield-check': {icon: ShieldCheck, label: 'أمان'},
  'shield-plus': {icon: ShieldPlus, label: 'حماية'},
  'hand-heart': {icon: HandHeart, label: 'رعاية'},
  stethoscope: {icon: Stethoscope, label: 'سماعة طبية'},
  'graduation-cap': {icon: GraduationCap, label: 'شهادة'},
  ambulance: {icon: Ambulance, label: 'طوارئ'},
  clock: {icon: Clock, label: 'وقت'},
  'heart-pulse': {icon: HeartPulse, label: 'قلب'},
  hospital: {icon: Hospital, label: 'مستشفى'},
  microscope: {icon: Microscope, label: 'تحاليل'},
  syringe: {icon: Syringe, label: 'حقن / تخدير'},
  'badge-check': {icon: BadgeCheck, label: 'اعتماد'},
  star: {icon: Star, label: 'نجمة'},
  smile: {icon: Smile, label: 'رضا'},
  sparkles: {icon: Sparkles, label: 'تميّز'},
  'thumbs-up': {icon: ThumbsUp, label: 'إعجاب'},
  'calendar-check': {icon: CalendarCheck, label: 'موعد'}
};

export function CmsIcon({name, fallback = 'stethoscope', ...props}: {name?: string; fallback?: string} & React.ComponentProps<LucideIcon>) {
  const Icon = (name && CMS_ICONS[name]?.icon) || CMS_ICONS[fallback]?.icon || Stethoscope;
  return <Icon aria-hidden {...props} />;
}
