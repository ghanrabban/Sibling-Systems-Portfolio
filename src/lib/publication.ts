/** Shared publication rules. These functions never read the machine's implicit timezone. */
export const locales = ['en', 'id'] as const;
export type Locale = (typeof locales)[number];

export interface Publication {
  id: string;
  collection: string;
  data: {
    lang: Locale;
    translationKey: string;
    slug?: string;
    date: Date;
    draft?: boolean;
    tags?: string[];
    categories?: string[];
    series?: string[];
  };
}

export function locale(value: string | undefined): Locale {
  if (!value || value.toLowerCase() === 'en' || value.toLowerCase() === 'en-us') return 'en';
  if (['id', 'id-id', 'id_id'].includes(value.toLowerCase())) return 'id';
  throw new Error(`Unsupported publication language: ${value}`);
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function buildDate(now = new Date(), explicit = process.env.BUILD_DATE): string {
  const date =
    explicit ??
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
  if (!isCalendarDate(date)) throw new Error(`BUILD_DATE must be a valid YYYY-MM-DD date: ${date}`);
  return date;
}

export function eligible(entry: Publication, day = buildDate()): boolean {
  if (!isCalendarDate(day)) throw new Error(`Invalid publication build date: ${day}`);
  return !entry.data.draft && entry.data.date.toISOString().slice(0, 10) <= day;
}

export function entrySlug(entry: Publication): string {
  const value = entry.data.slug ?? entry.id.replace(/^(en|id)\//, '');
  const parts = value.normalize('NFC').split('/');
  if (parts.some((part) => !part || part === '.' || part === '..' || /[?#\\%\s]/u.test(part))) {
    throw new Error(`Invalid publication slug in ${entry.collection}/${entry.id}: ${value}`);
  }
  if (['index', 'page', 'tags', 'categories', 'series', 'archives', '404'].includes(parts[0])) {
    throw new Error(`Reserved publication slug in ${entry.collection}/${entry.id}: ${value}`);
  }
  return parts.map(encodeURIComponent).join('/');
}

export function localeBase(language: string | undefined): string {
  return `/${locale(language)}`;
}

export function pageUrl(language: Locale, path = ''): string {
  return `/${language}/${path.replace(/^\/+|\/+$/g, '')}${path ? '/' : ''}`;
}

export function publicationUrl(entry: Publication): string {
  if (entry.collection === 'about') return pageUrl(entry.data.lang, 'about');
  const section =
    entry.collection === 'resumes'
      ? 'resume'
      : entry.collection === 'projects'
        ? 'projects'
        : 'blog';
  return pageUrl(entry.data.lang, `${section}/${entrySlug(entry)}`);
}

export function validatePublications<T extends Publication>(entries: T[]): T[] {
  const identities = new Set<string>();
  const urls = new Set<string>();
  for (const entry of entries) {
    locale(entry.data.lang);
    if (!entry.data.translationKey.trim()) throw new Error(`Missing translationKey: ${entry.id}`);
    const identity = `${entry.collection}:${entry.data.lang}:${entry.data.translationKey}`;
    const url = publicationUrl(entry);
    if (identities.has(identity)) throw new Error(`Duplicate translation identity: ${identity}`);
    if (urls.has(url)) throw new Error(`Duplicate publication URL: ${url}`);
    identities.add(identity);
    urls.add(url);
  }
  return entries;
}

export function published<T extends Publication>(
  entries: T[],
  language?: Locale,
  day = buildDate(),
): T[] {
  return validatePublications(entries)
    .filter((entry) => eligible(entry, day) && (!language || entry.data.lang === language))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id));
}

export function counterpart<T extends Publication>(
  entry: Publication,
  entries: T[],
  language: Locale,
  day = buildDate(),
): T | undefined {
  return published(entries, language, day).find(
    (candidate) =>
      candidate.collection === entry.collection &&
      candidate.data.translationKey === entry.data.translationKey,
  );
}

export function formatPublicationDate(date: Date, language: Locale): string {
  return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
