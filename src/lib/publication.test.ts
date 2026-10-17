import { describe, expect, test } from 'bun:test';
import {
  buildDate,
  counterpart,
  eligible,
  entrySlug,
  formatPublicationDate,
  isCalendarDate,
  locale,
  publicationUrl,
  published,
  validatePublications,
  type Publication,
} from './publication';
import { messages } from '../../app/lib/i18n';

const entry = (id: string, fields: Partial<Publication['data']> = {}): Publication => ({
  id,
  collection: 'blog',
  data: { lang: 'en', translationKey: id, date: new Date('2026-10-13T00:00:00Z'), ...fields },
});

describe('R06–R15/R28 publication contracts', () => {
  test('both interfaces have the same nonempty translation keys', () => {
    expect(Object.keys(messages.id).sort()).toEqual(Object.keys(messages.en).sort());
    expect(Object.values(messages.id).every((text) => text.trim())).toBe(true);
  });
  test('Indonesian aliases are explicit; unsupported language fails', () => {
    expect(locale('id-ID')).toBe('id');
    expect(locale('id')).toBe('id');
    expect(() => locale('fr')).toThrow();
  });
  test('calendar boundaries use Jakarta independently of host timezone', () => {
    expect(buildDate(new Date('2026-10-12T16:59:59Z'), undefined)).toBe('2026-10-12');
    expect(buildDate(new Date('2026-10-12T17:00:00Z'), undefined)).toBe('2026-10-13');
    expect(isCalendarDate('2026-02-30')).toBe(false);
    expect(() => buildDate(new Date(), '2026-02-30')).toThrow();
  });
  test('today is eligible; drafts and tomorrow are excluded everywhere', () => {
    const items = [
      entry('today'),
      entry('draft', { draft: true }),
      entry('future', { date: new Date('2026-10-14T00:00:00Z') }),
    ];
    expect(published(items, 'en', '2026-10-13').map((v) => v.id)).toEqual(['today']);
    expect(eligible(items[2], '2026-10-14')).toBe(true);
  });
  test('translated URLs may differ; ineligible counterparts do not exist', () => {
    const en = entry('en/design', { translationKey: 'design', slug: 'design-notes' });
    const id = entry('id/desain', { translationKey: 'design', slug: 'catatan-desain', lang: 'id' });
    expect(publicationUrl(counterpart(en, [en, id], 'id', '2026-10-13')!)).toBe(
      '/id/blog/catatan-desain/',
    );
    expect(
      counterpart(en, [en, { ...id, data: { ...id.data, draft: true } }], 'id', '2026-10-13'),
    ).toBeUndefined();
    expect(counterpart(id, [en, id], 'en', '2026-10-13')).toEqual(en);
  });
  test('duplicate identity and reserved or colliding paths fail before rendering', () => {
    expect(() => validatePublications([entry('a'), entry('b', { translationKey: 'a' })])).toThrow(
      'Duplicate translation',
    );
    expect(() =>
      validatePublications([entry('a', { slug: 'same' }), entry('b', { slug: 'same' })]),
    ).toThrow('Duplicate publication URL');
    for (const slug of ['../secret', 'a//b', 'page/2', 'bad?query', '%2e%2e'])
      expect(() => entrySlug(entry('a', { slug }))).toThrow();
  });
  test('locale partitioning and ordering are stable', () => {
    expect(
      published([entry('z'), entry('a'), entry('id', { lang: 'id' })], 'en', '2026-10-13').map(
        (v) => v.id,
      ),
    ).toEqual(['a', 'z']);
    const day = new Date('2026-10-13T00:00:00Z');
    expect(formatPublicationDate(day, 'id')).toContain('13');
    expect(formatPublicationDate(day, 'en')).toContain('13');
  });
  test('resumes have their own URLs and eligible translation identities', () => {
    const en = {
      ...entry('en/author', { translationKey: 'person', slug: 'author' }),
      collection: 'resumes',
    };
    const id = {
      ...entry('id/penulis', { lang: 'id', translationKey: 'person', slug: 'penulis' }),
      collection: 'resumes',
    };
    expect(publicationUrl(en)).toBe('/en/resume/author/');
    expect(publicationUrl(counterpart(en, [en, id], 'id', '2026-10-13')!)).toBe(
      '/id/resume/penulis/',
    );
    expect(
      counterpart(en, [en, { ...id, data: { ...id.data, draft: true } }], 'id', '2026-10-13'),
    ).toBeUndefined();
    expect(
      published(
        [en, { ...id, data: { ...id.data, date: new Date('2099-01-01') } }],
        undefined,
        '2026-10-13',
      ),
    ).toEqual([en]);
    expect(() => validatePublications([en, { ...en, id: 'another' }])).toThrow(
      'Duplicate translation',
    );
  });
});
