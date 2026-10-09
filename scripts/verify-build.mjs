import {existsSync,readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
for(const file of ['index.html','videos/index.html','tutorials/index.html','categories/index.html','search/index.html','vip/index.html','about/index.html','404.html','rss.xml','sitemap-index.xml'])assert(existsSync(`dist/${file}`),`缺少 ${file}`);
for(const file of readdirSync('src/content/blog').filter(f=>f.endsWith('.md'))){const body=readFileSync(`src/content/blog/${file}`,'utf8');const id=file.slice(0,-3);const draft=/^draft:\s*true\s*$/m.test(body);assert.equal(existsSync(`dist/${id}.html`),!draft,`文章路由/草稿错误 ${id}`);if(!draft){const html=readFileSync(`dist/${id}.html`,'utf8');assert(html.includes(`https://freesiai.com/${id}.html`));assert(html.includes('data-pagefind-body'));assert(!html.includes('src="https://www.youtube-nocookie.com/'));}}
const home=readFileSync('dist/index.html','utf8');assert(home.includes('lang="zh-CN"'));assert(!home.includes('giscus.app/client.js'));assert(!home.includes('<iframe'));console.log('构建校验通过：公共路由、文章 .html、草稿过滤、canonical、静态搜索与首页第三方加载。');

assert(existsSync('dist/pagefind/pagefind.js')||existsSync('dist/pagefind/empty.json'),'搜索产物缺失');
