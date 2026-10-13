/**
 * Verifies that every locale file has exactly the same keys (and array lengths) as en.json.
 * Usage: node scripts/check-messages.mjs
 */
import {readFile} from 'node:fs/promises';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '../messages');
const base = JSON.parse(await readFile(path.join(dir, 'en.json'), 'utf8'));
const locales = ['ar'];

function compare(a, b, trail, problems) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return problems.push(`${trail}: expected array`);
    if (a.length !== b.length) problems.push(`${trail}: length ${b.length} ≠ ${a.length}`);
    a.forEach((item, i) => b[i] !== undefined && compare(item, b[i], `${trail}[${i}]`, problems));
  } else if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') return problems.push(`${trail}: expected object`);
    for (const key of Object.keys(a)) {
      if (!(key in b)) problems.push(`${trail}.${key}: missing`);
      else compare(a[key], b[key], `${trail}.${key}`, problems);
    }
    for (const key of Object.keys(b)) if (!(key in a)) problems.push(`${trail}.${key}: extra`);
  } else if (typeof a !== typeof b) {
    problems.push(`${trail}: type ${typeof b} ≠ ${typeof a}`);
  }
}

let failed = false;
for (const locale of locales) {
  const messages = JSON.parse(await readFile(path.join(dir, `${locale}.json`), 'utf8'));
  const problems = [];
  compare(base, messages, locale, problems);
  if (problems.length) {
    failed = true;
    console.error(`✗ ${locale}.json\n  ${problems.join('\n  ')}`);
  } else {
    console.log(`✓ ${locale}.json matches en.json`);
  }
}
process.exit(failed ? 1 : 0);
