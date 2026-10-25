'use client';

import type {Session} from '@supabase/supabase-js';
import {
  Clapperboard,
  CircleHelp,
  ExternalLink,
  Home,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  PanelsTopLeft,
  Settings,
  Star,
  Stethoscope,
  UserRound,
  X
} from 'lucide-react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {createContext, use, useEffect, useState, type ReactNode} from 'react';
import {describeError, getAdminClient} from '@/lib/admin/supabase';
import {cmsConfigured} from '@/lib/cms/rest';
import {cn} from '@/lib/utils';
import {Alert, Button, Dialog, Label, Spinner, TextInput, ToastProvider, useToast} from './ui';

type AuthState =
  | {status: 'loading'}
  | {status: 'signedOut'}
  | {status: 'forbidden'; session: Session; reason: string}
  | {status: 'ready'; session: Session};

const AdminContext = createContext<{session: Session; newLeads: number; refreshLeads: () => void} | null>(null);

export function useAdmin() {
  const value = use(AdminContext);
  if (!value) throw new Error('useAdmin() must be used inside <AdminShell>.');
  return value;
}

/** Pages that work without a session. */
const PUBLIC_PAGES = ['/admin/login', '/admin/reset-password'];

const NAV = [
  {href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard},
  {href: '/admin/settings', label: 'الإعدادات العامة', hint: 'النافبار والفوتر والتواصل', icon: Settings},
  {href: '/admin/home', label: 'الصفحة الرئيسية', icon: Home},
  {href: '/admin/pages', label: 'رؤوس الصفحات و SEO', icon: PanelsTopLeft},
  {href: '/admin/doctor', label: 'ملف الطبيب', icon: UserRound},
  {href: '/admin/services', label: 'الخدمات والعمليات', icon: Stethoscope},
  {href: '/admin/videos', label: 'الفيديوهات', icon: Clapperboard},
  {href: '/admin/articles', label: 'المقالات', icon: Newspaper},
  {href: '/admin/reviews', label: 'آراء المرضى', icon: Star},
  {href: '/admin/faqs', label: 'الأسئلة الشائعة', icon: CircleHelp},
  {href: '/admin/leads', label: 'طلبات الاستشارة', icon: Inbox}
];

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

export function AdminShell({children}: {children: ReactNode}) {
  return (
    <ToastProvider>
      <Guard>{children}</Guard>
    </ToastProvider>
  );
}

function Guard({children}: {children: ReactNode}) {
  const pathname = normalize(usePathname() ?? '/admin');
  const router = useRouter();
  const isPublic = PUBLIC_PAGES.includes(pathname);
  const [auth, setAuth] = useState<AuthState>({status: 'loading'});

  useEffect(() => {
    if (!cmsConfigured) return;
    const client = getAdminClient();
    let active = true;

    const evaluate = async (session: Session | null) => {
      if (!session) {
        if (active) setAuth({status: 'signedOut'});
        return;
      }
      const {data, error} = await client.rpc('is_admin');
      if (!active) return;
      if (error) setAuth({status: 'forbidden', session, reason: describeError(error)});
      else if (data === true) setAuth({status: 'ready', session});
      else setAuth({status: 'forbidden', session, reason: 'هذا الحساب ليس لديه صلاحية إدارة الموقع.'});
    };

    void client.auth.getSession().then(({data}) => evaluate(data.session));
    const {data: listener} = client.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
      // Supabase advises against awaiting other client calls inside this callback.
      window.setTimeout(() => void evaluate(session), 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Redirects: no session → login (remembering the page); signed in on the login page → dashboard.
  useEffect(() => {
    if (auth.status === 'signedOut' && !isPublic) {
      router.replace(`/admin/login/?next=${encodeURIComponent(pathname)}`);
    }
    if (auth.status === 'ready' && pathname === '/admin/login') {
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(next && next.startsWith('/admin') ? `${next}/` : '/admin/');
    }
  }, [auth.status, isPublic, pathname, router]);

  if (!cmsConfigured) {
    return (
      <Centered>
        <Alert tone="error">
          لم يتم ضبط Supabase: أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY في ملف ‎.env ثم أعد البناء.
        </Alert>
      </Centered>
    );
  }

  // A sign-in that is not allowed in (not an admin, database not set up) must explain why, not leave the form idle.
  if (isPublic && !(auth.status === 'forbidden' && pathname === '/admin/login')) return <>{children}</>;
  if (auth.status === 'loading' || auth.status === 'signedOut') return <Spinner className="min-h-dvh" />;

  if (auth.status === 'forbidden') {
    return (
      <Centered>
        <div className="space-y-4 text-center">
          <Alert tone="error">{auth.reason}</Alert>
          <p className="text-sm text-white/60">{auth.session.user.email}</p>
          <Button onClick={() => void getAdminClient().auth.signOut()}>
            <LogOut aria-hidden className="size-4" />
            تسجيل الخروج
          </Button>
        </div>
      </Centered>
    );
  }

  return <Layout session={auth.session}>{children}</Layout>;
}

function Centered({children}: {children: ReactNode}) {
  return <div className="grid min-h-dvh place-items-center px-4">{<div className="w-full max-w-md">{children}</div>}</div>;
}

function Layout({session, children}: {session: Session; children: ReactNode}) {
  const pathname = normalize(usePathname() ?? '/admin');
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newLeads, setNewLeads] = useState(0);
  const [leadsTick, setLeadsTick] = useState(0);

  useEffect(() => {
    let active = true;
    getAdminClient()
      .from('consultation_leads')
      .select('id', {count: 'exact', head: true})
      .eq('status', 'new')
      .then(({count}) => {
        if (active) setNewLeads(count ?? 0);
      });
    return () => {
      active = false;
    };
  }, [leadsTick, pathname]);

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <nav aria-label="أقسام لوحة التحكم" className="flex flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={`${item.href}/`}
          onClick={() => setMenuOpen(false)}
          aria-current={isActive(item.href) ? 'page' : undefined}
          className={cn(
            'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition',
            isActive(item.href) ? 'bg-gold-400 text-navy-950' : 'text-white/75 hover:bg-white/5 hover:text-white'
          )}
        >
          <item.icon aria-hidden className="size-5 shrink-0" />
          <span className="flex-1">
            {item.label}
            {item.hint && <span className={cn('block text-[0.7rem] font-normal', isActive(item.href) ? 'text-navy-950/70' : 'text-white/40')}>{item.hint}</span>}
          </span>
          {item.href === '/admin/leads' && newLeads > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{newLeads}</span>
          )}
        </Link>
      ))}
    </nav>
  );

  return (
    <AdminContext value={{session, newLeads, refreshLeads: () => setLeadsTick((t) => t + 1)}}>
      <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
        {/* Sidebar (start side = right in Arabic) */}
        <aside className="sticky top-0 hidden h-dvh flex-col gap-6 overflow-y-auto border-e border-white/10 bg-navy-950 p-4 lg:flex">
          <SidebarBrand />
          {nav}
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-navy-950/90 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="فتح القائمة"
                className="grid size-10 place-items-center rounded-xl border border-white/15 lg:hidden"
              >
                <Menu aria-hidden className="size-5" />
              </button>
              <a
                href="/ar/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-gold-300 hover:bg-white/5"
              >
                <ExternalLink aria-hidden className="size-4" />
                عرض الموقع
              </a>
            </div>
            <div className="flex items-center gap-1">
              <span dir="ltr" className="hidden max-w-56 truncate text-xs text-white/50 md:inline">
                {session.user.email}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setPasswordOpen(true)}>
                <KeyRound aria-hidden className="size-4" />
                <span className="hidden sm:inline">كلمة المرور</span>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void getAdminClient().auth.signOut()}>
                <LogOut aria-hidden className="size-4 rtl:-scale-x-100" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="إغلاق القائمة" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-navy-950/80" />
          <aside className="absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto bg-navy-950 p-4 shadow-luxe">
            <div className="flex items-center justify-between">
              <SidebarBrand />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="إغلاق" className="grid size-10 place-items-center rounded-xl hover:bg-white/5">
                <X aria-hidden className="size-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <ChangePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </AdminContext>
  );
}

function SidebarBrand() {
  return (
    <Link href="/admin/" className="flex items-center gap-3 px-2">
      <span className="grid size-10 place-items-center rounded-xl bg-brand text-lg font-bold text-gold-300">ش</span>
      <span>
        <span className="block font-bold">لوحة التحكم</span>
        <span className="block text-xs text-white/50">د. أحمد شولح</span>
      </span>
    </Link>
  );
}

function ChangePasswordDialog({open, onClose}: {open: boolean; onClose: () => void}) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (password.length < 10) return setError('كلمة المرور يجب أن تكون 10 أحرف على الأقل.');
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين.');
    setSaving(true);
    const {error: updateError} = await getAdminClient().auth.updateUser({password});
    setSaving(false);
    if (updateError) return setError(describeError(updateError));
    setPassword('');
    setConfirm('');
    onClose();
    toast('تم تغيير كلمة المرور');
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="تغيير كلمة المرور"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button variant="primary" loading={saving} onClick={submit}>
            حفظ كلمة المرور
          </Button>
        </>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div>
          <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
          <TextInput id="new-password" type="password" dir="ltr" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
          <TextInput id="confirm-password" type="password" dir="ltr" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <button type="submit" className="sr-only">
          حفظ
        </button>
      </form>
    </Dialog>
  );
}
