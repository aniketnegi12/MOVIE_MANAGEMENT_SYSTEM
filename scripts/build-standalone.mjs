// ─── build-standalone.mjs ────────────────────────────────────────────────────
// Inlines every src/*.js referenced by index.html into dist/standalone.html —
// a single self-contained file that runs anywhere (preview harness, file://,
// any static host) with zero CORS/setup friction.
// Run: node scripts/build-standalone.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

const inlined = html.replace(
  /<script src="(src\/[^"]+)"><\/script>/g,
  (_, src) => `<script>\n/* ── inlined: ${src} ── */\n${readFileSync(join(root, src), 'utf8')}\n</script>`
);

const remaining = [...inlined.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
if (remaining.length) {
  console.error('✗ unresolved script tags:', remaining);
  process.exit(1);
}

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/standalone.html'), inlined);
console.log(`✓ dist/standalone.html (${(inlined.length / 1024).toFixed(1)} KB) — ${inlined.match(/─ inlined/g)?.length || 0} files inlined`);
