# Antii Tools

Antii Tools 是一个纯静态在线工具箱，面向开发者、设计师和内容创作者。当前包含图片压缩、二维码生成、CSS 视觉调试、JSON 格式化、时间戳转换、UUID 生成器，以及配套 SEO 指南页。

## 本地运行

不需要构建工具，直接启动静态服务：

```bash
python3 -m http.server 4173
```

然后访问：

```text
http://localhost:4173/
```

## 静态部署

可以部署到任意静态托管平台。仓库已包含 `netlify.toml`，如果使用 Netlify：

- Build command 留空。
- Publish directory 使用 `.`。
- 404 页面使用 `/404.html`。
- 基础安全头和静态资源缓存已在 `netlify.toml` 中配置。

仓库也包含 `vercel.json`，如果使用 Vercel：

- Framework Preset 选择 `Other`。
- Build command 留空。
- Output directory 使用 `.`。
- Clean URLs、安全头和静态资源缓存已在 `vercel.json` 中配置。

## 当前页面

核心工具：

- `/image-optimizer-pro/index.html`
- `/qr-code-forge/index.html`
- `/css-design-craft/index.html`
- `/json-formatter/index.html`
- `/timestamp-converter/index.html`
- `/uuid-generator/index.html`

内容与合规页：

- `/guides/*.html`
- `/guides/index.html`
- `/tools.html`
- `/about.html`
- `/privacy.html`
- `/terms.html`
- `/contact.html`
- `/sitemap.xml`
- `/robots.txt`
- `/404.html`

## 上线前必须替换

这些值目前是上线占位：

- 站点域名：`https://antii-tools.vercel.app`
- 联系邮箱：`hello@antii.tools`
- Firebase 配置：`firebase-config.js`
- 广告位：页面中的 `广告位待配置`

如果实际域名不是 `antii.tools`，需要同步替换：

- 所有 canonical 链接
- `sitemap.xml`
- `robots.txt`
- 首页结构化数据中的 `url`

可用命令辅助检查：

```bash
rg -n "antii\\.tools|hello@|YOUR_|广告位待配置|googlesyndication|adsbygoogle|ca-pub"
```

## Firebase

`firebase-config.js` 目前保留占位配置。只要检测到 `YOUR_`，代码会跳过 Firebase 初始化，站点保持免费版模式。

上线会员/登录前，需要：

1. 在 Firebase Console 创建项目。
2. 启用 Authentication 登录方式。
3. 创建 Firestore 数据库。
4. 替换 `firebase-config.js` 中的配置。
5. 设置 Firestore Security Rules，避免用户自行写入 `is_premium`。
6. 会员状态应由可信支付回调或管理端写入。

## 广告

当前站点只保留广告容器和 `广告位待配置` 文案，没有加载 AdSense 脚本。拿到真实 AdSense client 和 slot 后，再把广告代码接回页面。

建议先完成：

- 隐私政策、服务条款、关于、联系页面。
- 足够的原创指南内容。
- 稳定域名与站点地图。
- 基础流量统计。

## 注意

- 项目是纯静态站，所有新增工具应优先使用浏览器 API。
- 不要把用户文件上传到服务器，除非页面明确说明。
- `.gitignore` 已忽略 macOS `._*` AppleDouble 文件。
