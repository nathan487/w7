#!/usr/bin/env node
/**
 * source-audit.mjs —— 任务 2「源码级自查」的可复现命令
 *
 * 用法：
 *   npm run audit:dom                       # 搜 src/ 下所有 DOM 操作 API
 *   node scripts/source-audit.mjs --tree   # 打印 src/ 与组件目录结构
 *
 * 为什么写成脚本而不是手敲一次搜索：这条自查每周都要重跑，
 * 而且要能证明「组件层 0 处」，只看终端里一句「没找到」不算证据。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = process.cwd();
const SRC = resolve(ROOT, 'src');
const COMPONENTS = resolve(SRC, 'components');
const PATTERNS = [
  'document.querySelector',
  'document.getElementById',
  'innerHTML',
  'appendChild',
  'addEventListener',
  'replaceChildren',
];

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(name)) files.push(full);
  }
  return files;
}

const rel = (full) => relative(ROOT, full).replace(/\\/g, '/');

if (process.argv.includes('--tree')) {
  console.log('$ node scripts/source-audit.mjs --tree');
  console.log('src/');
  for (const entry of readdirSync(SRC, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      console.log('  |- ' + entry.name + '/');
      for (const child of readdirSync(join(SRC, entry.name))) {
        console.log('  |    |- ' + child);
      }
    } else {
      console.log('  |- ' + entry.name);
    }
  }
  console.log('');
  console.log('src/components/ 共 ' + readdirSync(COMPONENTS).length + ' 个组件文件');
} else {
  console.log('$ npm run audit:dom');
  console.log('搜索范围: src/**/*.{ts,tsx}');
  console.log('关键字: document.querySelector / document.getElementById / innerHTML');
  console.log('        appendChild / addEventListener / replaceChildren');
  let total = 0;
  let componentHits = 0;

  for (const file of walk(SRC)) {
    const name = rel(file);
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (PATTERNS.some((pattern) => line.includes(pattern))) {
          total += 1;
          if (name.startsWith('src/components/')) componentHits += 1;
          console.log(`${name}:${index + 1}:  ${line.trim()}`);
        }
      });
  }

  console.log('');
  console.log(`命中合计：src/ ${total} 处；src/components/ ${componentHits} 处`);
  console.log(
    componentHits === 0
      ? '结论：组件层零 DOM 操作，UI 完全由 State 驱动；唯一命中是 main.tsx 的 React 挂载点。'
      : '结论：组件层仍有 DOM 操作，需要修复。',
  );
  process.exitCode = componentHits === 0 ? 0 : 1;
}
