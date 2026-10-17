# Current design — Sibsys

Production source: `app/`; public assets: `static/`; Astro static output: `dist/`. Local `src/lib/publication.ts` owns en/id locales, Jakarta build-date eligibility, slug uniqueness and translation pairing. `app/content.config.ts` loads locale-qualified IDs from Markdown/MDX. Collection eligibility feeds all routes, feeds and Pagefind.

Retained Navfolio pieces: language-neutral BaseLayout, Markdown integration through `src/plugins/config.ts`, upstream Git history and MIT license. No package fork is needed and upstream locale normalization is not used. `modules: []` disables legacy injected modules. `src/` legacy content/layouts and `public/` are references, not production inputs.

Owner's 2026-10-17 design revision: application-owned neutral grayscale tokens, white/near-black light mode and charcoal/off-white dark mode. Code blocks, favicon and sharing artwork follow the same direction. No visible upstream credit in the website interface; README credit and license notices remain.

Docker provides edit, build/export, local Wrangler preview and browser QA targets. The final release is static assets only: no main Worker script/SSR/database. Intended origin `https://sibsys.dev`; account/domain association remains deployment-specific. EN is the root redirect; EN/ID detail URLs may differ while sharing a translation key. Placeholder mode requests noindex until the owner replaces/reviews examples.

See docs for authoring, deployment, provenance, verification and outstanding acceptance.

The 2026-10-17 resume revision replaces the Writing main-navigation entry with Resume. Isolated `app/pages/[lang]/resume/` routes use `app/content/resumes/`, the shared publication rules and `app/lib/resumes.ts`. Two editable author profiles are paired across EN/ID; CV content is Markdown, photos local and optional links HTTPS. Writing archives and RSS remain available. A missing CV translation falls back to the other locale's resume index. No additional runtime or dependency is needed.
