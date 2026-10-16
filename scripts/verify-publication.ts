import { writeFile, unlink, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const files: string[] = [];
async function build() {
  const child = Bun.spawn(['bun', 'run', 'build'], {
    stdout: 'inherit',
    stderr: 'inherit',
    env: { ...process.env, BUILD_DATE: '2026-10-16' },
  });
  assert.equal(await child.exited, 0, 'Fixture build failed');
}
try {
  for (const lang of ['en', 'id']) {
    for (const kind of ['draft', 'future']) {
      const file = `app/content/blog/${lang}/__verification-${kind}.md`;
      await writeFile(
        file,
        `---\ntitle: SIBSYS_${kind.toUpperCase()}_SENTINEL\ndescription: Private verification fixture\nlang: ${lang}\ntranslationKey: verification-${kind}\nslug: verification-${kind}\ndate: '${kind === 'future' ? '2099-01-01' : '2026-10-13'}'\ndraft: ${kind === 'draft'}\ntags: [verification-private]\n---\nSIBSYS_${kind.toUpperCase()}_SENTINEL\n`,
        { flag: 'wx' },
      );
      files.push(file);
    }
  }
  for (let n = 0; n < 7; n++) {
    const file = `app/content/blog/en/__verification-page-${n}.md`;
    await writeFile(
      file,
      `---\ntitle: Pagination fixture ${n}\ndescription: Temporary test\nlang: en\ntranslationKey: verification-page-${n}\nslug: verification-page-${n}\ndate: '2026-10-16'\n---\nPagination fixture.\n`,
      { flag: 'wx' },
    );
    files.push(file);
  }
  await build();
  assert.match(await readFile('dist/en/blog/page/2/index.html', 'utf8'), /Page 2 of 2/);
  assert.doesNotMatch(await readFile('dist/en/blog/page/2/index.html', 'utf8'), /hreflang="id"/);
  assert.match(await readFile('dist/en/blog/index.html', 'utf8'), /\/en\/blog\/page\/2\//);
  assert.doesNotMatch(
    await readFile('dist/id/rss.xml', 'utf8'),
    /Pagination fixture|SIBSYS_(DRAFT|FUTURE)_SENTINEL/,
  );
  console.log(
    'Publication integration: drafts/future excluded; pagination and locale isolation passed.',
  );
} finally {
  for (const file of files) await unlink(file);
  await build();
}
