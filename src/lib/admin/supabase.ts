'use client';

import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import {supabaseKey, supabaseUrl} from '@/lib/cms/rest';

/*
 * The dashboard's Supabase client (auth + database + storage). Only the publishable key is used:
 * every write is authorised by the signed-in user's session and the RLS policies in
 * supabase/schema.sql (admins only). Loaded by /admin pages only, never by the public site.
 */
let client: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }
  client ??= createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Password-reset links must work even when opened on another device (no PKCE verifier there).
      flowType: 'implicit',
      storageKey: 'shoulah-admin-auth'
    }
  });
  return client;
}

/** Arabic, human-readable message for common Supabase/PostgREST errors. */
export function describeError(error: unknown): string {
  const e = error as {message?: string; code?: string; status?: number; details?: string} | null;
  const message = e?.message ?? String(error);
  if (e?.code === '23505') return 'هذه القيمة مستخدمة بالفعل (مثلاً رابط/slug مكرر).';
  if (e?.code === '23514') return 'بعض القيم غير صالحة (تحقق من الحقول المطلوبة والصيغ).';
  if (e?.code === '42501' || /row-level security|permission denied/i.test(message)) return 'ليست لديك صلاحية لهذا الإجراء.';
  if (e?.code === 'PGRST205' || /schema cache/i.test(message)) return 'قاعدة البيانات لم تُجهَّز بعد: شغّل ملف supabase/schema.sql في Supabase.';
  if (/Failed to fetch|NetworkError/i.test(message)) return 'تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.';
  if (/JWT expired|invalid jwt/i.test(message)) return 'انتهت الجلسة، سجّل الدخول مرة أخرى.';
  return message;
}
