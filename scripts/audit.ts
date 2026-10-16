import { readdir, readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root = path.resolve('dist');
const files: string[] = [];
async function walk(directory: string) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) await walk(file);
    else files.push(file);
  }
}
await walk(root);
const relative = new Set(files.map((f) => path.relative(root, f)));
const errors: string[] = [];
const records: { path: string; bytes: number; sha256: string }[] = [];
let maxBytes = 0;
for (const file of files.sort()) {
  const name = path.relative(root, file);
  const bytes = (await stat(file)).size;
  const buffer = await readFile(file);
  records.push({ path: name, bytes, sha256: createHash('sha256').update(buffer).digest('hex') });
  maxBytes = Math.max(maxBytes, bytes);
  if (bytes > 25 * 1024 * 1024) errors.push(`Cloudflare file limit exceeded: ${name}`);
  if (/\.(env|pem|key)$|(^|\/)(node_modules|src|app|research|\.git)\//.test(name))
    errors.push(`Non-public source in output: ${name}`);
  if (/\.(html|js|json|xml|txt)$/.test(file)) {
    const content = buffer.toString('utf8');
    if (/SIBSYS_(DRAFT|FUTURE)_SENTINEL/.test(content))
      errors.push(`Unpublished fixture leaked: ${name}`);
    if (/astro\.navfolio\.site|ChillRoundM|force_language/.test(content))
      errors.push(`Reference configuration leaked: ${name}`);
    if (file.endsWith('.html')) {
      const documentUrl = new URL('/' + name.replace(/index\.html$/, ''), 'https://sibsys.dev');
      for (const [, raw] of content.matchAll(/(?:href|src)="([^"]+)"/g)) {
        if (/^(data:|mailto:|tel:)/.test(raw)) continue;
        const url = new URL(raw.replaceAll('&amp;', '&'), documentUrl);
        if (url.origin !== 'https://sibsys.dev') continue;
        const target = decodeURIComponent(url.pathname).replace(/^\//, '');
        const resolved = [
          target,
          target.replace(/\/$/, '') + '/index.html',
          target + '.html',
          target + 'index.html',
        ].find((candidate) => relative.has(candidate));
        if (!resolved) {
          errors.push(`${name}: unresolved ${raw}`);
          continue;
        }
        if (url.hash && resolved.endsWith('.html')) {
          const targetHtml = await readFile(path.join(root, resolved), 'utf8');
          if (!targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`))
            errors.push(`${name}: missing fragment ${raw}`);
        }
      }
      if (name.startsWith('en/') && !content.includes('lang="en"'))
        errors.push(`Wrong language: ${name}`);
      if (name.startsWith('id/') && !content.includes('lang="id"'))
        errors.push(`Wrong language: ${name}`);
    }
  }
}
const assets = records.filter((r) => !['_headers', '_redirects', '.assetsignore'].includes(r.path));
if (assets.length > 20_000) errors.push('Cloudflare Free asset count exceeded');
await mkdir('releases', { recursive: true });
const report = {
  files: assets.length,
  totalBytes: assets.reduce((n, r) => n + r.bytes, 0),
  maxFileBytes: maxBytes,
  warnings:
    assets.length >= 16_000 || maxBytes > 20 * 1024 * 1024
      ? ['Approaching project headroom target']
      : [],
  errors,
  manifest: records,
};
await writeFile('releases/asset-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(
  `Output audit: ${assets.length} assets; largest ${(maxBytes / 1024).toFixed(1)} KiB; ${errors.length} errors.`,
);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
