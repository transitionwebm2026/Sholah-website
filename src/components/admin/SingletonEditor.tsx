'use client';

import {RotateCcw, Save} from 'lucide-react';
import {useEffect, useState} from 'react';
import {validate, type Field} from '@/lib/admin/fields';
import {describeError, getAdminClient} from '@/lib/admin/supabase';
import {FieldsEditor} from './FieldsEditor';
import {useUploading} from './MediaInput';
import {Alert, Button, Card, Spinner, useToast, useUnsavedWarning} from './ui';

type Value = Record<string, unknown>;

/** Where a single editable record lives. `column` set → the form edits that jsonb column only. */
export type SingletonSource = {
  table: 'site_settings' | 'doctors_profile' | 'hero_sections' | 'page_sections';
  match: Record<string, string | number>;
  column?: string;
};

const META = ['created_at', 'updated_at'];

/** Loads one row (or one jsonb column of it), renders its form and saves it back with upsert. */
export function SingletonEditor({
  source,
  fields,
  title,
  description
}: {
  source: SingletonSource;
  fields: Field[];
  title?: string;
  description?: string;
}) {
  const toast = useToast();
  const uploading = useUploading();
  const [value, setValue] = useState<Value | null>(null);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const key = JSON.stringify(source);

  useEffect(() => {
    let active = true;
    const {table, match, column} = JSON.parse(key) as SingletonSource;
    getAdminClient()
      .from(table)
      .select('*')
      .match(match)
      .maybeSingle()
      .then(({data, error: loadError}) => {
        if (!active) return;
        if (loadError) {
          setError(describeError(loadError));
          return;
        }
        // A missing row (fresh database) starts as an empty form and is created on first save.
        const row = (data ?? {}) as Value;
        const next = column
          ? ((row[column] as Value | undefined) ?? {})
          : Object.fromEntries(Object.entries(row).filter(([k]) => !META.includes(k)));
        setValue(next);
        setSaved(JSON.stringify(next));
      });
    return () => {
      active = false;
    };
  }, [key]);

  const dirty = value !== null && JSON.stringify(value) !== saved;
  useUnsavedWarning(dirty);

  async function save() {
    if (!value) return;
    const found = validate(fields, value);
    setProblems(found);
    if (found.length) {
      toast('أكمل الحقول المطلوبة أولًا', 'error');
      return;
    }
    setSaving(true);
    // Only this form's columns: other tabs editing the same row keep their own (possibly unsaved) values.
    const own = fields.flatMap((f) => (f.type === 'heading' ? [] : [f.key]));
    const payload = source.column
      ? {...source.match, [source.column]: value}
      : {...Object.fromEntries(own.filter((k) => value[k] !== undefined).map((k) => [k, value[k]])), ...source.match};
    const {error: saveError} = await getAdminClient().from(source.table).upsert(payload);
    setSaving(false);
    if (saveError) {
      toast(describeError(saveError), 'error');
      return;
    }
    setSaved(JSON.stringify(value));
    toast('تم الحفظ — التعديل ظاهر على الموقع الآن');
  }

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!value) return <Spinner />;

  return (
    <Card title={title} description={description}>
      <FieldsEditor fields={fields} value={value} onChange={setValue} />

      {problems.length > 0 && (
        <div className="mt-5">
          <Alert tone="error">
            <ul className="list-inside list-disc space-y-0.5">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-5 mt-6 -mb-5 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-white/10 bg-navy-900/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
        <span className="text-sm text-white/60">{dirty ? 'لديك تغييرات غير محفوظة' : 'كل التغييرات محفوظة'}</span>
        <div className="flex gap-2">
          {dirty && (
            <Button
              variant="ghost"
              onClick={() => {
                setValue(JSON.parse(saved) as Value);
                setProblems([]);
              }}
            >
              <RotateCcw aria-hidden className="size-4" />
              تراجع
            </Button>
          )}
          <Button variant="primary" onClick={save} loading={saving} disabled={!dirty || uploading}>
            <Save aria-hidden className="size-4" />
            {uploading ? 'انتظر انتهاء الرفع…' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
