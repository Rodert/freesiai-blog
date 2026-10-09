import {readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const hasPosts=readdirSync('dist').some(n=>n!=='404.html'&&/^[1-9]\d*\.html$/.test(n));
if(hasPosts){const result=spawnSync('pagefind',['--site','dist'],{stdio:'inherit',shell:process.platform==='win32'});if(result.status!==0)process.exit(result.status??1);}else{mkdirSync('dist/pagefind',{recursive:true});writeFileSync('dist/pagefind/empty.json','{"pages":0}\n');console.log('无正式文章：跳过搜索索引，搜索页显示空状态。');}
