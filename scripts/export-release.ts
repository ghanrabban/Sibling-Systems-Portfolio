import { cp, mkdir, rename, lstat, symlink, readFile } from 'node:fs/promises';
import path from 'node:path';
// Each export is immutable. Switching the pointer cannot retain deleted pages.
const output = path.resolve(process.argv[2] ?? 'releases/export');
const metadata = JSON.parse(await readFile('releases/build-inputs.json', 'utf8'));
const name = `${metadata.buildDate}-${crypto.randomUUID().slice(0, 8)}`;
await mkdir(output, { recursive: true });
const current = path.join(output, 'current');
const previous = await lstat(current).catch(() => undefined);
if (previous && !previous.isSymbolicLink())
  throw new Error('Refusing to replace an existing non-symlink output/current');
await cp('dist', path.join(output, name, 'dist'), { recursive: true });
for (const file of ['build-inputs.json', 'asset-report.json'])
  await cp(`releases/${file}`, path.join(output, name, file));
const next = path.join(output, `.next-${name}`);
await symlink(`${name}/dist`, next);
await rename(next, current);
console.log(`Exported ${name}; current points to this complete asset set.`);
