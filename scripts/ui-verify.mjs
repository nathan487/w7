#!/usr/bin/env node
/**
 * ui-verify.mjs —— 轨道 B：真实浏览器里的 UI 行为验证
 *
 * 不是看截图猜「应该对」，而是用无头 Chrome 真的输入、真的点击，
 * 再把「页面 DOM 列表」与「控制台打印的 todos(State)」逐项比对。
 * 对应日志任务 2 表格：添加 / 控制台 todos / 完成 / 删除 四行「实际现象」。
 *
 * 用法：npm run verify:ui  （会自己拉起并关闭 Vite dev server）
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = process.cwd();
const OUT = resolve(ROOT, process.argv[2] || '.workbuddy/screenshots/W11');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:5173/';

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
const settle = () => new Promise((done) => setTimeout(done, 200));

async function waitForServer(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return true;
    } catch {
      // dev server 还没起来
    }
    await new Promise((done) => setTimeout(done, 300));
  }
  return false;
}

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
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const stateLogs = [];
  page.on('console', (message) => {
    const text = message.text();
    if (text.startsWith('[todos] ')) stateLogs.push(text.slice('[todos] '.length));
  });

  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  const snapshot = () =>
    page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.todo-list .todo-item')).map((li) => ({
        text: li.querySelector('.todo-item__text')?.textContent ?? '',
        done: li.classList.contains('done'),
      }));
      return {
        rows,
        input: document.querySelector('#todo-input')?.value ?? '',
        status: document.querySelector('#todo-status')?.textContent?.trim() ?? '',
      };
    });
  const latestState = () => JSON.parse(stateLogs[stateLogs.length - 1] ?? '[]');

  say('轨道 B：真实浏览器 UI 行为验证（Chrome headless + Vite dev server）');
  say('页面：' + BASE);
  say('');

  // ① 输入「任务A」并添加
  const initial = await snapshot();
  check(initial.rows.length === 0, '初始列表为空', `实际 ${initial.rows.length} 项`);

  await page.type('#todo-input', '任务A');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.querySelectorAll('.todo-list .todo-item').length === 1);
  await settle();

  const afterAdd = await snapshot();
  check(afterAdd.input === '', '添加后输入框清空', `value="${afterAdd.input}"`);
  check(
    afterAdd.rows.length === 1 && afterAdd.rows[0].text === '任务A',
    '列表多一项「任务A」',
    JSON.stringify(afterAdd.rows),
  );
  check(afterAdd.status.includes('共 1 项'), '状态统计由 State 算出', afterAdd.status);

  // ② 控制台打印 todos，与页面列表比对
  const stateAfterAdd = latestState();
  check(stateLogs.length > 0, '控制台打印了 [todos]', `共 ${stateLogs.length} 条日志`);
  check(
    stateAfterAdd.length === afterAdd.rows.length &&
      stateAfterAdd[0]?.text === afterAdd.rows[0].text,
    'State 数组内容与页面列表一致',
    `State=${JSON.stringify(stateAfterAdd)} / DOM=${JSON.stringify(afterAdd.rows)}`,
  );

  // 再加一条，方便验证「只删一条」
  await page.type('#todo-input', '任务B');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.querySelectorAll('.todo-list .todo-item').length === 2);
  await settle();

  // ③ 点任务A 的「完成」
  let items = await page.$$('.todo-list .todo-item');
  const toggleBtn = await items[0].$('.todo-item__toggle');
  await toggleBtn.click();
  await page.waitForFunction(
    () => document.querySelectorAll('.todo-list .todo-item.done').length === 1,
  );
  await settle();

  const afterToggle = await snapshot();
  check(
    afterToggle.rows[0].done === true,
    '点「完成」后文字出现删除线样式（.done）',
    JSON.stringify(afterToggle.rows),
  );
  const stateAfterToggle = latestState();
  check(
    stateAfterToggle.find((todo) => todo.text === '任务A')?.completed === true,
    'State 里任务A 的 completed 同步变 true',
    JSON.stringify(stateAfterToggle),
  );
  check(afterToggle.status.includes('已完成 1 项'), '统计文字与 State 一致', afterToggle.status);

  await page.screenshot({ path: resolve(OUT, 'ui-1-react-todo.png'), fullPage: true });
  say('已截图 ui-1-react-todo.png（2 项，任务A 已完成，状态统计同步）');

  // ④ 点任务A 的「删除」
  items = await page.$$('.todo-list .todo-item');
  const deleteBtn = await items[0].$('.todo-item__delete');
  await deleteBtn.click();
  await page.waitForFunction(() => document.querySelectorAll('.todo-list .todo-item').length === 1);
  await settle();

  const afterDelete = await snapshot();
  check(
    afterDelete.rows.length === 1 && afterDelete.rows[0].text === '任务B',
    '列表少一项，且只少任务A',
    JSON.stringify(afterDelete.rows),
  );
  const stateAfterDelete = latestState();
  check(
    stateAfterDelete.length === 1 && stateAfterDelete[0].text === '任务B',
    '控制台 State 数组同步少一项',
    JSON.stringify(stateAfterDelete),
  );
  await page.screenshot({ path: resolve(OUT, 'ui-2-after-delete.png'), fullPage: true });
  say('已截图 ui-2-after-delete.png（删除后仅剩任务B）');

  // ⑤ 业务规则回归：纯空格不能添加
  await page.type('#todo-input', '   ');
  await page.click('button[type="submit"]');
  await settle();
  const afterBlank = await snapshot();
  check(
    afterBlank.rows.length === 1,
    '纯空格输入不入库（W9 规则仍在）',
    `列表 ${afterBlank.rows.length} 项`,
  );

  // ⑥ 触发一次无关 State 更新（切筛选），确认没有手插 DOM 残留 / 重复节点
  await page.click('.todo-app__filters button:nth-child(2)');
  await settle();
  const afterFilter = await snapshot();
  check(
    afterFilter.rows.length === 1,
    '切换筛选后 UI 仍完全由 State 渲染，无重复或残留节点',
    JSON.stringify(afterFilter.rows),
  );

  say('');
  say(`结果：${failures.length === 0 ? '全部通过' : `${failures.length} 项失败`}`);
} catch (error) {
  say('× 验证脚本异常：' + (error instanceof Error ? error.message : String(error)));
  failures.push('脚本异常');
} finally {
  if (browser) await browser.close();
  server.kill();
  writeFileSync(resolve(OUT, 'ui-verify.txt'), lines.join('\n') + '\n', 'utf8');
  console.log('已写出 ' + resolve(OUT, 'ui-verify.txt'));
  if (failures.length > 0) process.exitCode = 1;
}
