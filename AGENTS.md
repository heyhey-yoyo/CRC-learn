# CRC Evidence Lab — 项目说明（供 AI 编程代理阅读）

## 项目概览

CRC Evidence Lab 是一个面向准博士生和青年研究者的**双案例临床试验分步学习课程**网页，纯静态多文件实现（`index.html` + `styles.css` + `app.js`），零依赖、零构建，目标部署平台为 Cloudflare Pages。

## 技术栈与运行架构

| 技术 | 说明 |
| --- | --- |
| HTML / CSS / JavaScript | 多文件静态网页，无框架、无打包器、零 npm 依赖 |
| localStorage | 学习进度本地持久化，键前缀请保持稳定 |
| Cloudflare Pages | 静态托管，构建命令留空，构建输出目录为 `/` |

## 项目结构

| 文件 | 作用 |
| --- | --- |
| `index.html` | 页面结构（HTML），引用 `styles.css` 与 `app.js` |
| `styles.css` | 全部样式（约 42 KB） |
| `app.js` | 全部交互逻辑与课程内容数据（约 500 KB） |
| `tests/static-smoke.test.mjs` | 零依赖静态验收（导航、资源、脚本语法、响应式样式、重复 ID） |
| `assets/project-mark.svg` | 页面标志与 favicon 共用图形 |
| `LICENSE` | MIT 许可证 |
| `.gitignore` | Git 忽略规则 |

## 运行与构建

无构建步骤，直接用浏览器打开 `index.html` 即可。如需本地静态预览：

```bash
python -m http.server 8000
```

浏览器打开 `http://localhost:8000`。也可直接双击 `index.html` 在浏览器中打开（无构建、无依赖）。

## 测试

无需第三方依赖，运行 `node --test tests/static-smoke.test.mjs` 可检查课程导航、固定章节入口、本地资源、脚本语法、响应式样式与重复 ID。课程进度保存与完整学习流程仍需在浏览器中手动验证。

发布检查：

```bash
node --test tests/static-smoke.test.mjs
```

## 代码组织与风格约定

- **结构**：HTML 在 `index.html`，样式在 `styles.css`，逻辑与数据在 `app.js`，三者职责分离
- CSS 变量定义在 `:root`，统一视觉令牌（颜色、圆角、阴影）
- 当前页面主体沿用 `ydchen-portfolio` 的米白 / 赤陶色视觉系统，标题使用衬线字体；修改样式时保持课程阅读层级和交互状态清晰
- 视觉验收以课程正文 15–16px、导航与步骤标签不小于 12px 为基线，并在 1440px 桌面与 390px 手机视口检查整体横向溢出
- 中文界面文案，标识符使用英文
- **版本管理**：版本号以 GitHub Release 为准；页面不显示版本号，修改 Release 时无需改页面
- 保持零依赖原则，未经明确批准不得引入外部库或构建工具
- **外部引用**：代码不依赖外部 CSS/JS 资源（Cloudflare Pages 上不存在、会 404），不要新增外部引用；Cloudflare beacon 脚本保留

### 品牌与排版

本项目为普通项目类。页眉桌面 72px、手机（≤640px）64px；方章 48×48px / 40×40px，标题衬线 18px/400/1.3、手机 16px，副标题无衬线 12px/400/1.4；标志与标题间距 12px，标题与副标题间距 2px。

页眉背景和底部分隔线横跨页面可用宽度，内容区最大宽度 1280px（含两侧各 16px 内边距），整体居中；品牌和标题靠左，操作区靠右，窄屏换行后仍保持该对齐。品牌页眉在文档顶部正常排布，随页面滚走，不固定或吸顶；表格内部表头、侧边工具和手机底部导航可按功能保留。

正文采用统一系统无衬线字体，默认 16px / 1.6；标题采用 Georgia、Times New Roman、Songti SC、STSong 衬线族。数字与代码可使用 SFMono-Regular、Consolas、Liberation Mono、Microsoft YaHei 等宽族。按钮和输入通常 15px，辅助文字 12–14px，密集科学数据允许有理由的局部调整。页面底色 #f3eee5、正文 #24221f、赤陶强调 #a94f31，柔和底色上的强调文字 #823a25；科学分类色、热图、作品主题与状态色保留必要区分度。

主样式保留一个顶层 `:root`，条件规则和深色画布局部令牌独立维护，避免叠加重复主题或末尾覆盖层。修改视觉后核对实际渲染字体、字号、间距、对比度和操作可达性；至少检查 1440、820、390px，涉及断点时补查两侧宽度，涉及画布或存储时补查交互。构建、单测、本地浏览器和线上部署分别记录；发布后禁用缓存/硬刷新，并核对实际资源版本。

### 交互与数据约束

home-details 标题与内容保留 18px 水平内边距，并为展开图标留空间。case 与状态颜色保留语义；删选择器前核对 HTML 和动态模板，不改课程资源或进度数据。

## 部署

**Cloudflare Pages（GitHub 集成）**

```text
Production branch: main
Build command: （留空）
Build output directory: /
```

**直接上传**

```bash
npx wrangler pages deploy . --project-name crc-learn
```

## 安全与数据注意事项

- 所有数据保存在浏览器 `localStorage`，不上传服务器
- 无后端、无身份验证、无多用户支持
- 不包含用户数据采集逻辑

## 标志维护约定

项目标志采用统一的深灰方章、米白线条与赤陶色识别点，页面标志与 favicon 共用同一 `assets/project-mark.svg`。后续替换必须保持原标志容器宽高，不得借机改变页眉、网格或页面布局。

---

## AI 维护提醒

> **⚠️ 任何修改此项目的 AI 代理（包括未来的你自己）都必须遵守：**
>
> - **修改代码后必须同步更新本 AGENTS.md 与 [README.md](./README.md)** — 功能增删、版本变更、部署方式变更都需要在两份文档中体现
> - [README.md](./README.md) 面向**人类用户**，AGENTS.md 面向 **AI 代理**，两份文件**不可互相替代**
> - 项目为多文件结构（`index.html` + `styles.css` + `app.js`），新增/拆分文件时务必同步更新文件清单
