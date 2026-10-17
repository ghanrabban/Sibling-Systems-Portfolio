import { writeFile, unlink, readFile, access } from 'node:fs/promises';
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
    for (const collection of ['blog', 'resumes']) {
      for (const kind of ['draft', 'future']) {
        const file = `app/content/${collection}/${lang}/__verification-${kind}.md`;
        const resumeFields =
          collection === 'resumes'
            ? 'headline: Verification profile\nphoto: /images/authors/author-1.svg\nphotoAlt: Verification placeholder\n'
            : '';
        await writeFile(
          file,
          `---\ntitle: SIBSYS_${kind.toUpperCase()}_SENTINEL\ndescription: Private verification fixture\nlang: ${lang}\ntranslationKey: verification-${kind}\nslug: verification-${kind}\ndate: '${kind === 'future' ? '2099-01-01' : '2026-10-13'}'\ndraft: ${kind === 'draft'}\ntags: [verification-private]\n${resumeFields}---\nSIBSYS_${kind.toUpperCase()}_SENTINEL\n`,
          { flag: 'wx' },
        );
        files.push(file);
      }
    }
  }
  const minimalResume = 'app/content/resumes/en/__verification-minimal.md';
  await writeFile(
    minimalResume,
    `---
title: Verification minimal resume
description: A temporary profile with no optional fields
lang: en
translationKey: verification-minimal
slug: verification-minimal
date: '2026-10-13'
headline: Verification profile
photo: /images/authors/author-1.svg
photoAlt: Verification placeholder
---
## About

Temporary profile.
`,
    { flag: 'wx' },
  );
  files.push(minimalResume);
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
  for (const lang of ['en', 'id']) {
    for (const kind of ['draft', 'future']) {
      await assert.rejects(access(`dist/${lang}/resume/verification-${kind}/index.html`));
    }
    assert.doesNotMatch(
      await readFile(`dist/${lang}/resume/index.html`, 'utf8'),
      /SIBSYS_(DRAFT|FUTURE)_SENTINEL/,
    );
  }
  const minimalHtml = await readFile('dist/en/resume/verification-minimal/index.html', 'utf8');
  assert.match(minimalHtml, /href="\/id\/resume\/"/);
  assert.doesNotMatch(minimalHtml, /hreflang="id"|class="resume-(skills|links|location|example)"/);
  assert.doesNotMatch(
    await readFile('dist/id/resume/index.html', 'utf8'),
    /Verification minimal resume/,
  );
  assert.doesNotMatch(await readFile('dist/sitemap-0.xml', 'utf8'), /verification-(draft|future)/);
  assert.match(await readFile('dist/en/blog/page/2/index.html', 'utf8'), /Page 2 of 2/);
  assert.doesNotMatch(await readFile('dist/en/blog/page/2/index.html', 'utf8'), /hreflang="id"/);
  assert.match(await readFile('dist/en/blog/index.html', 'utf8'), /\/en\/blog\/page\/2\//);
  assert.doesNotMatch(
    await readFile('dist/id/rss.xml', 'utf8'),
    /Pagination fixture|SIBSYS_(DRAFT|FUTURE)_SENTINEL/,
  );
  console.log(
    'Publication integration: article/resume drafts and future entries excluded; minimal resume, translation fallback, pagination and locale isolation passed.',
  );
} finally {
  for (const file of files) await unlink(file);
  await build();
}
