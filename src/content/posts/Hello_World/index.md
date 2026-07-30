---
title: Hello World
published: 2026-01-01
description: Start writing with the Lightfolio theme.
tags: [Blog, Astro]
category: Guide
draft: false
lang: en
---

Welcome to your new Astro blog. This example keeps the home page populated after a fresh clone and shows the basic post structure.

## Frontmatter

Every post starts with YAML frontmatter:

```yaml
---
title: My First Post
published: 2026-01-01
description: A short summary shown on the post card.
tags: [Notes]
category: Journal
draft: false
lang: en
---
```

Set `draft` to `true` while a post is unfinished. Add a local cover image next to the Markdown file and reference it with `image: ./cover.jpg`.

## Content location

Posts live in `src/content/posts/`. A post can be a single Markdown file or a directory containing `index.md` and related images.

```text
src/content/posts/
|-- first-post.md
`-- second-post/
    |-- index.md
    `-- cover.jpg
```

Run `pnpm new-post my-post` to create a new post, then use `pnpm dev` to preview it locally.
