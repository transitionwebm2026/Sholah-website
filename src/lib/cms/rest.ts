/**
 * Minimal Supabase REST (PostgREST) client for the public website: plain `fetch`, no SDK, so
 * visitors download a few hundred bytes instead of supabase-js. Runs both at build time (Node)
 * and in the browser. The admin dashboard uses the full SDK instead (`src/lib/admin/supabase.ts`).
 */

export const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

/** False until both public env vars are set; the build then uses the bundled seed content. */
export const cmsConfigured = Boolean(supabaseUrl && supabaseKey);

export class CmsError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'CmsError';
  }
}

const headers = () => ({apikey: supabaseKey, Accept: 'application/json'});

async function fail(res: Response, what: string): Promise<never> {
  let detail = '';
  try {
    const body = (await res.json()) as {message?: string; hint?: string};
    detail = [body.message, body.hint].filter(Boolean).join(' — ');
  } catch {
    // Non-JSON error body.
  }
  throw new CmsError(`Supabase ${what} failed (${res.status})${detail ? `: ${detail}` : ''}`, res.status);
}

/** `select` rows; `query` uses PostgREST syntax, e.g. `{select: '*', slug: 'eq.foo', order: 'sort_order.asc'}`. */
export async function restSelect<T>(table: string, query: Record<string, string>): Promise<T[]> {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${new URLSearchParams(query)}`, {headers: headers()});
  if (!res.ok) await fail(res, `read of "${table}"`);
  return (await res.json()) as T[];
}

/** Insert without reading back (visitors may insert leads but never select them). */
export async function restInsert(table: string, row: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {...headers(), 'Content-Type': 'application/json', Prefer: 'return=minimal'},
    body: JSON.stringify(row)
  });
  if (!res.ok) await fail(res, `insert into "${table}"`);
}
