'use client';

import {LockKeyhole, LogIn, Mail} from 'lucide-react';
import {useState, type FormEvent} from 'react';
import {Alert, Button, Label, TextInput} from '@/components/admin/ui';
import {describeError, getAdminClient} from '@/lib/admin/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    const {error: signInError} = await getAdminClient().auth.signInWithPassword({email: email.trim(), password});
    setBusy(false);
    // On success AdminShell sees the new session and redirects to the dashboard.
    if (signInError) {
      setError(/invalid login credentials/i.test(signInError.message) ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : describeError(signInError));
    }
  }

  async function forgot() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('اكتب بريدك الإلكتروني أولًا ثم اضغط «نسيت كلمة المرور».');
      return;
    }
    setBusy(true);
    const {error: resetError} = await getAdminClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password/`
    });
    setBusy(false);
    if (resetError) setError(describeError(resetError));
    else setNotice('إن كان البريد مسجّلًا، ستصلك رسالة بها رابط لتعيين كلمة مرور جديدة.');
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand text-2xl font-bold text-gold-300 shadow-gold">ش</span>
          <h1 className="mt-5 text-2xl font-bold">لوحة تحكم الموقع</h1>
          <p className="mt-2 text-sm text-white/60">د. أحمد شولح — استشاري الجراحة العامة والمناظير</p>
        </div>

        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-white/10 bg-navy-900/70 p-6 shadow-luxe sm:p-8">
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail aria-hidden className="pointer-events-none absolute top-1/2 end-3 size-4 -translate-y-1/2 text-white/40" />
              <TextInput
                id="email"
                type="email"
                dir="ltr"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pe-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <LockKeyhole aria-hidden className="pointer-events-none absolute top-1/2 end-3 size-4 -translate-y-1/2 text-white/40" />
              <TextInput
                id="password"
                type="password"
                dir="ltr"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pe-10"
              />
            </div>
          </div>

          {error && <Alert tone="error">{error}</Alert>}
          {notice && <Alert tone="success">{notice}</Alert>}

          <Button type="submit" variant="primary" loading={busy} className="w-full">
            <LogIn aria-hidden className="size-4 rtl:-scale-x-100" />
            تسجيل الدخول
          </Button>
          <button type="button" onClick={forgot} disabled={busy} className="block w-full text-center text-sm text-white/60 hover:text-gold-300">
            نسيت كلمة المرور؟
          </button>
        </form>
      </div>
    </main>
  );
}
