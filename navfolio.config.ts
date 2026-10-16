import { pages } from '@navfolio/pages';
import { markdownPlugin } from '@navfolio/plugin-markdown';

import { defineNavfolioConfig } from './src/plugins/config';

export default defineNavfolioConfig({
  modules: [],
  plugins: [
    markdownPlugin({
      expressiveCode: true,
      layouts: false,
      math: {
        enabled: false,
      },
      mermaid: false,
      responsiveTables: true,
    }),
    pages(),
  ],
});
