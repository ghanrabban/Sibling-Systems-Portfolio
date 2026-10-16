# Sibsys implementation record

Started 2026-10-13, following master plan revision 3. Product: **Sibsys — Sibling Systems**, intended origin `https://sibsys.dev`. EN/ID interfaces, Git/GitHub source, local Docker, and Cloudflare Workers Static Assets remain the delivery constraints.

## Baseline and decisions

- Clean existing portfolio checkout: Navfolio `70aa71ddd9f7ee4af38fa5810b320820712f1885`, branch `v1`; implementation branch `feat/sibsys-portfolio`. No pre-existing local edits.
- Docker engine 29.8.2, Linux aarch64; Compose 5.5.1. Pinned Node image and Bun version are recorded in Dockerfile.
- Local-only reference font tooling is isolated in the `reference` image target.
- Read-only locale research supports retaining Navfolio with narrow local core/theme forks; upgrading their default branches does not fix the inspected locale/head contracts. Core baseline `1e7954f8fa38e150b961b85d9cc2630aede6f3d5`; theme `0be2d98a2550afab644cdca2b129245027615638`.
- The previous `sibsys.dev` page was unavailable through the web inspection tool. No existing live content has been inferred or replaced.
- Biography beyond the supplied descriptor and other project/article material have not been supplied. Initial content must be factual about Sibsys itself; no invented achievements or employment.

## Evidence status

The placeholder implementation and local automated checks are complete. Results and pending owner, manual-accessibility, deployment and recovery checks are recorded below. An unexecuted check is not a pass.

## Reference verification and scoped architecture decision

2026-10-13: Docker reference build passed at the audited commit with the pinned docs submodule. Bun 1.4.3 installed the frozen lock; Astro rendered 75 pages and Pagefind indexed 73 pages in forced `zh`. Baseline warnings: deprecated Markdown configuration and large demo chunks. This verifies the reference, not Sibsys.

The owner authorized implementation and requested **placeholder content only**, to replace personally later. Real-content acceptance is therefore deferred; placeholders must be explicitly labeled. `https://sibsys.dev` currently serves a coming-soon page (HTTP 200). The requested GitHub repository has no advertised refs. Existing untracked Docker/publication helper work has been preserved.

B20/ADR02 refinement: source inspection shows locale state and unprefixed URLs spread across the legacy head/navigation/article helpers and module route injection. The theme exposes a language-neutral BaseLayout and palette styles. Sibsys will retain Navfolio history, theme layout/palettes, Markdown integration and pinned dependencies, while using an isolated `app/` source tree with explicit locale/content contracts and `static/` public assets. The legacy `src/` starter remains a reference; rebuild it from the audited upstream commit in a separate checkout. This uses supported theme interfaces and avoids creating a second package-fork maintenance obligation. No claim is made that upstream core itself gained Indonesian support; production will not call its locale normalizer. The old doc/demo routes and public fonts are outside the production build boundary.

G1 reference build is passed. G2 requires the new EN/ID slice, filtering and generated search checks before it can pass. User publication on GitHub is authorized by the current request; target is `ghanrabban/Sibling-Systems-Portfolio`.

## Verification update — 2026-10-16

The upstream reference is preserved in history. The production application now builds 43 HTML pages (plus feed routes), with 11 eligible searchable entries split across English and Indonesian. The owner requested placeholders; G3 real-biography/project-claims acceptance is intentionally deferred, not inferred from the examples.

Completed on Docker Linux arm64: 7 publication/UI-contract tests; Astro check (zero errors); generated link/fragment, locale and asset audit; draft/future sentinel and pagination integration; 8 Chromium browser scenarios covering native redirect/headers/localized 404s, feeds, reciprocal translations, original-only content, Pagefind, failed-index fallback, theme persistence, mobile menu, no-JavaScript reading and viewport overflow at 320/390/768/1440px. Automated axe checks cover six representative pages in both themes plus the search dialog, with zero violations of the selected WCAG A/AA rules. This is not a full WCAG conformance claim or screen-reader certification.

Browser verification found and resolved duplicate header blocks (the placeholder noindex block displaced security headers), palette specificity reducing contrast, and a search-loading failure with the inherited build dependencies. A content-loader collision between the two About slugs was corrected with locale-qualified content IDs. Visual review also caught a broken sharing-image font render; the PNG was regenerated with an available font and inspected. A formatter removed list dates; they were restored and a rendered date assertion added.

Dependency audit initially flagged 16 package families, including an Astro critical advisory. The compatible update moved Astro to 7.4.0 and Sharp to 0.35.5, among other patched packages. Navfolio direct source references are explicitly pinned. Targeted overrides select xmldom 0.9.12, postcss-selector-parser 7.1.6 and KaTeX 0.18.2. Math/Mermaid are disabled in production; enabling them requires separate compatibility tests. The final official npm advisory response was `{}`. This scan does not cover OS images, all Git-hosted code, or undisclosed issues. A pattern scan of 10,236,424 bytes of outgoing inherited history found no private keys, GitHub tokens, AWS access IDs or literal Cloudflare token assignments; it is not a comprehensive secret detector. The inherited registry was replaced with official npm for future resolution; older locked tarball URLs retain integrity checks.

Performance lab: Chromium 156.0.8078.4, Linux arm64, 390×844, cold contexts/cache disabled, CDP 4× CPU slowdown, 1.6 Mbps down / 750 Kbps up / 150 ms latency, three samples per page. Median LCP in milliseconds: EN home 452; ID home 444; EN sample article 452; ID sample article 468; sample project 440. Median CLS ranged 0.0013–0.0733. Initial fonts total 150,456 bytes; scripts stayed below 200 KiB. These are local starter-content results, not real long-article, image-heavy, production-network or field results. Raw results live in the ignored release evidence directory.

Workers configuration is static-only. Local checks establish behavior and asset capacity, not account entitlement. Wrangler `whoami` reports no authentication; the actual account/plan, hosted preview, domain binding, deployment identity and remote rollback are unverified. No Cloudflare site or DNS record has been changed.

Still required for full G4/G5 acceptance: owner content/style review and author/Git walkthrough; screen-reader and real Safari/device checks; long real-content stress cases; account-authenticated hosted smoke tests and timed rollback. Source publication, clean public clone build and final Docker export status are recorded below as they execute. The plan's 0/1/6/7/12/13 pagination matrix is only partially covered by the current integration fixture; no blanket pass is claimed.

## Source and local release handoff

Implementation commit `2dd4b5216178ec00c6224d4d8f66923d5c382b4d` was pushed to the owner's `main` branch. An unauthenticated, shallow public clone succeeded and its Docker build completed without initializing the reference docs submodule. The fresh clone used cached Docker dependency layers; a separate cold frozen install had already succeeded with 726 packages. No private dependency or maintainer-only source was required.

The exported release and the fresh-clone build matched all 94 file checksums (92 assets plus `_headers` and `_redirects`). The SHA-256 of the sorted path-to-file-hash mapping is `9723d6d4ca0999b0a28bc7d738e296db0dc3c0984a5be5ab864567c97d868a73`. Assets total 1,733,684 bytes; the largest is 175,488 bytes. These two measured outputs are byte-identical; this does not establish byte-identical Docker images or every future build.

A subsequent export verification preserved every non-search file checksum but changed Pagefind's generated index/metadata bytes and names. Both indexes still report six English and five Indonesian entries. Therefore builds are functionally reproducible, not guaranteed byte-identical; retain the specific reviewed artifact and its own asset report for deployment and recovery.

Docker Compose editing and Wrangler preview both started successfully on loopback. A temporary bind-mounted edit appeared in the editing service and was restored immediately. An isolated export test verified that the active release no longer contains a withdrawn page while the old artifact remains retained. The export now saves its matching Wrangler configuration and records actual Node version, lockfile hash and configuration hash. Wrangler's upload dry run passed with no configured application bindings. A dry run is not a deployment.

The final source tag is `v0.1.0-preview.1`; it denotes a placeholder preview, not production acceptance. The local runtime/output is ready for owner review. G2's bilingual slice is implemented and tested; G3's placeholder presentation is delivered under the owner's scope change. G4/G5 remain open for the specifically listed manual/owner/hosted checks. The retained Markdown adapter still produces an Astro deprecation notice; migrate that adapter before a future incompatible framework upgrade.

## Monochrome and interface attribution revision — 2026-10-17

The owner requested a plain black/white light theme, comfortable dark contrast and no Navfolio credit in the website interface. Light mode now uses white surfaces and near-black text; dark mode uses charcoal `#222222` with off-white text. Navigation, search, code syntax, Markdown callouts, favicon, sharing image and browser theme color follow the neutral palette. The README acknowledgment and existing license notices remain; these changes do not transfer upstream copyright.

Removed the EN/ID footer attribution and its translation keys. Visible-text extraction found no upstream name across all 45 generated HTML files. Seven unit tests, Astro diagnostics, formatting and eight Chromium browser scenarios passed. Additional checks against the refreshed Docker preview covered EN/ID home and code-containing articles in both themes: no chromatic computed UI colors, no selected axe A/AA violations, and a minimum 5.55:1 contrast for primary, secondary and accent text against the four surface tokens. Desktop/mobile, both themes, article and sharing-image renders were inspected. This remains automated/sample-based verification, not full manual accessibility acceptance.

The output audit exposed a stale Expressive Code stylesheet URL after changing its theme. Production builds now use Astro's supported `--force` option to refresh content caches. Rebuilding the previously cached workspace and a clean Docker source layer both passed the generated-link audit.

GitHub's public contributor API listed six inherited authors/bots plus the owner, matching the local history. The list comes from commit authorship, independently of collaborator access. Removing the inherited names requires replacing the default-branch ancestry; this revision does not itself rewrite that history. Prepare and verify a complete Git bundle and a candidate preserving the owner's Sibsys commits before any separately approved public history replacement. GitHub documents that contributor statistics can take about 24 hours to refresh after a history change: [contributor documentation](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-a-projects-contributors).
