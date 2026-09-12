import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const expectedIds = ["courseSidebar", "progressBar", "mainContent", "homePage", "chapter-1"];

test("课程导航、资源与响应式样式保持完整", () => {
  assert.match(html, /<meta[^>]+name=["']viewport["']/i);
  for (const id of expectedIds) assert.match(html, new RegExp(`id=["']${id}["']`));
  for (const reference of [...html.matchAll(/\b(?:src|href)=["']([^"'#?]+)["']/gi)].map((match) => match[1])) {
    if (!/^(?:[a-z][a-z\d+.-]*:|\/\/|\/)/i.test(reference)) assert.ok(existsSync(resolve(root, reference)), reference);
  }
  assert.equal(spawnSync(process.execPath, ["--check", resolve(root, "app.js")]).status, 0);
  assert.match(readFileSync(resolve(root, "styles.css"), "utf8"), /@media/i);
});

test("静态页面不声明重复的固定 ID", () => {
  const ids = [...html.matchAll(/\bid=["']([A-Za-z][\w:-]*)["']/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test("HTML 中的 data-download 键均能解析到内嵌资源", () => {
  const source = readFileSync(resolve(root, "app.js"), "utf8");
  const marker = "const resources = ";
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, "未找到 resources 定义");
  // resources 是约 470KB 的单行内嵌对象，用括号匹配定位边界后仅解析该对象，避免整体 eval
  let depth = 0, inString = false, escaped = false, end = -1;
  for (let pos = start + marker.length; pos < source.length; pos++) {
    const ch = source[pos];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) { end = pos; break; } }
  }
  assert.notEqual(end, -1, "resources 对象未闭合");
  const resourceKeys = new Set(Object.keys(JSON.parse(source.slice(start + marker.length, end + 1))));
  const aliasMatch = source.match(/const aliases = \{([\s\S]*?)\};/);
  assert.ok(aliasMatch, "未找到 aliases 定义");
  const aliasKeys = new Set([...aliasMatch[1].matchAll(/^\s*(\w+)\s*:/gm)].map((match) => match[1]));
  const downloadKeys = [...html.matchAll(/data-download=["']([^"']+)["']/g)].map((match) => match[1]);
  assert.ok(downloadKeys.length > 0, "HTML 中未找到 data-download 键");
  const missing = downloadKeys.filter((key) => !resourceKeys.has(key) && !aliasKeys.has(key));
  assert.deepEqual(missing, []);
});
