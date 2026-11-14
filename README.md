# 个人文档

阅读公开仓库 `content/` 里的 Markdown。登录后用细粒度令牌在网页里保存，令牌只留在浏览器本地。

站点配置：

```text
VITE_GITHUB_OWNER=SmallBird6
VITE_GITHUB_REPO=notes
VITE_GITHUB_BRANCH=main
VITE_CONTENT_DIR=content
```

```bash
npm test
npm run build
npm run dev
```

发布后的地址是 <https://smallbird6.github.io/notes/>。
