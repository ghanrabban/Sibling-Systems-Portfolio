import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const path = (relative: string) => fileURLToPath(new URL(relative, root));
await mkdir(path('static/images/brand/'), { recursive: true });

for (const [theme, source] of [
  ['light', 'Sibsys.png'],
  ['dark', 'Sibsys_dark-theme.png'],
] as const) {
  // Preserve the supplied artwork and transparency; only resize and encode web copies.
  const image = sharp(path(`logo/${source}`));
  await image
    .clone()
    .resize(256, 256, { fit: 'contain', background: '#00000000' })
    .webp({ lossless: true })
    .toFile(path(`static/images/brand/sibsys-${theme}.webp`));
  await image
    .clone()
    .resize(64, 64, { fit: 'contain', background: '#00000000' })
    .png({ compressionLevel: 9 })
    .toFile(path(`static/favicon-${theme}.png`));
}
console.log('Generated light/dark Sibsys logos and favicons from logo/.');
