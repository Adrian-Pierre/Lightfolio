# Lightfolio Theme（轻笺）

轻笺（Lightfolio）是一个基于 [Astro](https://astro.build) 和 [Fuwari](https://github.com/saicaca/fuwari) 定制的静态博客主题。

作者博客：[anpier.cn](https://anpier.cn/)

仓库提供可直接运行的主题模板，不包含原博客的个人文章、相册、友链、评论系统、访问统计、分析追踪和私有部署配置。

## 功能

- Astro 5、Svelte 5 和 Tailwind CSS
- 独立的 About、Home、Archive、Friends 和 Pictures 页面
- 响应式布局、明暗模式与平滑页面切换
- Pagefind 静态搜索、RSS 和 Sitemap
- 数学公式、提示块、GitHub 卡片和增强代码块
- 可选的本地音乐播放器
- 中文、英文及其他多语言界面

## 环境要求

- Node.js 20 或更高版本，推荐使用当前 LTS 版本
- pnpm 9 或更高版本

## 本地运行

```sh
pnpm install
pnpm dev
```

开发服务器默认运行在 `http://localhost:4321`。

生产构建与检查：

```sh
pnpm check
pnpm type-check
pnpm build
```

## 配置

首次使用时至少修改以下内容：

1. 将 `astro.config.mjs` 中的 `site` 改成你的正式网址。
2. 在 `src/config.ts` 中修改站点标题、语言、导航、作者资料和文章许可。
3. 在 `src/content/spec/about.md` 中填写 About 页面正文。
4. 在 `src/pages/friends.astro` 的 `items` 数组中维护友链。
5. 在 `src/data/pictures.ts` 中维护相册数据。
6. 删除 `src/content/posts/` 中的演示文章并添加自己的内容。

新建文章：

```sh
pnpm new-post my-post
```

文章支持单文件或页面包两种组织方式：

```text
src/content/posts/
|-- my-post.md
`-- another-post/
    |-- index.md
    `-- cover.jpg
```

### 音乐播放器

音乐播放器默认关闭。使用时请把有合法分发权的音频放入 `public/`，然后修改 `src/config.ts` 中的 `musicConfig`。不要把无授权的商业音乐提交到公开仓库。

## 发布到 GitHub

先在 GitHub 创建一个空的公开仓库，不要勾选自动创建 README、`.gitignore` 或 LICENSE。然后在当前目录运行：

```sh
git init
git add .
git commit -m "chore: publish theme"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/YOUR_REPOSITORY.git
git push -u origin main
```

将 `YOUR_NAME` 和 `YOUR_REPOSITORY` 替换为实际值。推送后可在仓库的 `Settings > General` 中启用 `Template repository`，其他人就能通过 `Use this template` 创建自己的博客。

如果本机已经配置 [GitHub CLI](https://cli.github.com/)，也可以直接运行：

```sh
gh repo create YOUR_REPOSITORY --public --source=. --remote=origin --push
```

## 发布前检查

- 确认 `astro.config.mjs` 中没有保留 `https://example.com`
- 确认 `src/config.ts` 中没有保留 `Your Name`
- 检查提交内容中是否存在 `.env`、密钥、令牌、服务器地址或个人文章
- 确认所有图片、字体和音频允许公开分发
- 运行 `pnpm check`、`pnpm type-check` 和 `pnpm build`

## 开源许可

代码使用 [MIT License](LICENSE)。本项目基于 Fuwari 修改，原项目版权声明保留在 LICENSE 中。
