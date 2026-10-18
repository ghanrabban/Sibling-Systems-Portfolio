import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('static hosting: redirect, translated 404, headers and feeds', async ({ request }) => {
  const root = await request.get('/', { maxRedirects: 0 });
  expect(root.status()).toBe(302);
  expect(root.headers().location).toBe('/en/');
  for (const lang of ['en', 'id']) {
    const page = await request.get(`/${lang}/`);
    expect(page.status()).toBe(200);
    expect(page.headers()['x-content-type-options']).toBe('nosniff');
    expect(page.headers()['x-robots-tag']).toBe('noindex');
    expect(page.headers()['content-security-policy']).toContain("default-src 'self'");
    const missing = await request.get(`/${lang}/a-page-that-does-not-exist/`);
    expect(missing.status()).toBe(404);
    expect(await missing.text()).toContain(`lang="${lang}"`);
    const rss = await request.get(`/${lang}/rss.xml`);
    expect(rss.status()).toBe(200);
    expect(await rss.text()).toContain(`<language>${lang}</language>`);
    expect(await rss.text()).not.toContain(
      `https://sibsys.dev/${lang === 'en' ? 'id' : 'en'}/blog/`,
    );
  }
  const sitemap = await request.get('/sitemap-0.xml');
  expect(await sitemap.text()).toContain('https://sibsys.dev/id/about/');
  expect(await sitemap.text()).not.toContain('/404');
});

test('translations preserve article identity and expose missing counterparts honestly', async ({
  page,
}) => {
  await page.goto('/en/');
  await expect(page.locator('.post-row time').first()).toHaveAttribute('datetime', '2026-10-13');
  await page.goto('/en/blog/a-note-to-begin-with/');
  await expect(page.locator('link[hreflang="id"]')).toHaveAttribute(
    'href',
    'https://sibsys.dev/id/blog/catatan-untuk-memulai/',
  );
  await page.locator('.language-link').click();
  await expect(page).toHaveURL(/\/id\/blog\/catatan-untuk-memulai\//);
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  await page.locator('.language-link').click();
  await expect(page).toHaveURL(/\/en\/blog\/a-note-to-begin-with\//);
  await page.goto('/en/blog/an-unfinished-thought/');
  await expect(page.locator('.translation-notice')).toBeVisible();
  await expect(page.locator('link[hreflang="id"]')).toHaveCount(0);
  await expect(page.locator('.language-link')).toHaveAttribute('href', '/id/blog/');
});

test('search is bilingual, keyboard accessible, empty-safe and clearable', async ({ page }) => {
  for (const [lang, query] of [
    ['en', 'system'],
    ['id', 'sistem'],
  ]) {
    await page.goto(`/${lang}/`);
    const trigger = page.locator('.search-trigger');
    await trigger.focus();
    await page.keyboard.press('Control+k');
    await expect(page.locator('#search-input')).toBeFocused();
    await page.locator('#search-input').fill(query);
    await expect(page.locator('#search-results a').first()).toBeVisible();
    for (const href of await page
      .locator('#search-results a')
      .evaluateAll((links) => links.map((l) => l.getAttribute('href'))))
      expect(href).toContain(`/${lang}/`);
    await page.locator('#search-input').fill('unfindablezyxwv987654');
    await expect(page.locator('#search-results a')).toHaveCount(0);
    await expect(page.locator('#search-status')).toHaveText(
      lang === 'en' ? /No matches/ : /Belum ada hasil/,
    );
    await page.locator('#search-input').fill('');
    await page.keyboard.press('Escape');
    await expect(page.locator('#search-dialog')).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
});

test('failed search offers a readable fallback', async ({ page }) => {
  await page.route('**/pagefind/**', (route) => route.abort());
  await page.goto('/en/');
  await page.locator('.search-trigger').click();
  await page.locator('#search-input').fill('systems');
  await expect(page.locator('#search-status')).toHaveText(/unavailable|couldn.t|could not/i);
  await expect(page.locator('.search-footer a')).toHaveAttribute('href', '/en/blog/');
});

test('theme persists, mobile menu closes with Escape, and narrow pages fit', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/id/');
  const initial = await page.locator('html').getAttribute('data-theme');
  await page.locator('#theme-toggle').click();
  const next = initial === 'dark' ? 'light' : 'dark';
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', next);
  await page.locator('#menu-toggle').click();
  await expect(page.locator('#mobile-nav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-nav')).not.toBeVisible();
  await expect(page.locator('#menu-toggle')).toBeFocused();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/en/',
      '/id/',
      '/en/blog/inside-a-small-system/',
      '/id/blog/catatan-untuk-memulai/',
      '/en/projects/',
      '/en/resume/',
      '/id/resume/',
      '/en/resume/author-1/',
      '/id/resume/author-2/',
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
});

for (const initial of ['light', 'dark'] as const) {
  test(`brand images and favicon follow ${initial} system preference and saved overrides`, async ({
    browser,
    request,
  }) => {
    const context = await browser.newContext({ colorScheme: initial });
    const page = await context.newPage();
    const verifyBrand = async (theme: 'light' | 'dark', count: number) => {
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('#site-favicon')).toHaveAttribute('href', `/favicon-${theme}.png`);
      const visible = page.locator('.brand-mark img:visible');
      await expect(visible).toHaveCount(count);
      for (const logo of await visible.all()) {
        await expect(logo).toHaveAttribute('src', `/images/brand/sibsys-${theme}.webp`);
        expect(
          await logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth === 256),
        ).toBe(true);
      }
    };
    await page.goto('/en/');
    await verifyBrand(initial, 3);
    const opposite = initial === 'dark' ? 'light' : 'dark';
    await page.locator('#theme-toggle').click();
    await verifyBrand(opposite, 3);
    await page.reload();
    await verifyBrand(opposite, 3);
    await page.locator('.language-link').click();
    await expect(page).toHaveURL(/\/id\/$/);
    await verifyBrand(opposite, 3);
    await page.goto('/id/resume/');
    await verifyBrand(opposite, 2);
    await page.locator('#theme-toggle').click();
    await verifyBrand(initial, 2);
    const favicon = await request.get(`/favicon-${initial}.png`);
    expect(favicon.status()).toBe(200);
    expect(favicon.headers()['content-type']).toContain('image/png');
    const legacy = await request.get('/favicon.svg', { maxRedirects: 0 });
    expect(legacy.status()).toBe(301);
    expect(legacy.headers().location).toBe('/favicon-light.png');
    await context.close();
  });
}

test('representative pages and search have no automated WCAG A/AA violations', async ({ page }) => {
  for (const mode of ['light', 'dark']) {
    for (const route of [
      '/en/',
      '/id/',
      '/en/blog/a-note-to-begin-with/',
      '/id/projects/proyek-berikutnya/',
      '/en/about/',
      '/id/blog/tags/',
      '/en/resume/',
      '/id/resume/',
      '/en/resume/author-1/',
      '/id/resume/author-2/',
    ]) {
      await page.goto(route);
      await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), mode);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations,
        `${route} (${mode}): ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
      ).toEqual([]);
    }
  }
  await page.locator('.search-trigger').click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test('core content and navigation remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: 'dark',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/id/');
  await expect(page.locator('h1')).toBeVisible();
  // Without scripting the page retains its light theme, even on a dark OS.
  await expect(page.locator('.brand-mark-light:visible')).toHaveCount(3);
  await expect(page.locator('.brand-mark-dark:visible')).toHaveCount(0);
  await expect(page.locator('#site-favicon')).toHaveAttribute('href', '/favicon-light.png');
  await page.locator('.nojs-nav a[href="/id/resume/"]').click();
  await expect(page.locator('.resume-card')).toHaveCount(2);
  await page.locator('.resume-card').nth(1).click();
  await expect(page.locator('h1')).toHaveText('Penulis Kedua');
  await expect(page.locator('.resume-prose')).toBeVisible();
  await page.locator('.resume-back').click();
  await expect(page).toHaveURL(/\/id\/resume\/$/);
  await page.locator('.nojs-nav a[href="/id/"]').click();
  await page.getByRole('link', { name: 'Semua tulisan', exact: true }).first().click();
  await expect(page.locator('.post-list')).toBeVisible();
  await context.close();
});

test('both authors have separate bilingual resumes and working photo cards', async ({
  page,
  request,
}) => {
  for (const lang of ['en', 'id']) {
    await page.goto(`/${lang}/resume/`);
    await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveText('Resume');
    await expect(page.locator('.desktop-nav a[href$="/blog/"]')).toHaveCount(0);
    await expect(page.locator('.resume-card')).toHaveCount(2);
    for (let n = 1; n <= 2; n++) {
      await page.goto(`/${lang}/resume/`);
      const card = page.locator('.resume-card').nth(n - 1);
      await expect(card).toHaveAttribute('href', `/${lang}/resume/author-${n}/`);
      await expect(card.locator('img')).toHaveAttribute('alt', /.+/);
      expect(
        await card
          .locator('img')
          .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
      ).toBe(true);
      await card.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`/${lang}/resume/author-${n}/$`));
      await expect(page.locator('h1')).toHaveText(
        lang === 'en'
          ? n === 1
            ? 'Author One'
            : 'Author Two'
          : n === 1
            ? 'Penulis Pertama'
            : 'Penulis Kedua',
      );
      await expect(page.locator('.resume-example')).toBeVisible();
      await expect(page.locator('.resume-prose h2')).toHaveCount(5);
      await expect(page.locator('.resume-skills li')).toHaveCount(3);
      await expect(page.locator('.resume-links')).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://sibsys.dev/${lang}/resume/author-${n}/`,
      );
      const other = lang === 'en' ? 'id' : 'en';
      await expect(page.locator(`link[hreflang="${other}"]`)).toHaveAttribute(
        'href',
        `https://sibsys.dev/${other}/resume/author-${n}/`,
      );
      await page.locator('.language-link').click();
      await expect(page).toHaveURL(new RegExp(`/${other}/resume/author-${n}/$`));
      await page.locator('.language-link').click();
      await page.locator('.resume-back').click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/resume/$`));
    }
    const missing = await request.get(`/${lang}/resume/unknown-author/`);
    expect(missing.status()).toBe(404);
    expect(await missing.text()).toContain(`lang="${lang}"`);
    const rss = await request.get(`/${lang}/rss.xml`);
    expect(await rss.text()).not.toContain('/resume/');
  }
  const sitemap = await request.get('/sitemap-0.xml');
  for (const lang of ['en', 'id'])
    for (const n of [1, 2])
      expect(await sitemap.text()).toContain(`https://sibsys.dev/${lang}/resume/author-${n}/`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  await page.locator('#menu-toggle').click();
  await page.locator('#mobile-nav a[href="/en/resume/"]').click();
  await expect(page.locator('.resume-card')).toHaveCount(2);
});

test('author resumes are searchable in their own language', async ({ page }) => {
  for (const [lang, query] of [
    ['en', 'Author'],
    ['id', 'Penulis'],
  ]) {
    await page.goto(`/${lang}/resume/`);
    await page.locator('.search-trigger').click();
    await page.locator('#search-input').fill(query);
    await expect(page.locator(`#search-results a[href*="/${lang}/resume/"]`)).toHaveCount(2);
    const other = lang === 'en' ? 'id' : 'en';
    await expect(page.locator(`#search-results a[href*="/${other}/"]`)).toHaveCount(0);
    await page.locator(`#search-results a[href*="/${lang}/resume/"]`).first().click();
    await expect(page.locator('.resume-hero')).toBeVisible();
  }
});

test('capture desktop, mobile, article and dark mode for visual review', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/en/');
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.locator('#theme-toggle').click();
  await page.screenshot({ path: 'test-results/home-desktop-dark.png', fullPage: true });
  await page.locator('#theme-toggle').click();
  await page.goto('/en/resume/');
  await page.screenshot({ path: 'test-results/resume-desktop.png', fullPage: true });
  await page.goto('/en/resume/author-1/');
  await page.screenshot({ path: 'test-results/resume-profile-desktop.png', fullPage: true });
  await page.goto('/id/blog/catatan-untuk-memulai/');
  await page.screenshot({ path: 'test-results/article-id.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/id/resume/');
  await page.screenshot({ path: 'test-results/resume-mobile.png', fullPage: true });
  await page.goto('/id/resume/author-2/');
  await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'));
  await page.screenshot({ path: 'test-results/resume-profile-dark-mobile.png', fullPage: true });
  await page.goto('/id/');
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  await page.locator('#theme-toggle').click();
  await page.screenshot({ path: 'test-results/home-mobile-dark.png', fullPage: true });
});
