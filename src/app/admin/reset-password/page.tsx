'use client';

import {KeyRound} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useEffect, useState, type FormEvent} from 'react';
import {Alert, Button, Label, TextInput} from '@/components/admin/ui';
import {describeError, getAdminClient} from '@/lib/admin/supabase';

/** Opened from the "reset password" email: Supabase signs the user in from the link, then they pick a new password. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = getAdminClient();
    const {data} = client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) setReady(true);
    });
    // The link may already have been processed before this listener was attached.
    const timer = window.setTimeout(() => {
      void client.auth.getSession().then(({data: s}) => setReady((r) => r ?? Boolean(s.session)));
    }, 1200);
    return () => {
      data.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 10) return setError('كلمة المرور يجب أن تكون 10 أحرف على الأقل.');
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين.');
    setBusy(true);
    const {error: updateError} = await getAdminClient().auth.updateUser({password});
    setBusy(false);
    if (updateError) return setError(describeError(updateError));
    router.replace('/admin/');
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-navy-900/70 p-6 shadow-luxe sm:p-8">
        <h1 className="flex items-center gap-3 text-xl font-bold">
          <KeyRound aria-hidden className="size-6 text-gold-400" />
          تعيين كلمة مرور جديدة
        </h1>
        {ready === false && <Alert tone="error">الرابط غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من صفحة تسجيل الدخول.</Alert>}
        <div>
          <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
          <TextInput id="new-password" type="password" dir="ltr" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!ready} />
        </div>
        <div>
          <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
          <TextInput id="confirm-password" type="password" dir="ltr" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={!ready} />
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" variant="primary" loading={busy} disabled={!ready} className="w-full">
          حفظ كلمة المرور والدخول
        </Button>
      </form>
    </main>
  );
}
