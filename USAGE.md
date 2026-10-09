# 自由域使用与维护说明

记录文章发布、站点配置和部署方式，供自己维护时查阅。

## 本地开发

使用 Node 22 LTS（见 `.nvmrc`）。

```sh
npm ci
npm run dev
npm run check
npm run build
npm run verify:build
npm run preview
```

搜索依赖构建后的 Pagefind 索引，请在 `npm run preview` 中测试。

## 发布文章

```sh
npm run new:post
```

脚本按 `data/post-id-sequence.json` 的 `nextId` 创建数字文件，默认草稿。填写标题、摘要、日期、分类和正文，确认后设置 `draft: false`。正文从 H2 开始。图片放在 `public/images/posts/{id}/`，frontmatter 使用 `/images/posts/{id}/cover.webp`。可选 `youtubeId` 必须是真实的 11 位视频 ID。

文章地址永久为 `/{id}.html`，标题或分类改变不会改 URL。不要手动降低 nextId，不要复用撤稿 ID。删除文章时将 ID 加入 `retiredIds`；多分支编辑必须解决序列冲突。当前撤稿策略为 404。

## 配置

- `src/config/site.ts`：品牌、域名、每页数量、作者外链与真实会员信息。
- `src/config/categories.ts`：分类 slug 与名称，仅有正式文章的分类显示。
- `src/config/integrations.ts`：Giscus 公开仓库、repoId、category 和 categoryId。未配置时不加载评论脚本。
- `astro.config.mjs` / `public/robots.txt`：更换域名时同步修改。

没有真实会员价格、购买链接或作者外链时保持空值，不发布示例内容。Giscus 需启用 GitHub Discussions 并安装 Giscus App，文章映射固定为 `freesiai-post-{id}`。

## Cloudflare Pages

连接 GitHub 仓库，生产分支 `main`，构建命令 `npm run build`，输出目录 `dist`，Node 版本设置为 `22.23.2`。绑定 `freesiai.com`；www 如启用则重定向到主域。无需 Astro Cloudflare 适配器或 Pages Functions。不要提交 dist。

部署后验证文章 `/{id}.html` 不被平台转为无扩展名地址；同时验证不存在的路径返回 404、搜索、域名 HTTPS 与自动构建。若平台默认规范化 `.html`，需调整 Pages 路由策略后再验收。

GitHub Actions 在 push/PR 运行类型检查、内容校验、生产构建和产物校验。首次连接 Pages、域名及真实 Giscus 评论需要在各平台配置。

## 设计与内容

首页参考提供截图的四列封面网格 + 右侧栏，窄屏减少列数；没有正式文章时展示真实空状态。未复制参考站品牌、广告或封面。默认分享图为自制 SVG；如需兼容所有社交平台，发布前替换为 1200×630 PNG/JPEG 并修改 BaseLayout 默认图片路径。

构建后 normalize-build.mjs 将 Astro 的数字文章目录输出转换为真正 .html 文件，并同步修正 sitemap；Pagefind 在规范化之后建立索引。

ID 404 保留给错误页，新建脚本会跳过该编号。无正式文章时跳过 Pagefind 索引并显示搜索空状态。
