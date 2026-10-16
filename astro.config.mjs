import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { getAstroPluginConfig } from './src/plugins/config';
import navfolioConfig from './navfolio.config';
const markdown = getAstroPluginConfig(navfolioConfig, { mathRenderer: 'katex' });
export default defineConfig({
  site: 'https://sibsys.dev',
  base: '/',
  srcDir: './app',
  publicDir: './static',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { remarkPlugins: markdown.remarkPlugins, rehypePlugins: markdown.rehypePlugins },
  integrations: [
    ...markdown.integrations,
    mdx(),
    sitemap({ filter: (url) => new URL(url).pathname !== '/' && !url.includes('/404') }),
  ],
  server: { host: '0.0.0.0', port: 4321 },
});
