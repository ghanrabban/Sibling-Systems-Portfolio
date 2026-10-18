# Sibsys — Sibling Systems

A quiet home for projects, author resumes, writing, and ideas in progress. English and Bahasa Indonesia, monochrome light/charcoal dark themes and local search. Built with Astro for **https://sibsys.dev**.

This first version contains **clearly labeled placeholder content**, as requested. Search engines are asked not to index it until `placeholderMode` is turned off after editorial review. This is a publishing preference, not access control: public files and Git history remain readable.

## Start locally with Docker

Install and start Docker Desktop. From this repository:

```sh
docker compose up --build dev
```

Open **http://localhost:4321/en/** or **http://localhost:4321/id/**. Edits to `app/`, `static/` and the publication helper are mounted into the container. Rebuild after dependency/build-configuration changes. Search is generated during a production build; use this preview to test it:

```sh
docker compose up --build preview
```

Open **http://localhost:8787/en/**. This serves the built artifact through local Wrangler, including search, Cloudflare headers, redirects and real 404 responses. Rebuild this preview after content changes. Both services bind only to this computer. No host Node/Bun or deployment credentials are needed.

```sh
docker compose --profile test run --build --rm qa
docker compose run --build --rm build
docker compose down
```

The build exports an immutable release directory under `releases/`; `releases/current` points to its `dist/`. Export replaces the complete asset set so withdrawn pages cannot survive from an older build. Reports sit beside the exported assets.

## Edit your portfolio

| Change                                               | File or folder                                                             |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| Brand, descriptions, source URL, indexing preference | `app/config/site.ts`                                                       |
| About                                                | `app/content/about/en/about.md`, `app/content/about/id/about.md`           |
| Writing                                              | `app/content/blog/en/`, `app/content/blog/id/`                             |
| Projects                                             | `app/content/projects/en/`, `app/content/projects/id/`                     |
| Author names, roles, CV sections, skills and links   | `app/content/resumes/en/`, `app/content/resumes/id/`                       |
| Author photo placeholders                            | `static/images/authors/author-1.svg`, `static/images/authors/author-2.svg` |
| Interface translations                               | `app/lib/i18n.ts`                                                          |
| Colors and responsive layout                         | `app/styles/sibsys.css`                                                    |
| Public images                                        | `static/images/`                                                           |
| Light/dark logo originals                            | `logo/Sibsys.png`, `logo/Sibsys_dark-theme.png`                            |

Read the [author guide](docs/author-guide.md), [operations guide](docs/operations.md), and [implementation record](docs/implementation-record.md).

The **Resume** navigation tab opens two author cards at `/en/resume/` and `/id/resume/`. Each opens a separate CV. Both authors use editable placeholders; replace their names, portraits and details before launch. The homepage still links to the writing archive, and existing article URLs and RSS feeds remain available.

## Architecture

`app/` and `static/` are production inputs. `src/lib/publication.ts` owns eligibility and URL rules. Astro generates static HTML; Pagefind builds separate EN/ID indexes. Cloudflare Workers Static Assets serves the result without runtime Worker code, databases, paid bindings or a Docker server.

The upstream MIT notice is retained. The owner-approved default-branch history replacement removed inherited commits; a verified local backup preserves them. Legacy `src/` (except `src/lib/` and the Markdown plugin adapter), `public/`, old scripts and the optional `src/docs` submodule are reference material. **Edit the `app/` paths above.** A normal clone is sufficient; initializing the reference docs submodule is unnecessary. Rebuild the original reference from audited upstream commit `70aa71ddd9f7ee4af38fa5810b320820712f1885` in a separate upstream checkout or the retained backup.

The Docker image digest, Bun version and `bun.lock` pin build inputs. Sibsys owns its EN/ID routing and monochrome palettes; no private package forks are required.

## Source and deployment

Source: [ghanrabban/Sibling-Systems-Portfolio](https://github.com/ghanrabban/Sibling-Systems-Portfolio).

GitHub publication and Cloudflare deployment are separate. The inherited Pages/review workflows were removed; pushes do not automatically deploy or send source to a review provider. Keep confidential drafts outside this public repository.

The intended Worker is `sibsys-portfolio`. Verify the account and existing custom-domain binding before deployment. Configuration intentionally does not replace an unknown domain association. Follow the operations guide to upload the reviewed static artifact and connect `sibsys.dev`.

## Acknowledgment

Inspired by [Navfolio](https://github.com/dodolalorc/astro-navfolio). Sibsys retains its neutral base layout and Markdown integration. The original MIT copyright/permission notice and applicable package/font/icon licenses remain included; see [LICENSE](LICENSE) and [third-party notices](docs/third-party-notices.md). This acknowledgment is shown here rather than in the website interface.
