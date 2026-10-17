import { getCollection } from 'astro:content';
import { published, type Locale } from '../../src/lib/publication';

export async function resumes(language?: Locale) {
  return published(await getCollection('resumes'), language).sort(
    (a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id),
  );
}
