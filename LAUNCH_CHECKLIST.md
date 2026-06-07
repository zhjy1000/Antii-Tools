# Antii Tools Launch Checklist

## 1. 品牌与联系信息

- [ ] 确认正式域名。
- [ ] 将 `https://antii-tools.vercel.app` 替换为正式域名。
- [ ] 将 `hello@antii.tools` 替换为真实联系邮箱。
- [ ] 检查 `about.html`、`privacy.html`、`terms.html`、`contact.html` 内容是否符合实际主体。

## 2. SEO

- [ ] 检查所有页面的 `<title>`。
- [ ] 检查所有页面的 `<meta name="description">`。
- [ ] 检查 canonical 是否指向正式域名。
- [ ] 更新 `sitemap.xml`。
- [ ] 更新 `robots.txt`。
- [ ] 部署后提交 sitemap 到搜索引擎站长平台。

## 3. Firebase 登录与会员

- [ ] 替换 `firebase-config.js` 中的 Firebase 配置。
- [ ] 启用 Firebase Authentication。
- [ ] 启用 Firestore。
- [ ] 创建 `users/{uid}` 文档结构。
- [ ] 设置 Firestore Security Rules。
- [ ] 确认普通用户不能自行写入 `is_premium`。
- [ ] 接入真实支付前，不开放 Pro 购买入口。

## 4. 广告

- [ ] 申请 AdSense 或其他广告平台。
- [ ] 替换所有 `广告位待配置`。
- [ ] 接入真实 `ca-pub` 和广告 slot。
- [ ] 检查移动端广告尺寸。
- [ ] 确认广告不会遮挡工具主流程。

## 5. 工具 QA

- [ ] 图片压缩：上传 JPG/PNG/WebP，下载单图和 ZIP。
- [ ] 二维码：生成、改颜色、下载 PNG、复制 SVG。
- [ ] CSS 工具：切换三个 tab，复制 CSS。
- [ ] JSON 工具：格式化、压缩、错误 JSON 提示。
- [ ] 时间戳工具：秒、毫秒、ISO、本地时间互转。
- [ ] UUID 工具：批量生成、格式切换、复制、下载。

## 6. 部署后检查

- [ ] 首页可访问。
- [ ] 所有工具页可访问。
- [ ] 所有指南页可访问。
- [ ] `sitemap.xml` 可访问。
- [ ] `robots.txt` 可访问。
- [ ] 浏览器控制台无关键错误。
- [ ] 移动端无横向滚动。
- [ ] 统计工具正常记录访问。
