// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    author: z.string(),
    date: z.string(),
    readTime: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean(),
    image: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
};
