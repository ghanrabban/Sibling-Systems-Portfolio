# Implementation backlog — SWEBOK-informed revision

Revision 3 · 13 October 2026 · All application work remains planned. B00–B22 are retained; B01/B19/B21/B22 now explicitly cover Git version control and GitHub source publication alongside Docker and Workers Free.

This is a proposed build sequence for the portfolio described in [the analysis](./analysis-and-plan.md). No items are marked implemented. P0 items are required to establish a correct personal site; P1 items complete the intended launch experience; P2 items are optional extensions. P0 and P1 together form the proposed release scope; P1 is not an automatic waiver from launch acceptance.

## Execution controls

Use [requirements and traceability](./requirements-and-traceability.md) for acceptance contracts, [architecture and design](./architecture-and-design.md) for proposed decisions, and [quality and operations](./quality-and-operations.md) for T01–T20 and risks K01–K11. The [SWEBOK review](./swebok-review-and-tailoring.md) records source passages and deliberate tailoring.

**B00 · P0 · Establish the requirements baseline.** Review UG01–UG06 and R01–R29 against the content brief and actual publishing journeys. Git/GitHub, Docker locally and Workers Free hosting are confirmed constraints. Keep owner inputs, defaults and unresolved decisions distinct. This planning package is prepared; its detailed baseline remains proposed. At implementation start, resolve only decisions needed for the current increment, record the choice, and keep the rest visible. Product validation uses T17/T19; writing this document does not mark those tests passed.

The owner is accountable for product/content choices. The implementation role is responsible for technical execution and evidence. Routine changes within authorized scope proceed without separate permission gates; a gate is an evidence checkpoint, not a standing request for approval. The present task authorizes planning only.

| Gate                           | Required evidence / exit                                                                                                                                                                                                     | Work ordering                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| G0 · Reviewable plan           | Requirements, assumptions, architecture, risk/test plan and backlog are coherent; no claim of implementation readiness from documents alone                                                                                  | B00; this document package                                              |
| G1 · Feasible baseline         | Pinned Docker/install/build inputs; clean local startup, minimal personal-mode fixture build and local Workers preview; reference differences explained; bounded locale experiment; fork/registry strategy; revised forecast | B01–B03, B20, initial B21; experiment may use clearly isolated fixtures |
| G2 · Bilingual vertical slice  | One translated article pair, one original-only article, one project pair, localized Home/About/index fixtures, route/search/feed/metadata and draft/date tests work together                                                 | B04–B11; apply relevant checks as each item is built                    |
| G3 · Personal experience       | Real owner material replaces fixtures; Home/reading/projects usable in both themes; owner feedback captured; initial accessibility/performance evidence                                                                      | B12–B17, content review portion of B22                                  |
| G4 · Release candidate         | Required checks pass; content accepted; identified artifact fits Workers Free limits; account/plan/origin/root base recorded; backup/rollback rehearsal; author guide usable; gaps resolved or scope explicitly revised      | B18, B19 readiness, B21 completion, B22 rehearsal                       |
| G5 · Published and handed over | Within authorized execution scope: GitHub source published and clone verified; tagged source/artifact/deployment mapping, hosted smoke checks, recovery identity and maintenance ownership                                   | B19 source/site publication, B22 handover                               |

Each implementation increment includes design, code/content, relevant tests, review and evidence. The phases below show dependencies, not a rule to postpone testing until Phase 5. Reopen an earlier decision when new evidence contradicts it.

## Phase 1 — Verify the baseline

**B01 · P0 · Establish Git/GitHub and a reproducible source baseline.** Create a dedicated portfolio checkout from upstream `v1`, recording `70aa71ddd9f7ee4af38fa5810b320820712f1885` as the analysis baseline. Preserve upstream history when using a fork/clone, retain notices, and record direct/transitive package pins and the documentation gitlink. Resolve the owner's GitHub destination before first push. Set the intended `origin`/`upstream` remotes, a stable `main`, short branch/commit workflow, `.gitignore` and README per master-plan §11.1. Keep private drafts and unrelated workspace files outside this repository. Review all outgoing history and required fork accessibility before public publication. Preserve the lockfile during baseline work; do not combine framework upgrades with initial redesign. GitHub source can be published once this boundary is ready in the execution scope; it need not wait for the website launch.

**B02 · P0 · Establish the Docker toolchain and local preview.** Follow ADR09 and the [Docker/Cloudflare workflow](./docker-cloudflare-hosting.md). Docker CLI 29.8.2 and Compose 5.5.1 are installed; verify engine, architecture and native dependencies during implementation. Create the Dockerfile, Compose services and narrow build context, using pinned image/tools, Node ≥22.12 and a recorded Bun version. Support editing/hot reload, a clean build/export, and pinned Wrangler local preview as distinct tasks. Keep host and container dependencies separate. The upstream font build needs Python, FontTools and Brotli until that pipeline is removed coherently. Inspect `.npmrc` and the lockfile's `registry.npmmirror.com` entries; deliberately retain or regenerate/validate the lockfile against the intended registry. Changing `.npmrc` alone does not rewrite locked tarball URLs. Local development must require no Cloudflare credentials and must not deploy.

**B03 · P0 · Build a reference and document deviations.** Initialize the docs submodule at the recorded gitlink for reference validation, rather than following a moving remote branch. Inside Docker, run the original font/build/index sequence, preview the production output, and compare Home, Blog, article, and Projects against the captured reference. Run the relevant existing tests. Retain a record of any baseline failures rather than attributing them to future personalization. Reference demo output must remain separate from the eventual personal upload artifact.

Before B01's first source push, inspect inherited GitHub workflows and remove or disable demo sync/deploy jobs in the personal publication path. B06 completes any remaining workflow cleanup later; its placement must not allow an earlier source push to trigger an unintended deployment.

**B20 · P0 · Prove the reuse/localization strategy.** Execute the bounded experiment in the architecture document. Check core locale normalization, per-page head/UI language, Projects injection, article pairing, missing translations and Pagefind together. Record a first investigation checkpoint at four focused hours, changed packages/files, unresolved issues, and a revised estimate. Do not use the checkpoint as permission to claim success or silently drop bilingual scope. Compare a simpler Astro base if a narrow fork is not sustainable.

**B21 · P0 · Track supply-chain and security decisions throughout delivery.** Begin the dependency/asset inventory and threat model now. Resolve registry and executable build-input assumptions; plan least-privilege CI, draft-source visibility, safe rendering and secret/output checks. Complete advisory triage, host configuration review and T15/T16 before G4. Pin identity is not a safety guarantee, and scanner coverage of Git dependencies must be recorded.

For GitHub publication, review the full outgoing commit/ref set as well as current files; `.gitignore` and website draft filtering do not conceal committed history. Record the public source boundary and keep deploy credentials out of commits. This repository review is part of B21, not an extra approval ceremony.

Acceptance: G1 has a functioning minimal personal-mode build using isolated fixtures, understood reference discrepancies, and evidence supporting the source-change strategy. Unexplained build failure cannot pass the gate. Initial checks: T01–T06 as applicable to the experiment, with T15/T16 review. SWEBOK: Ch. 2 decisions/evaluation; Ch. 4 reuse; Ch. 8 identification/builds; Ch. 9 feasibility/risk; Ch. 13 security.

## Phase 2 — Create the personal publishing foundation

**B04 · P0 · Select personal content.** Create the personal content directory. Initially satisfy the current About and Projects index requirements; migrate them to locale-aware loaders in Phase 3. Stop production builds from setting `NAVFOLIO_CONTENT_SOURCE=docs`. Remove upstream documentation synchronization from the personal deployment path.

**B05 · P0 · Replace publishing identity.** Update `src/config/site.toml`, the workflow, retained hosting config, favicon assets, manifest, repository links, profile links, and sharing defaults. Provide only genuine public identity and contact details. Empty optional social items should disappear. The main GitHub URL/profile fields currently require valid URLs, so handle omitted profiles intentionally rather than inserting invalid empty strings.

**B06 · P0 · Simplify enabled features.** Retain Projects and the Markdown capabilities actually needed. Disable Vibe and Media for launch using module configuration, with corresponding navigation removed. Keep comments disabled. Remove unrelated upstream review/sync workflows from the personal automation setup. Retain a rollback path to the baseline.

Acceptance: a personal-mode build uses the intended content/settings and cannot accidentally republish the Navfolio demo; T02/T07 demonstrate that boundary. Owner material may still be pending while isolated fixtures support development. SWEBOK: Ch. 1 requirements, Ch. 4 construction, Ch. 8 configuration control.

## Phase 3 — Make the site bilingual

**B07 · P0 · Introduce locale data.** Add `id.json`, register `id`, and modify UI helpers to accept the current page’s locale. The pinned `@navfolio/core` normalizer currently maps `id` to English, including inside `createI18n`; first extend that dependency’s locale support through a documented pinned fork or a verified upstream revision. Test both `id` and `id-ID`. Separate shared site identity from localized homepage/page copy. Localize aria labels and interaction messages as well as visible headings. Implement the selected date-only publication semantics and explicit display formatting for `en` and `id-ID`. Proposed policy: a stable calendar date in Asia/Jakarta, with a recorded build-date input. T20 checks machine-timezone independence.

**B08 · P0 · Define the content contract.** Add validated `lang`, `translationKey`, and optional explicit slugs. Update loaders for localized About and project-index entries. Establish uniqueness rules for `(collection, lang, translationKey)` and `(collection, lang, slug)`. Keep published translations optional. A missing translation must not block publishing the original. Implement one shared publication predicate for draft and future-date eligibility, deterministic sorting, and validation of normalized slugs/reserved-route collisions. Follow ADR04 and R11/R12/R28 rather than duplicating filters in individual pages.

**B09 · P0 · Generate localized routes.** Configure Astro locales `en` and `id`, with both prefixed. Implement localized Home, Blog, article, pagination, categories, tags, series, years, Projects, project detail, About, and feeds. Generate paths from one URL helper that understands both locale and deployment base. Replace fixed `/blog/` assumptions in components, heatmap links, search classification, feeds, and related-post links.

Projects currently uses injected routes. Choose a deliberate host integration change that emits both localized paths and selects locale-specific content; do not combine unmodified injected `/projects` routes with a second set of conflicting pages. Vibe/Media remain deferred until their package-owned routing and UI can accept the same locale model.

**B10 · P0 · Connect translation navigation and metadata.** Pair real translations, create self-canonical and alternate-language links, and provide an understandable missing-translation state. Use a normal full page navigation for the language switch initially. Confirm that Home and About have both translations, while articles may be original-language only.

**B11 · P0 · Localize search and RSS.** Remove `force_language: zh` from `pagefind.yml`; otherwise correct page language attributes alone will not create the required indexes. Build Pagefind after Astro renders pages with correct language attributes. Translate the custom search UI. Review whether archive/tag pages should be excluded from indexing so detail pages dominate. Provide `/en/rss.xml` and `/id/rss.xml`; use the URL helper for feed links. Test search after EN→ID→EN navigation and confirm no draft leaks.

Acceptance: a translated article pair, an original-only article, a translated project, Home, and About all behave correctly in both languages. Pagination, taxonomy counts, related items, feeds, and search stay in the selected language. No mixed-language fallback pages are indexed as translations. G2 requires T03–T10 and T20 evidence, plus search lifecycle checks from T12. These tests accompany B07–B11. SWEBOK: Ch. 4 internationalization, Ch. 5 partitions/boundaries/integration, Ch. 11 models/invariants, Ch. 17 sets and relations.

## Phase 4 — Personalize the portfolio

**B12 · P1 · Recompose Home.** Introduce recent-writing and selected-project sections. Keep the reference shell, sage palette, restrained borders, and two-column character. Reduce the biography to a short introduction. Make content prominent in both desktop and mobile DOM order. Retain “Current focus” as manually edited text. Omit or lower the activity grid until it adds useful context.

**B13 · P1 · Strengthen project detail.** Keep the editorial project grid and article presentation. Add status, role, stack, and featured metadata only where the interface renders it. Include meaningful screenshots, repository/demo links, decisions, outcomes, and lessons. Remove blog-like biography/index metadata where it distracts from those page purposes.

**B14 · P1 · Polish reading and discovery.** Test actual long English and Indonesian prose, lengthy titles, code, tables, images, headings, and lists. Keep contents navigation. Make “more writing” language-aware and select genuinely related work by series/topics before recency. Link project articles and case studies when they refer to the same work.

**B15 · P1 · Complete identity assets.** Supply a lightweight favicon, avatar or mark, and a branded default sharing image. Pass actual article/project images to metadata. Choose fonts with clear usage terms; using the retained Maple Mono for code can avoid carrying a separate Monaco asset. Remove demo images after verifying that no content imports them.

Acceptance: Home, Writing, Projects, and About communicate the owner’s identity with real material and remain recognizably inspired by Navfolio. G3 records T11/T13/T14/T16 and actual owner feedback from T17; unavailable content or review environments stay visible. SWEBOK: Ch. 3 user-centered design, Ch. 12 product assurance, Ch. 14 professional documentation, Ch. 16 human factors.

## Phase 5 — Quality and publication readiness

**B16 · P1 · Reduce unnecessary downloads.** Replace the oversized favicon. For English/Indonesian content, revise the font schema/head generation, font CSS, build command, and full-font warmup together so unused CJK loading is absent. Do not merely remove Python tools while leaving the font-subsetting command mandatory. Measure cold-cache behavior after the change.

**B17 · P1 · Accessibility and interaction checks.** Review contrast of all essential metadata, add or verify a skip link, fix focus appearance, and keep practical touch targets. Verify search focus trap and restoration, and ensure its hidden controls are not reachable when closed. Check menu state, focus, reduced motion, heading order, image alternatives, and no-JavaScript content/navigation. Test interactions after Astro client transitions, not only fresh page loads.

**B18 · P1 · Production verification.** Run relevant existing unit tests and add focused tests for locale URLs, translation pairing, content selection, draft exclusion, and generated route collisions. Avoid snapshot tests that merely repeat configuration. Run the repository’s required formatting/lint checks and production build for retained modes. If docs mode is intentionally removed from the personal fork, update the documented verification scope accordingly.

Inspect the built site at narrow, tablet, and desktop widths in both themes. Check all internal links, locales, feeds, canonical URLs, sitemap, sharing images, 404 handling, and generated search results. Test one published phrase and one unique draft phrase in each language.

**B19 · P1 · Prepare Workers Free hosting and release.** Verify the target account's Workers plan and choose the project name and workers.dev/custom-domain origin; apply the public GitHub source boundary in ADR10. Use root base `/` and an explicit assets-only Wrangler configuration, with no Worker entry point, SSR adapter or build-on-deploy step. Include native redirects/headers, custom 404 pages and Pagefind in the reviewed output. Inventory the final upload set against current free-tier file limits; keep manifests, private material and credentials outside it. Exercise local Wrangler preview, then an appropriately scoped remote rehearsal only when authorized. Upload the frozen artifact through a separate credentialed Wrangler step; verify hosted behavior and record deployment identity. Rehearse recovery by uploading the retained known-good artifact and matching configuration. Follow the hosting assessment; no paid service or current deployment is implied.

**B22 · P1 · Rehearse authoring and hand over maintenance.** Develop the author guide alongside B08–B14, then have the owner exercise T19 with actual content. Document backup/restore, release/rollback, dependency/fork updates, domain/host ownership, incident reporting and retirement/migration. Conduct the preview recovery drill; keep current/previous known-good artifacts and a separate source/media/config backup. Maintenance cadence is proposed in the quality plan; no monitoring automation is created by writing it.

B19 additionally publishes the reviewed source and a GitHub release tied to an annotated version tag, verifies a fresh public checkout, and records commit/tag → artifact checksum → Cloudflare deployment identity. B22's guide covers branch/commit/review/push, upstream updates, source correction using revert/follow-up commits, and the distinct website deployment step. No GitHub push automatically deploys in the initial plan.

Acceptance: G4 evidence identifies all required checks, actual owner acceptance, the exact release candidate and successful recovery/authoring rehearsal. G5 additionally requires authorized publication, verified hosted behavior and handover. A deployment has not happened merely because its workflow exists. SWEBOK: Ch. 5 completion/reporting, Ch. 6 operations/rollback, Ch. 7 maintenance planning, Ch. 8 releases, Ch. 12 V&V.

## Dependencies, effort and replanning

Critical path: B00 → B01–B03/B20 → B04–B08 → B09–B11 → real-content integration and B18 → B19/B22 readiness → authorized publication. B21 runs across the work; visual assets/content preparation can proceed alongside technical foundation work when their inputs exist. A local successful article page is not enough to bypass locale/search/feed integration.

| Remaining implementation phase                     | Focused effort range | Main uncertainty                                                                     |
| -------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| Baseline and reuse experiment                      | 8–14 hours           | Docker/platform/native dependency compatibility, local Workers preview, fork breadth |
| Personal publishing foundation                     | 4–6 hours            | Owner content inputs and upstream configuration assumptions                          |
| Complete bilingual behavior                        | 12–20 hours          | Route injection, shared selection rules, search/metadata propagation                 |
| Personal presentation and real-content integration | 8–12 hours           | Asset readiness, article/project variety, owner feedback                             |
| Verification, release rehearsal and handover       | 10–16 hours          | Accessibility/browser findings, host behavior, author/recovery rehearsal             |

**Base range: 42–68 focused hours. Planning allowance: 9–14 hours (approximately 20%, rounded upward). Total envelope: 51–82 hours.** Docker/local Workers setup adds 2–4 hours to revision 1's baseline; Workers deployment replaces generic hosting work already estimated. This is a bottom-up judgment range without calibrated historical productivity or statistical confidence, not a SWEBOK formula or a delivery commitment. It includes tests/review throughout the phases and excludes the already completed research/document revision, owner writing/translation time, new photography/illustration, service fees and external waiting. It assumes a small sustainable Navfolio fork and promptly available content. Larger package redesign or new functionality requires a fresh estimate, not automatic use of the allowance.

At G1, compare actual effort and remaining patch scope to the estimates; at G2, estimate again using observed localization/test work. Hosting is constrained to Workers Free; no fixed calendar deadline or budget for other costs has been supplied. Track domain renewal, storage/backup, optional asset licenses and maintenance time separately. The proposed local-build/static-assets path needs no Cloudflare paid add-on or Workers Builds minutes; actual output and account configuration still require verification. Do not purchase services from this estimate.

The Git/GitHub revision keeps the 51–82-hour envelope: repository setup, source review and release tagging fit the existing baseline/release allowance. Automated GitHub Actions builds or deployments are optional follow-up scope and are not included by implication.

## Focused test scenarios

| Scenario                                              | Expected result                                                                                                               |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Two translations with different slugs                 | Switch links pair by translation key and reach the correct existing page                                                      |
| English-only article                                  | No invented Indonesian counterpart or alternate-language metadata; clear route to Indonesian archive                          |
| Duplicate translation key in the same language        | Validation fails with an actionable message                                                                                   |
| Locale normalization receives `id` or `id-ID`         | Indonesian messages are selected rather than falling back to English                                                          |
| Draft with a unique phrase                            | Absent from static page paths, listings, search, feed, and sitemap                                                            |
| Seven published posts in one locale, two in the other | Pagination and counts are calculated independently                                                                            |
| Search after switching languages                      | Current-language result set and labels; no stale search state                                                                 |
| Project index in both languages                       | Each selects its own index entry and only matching projects                                                                   |
| Workers root-base deployment and unknown deep link    | Images, scripts, Pagefind, feeds and canonical URLs resolve; unknown routes return a real 404                                 |
| Clean Docker checkout and final upload inventory      | Local editing/build/preview work; generated output fits the current Free file limits; no credentials or private research ship |
| Long Indonesian title and code sample at 320px        | Text wraps; only intentional code/table areas scroll horizontally                                                             |
| Article with a share image                            | Correct absolute image URL appears in social metadata                                                                         |

The authoritative expanded test catalog is T01–T20 in the quality plan; the table above remains a quick scenario index. Add future-date boundaries, search error/stale-response behavior, restore rehearsal and author acceptance from that catalog.

## Deferred work

P2: short-form Notes/Vibe, Media shelf, comments, newsletter, analytics, project feeds, scheduled publishing, a browser-based CMS, and cross-language search. Add these only when there is a publishing need. They are not prerequisites for the requested portfolio.
