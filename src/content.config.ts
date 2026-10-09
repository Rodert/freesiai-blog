import {defineCollection} from 'astro:content';
import {z} from 'astro/zod';
import {glob} from 'astro/loaders';
import {categories} from './config/categories';
const blog=defineCollection({loader:glob({pattern:'*.md',base:'./src/content/blog'}),schema:z.object({title:z.string().min(1),description:z.string().min(1),pubDate:z.coerce.date(),updatedDate:z.coerce.date().optional(),category:z.string().refine(v=>v in categories,'未知分类'),tags:z.array(z.string()).default([]),cover:z.string().regex(/^\/images\//).optional(),youtubeId:z.string().regex(/^[a-zA-Z0-9_-]{11}$/).optional(),draft:z.boolean().default(false),featured:z.boolean().default(false)})});
export const collections={blog};
