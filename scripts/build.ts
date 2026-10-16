import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildDate } from '../src/lib/publication';
import { site } from '../app/config/site';
const day = buildDate();
async function run(command: string[]) {
  const child = Bun.spawn(command, {
    stdout: 'inherit',
    stderr: 'inherit',
    env: { ...process.env, BUILD_DATE: day, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  if (await child.exited) throw new Error(`Build step failed: ${command.join(' ')}`);
}
// Content caches can retain stylesheet URLs from an earlier Markdown theme.
await run(['node', 'node_modules/astro/bin/astro.mjs', 'build', '--force']);
for (const lang of ['en', 'id']) await cp(`dist/${lang}/404/index.html`, `dist/${lang}/404.html`);
if (site.placeholderMode) {
  const headers = await readFile('dist/_headers', 'utf8');
  await writeFile('dist/_headers', headers.replace('/*\n', '/*\n  X-Robots-Tag: noindex\n'));
}
await run(['node_modules/.bin/pagefind', '--site', 'dist']);
await run(['bun', 'scripts/audit.ts']);
await mkdir('releases', { recursive: true });
await writeFile(
  'releases/build-inputs.json',
  JSON.stringify(
    {
      buildDate: day,
      sourceCommit: process.env.SOURCE_COMMIT ?? 'working-tree',
      site: site.url,
      node: Bun.spawnSync(['node', '-p', 'process.versions.node']).stdout.toString().trim(),
      bun: Bun.version,
      lockSha256: createHash('sha256')
        .update(await readFile('bun.lock'))
        .digest('hex'),
      wranglerConfigSha256: createHash('sha256')
        .update(await readFile('wrangler.jsonc'))
        .digest('hex'),
      placeholderMode: site.placeholderMode,
    },
    null,
    2,
  ) + '\n',
);
