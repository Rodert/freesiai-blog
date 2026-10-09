# 自由域 静态博客技术开发规范（V1.0）

> 文档版本：1.0 · 日期：2026-10-09  
> 项目域名：https://freesiai.com  
> 建议 GitHub 仓库：`freesiai-blog`  
> 文档用途：提供给 AI 开发助手作为实施依据；未明确授权的功能不得擅自增加。

## 0. 给 AI 开发助手的执行指令

你是一名负责交付生产可部署静态网站的资深前端工程师。请严格按本规范开发 自由域 V1.0。优先完整、简单、可维护、SEO 友好；不要引入数据库、服务端运行环境、登录系统、支付系统、CMS 后台或不必要的依赖。所有业务内容都从 Markdown 内容集合和配置读取，不要把示例文章当作真实内容上线。先完成构建及路由测试，再验收 UI。用户提供的“零度博客”截图是首页视觉基准，需参考其中的信息层级、网格卡片、导航和右侧栏布局，但不复制其品牌标识、图片或受版权保护的素材。

凡是密钥、购买地址、YouTube 视频 ID、Giscus GitHub 仓库与分类 ID 尚未提供的地方，使用**显式配置项及安全空状态**，不填造假值。不要因为未配置 Giscus 而导致页面构建失败。

## 1. 项目目标与边界

### 1.1 目标

创建一个中文、轻量、响应式的内容博客，用于：

1. 将作者在 YouTube 发布的视频整理成对应的中文图文教程；文章内可播放 YouTube 视频，同时显示“在 YouTube 观看”外链。
2. 发布其他 Markdown 图文教程，无需视频也可正常发布。
3. 提供首页、教程栏目、分类归档、全文搜索、文章详情、会员介绍和关于页面。
4. 文章末尾可使用 Giscus 评论；侧边栏预留广告、分类、近期文章等常规模块。
5. 通过 GitHub 提交 Markdown 自动触发 Cloudflare Pages 静态构建部署。

### 1.2 V1 不做

- 不上传、不代理、不存储、不转码 YouTube 视频。
- 不开发用户注册、登录、账户、会员鉴权或权限系统。
- 不开发支付接口、订单管理、会员内容解锁；会员页只提供外部购买链接。
- 不开发 WordPress 式可视化编辑后台或自建 CMS。
- 不部署 MySQL、Redis、D1、R2、独立 API、Pages Functions 或常驻 Node/PHP 服务器。
- 不做自动同步 YouTube 内容；文章由作者手动整理为 Markdown。
- 第一版不设置虚假的广告、文章数量、阅读量、评论数、推荐评价等。

## 2. 技术栈与工程标准

| 分类 | 采用方案 | 用途 |
| --- | --- | --- |
| 框架 | Astro（当前稳定版） | 静态 HTML 生成、页面路由、内容集合 |
| 语言 | TypeScript（strict） | 数据与组件类型安全 |
| 样式 | Tailwind CSS（与 Astro 稳定兼容版本）+ 少量组件 CSS | 响应式页面与主题变量 |
| 内容 | Astro Content Collections + Markdown（可按需扩展 MDX） | 管理文章 |
| 视频 | YouTube iframe，按需/点击加载 | 外链播放，不托管视频 |
| 搜索 | Pagefind | 构建后本地静态全文索引 |
| 评论 | Giscus + GitHub Discussions | 无自建评论后端 |
| 托管 | Cloudflare Pages（静态站点） | CDN 与 HTTPS |
| 代码 | GitHub | 版本管理、提交后自动部署 |
| 包管理 | npm | 减少工具链约束 |

**核心配置**：Astro 使用 `output: 'static'`，`site: 'https://freesiai.com'`；静态部署不添加 `@astrojs/cloudflare` 适配器（它用于 SSR 等服务端能力）。固定 Node LTS 版本，并提交 lockfile。

## 3. 站点信息架构及 URL

### 3.1 路由定义

| URL | 页面 | 说明 |
| --- | --- | --- |
| `/` | 首页 | 最近发布文章，最新在前 |
| `/{id}.html` | 文章详情 | 例如 `/1.html`、`/2.html`，必须保留 `.html` |
| `/videos/` | 视频教程 | 仅展示带 YouTube ID 的文章 |
| `/tutorials/` | 图文教程 | 非视频教程文章；可根据实际内容类型确定筛选规则 |
| `/categories/` | 分类总览 | 有真实文章的分类列表 |
| `/categories/{slug}/` | 分类详情 | 分类文章列表 |
| `/search/` | 全文搜索 | 按标题、正文搜索 |
| `/vip/` | 会员介绍 | 权益、价格、外部购买按钮；未配置时显示待完善状态 |
| `/about/` | 关于 | 作者简介及外链；未配置的信息不展示 |
| `/page/{n}/` | 首页分页 | 第二页如 `/page/2/`；第一页 canonical 指向 `/` |
| `/404.html` | 404 | 返回首页、搜索入口 |

分类分页及视频/教程分页可在 V1 文章量增加后逐步补充；但公共分页组件应可复用。

### 3.2 数字文章 ID（强制）

- 文章文件统一为 `src/content/blog/1.md`、`2.md`、`3.md`……。
- 站点输出必须为 `dist/1.html`、`dist/2.html`、`dist/3.html`，**不是** `/posts/1/`、`/1/` 或 `/posts/1.html`。
- `id` 仅允许正整数，禁止前导零（例如不使用 `001`），从 1 开始顺序分配。
- ID 是永久标识，一旦发布不得改变；删除或撤稿不得复用 ID。
- 文章展示顺序由 `pubDate` 降序决定；发布时间相同时按 ID 降序，保证排序确定性。
- 不允许用户修改文章标题或分类后自动改变 URL。
- 必须编写 `npm run new:post` 脚本：使用**显式文章 ID 分配清单**（如 `data/post-id-sequence.json` 中的 `nextId`）和文件存在性校验生成新文件；禁止只根据当前最大的文件 ID 决定下一个 ID，以免删除文章后复用旧编号。序列文件必须跟踪 Git，CI 校验序列不小于已分配最大 ID + 1。
- 对已上线又撤稿的文章，优先保留该 ID 的说明页面或明确的重定向/404 策略，不能把旧 URL 指向不同文章。

### 3.3 Astro 动态静态路由

建议采用文件：`src/pages/[id].html.astro`，通过 `getStaticPaths()` 枚举文章内容集合中的 ID，构建出 `/{id}.html`。**开发者必须用真实 build 结果验证文件名与访问路径，不允许只凭推测宣称已完成**。示意代码：

```astro
---
import { getCollection, render } from 'astro:content';
import ArticleLayout from '../layouts/ArticleLayout.astro';

export async function getStaticPaths() {
  const entries = await getCollection('blog', ({ data }) => !data.draft);
  return entries.map((entry) => ({
    params: { id: entry.id.replace(/\.md$/, '') },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<ArticleLayout post={entry}>
  <Content />
</ArticleLayout>
```

注意：Astro Content Collection 的 `entry.id` 实际表现应按**项目安装的 Astro 版本**核实，不应直接假设文件后缀存在。可统一建立 `getPostNumericId(entry)` 并校验只包含数字。上述示意以项目实际类型检查和 build 成功为准。

## 4. 内容模型与 Markdown 规范

### 4.1 Frontmatter

建议 `src/content.config.ts` 用 Zod 定义字段并验证：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | string | 是 | 文章标题 |
| `description` | string | 是 | SEO 摘要，建议 80–160 个中文字符以内，按自然语言质量调整 |
| `pubDate` | date | 是 | 发布时间，ISO 日期 `YYYY-MM-DD` |
| `updatedDate` | date | 否 | 更新日期 |
| `category` | string | 是 | 分类 slug，需存在于集中配置 |
| `tags` | string[] | 否 | 文章标签 |
| `cover` | string | 否 | 网站内绝对资源路径，例如 `/images/posts/1/cover.webp` |
| `youtubeId` | string | 否 | YouTube 视频 ID；无视频时不填 |
| `draft` | boolean | 否 | 默认 false；true 不产生对外页面/索引 |
| `featured` | boolean | 否 | 预留字段，V1 首页仍固定按发布时间倒序 |

**文章 ID 不在 Frontmatter 中重复定义**，以文件名 `1.md` 为唯一数据源。避免文件名与元数据产生冲突。

### 4.2 示范文章（只放在文档中，不作为线上真实内容）

文件：`src/content/blog/1.md`

```md
---
title: 'Codex 安装与使用教程'
description: '通过图文步骤介绍安装 Codex 和常见配置方式。'
pubDate: 2026-10-09
category: 'ai-coding'
tags: ['Codex', 'AI 编程']
cover: '/images/posts/1/cover.webp'
youtubeId: 'REPLACE_WITH_REAL_YOUTUBE_ID'
draft: true
---

# Codex 安装与使用教程

这里编写实际图文教程……

## 安装步骤

这里放正文、命令和截图。
```

该文件若用于测试应保持 `draft: true`；正式发布前须替换为真实内容和视频 ID。

### 4.3 内容约束

- Markdown 内允许标题、代码块、表格、图片、引用、列表。
- H1 默认由文章详情模板输出；正文建议从 H2 开始，避免重复 H1。
- 文章标题、摘要、图片 alt 应为真实且有意义的内容。
- 代码块提供高亮，保证移动端横向滚动，不撑破布局。
- 图片优先 WebP/AVIF，使用合理大小及延迟加载；文章封面建议宽屏 16:9。
- 发布流程：新增数字 Markdown -> 本地检查 -> Git 提交 -> Cloudflare 构建 -> 对外生效。

## 5. UI 与页面设计

### 5.1 视觉基准

- 以用户提供的零度博客首页截图为样式参考，不采用 VuePress 文档站样式。
- 整体简洁，页面主背景偏浅灰，顶部白色导航，文章卡片白底、轻圆角、合理留白。
- 首页以文章封面为视觉中心，卡片含封面、标题、日期、分类（视设计密度决定展示）。
- **桌面端主内容区域为四列卡片网格，右侧独立侧边栏**；宽度不足时自动降低列数。
- 卡片为规则 CSS Grid，不需要 Masonry 瀑布流算法。
- 不直接使用原站 Logo、标题、封面素材、广告图。
- 颜色、尺寸作为可调整 design tokens，不把截图估测像素值当作硬性真值。

### 5.2 响应式原则

| 视口 | 建议布局 |
| --- | --- |
| ≥ 1440px | 主内容四列卡片 + 右侧边栏 |
| 1024–1439px | 主内容 3–4 列，视空间调整；侧边栏收窄或下移 |
| 768–1023px | 2–3 列，侧边栏下移 |
| < 768px | 1–2 列，自适应；顶部导航折叠；无横向溢出 |

验收更注重视觉层级、文字可读性和不溢出，具体 breakpoint 可在实现时细调。

### 5.3 首页

- 顶部：自由域 标识、首页、视频教程、图文教程、分类、会员、搜索入口。
- 主区域：最近发布文章卡片（按 `pubDate DESC, id DESC`），每页建议 12 篇，真实数量可在配置调整。
- 右侧侧边栏：搜索、广告位、分类、近期文章。
- 第一版：广告仅使用空占位，不展示假广告；分类和近期文章来自真实 Markdown 数据，若无真实内容则显示克制的空状态或者暂时隐藏具体列表。
- 分类及栏目不应创建没有意义的虚构内容。
- 列表项点击必须进入其真实 `/{id}.html`。

### 5.4 文章详情页

- 面包屑、标题、发布时间、可选更新日期、分类、封面（如果有）、正文、可选 YouTube 视频、原视频外链、上一篇/下一篇、评论区。
- 桌面端可复用首页的侧边栏布局；移动端侧边栏放到正文下方或隐藏广告占位。
- YouTube 播放采用 `youtube-nocookie.com` 嵌入域名（适用时），采用 16:9 容器；优先点击后加载 iframe，减少页面初始第三方请求。
- 保留“在 YouTube 观看”链接，设置 `target="_blank" rel="noopener noreferrer"`。
- YouTube 加载失败时，正文仍可访问，外链仍能点击。对中国大陆网络访问受限的情况应明确保留文字版教程。
- 无 `youtubeId` 时完全不渲染播放器。

### 5.5 会员页 `/vip/`

- 配置化展示会员说明、实际权益、实际价格、FAQ、外部购买按钮。
- 没有获得真实价格、链接或权益之前，**不展示虚构价格与购买承诺**；按钮可隐藏或显示“即将上线”的非交互状态。
- 不做会员登录、付费内容、支付回调。

### 5.6 其他页面

- `/videos/`：筛选有 `youtubeId` 的文章。
- `/tutorials/`：筛选没有 `youtubeId` 的教程内容；若未来引入跨形态内容，调整为显式 `type` 字段。
- `/categories/`：显示配置中有真实文章的分类。
- `/search/`：标题和正文全文搜索，结果链接为数字 URL。
- `/about/`：品牌介绍与真实外部渠道。
- `/404.html`：简洁错误页、返回首页和搜索链接。

## 6. 组件与项目结构

```text
freesiai-blog/
├── public/
│   ├── favicon.svg
│   ├── images/
│   │   └── posts/
│   ├── robots.txt                 # 可构建生成或手工维护
│   └── _headers                   # 可选，安全与缓存响应头
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── SiteHeader.astro
│   │   ├── SiteFooter.astro
│   │   ├── PostCard.astro
│   │   ├── PostGrid.astro
│   │   ├── Pagination.astro
│   │   ├── Sidebar.astro
│   │   ├── SidebarAdSlot.astro
│   │   ├── CategoryList.astro
│   │   ├── RecentPosts.astro
│   │   ├── YouTubeEmbed.astro
│   │   ├── GiscusComments.astro
│   │   └── SearchBox.astro
│   ├── config/
│   │   ├── site.ts                 # 网站名称、域名、分页数、导航链接
│   │   ├── categories.ts           # 分类显示名与 slug
│   │   └── integrations.ts         # Giscus/外部服务配置
│   ├── content/
│   │   └── blog/                   # 1.md, 2.md, 3.md...
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── ListingLayout.astro
│   │   └── ArticleLayout.astro
│   ├── lib/
│   │   ├── posts.ts                # 排序、过滤、数字 ID、上一篇/下一篇
│   │   └── seo.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── [id].html.astro         # 构建 /1.html 等
│   │   ├── videos/index.astro
│   │   ├── tutorials/index.astro
│   │   ├── categories/index.astro
│   │   ├── categories/[slug]/index.astro
│   │   ├── search/index.astro
│   │   ├── vip/index.astro
│   │   ├── about/index.astro
│   │   ├── page/[page]/index.astro
│   │   ├── rss.xml.ts
│   │   └── 404.astro
│   ├── styles/global.css
│   └── content.config.ts
├── data/
│   └── post-id-sequence.json
├── scripts/
│   ├── new-post.mjs
│   ├── validate-content.mjs
│   └── verify-build.mjs
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
├── README.md
└── TECHNICAL_SPEC.md
```

文件路径是建议实现方案；可作不破坏功能的轻微调整，但 URL 和接口行为不可变。

## 7. 静态搜索 Pagefind

Pagefind 无需远程搜索服务。每次 Astro 生成 `dist` 后再对静态 HTML 建索引。

建议 `package.json`：

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && pagefind --site dist",
    "preview": "astro preview",
    "check": "astro check && node scripts/validate-content.mjs",
    "new:post": "node scripts/new-post.mjs",
    "verify:build": "node scripts/verify-build.mjs"
  }
}
```

安装并锁定兼容版本：`astro`、`@astrojs/check`、`typescript`、`tailwindcss`、与当前 Astro 版本兼容的 Tailwind 集成，以及 `pagefind`。具体版本以实施时稳定版本为准，避免引用旧版集成 API。

- 页面正文通过 `data-pagefind-body` 标注主要可搜索内容，避免导航、侧边栏、页脚造成噪声。
- 草稿不生成静态页面，也不进入 Pagefind。
- 在生产 build 后验证 `dist/pagefind/` 存在，且 `/search/` 页面查询可返回文章标题及正文关键词。
- 开发模式下 Pagefind 索引通常不会自动更新；测试搜索时运行完整 `npm run build` 与静态预览。

## 8. Giscus 评论

- 采用 Giscus 的公开 GitHub 仓库 + GitHub Discussions 模式；访客必须拥有 GitHub 账号才能发表评论。
- 配置项：`repo`、`repoId`、`category`、`categoryId`、`lang: zh-CN`、theme。
- **推荐映射为 `specific`，并将 `term` 固定为 `freesiai-post-{id}`**，例如文章 `/1.html` 的讨论 key 为 `freesiai-post-1`；避免日后修改标题、域名或文章导航影响关联。
- 如采用 pathname 映射，必须确保 `.html` 路径永久稳定；此项目优先 specific 方式。
- 只有文章详情页渲染 Giscus，搜索结果、首页不加载评论组件。
- 仓库应为公开、启用 Discussions，并安装 Giscus App；使用官方配置器获取真实 repo ID 和 category ID。
- 未配置时不嵌入 Giscus 脚本，可以显示“评论尚未启用”的温和提示。
- Giscus 依赖 GitHub 服务可访问性，不能保证所有地区用户均可正常发表评论。

## 9. SEO、可访问性与性能

### 9.1 SEO

- 各页面输出唯一 `<title>`、`meta description` 和 canonical URL。
- 文章 canonical 精确指向 `https://freesiai.com/{id}.html`。
- 站点语言 `lang="zh-CN"`；HTML 合理 H1/H2 结构。
- 生成 `sitemap-index.xml` 或实际所用 sitemap 入口（由集成输出决定），并在 robots.txt 中标注真实 sitemap URL。
- 提供 RSS，内容仅包括正式发布文章，链接为永久数字 URL。
- Open Graph、Twitter Card 元数据；无封面时使用网站级默认分享图（需要自制、不得盗用）。
- 文章可加 `BlogPosting` JSON-LD（与真实元数据一致）；面包屑可加 `BreadcrumbList`。
- 404、搜索结果页面可设置 `noindex`；不要把草稿发布出去。
- 使用 `<a href>` 保持内部导航可爬取；避免纯 JS 导航。

### 9.2 性能

- 封面图片尺寸预处理，默认延迟加载非首屏图片。
- 首页不直接加载 YouTube iframe。
- 字体优先使用系统字体，减少远程依赖。
- 不引入整站 React/Vue 客户端运行时，必要交互用少量 JS。
- 卡片和导航有 hover/focus 反馈，键盘可操作。
- 所有图片有 alt，外链使用安全 `rel` 属性。
- 移动端宽度不得出现横向滚动。

## 10. Cloudflare Pages 部署

### 10.1 GitHub 仓库

建议新建：`freesiai-blog`。优先使用独立仓库维护站点文件和 Markdown 内容。代码仓库如果启用 Giscus，可复用同一个公开仓库的 Discussions；如不想公开网站源码，可另设公开评论仓库。

### 10.2 Astro 配置示例

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://freesiai.com',
  output: 'static',
  trailingSlash: 'always',
});
```

`trailingSlash` 仅规范目录页（例如 `/vip/`），不要对 `/1.html` 等带扩展名的文章 URL 追加斜杠；实施时必须验证 `.html` 路由不被重写。

### 10.3 Pages 配置

- Cloudflare Dashboard → Workers & Pages → 创建 Pages 项目 → 连接 GitHub 仓库。
- Production branch：`main`。
- Build command：`npm run build`。
- Build output directory：`dist`。
- Node.js 版本：选择与锁文件和依赖一致的稳定 LTS，明确配置而非依赖环境默认值。
- 域名绑定：`freesiai.com`，并根据需要绑定 `www.freesiai.com` 后统一 301 至主域名。
- 每次 push 自动构建；PR 可使用预览部署，但在未公开前可设置合理的索引策略。
- 本项目为纯静态输出，无须 Cloudflare SSR adapter / Functions / D1 / R2。

**注意**：不要把 `dist/` 当作源码提交；由 Pages 构建产物并发布。

## 11. 文章发布工作流

1. 运行 `npm run new:post`，脚本获取下一个未使用的永久 ID，并同步增加 `data/post-id-sequence.json` 的 `nextId`。
2. 生成 `src/content/blog/{id}.md` 的规范 Frontmatter；默认 `draft: true`。
3. 作者填写真正的文章、封面图片、真实分类；如是视频教程则填写 YouTube ID。
4. 在本地运行 `npm run check`、`npm run build` 和 `npm run verify:build`。
5. 预览确认后将 `draft: false`，提交到 GitHub `main` 分支。
6. Cloudflare Pages 自动重新构建发布；首页、分类、RSS、搜索索引同时更新。

**同步修改同一序列文件可能发生 Git 合并冲突**，应当人工解决冲突并检查 ID 唯一性；CI 应拒绝重复编号。

## 12. 开发分阶段任务

### P0 — 工程脚手架
- [ ] 初始化 Astro、TypeScript strict、Tailwind，固定依赖版本。
- [ ] 配置静态输出、域名和公共页面布局。
- [ ] 基于截图完成 Header、Footer、PostCard、PostGrid、Sidebar、响应式 CSS。

### P1 — 内容和路由
- [ ] Content Collections schema 校验。
- [ ] 实现数字文章永久 URL `/{id}.html`。
- [ ] 建立文章 ID 分配脚本与永久不复用约束。
- [ ] 实现首页时间倒序、列表分页、分类页和基本栏目。
- [ ] 实现文章详情、代码高亮、正文图片。

### P2 — 外部服务集成
- [ ] YouTube 封面 + 点击加载播放器 + 原视频链接。
- [ ] Pagefind 构建全文索引与搜索界面。
- [ ] Giscus 的可选配置、中文模式、固定 discussion key。

### P3 — 独立页面与 SEO
- [ ] 会员介绍页 / 关于页 / 404。
- [ ] 右侧广告、分类、近期文章插槽与空状态。
- [ ] Sitemap、RSS、canonical、OG、必要结构化数据。
- [ ] Lighthouse / 移动端 / 键盘访问 / 外链检查。

### P4 — 部署与交付
- [ ] GitHub 创建仓库、Pages Git 集成、域名接入。
- [ ] README 使用说明、配置项清单、文章发布流程。
- [ ] 记录本地构建、预览、线上 URL 测试结果。

## 13. 验收标准（必须可验证）

| 编号 | 验收要求 | 通过条件 |
| --- | --- | --- |
| A01 | 静态构建 | `npm run build` 成功，`dist/` 可部署，无 server runtime |
| A02 | 永久文章 URL | 测试文章输出 `dist/1.html`、`dist/2.html`，访问 `/1.html`、`/2.html` 成功 |
| A03 | URL 不误改 | `/1.html` 不跳转成 `/1/` 或 `/posts/1/` |
| A04 | 数字 ID | 不得重复；删除文章不复用旧 ID；标题修改不影响 URL |
| A05 | 排序 | 按发布时间降序，时间相同时按 ID 降序 |
| A06 | 首页视觉 | 桌面四列主网格 + 右侧边栏，浅灰底白卡，参考截图 |
| A07 | 响应式 | 常见桌面/平板/手机宽度无水平溢出，导航可操作 |
| A08 | 视频文章 | 有 ID 文章显示点击后加载的视频和 YouTube 外链；无 ID 文章不显示播放器 |
| A09 | 图片 | 本地图片随 GitHub 和 Pages 发布，无 R2 依赖 |
| A10 | 搜索 | 发布后 Pagefind 可通过标题和正文关键词检索，链接为 `/{id}.html` |
| A11 | 评论 | 配置有效 Giscus 后可以评论，文章讨论 key 与数字 ID 绑定 |
| A12 | 无评论配置 | 页面仍构建和正常显示，不泄漏错误或破坏布局 |
| A13 | 分类与侧栏 | 真实分类可导航，广告位置预留但不出现假广告 |
| A14 | 会员页 | 无登录/支付接口，购买按钮仅指向可配置的真实外链 |
| A15 | SEO | Canonical、sitemap、RSS、OG 和 `lang=zh-CN` 正确 |
| A16 | 草稿 | `draft: true` 文章不生成对外页面、不进入搜索/归档/RSS |
| A17 | 404 | 不存在文章时静态站点返回 404 页面，不误显示首页 |
| A18 | 自动发布 | GitHub push 至 main 后 Pages 自动构建并发布 |
| A19 | 空内容站点 | 无正式文章时首页、搜索、分类、会员及侧栏空状态正常，不产生假数据 |

开发者至少提供一次真实生产 `npm run build` 的输出摘要，抽查 `dist/1.html` 文件是否存在（可使用本地真实测试文章，正式交付前移除或保留草稿）。

## 14. 配置项待用户后续提供（不阻塞基础开发）

| 配置 | 缺省处理 |
| --- | --- |
| 自由域 Logo / favicon | 可先使用简洁的文字 Logo 和自制 SVG favicon |
| 会员真实权益和价格 | 未提供前仅保留结构与待完善状态 |
| 外部购买地址 | 未提供时不显示有效购买按钮 |
| YouTube 频道/视频 URL | 文章层可选，未配置不嵌入视频 |
| Giscus repo、repoId、categoryId | 未提供则禁用评论组件并保持构建成功 |
| 作者联系方式 / 社媒 | 不填造假链接 |
| 广告投放内容 | 只预留插槽，不加载广告脚本 |

## 15. 交付物

- 完整且可执行的 GitHub 项目源码。
- README：安装、开发、内容编辑、新建编号文章、构建、部署步骤。
- `.gitignore`、锁文件、必要的示例配置说明。
- `TECHNICAL_SPEC.md` 与实际实现保持一致。
- 至少验证静态 URL、搜索、响应式、评论配置回退、草稿过滤、SEO 与 Cloudflare Pages 部署。

## 16. 参考文档

- Astro 路由：https://docs.astro.build/en/guides/routing/
- Astro 内容集合：https://docs.astro.build/en/guides/content-collections/
- Cloudflare Pages + Astro：https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
- Cloudflare Git 集成：https://developers.cloudflare.com/pages/configuration/git-integration/
- Pagefind：https://pagefind.app/docs/
- Giscus：https://giscus.app/zh-CN

---

**一句话项目定义**：自由域 是一个 Astro 驱动的中文静态教程博客，使用永久数字 `.html` URL、GitHub Markdown 发布、YouTube 外链视频、Pagefind 本地全文搜索和 Giscus 评论，整体部署在 Cloudflare Pages，不需要独立后端或数据库。

## 实施说明

品牌统一为自由域；英文仓库名与域名不变。栏目页面采用 videos.astro、tutorials.astro 等文件，静态目录 URL 不变。无正式文章不创建分类详情或分页。撤稿 ID 记录于 retiredIds，旧地址返回 404。部署与真实 Giscus 验收需完成平台配置。

实现约束：ID 404 保留给 /404.html，分配脚本跳过；无正式文章时不生成全文索引，仅生成空状态标记。
