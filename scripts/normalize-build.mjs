import {readdirSync,statSync,readFileSync,writeFileSync,renameSync,rmdirSync} from 'node:fs';
for(const name of readdirSync('dist'))if(/^[1-9]\d*\.html$/.test(name)&&statSync(`dist/${name}`).isDirectory()){renameSync(`dist/${name}/index.html`,`dist/${name}.tmp`);rmdirSync(`dist/${name}`);renameSync(`dist/${name}.tmp`,`dist/${name}`);}
for(const name of readdirSync('dist').filter(n=>n.startsWith('sitemap')&&n.endsWith('.xml'))){const p=`dist/${name}`;writeFileSync(p,readFileSync(p,'utf8').replace(/(https:\/\/freesiai\.com\/[1-9]\d*\.html)\//g,'$1'));}
