# 自由域

我的中文教程博客，记录 AI 工具和实用教程。

站点：https://freesiai.com

## 本地运行

使用 Node 22 LTS。

```sh
npm ci
npm run dev
```

## 新建文章

```sh
npm run new:post
```

文章放在 `src/content/blog/`，默认是草稿。写好后将 `draft` 改为 `false`，提交到 `main`，由 Cloudflare Pages 自动部署。

详细发布流程、配置和部署说明见 [USAGE.md](USAGE.md)。
