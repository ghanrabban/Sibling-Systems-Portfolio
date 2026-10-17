import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { isCalendarDate } from '../src/lib/publication';
const calendarDate = z
  .string()
  .refine(isCalendarDate, 'Use a valid YYYY-MM-DD calendar date')
  .transform((value) => new Date(`${value}T00:00:00Z`));
const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  lang: z.enum(['en', 'id']),
  translationKey: z.string().min(1),
  slug: z.string().optional(),
  date: calendarDate,
  draft: z.boolean().default(false),
  example: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  series: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  status: z.string().optional(),
  role: z.string().optional(),
  image: z
    .string()
    .regex(/^\/images\/[a-zA-Z0-9_./-]+$/)
    .optional(),
  links: z
    .array(z.object({ label: z.string(), url: z.url().refine((s) => s.startsWith('https://')) }))
    .default([]),
});
export const collections = {
  resumes: defineCollection({
    loader: glob({
      base: './app/content/resumes',
      pattern: '**/*.md',
      generateId: ({ entry }) => entry.replace(/\.md$/, ''),
    }),
    schema: schema.extend({
      headline: z.string().min(1),
      location: z.string().optional(),
      photo: z
        .string()
        .regex(/^\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:svg|webp|png|jpe?g|avif)$/),
      photoAlt: z.string().min(1),
      order: z.number().int().min(0).default(0),
      skills: z.array(z.string().min(1)).default([]),
    }),
  }),
  blog: defineCollection({
    loader: glob({
      base: './app/content/blog',
      pattern: '**/*.{md,mdx}',
      generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ''),
    }),
    schema,
  }),
  projects: defineCollection({
    loader: glob({
      base: './app/content/projects',
      pattern: '**/*.{md,mdx}',
      generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ''),
    }),
    schema,
  }),
  about: defineCollection({
    loader: glob({
      base: './app/content/about',
      pattern: '**/*.{md,mdx}',
      generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ''),
    }),
    schema,
  }),
};
