# Editing and publishing Sibsys

## Replace the examples

1. Start the Docker editing service from the README.
2. Edit the English and Indonesian identity text in `app/config/site.ts` and both About files.
3. Replace or remove sample projects/articles. Mark real content `example: false`. No achievement, employer or contact address is inferred for you.
4. Keep `placeholderMode: true` during preparation. After reviewing both languages, set it to `false`; the next build removes the site-wide noindex metadata and header. The 404 exclusions remain.
5. Build and inspect the production preview before deploying. A deployed artifact never updates itself.

## Write an article

Add `app/content/blog/en/my-article.md`:

```md
---
title: 'My article'
description: 'A useful one-sentence introduction.'
lang: en
translationKey: my-article
slug: my-article
date: '2026-10-16'
draft: true
example: false
tags: [Notes]
categories: [Writing]
series: []
---

## Start here

Your writing goes here.
```

Dates must be quoted, real `YYYY-MM-DD` calendar dates. An item is eligible when `draft` is false and its date is on or before the build date in **Asia/Jakarta**. A future date needs a new build on or after that day; there is no scheduling service.

Drafts are excluded even in the editing server. Preview confidential drafts in your editor. To inspect layout, temporarily use `draft: false` and an eligible date locally; restore the draft before committing if it is not ready. This repository is public: never commit confidential drafts or credentials. Files in `static/` are always public regardless of a referring article's status.

Use `##`/`###` headings for the contents list; the layout supplies the title. Markdown lists, tables, quotes and fenced code blocks are supported. Prefer Markdown: MDX executes trusted code during builds and is not a safe format for untrusted uploads.

## Add a translation

Create `app/content/blog/id/artikel-saya.md` with `lang: id`, `slug: artikel-saya`, and the **same** `translationKey: my-article`. Translate its title, description and body. Each collection permits one entry per language for a key. Its URL becomes `/id/blog/artikel-saya/`; English remains `/en/blog/my-article/`.

Untranslated entries are valid. They show a notice and link to the other language's writing archive. Alternate metadata never promises a translation that is absent, draft or future-dated. Tags/categories/series are local labels and need not have identical names.

Slugs cannot use reserved first segments `index`, `page`, `tags`, `categories`, `series`, `archives`, `404`, or contain whitespace, percent escapes, query characters or traversal segments. Use short lowercase words separated by hyphens. Duplicate URLs/translation keys fail the build.

## Add a project

Use the same metadata in `app/content/projects/en/` or `id/`, with optional `featured: true`, `status`, `role`, `image: /images/your-image.webp`, and `links: [{ label: Source, url: 'https://github.com/your/project' }]`. Use real contribution/outcome descriptions. Put optimized, authorized images in `static/images/`. Without an image, the card uses the built-in geometric illustration.

The homepage displays up to two featured projects and three recent articles. Writing is paginated in groups of six, separately by language. Related writing stays in the current language; RSS includes eligible writing only.

## Edit the two resumes

Open `app/content/resumes/en/author-1.md` and `author-2.md`, plus the matching files under `id/`. Each file is one complete profile: the metadata between `---` supplies the card and CV header, and the Markdown below supplies the CV sections.

- `title`: the author's public name. `headline`: their professional title. `description`: a short introduction, also used in search and page metadata.
- `photo`: a local image path, such as `/images/authors/your-name.webp`. Put the image in `static/images/authors/`, then update both language files. Use a square crop, ideally 480×480 or larger but optimized for the web. `photoAlt` should describe the actual portrait in that file's language. The initial SVGs are explicitly labeled placeholders.
- `location`: optional city/country. Remove it to omit this line.
- `skills`: a list of skills. Use `skills: []` to hide the section.
- `links`: optional HTTPS profile links, for example `[{ label: LinkedIn, url: 'https://www.linkedin.com/in/your-profile/' }]`. Replace the example URL with your own before publishing. Empty links produce no buttons; there is no fake contact or CV download.
- `order`: controls the card order. Keep `translationKey` identical for the same person in both languages, and different between authors.

Edit, duplicate or remove the Markdown sections for biography, experience, education, projects, and certifications. Use `##` for sections and `###` for individual roles or qualifications; the desktop contents list follows the headings automatically. Use factual dates and outcomes. Set `example: false` after replacing all example content, and review the global `placeholderMode` separately.

The normal date/draft rules apply to profiles. A draft or future profile is excluded from the cards, detail pages, search and sitemap. A missing translation links to the other language's resume index without advertising a nonexistent translated CV. Profiles are not included in the writing RSS feeds. Public image files and Git source remain public even if a profile is a draft.

The initial URLs are `/en/resume/author-1/`, `/en/resume/author-2/` and their `/id/` counterparts. Keeping the slugs preserves those links when names change. If you change a published slug, add a redirect for the old path in `static/_redirects` before rebuilding. Writing remains available from the homepage's **All writing** link, `/en/blog/`, `/id/blog/`, and search.

## Review a change

Check both language links, title/description, dates, mobile layout, portraits, CV sections, code/tables, search and external URLs. Run Docker QA, then export a release. Use the operations guide to save/push source and deploy separately.

The owner walkthrough (editing, translating, reviewing, pushing and restoring a change) remains a personal acceptance step; automated tests do not replace it.
