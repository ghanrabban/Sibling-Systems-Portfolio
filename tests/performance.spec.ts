import { test, expect } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';

test('record three cold mobile samples per representative page', async ({ browser }) => {
  test.setTimeout(180_000);
  const routes = [
    '/en/',
    '/id/',
    '/en/blog/a-note-to-begin-with/',
    '/id/blog/catatan-untuk-memulai/',
    '/en/projects/your-next-project/',
    '/en/resume/',
    '/id/resume/author-2/',
  ];
  const samples: {
    route: string;
    lcp: number;
    cls: number;
    fontBytes: number;
    scriptBytes: number;
  }[] = [];
  for (const route of routes) {
    for (let run = 0; run < 3; run++) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        colorScheme: 'light',
      });
      const page = await context.newPage();
      const session = await context.newCDPSession(page);
      await session.send('Network.enable');
      await session.send('Network.setCacheDisabled', { cacheDisabled: true });
      await session.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,
        downloadThroughput: 1_600_000 / 8,
        uploadThroughput: 750_000 / 8,
      });
      await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.addInitScript(() => {
        const measured = { lcp: 0, cls: 0 };
        Object.assign(window, { sibsysMetrics: measured });
        new PerformanceObserver((list) => {
          for (const item of list.getEntries()) measured.lcp = item.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const item of list.getEntries() as (PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          })[])
            if (!item.hadRecentInput) measured.cls += item.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(async () => {
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const metrics = (window as unknown as { sibsysMetrics: { lcp: number; cls: number } })
          .sibsysMetrics;
        return {
          ...metrics,
          fontBytes: resources
            .filter((r) => /\.woff2?/.test(r.name))
            .reduce((n, r) => n + r.encodedBodySize, 0),
          scriptBytes: resources
            .filter((r) => /\.js(?:\?|$)/.test(r.name))
            .reduce((n, r) => n + r.encodedBodySize, 0),
        };
      });
      samples.push({ route, ...result });
      await context.close();
    }
  }
  const median = (values: number[]) => [...values].sort((a, b) => a - b)[1];
  const medians = routes.map((route) => {
    const values = samples.filter((s) => s.route === route);
    return { route, lcp: median(values.map((s) => s.lcp)), cls: median(values.map((s) => s.cls)) };
  });
  await mkdir('releases', { recursive: true });
  await writeFile(
    'releases/performance.json',
    JSON.stringify(
      {
        browser: browser.version(),
        environment: `${os.platform()} ${os.arch()}`,
        viewport: '390x844',
        cpuSlowdown: 4,
        downloadMbps: 1.6,
        uploadKbps: 750,
        latencyMs: 150,
        samples,
        medians,
        limitation:
          'Local Wrangler lab, starter content; not hosted field performance or a long real article.',
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(medians));
  for (const sample of samples) {
    expect(sample.lcp).toBeGreaterThan(0);
    expect(sample.fontBytes).toBeLessThanOrEqual(300 * 1024);
    expect(sample.scriptBytes).toBeLessThanOrEqual(200 * 1024);
  }
  for (const result of medians) {
    expect(result.lcp, result.route).toBeLessThanOrEqual(2500);
    expect(result.cls, result.route).toBeLessThanOrEqual(0.1);
  }
});
