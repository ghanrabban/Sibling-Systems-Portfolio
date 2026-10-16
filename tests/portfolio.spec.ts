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
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
});

test('representative pages and search have no automated WCAG A/AA violations', async ({ page }) => {
  for (const mode of ['light', 'dark']) {
    for (const route of [
      '/en/',
      '/id/',
      '/en/blog/a-note-to-begin-with/',
      '/id/projects/proyek-berikutnya/',
      '/en/about/',
      '/id/blog/tags/',
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
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/id/');
  await expect(page.locator('h1')).toBeVisible();
  await page.locator('.nojs-nav a[href="/id/blog/"]').click();
  await expect(page.locator('.post-list')).toBeVisible();
  await context.close();
});

test('capture desktop, mobile, article and dark mode for visual review', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/en/');
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.goto('/id/blog/catatan-untuk-memulai/');
  await page.screenshot({ path: 'test-results/article-id.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/id/');
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  await page.locator('#theme-toggle').click();
  await page.screenshot({ path: 'test-results/home-mobile-dark.png', fullPage: true });
});
