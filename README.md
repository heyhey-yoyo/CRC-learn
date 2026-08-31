# CRC Evidence Lab

一个面向准博士生和青年研究者的双案例临床试验分步学习课程，从真实问题到可复核结论。纯静态网页（HTML + CSS + JS），可直接部署到 Cloudflare Pages。

## 主要功能

- 双案例临床试验分步学习课程（结直肠癌方向）
- 章节式分步导航，支持桌面侧边栏与移动端下拉切换
- 内置学习工具与进度记录（浏览器本地存储）
- 全中文界面，响应式布局

## 界面风格

页面采用 `ydchen-portfolio` 的米白、浅灰与赤陶色配色，使用衬线标题和扁平化章节卡片；课程内容、章节结构、学习进度和响应式交互保持不变。

课程正文采用 15–16px 基线，导航与步骤标签不小于 12px；桌面与手机端均不得出现页面整体横向溢出。

## 数据与隐私

应用是纯静态网页，学习进度保存在浏览器 `localStorage` 中，不会上传到任何服务器。清理网站数据或更换设备可能导致进度丢失。

## 本地运行

项目无任何构建步骤，直接用浏览器打开 `index.html` 即可。

如需本地静态预览：

```bash
python -m http.server 8000
```

浏览器打开：

```text
http://localhost:8000
```

## 部署

**通过 GitHub 自动部署**

1. 将项目推送到 GitHub（仓库 `heyhey-yoyo/CRC-learn`）。
2. 在 Cloudflare Dashboard 中进入 **Workers & Pages**。
3. 创建 Pages 项目并连接 `CRC-learn` 仓库。
4. 使用以下设置：

```text
Production branch: main
Build command: （留空，无需构建）
Build output directory: /
```

每次推送后 Cloudflare Pages 会自动构建和部署。

**直接上传**

```bash
npx wrangler pages deploy . --project-name crc-learn
```

---

> AI 编程代理请阅读 [AGENTS.md](./AGENTS.md) 了解项目结构。

---

## AI 维护提醒

> **⚠️ 任何修改此项目的 AI 代理都必须同步更新本文件与 AGENTS.md。**
>
> - 新增功能 → 在 README 中添加用户可理解的说明
> - 修改版本号 → 以 GitHub Release 为准（页面不显示版本号）
> - 部署方式变更 → 同步更新本文部署章节
> - 保持 **README 面向人类用户**，**AGENTS.md 面向 AI 代理**，两份文件不可互相替代
