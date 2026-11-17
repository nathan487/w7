#!/usr/bin/env node
/**
 * w12-verify.mjs —— W12 任务 1/2 真实浏览器验证（Chrome headless + Vite dev server）
 *
 * 不靠截图猜，真的点击、真的刷新，再用断言证明：
 *   ① light 主题 → 点切换 → dark 主题（Context 生效，中间层没传 prop）
 *   ② localStorage 预置数据 → 刷新 → 数据还在（惰性初始化，不被空数组覆盖）
 *   ③ dark 主题刷新后仍是 dark（主题也持久化）
 *   ④ 非法 JSON 不导致白屏（安全读取）
 *
 * 用法：npm run verify:w12        （自己拉起/关闭 dev server）
 * 输出：.workbuddy/screenshots/W12/ 下的 PNG + w12-verify.txt
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = process.cwd();
const OUT = resolve(ROOT, '.workbuddy/screenshots/W12');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:5173/';
const TODOS_KEY = 'todo-v2-items';
const THEME_KEY = 'todo-v2-theme';

mkdirSync(OUT, { recursive: true });

const lines = [];
const failures = [];
const say = (text) => {
  lines.push(text);
  console.log(text);
};
const check = (ok, label, detail) => {
  say(`${ok ? '✓' : '×'} ${label}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures.push(label);
};
const settle = () => new Promise((done) => setTimeout(done, 250));

async function waitForServer(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(BASE)).ok) return true;
    } catch {
      // dev server 未就绪
    }
    await new Promise((done) => setTimeout(done, 300));
  }
  return false;
}

const readState = (keys) =>
  page.evaluate(
    (k) => ({
      rows: Array.from(document.querySelectorAll('.todo-list .todo-item__text')).map(
        (el) => el.textContent,
      ),
      theme: document.querySelector('.todo-app')?.getAttribute('data-theme') ?? '',
      className: document.querySelector('.todo-app')?.className ?? '',
      toggleLabel: document.querySelector('.theme-toggle')?.textContent ?? '',
      bodyBg: getComputedStyle(document.body).backgroundColor,
      color: getComputedStyle(document.body).color,
      storage: {
        todos: localStorage.getItem(k.todos),
        theme: localStorage.getItem(k.theme),
      },
    }),
    keys,
  );

let page;
const server = spawn(
  process.execPath,
  [
    resolve(ROOT, 'node_modules/vite/bin/vite.js'),
    '--host',
    '127.0.0.1',
    '--port',
    '5173',
    '--strictPort',
  ],
  { cwd: ROOT, stdio: 'ignore' },
);
let browser;

try {
  if (!(await waitForServer())) throw new Error('Vite dev server 30 秒内未就绪');
  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const keys = { todos: TODOS_KEY, theme: THEME_KEY };

  say('W12 真实浏览器验证：Context 主题切换 + useEffect 持久化');
  say('页面：' + BASE);
  say('');

  // ① 预置 localStorage 数据（对应模板「动手验证」步骤），清空主题
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate((k) => {
    localStorage.clear();
    localStorage.setItem(k.todos, JSON.stringify([{ id: 1, text: '测试任务', completed: false }]));
  }, keys);
  await page.reload({ waitUntil: 'networkidle0' });
  await settle();

  const loaded = await readState(keys);
  check(
    loaded.rows.length === 1 && loaded.rows[0] === '测试任务',
    '首次加载读到预置的「测试任务」，未被空数组覆盖',
    JSON.stringify(loaded.rows),
  );
  check(loaded.theme === 'light', '首次加载为 light 主题', loaded.theme);

  // ② 截 light 主题
  await page.screenshot({ path: resolve(OUT, 'w12_01_light.png'), fullPage: true });
  say('已截图 w12_01_light.png（light 主题，读到测试任务）');

  // ③ 点切换按钮 → dark
  await page.click('.theme-toggle');
  await settle();
  const dark = await readState(keys);
  check(dark.theme === 'dark', '点切换按钮后 data-theme=dark', dark.theme);
  check(
    dark.className.includes('theme-dark'),
    '根节点 class 含 theme-dark（TodoApp 消费者生效）',
    dark.className,
  );
  check(
    dark.toggleLabel.includes('浅色'),
    '切换按钮文案随主题更新（ThemeToggle 消费者生效）',
    dark.toggleLabel,
  );
  check(dark.storage.theme === 'dark', '主题已写入 localStorage', String(dark.storage.theme));
  check(
    dark.bodyBg !== loaded.bodyBg,
    '整页背景色确实变化（CSS 变量生效）',
    `${loaded.bodyBg} → ${dark.bodyBg}`,
  );

  // ④ 截 dark 主题
  await page.screenshot({ path: resolve(OUT, 'w12_02_dark.png'), fullPage: true });
  say('已截图 w12_02_dark.png（dark 主题）');

  // ⑤ 刷新：数据 + 主题都还在
  await page.reload({ waitUntil: 'networkidle0' });
  await settle();
  const reloaded = await readState(keys);
  check(
    reloaded.rows.length === 1 && reloaded.rows[0] === '测试任务',
    '刷新后任务还在（单 Effect 写入 + 惰性初始化）',
    JSON.stringify(reloaded.rows),
  );
  check(reloaded.theme === 'dark', '刷新后仍是 dark 主题（主题持久化）', reloaded.theme);
  await page.screenshot({ path: resolve(OUT, 'w12_03_after_reload.png'), fullPage: true });
  say('已截图 w12_03_after_reload.png（刷新后数据与主题保持）');

  // ⑥ 非法 JSON 不白屏
  await page.evaluate((k) => localStorage.setItem(k.todos, '{bad json'), keys);
  await page.reload({ waitUntil: 'networkidle0' });
  await settle();
  const bad = await readState(keys);
  check(
    bad.rows.length === 0 && bad.theme !== '',
    '非法 JSON 不崩溃，安全地显示空列表',
    JSON.stringify(bad.rows),
  );

  say('');
  say(`结果：${failures.length === 0 ? '全部通过' : `${failures.length} 项失败`}`);
} catch (error) {
  say('× 验证脚本异常：' + (error instanceof Error ? error.message : String(error)));
  failures.push('脚本异常');
} finally {
  if (browser) await browser.close();
  server.kill();
  writeFileSync(resolve(OUT, 'w12-verify.txt'), lines.join('\n') + '\n', 'utf8');
  console.log('已写出 ' + resolve(OUT, 'w12-verify.txt'));
  if (failures.length > 0) process.exitCode = 1;
}
