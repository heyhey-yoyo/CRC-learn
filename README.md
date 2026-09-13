# CRC Evidence Lab

一个面向准博士生和青年研究者的双案例临床试验分步学习课程，从真实问题到可复核结论。纯静态网页（HTML + CSS + JS），可直接部署到 Cloudflare Pages。

## 主要功能

- 双案例临床试验分步学习课程（结直肠癌方向）
- 章节式分步导航，支持桌面侧边栏与移动端菜单抽屉切换
- 内置学习工具与进度记录（浏览器本地存储）
- 可下载完整教学项目包或单项资源，配套确认响应、生存终点、配对组织、ctDNA、先导暴露与逐行核查练习
- 全中文界面，响应式布局

## 界面风格

采用暖米白、浅灰与赤陶色，衬线标题与系统无衬线正文保持统一层级，图表与状态提示保留必要的颜色区别。

页眉内容区居中，品牌与标题靠左，操作靠右；页眉位于文档顶部，随页面正常滚走，窄屏允许换行。页眉背景与分隔线铺满页面宽度。

课程说明、折叠内容和阅读卡片保留充足内边距，学习步骤可保存并在重新打开时恢复。

## 数据与隐私

应用是纯静态网页，学习进度保存在浏览器 `localStorage` 中，不会上传到任何服务器。清理网站数据或更换设备可能导致进度丢失。

页面包含 Cloudflare Web Analytics 访问统计脚本，会向 Cloudflare 发送访问分析请求；这与学习进度的本地保存分开，应用不会将学习进度传给该脚本。

## 本地运行

项目无任何构建步骤，直接用浏览器打开 `index.html` 即可。

下载分析练习需要 R 4.4 或更新版本及 survival 包，按项目包 README 顺序运行脚本。全部数据是模拟教学材料，包含明确标记且保留的异常；计算检查通过不代表数据查询已关闭，也不代表真实临床适用性。网页与项目包共享 Simon 判断；先导按首剂后 ≤42 天判断周期 3 进入情况，并分开报告 RLT 全治疗分母、完成窗标志和组分 RDI。

如需本地静态预览：

```bash
python -m http.server 8000
```

浏览器打开：

```text
http://localhost:8000
```

## 部署

对外版本以 GitHub Release 为准，课程页面不另设应用版本常量。下载包中的教学材料标识和浏览器进度键是内部兼容标识，不作为应用发布版本。

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

## License

MIT

---

> AI 编程代理请阅读 [AGENTS.md](./AGENTS.md) 了解代码架构、测试与开发约定。

---

## AI 维护提醒

> **⚠️ 任何修改此项目的 AI 代理都必须同步更新本文件与 AGENTS.md。**
>
> - 新增功能 → 在 README 中添加用户可理解的说明
> - 修改版本号 → 以 GitHub Release 为准（页面不显示版本号）
> - 部署方式变更 → 同步更新本文部署章节
> - 保持 **README 面向人类用户**，**AGENTS.md 面向 AI 代理**，两份文件不可互相替代
