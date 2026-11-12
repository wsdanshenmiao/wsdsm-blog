# 写作说明

这个仓库是一个 Quartz 5 静态博客。`content/` 里的 Markdown 会被构建成网页，推到 GitHub 后由 Cloudflare Pages 自动发布。

## 目录

```
D:\Blog\
├── content\              写作只碰这里
│   ├── index.md          首页
│   ├── about.md          关于
│   └── posts\            所有文章
├── quartz.config.yaml    站点配置：站名、语言、字体、布局开关
├── quartz.ts             插件覆盖（最近更新的过滤规则）
├── quartz\               引擎源码，不要改
├── docs\                 Quartz 官方文档，离线查配置用
├── public\               构建产物，自动生成，不进 git
└── node_modules\         依赖，不进 git
```

## 写一篇新文章

1. 在 `content\posts\` 下新建一个 `.md` 文件，文件名用英文或拼音，比如 `water-rendering.md`
2. 开头写 frontmatter：

```yaml
---
title: 水体渲染
date: 2026-11-12
tags: [渲染, 笔记]
description: 一句话摘要，列表页和搜索结果里会显示
---
```

3. 正文照常写。写完执行：

```
cd /d D:\Blog
npx quartz sync
```

`sync` 会提交并推送到 GitHub，Cloudflare Pages 收到推送后自动重新构建，一两分钟后线上更新。

`title` 和 `date` 必填。`date` 决定文章在列表里的排序，格式 `YYYY-MM-DD`。`tags` 决定它出现在哪些标签页下，标签页自动生成，不用手动建目录。

## 图片

放在文章同级的 `assets\` 目录里，用相对路径引用：

```
content\posts\
├── water-rendering.md
└── assets\
    └── wave.png
```

文章里写 `![波形](assets/wave.png)`。构建时 `assets\` 会整份复制到输出目录，路径自动重写。

Typora 有两个设置必须先改，否则图会裂：

- 偏好设置 → 图像 → 「插入图片时」选 **复制图片到 ./assets/**
- 勾选 **优先使用相对路径**

选「使用绝对路径」的话，`D:\...\a.png` 这种写进 md，发布出去必然是裂图。

## 为什么文件名不用中文

中文文件名会变成 URL 里的百分号编码，比如 `content/posts/水体渲染.md` 最终地址是 `/posts/%E6%B0%B4%E4%BD%93%E6%B8%B2%E6%9F%93`。能用，但复制分享出去很难看，也不利于搜索引擎。

规则：**文件名用英文或拼音，中文标题写进 frontmatter 的 `title`**。网页上显示的是 `title`，跟文件名无关。

## 本地预览

```
cd /d D:\Blog
npx quartz build --serve
```

浏览器打开 `http://localhost:8080`。改内容会自动重建，刷新即可看到。

端口被占用时加 `--port 8081`。

## 改站点信息

都在 `quartz.config.yaml`：

| 想改什么 | 改哪里 |
|---|---|
| 站名 | `configuration.pageTitle` |
| 网址 | `configuration.baseUrl` |
| 界面语言 | `configuration.locale`（现在是 `zh-CN`） |
| 配色 | `configuration.theme.colors` 下的色值 |
| 字体 | `configuration.theme.typography` |
| 侧栏「最近更新」条数 | `recent-notes` 的 `options.limit` |
| 页脚链接 | `footer` 的 `options.links` |

改完 `npx quartz sync`。

`baseUrl` 必须和实际访问地址一致。填错的话全站链接、RSS、sitemap 全部错位，页面能打开但点了会 404。

## 部署：GitHub + Cloudflare Pages

### 第一次

1. GitHub 新建仓库，名字 `wsdsm-blog`，Public，**不要**勾选 README / .gitignore / license
2. 本仓库已经配好远端，执行 `npx quartz sync` 推上去
3. 注册 https://dash.cloudflare.com/sign-up ，免费计划，不用绑卡
4. 控制台 → **Compute (Workers)** → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
5. 授权 GitHub，选中 `wsdsm-blog`
6. 填四项：

   | 配置项 | 值 |
   |---|---|
   | Production branch | `v5` |
   | Framework preset | `None` |
   | Build command | `git fetch --unshallow && npx quartz plugin install && npx quartz build` |
   | Build output directory | `public` |

7. 展开 **Environment variables**，加一条 `NODE_VERSION` = `22`
8. **Save and deploy**，等两分钟

地址是 `https://wsdsm-blog.pages.dev`。

构建命令前面那段 `git fetch --unshallow` 不能省。Cloudflare 默认浅克隆，Quartz 用 git 提交时间作文章日期，浅克隆会让所有文章日期变成构建当天。虽然 frontmatter 里的 `date` 优先级更高（配置里 `priority` 是 frontmatter → git → filesystem），但 `about`、`index` 这类没写 `date` 的页面会受影响。

### 以后

改内容 → `npx quartz sync` → 等一分钟。免费版每月 500 次构建，正常写作够用。

### 绑自己的域名

1. 域名商那里加一条 CNAME，指向 `wsdsm-blog.pages.dev`
2. Pages 项目 → **Custom domains** → 添加域名，等状态变绿
3. 把 `quartz.config.yaml` 的 `baseUrl` 改成新域名
4. `npx quartz sync`

## 常见故障

| 现象 | 原因 |
|---|---|
| 页面能开，点进去全 404 | `baseUrl` 和实际域名不一致 |
| 图片裂 | Typora 用了绝对路径，或图片没放在 `assets\` 下 |
| 构建失败，提示 node 版本 | Pages 环境变量 `NODE_VERSION=22` 没生效 |
| 构建失败，提示插件 | 跑 `npx quartz plugin doctor` 看具体是哪个插件 |
| 本地 `--serve` 报批量删除错误 | 换个终端窗口跑，或改用 `npx quartz build` 后自己起静态服务 |
| 中文标题变成乱码 URL | 文件名用了中文，改成英文或拼音，标题写 frontmatter |

## 两个前提要记住

**这是 Quartz 5，不是 4。** 4.x 的配置写在 `quartz.config.ts` 里，5.x 改成了 `quartz.config.yaml` 加独立的 `@quartz-community/*` 插件包。网上搜到的绝大多数教程是 4.x 的，配置格式对不上。要查配置以本仓库 `docs\` 目录为准。

**单文件上限 25 MiB。** Cloudflare Pages 免费版对单个文件有限制，一段几分钟的 1080p 演示视频很容易超。视频放 B 站用 iframe 内嵌，或者传到 Cloudflare R2 再用链接引，不要直接塞进仓库。仓库体积膨胀后 clone 和构建都会变慢。
