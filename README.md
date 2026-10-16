# Sibsys — Sibling Systems

A quiet home for projects, writing, and ideas in progress. English and Bahasa Indonesia, light/dark themes and local search. Built with Astro, inspired by [Navfolio](https://github.com/dodolalorc/astro-navfolio), for **https://sibsys.dev**.

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

| Change                                               | File or folder                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| Brand, descriptions, source URL, indexing preference | `app/config/site.ts`                                             |
| About                                                | `app/content/about/en/about.md`, `app/content/about/id/about.md` |
| Writing                                              | `app/content/blog/en/`, `app/content/blog/id/`                   |
| Projects                                             | `app/content/projects/en/`, `app/content/projects/id/`           |
| Interface translations                               | `app/lib/i18n.ts`                                                |
| Colors and responsive layout                         | `app/styles/sibsys.css`                                          |
| Public images                                        | `static/images/`                                                 |

Read the [author guide](docs/author-guide.md), [operations guide](docs/operations.md), and [implementation record](docs/implementation-record.md).

## Architecture

`app/` and `static/` are production inputs. `src/lib/publication.ts` owns eligibility and URL rules. Astro generates static HTML; Pagefind builds separate EN/ID indexes. Cloudflare Workers Static Assets serves the result without runtime Worker code, databases, paid bindings or a Docker server.

Upstream Navfolio history and its MIT notice are retained. Legacy `src/` (except `src/lib/` and the Markdown plugin adapter), `public/`, old scripts and the optional `src/docs` submodule are reference material. **Edit the `app/` paths above.** A normal clone is sufficient; initializing the reference docs submodule is unnecessary. Rebuild the original reference only from audited commit `70aa71ddd9f7ee4af38fa5810b320820712f1885` in a separate checkout.

The Docker image digest, Bun version and `bun.lock` pin build inputs. Sibsys uses Navfolio's neutral base layout, palettes and Markdown integration, with application-owned EN/ID routing; no private package forks are required. See [third-party notices](docs/third-party-notices.md).

## Source and deployment

Source: [ghanrabban/Sibling-Systems-Portfolio](https://github.com/ghanrabban/Sibling-Systems-Portfolio).

GitHub publication and Cloudflare deployment are separate. The inherited Pages/review workflows were removed; pushes do not automatically deploy or send source to a review provider. Keep confidential drafts outside this public repository.

The intended Worker is `sibsys-portfolio`. Verify the account and existing custom-domain binding before deployment. Configuration intentionally does not replace an unknown domain association. Follow the operations guide to upload the reviewed static artifact and connect `sibsys.dev`.
