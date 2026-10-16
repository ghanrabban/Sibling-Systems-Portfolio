import { getCollection, type CollectionEntry } from 'astro:content';
import { published, type Locale } from '../../src/lib/publication';
export {
  buildDate,
  counterpart,
  entrySlug,
  formatPublicationDate,
  locale,
  locales,
  pageUrl,
  publicationUrl,
} from '../../src/lib/publication';
export type { Locale } from '../../src/lib/publication';
export type Entry =
  CollectionEntry<'blog'> | CollectionEntry<'projects'> | CollectionEntry<'about'>;
export async function entries(
  collection: 'blog' | 'projects' | 'about',
  language?: Locale,
): Promise<Entry[]> {
  return published(await getCollection(collection), language);
}
export function readingMinutes(entry: Entry) {
  return Math.max(1, Math.ceil((entry.body ?? '').split(/\s+/).length / 220));
}
export function groupSlug(value: string) {
  return value
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');
}
