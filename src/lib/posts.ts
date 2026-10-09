import {getCollection,type CollectionEntry} from 'astro:content';
export type Post=CollectionEntry<'blog'>;
export function numericId(p:Post){if(!/^[1-9]\d*$/.test(p.id))throw new Error(`非法文章 ID: ${p.id}`);return Number(p.id);}
export const postUrl=(p:Post)=>`/${numericId(p)}.html`;
export const dateLabel=(d:Date)=>new Intl.DateTimeFormat('zh-CN',{timeZone:'UTC',year:'numeric',month:'long',day:'numeric'}).format(d);
export async function published(){return (await getCollection('blog',({data})=>!data.draft)).sort((a,b)=>b.data.pubDate.getTime()-a.data.pubDate.getTime()||numericId(b)-numericId(a));}
