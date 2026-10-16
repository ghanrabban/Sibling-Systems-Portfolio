import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
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
await run(['node', 'node_modules/astro/bin/astro.mjs', 'build']);
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
      node: process.versions.node,
      bun: Bun.version,
      placeholderMode: site.placeholderMode,
    },
    null,
    2,
  ) + '\n',
);
