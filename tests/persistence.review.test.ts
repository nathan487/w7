/**
 * persistence.review.test.ts —— 任务 3「AI 持久化修复版」三层审查的可运行断言
 *
 * 不是肉眼看代码说「应该没问题」，而是：
 *  ① 源码级断言：靶子的三处隐患、AI 版修了哪条漏了哪条，都写成可重跑的检查；
 *  ② 可运行断言：把 AI 版的读取逻辑拿来喂非法 JSON / 非数组，验证它是否真的安全。
 *
 * 证据链（Git 历史本身）：
 *   - 提交 A：本文件断言「读取非法 JSON 不崩」，被测函数当时指向 AI 版 → 1 failed（红）。
 *   - 提交 B：把被测函数指向 src/persistence.loadTodos（安全版）→ 全绿。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect } from 'vitest';
import { loadTodos } from '../src/persistence';
import type { StorageLike } from '../src/persistence';

const read = (p: string): string => readFileSync(resolve(process.cwd(), p), 'utf8');

// —— 被测函数（提交 A 指向 AI 版复刻，提交 B 指向安全版）——
// 修复后：指向 src/persistence.loadTodos（try-catch + Array.isArray + 逐条校验）
function reviewedLoad(store: StorageLike): unknown[] {
  return loadTodos(store);
}

function memory(seed: string | null): StorageLike {
  let value = seed;
  return {
    getItem: () => value,
    setItem: (_k, v) => {
      value = v;
    },
  };
}

test('靶子：原始代码确实是双 Effect + 无 try-catch + 无 Array.isArray', () => {
  const source = read('materials/persistence.bad.tsx');
  expect(source).toContain('useEffect');
  expect(source).toContain('JSON.parse(saved)');
  expect(source).not.toContain('try {');
  expect(source).not.toContain('Array.isArray(');
});

test('① 依赖审查：AI 版写入 Effect 补上了 [todos] 依赖', () => {
  const source = read('materials/persistence.aiFixed.tsx');
  expect(source).toContain('}, [todos]);');
});

test('② 生命周期审查：AI 版去掉了读取 Effect，双 Effect 覆盖窗口消失', () => {
  const source = read('materials/persistence.aiFixed.tsx');
  const effects = source.match(/useEffect\(/g) ?? [];
  expect(effects).toHaveLength(1); // 只剩写入 Effect
});

test('③ 数据审查：AI 版仍未加 try-catch / Array.isArray（源码证据）', () => {
  const source = read('materials/persistence.aiFixed.tsx');
  expect(source).toContain('JSON.parse(saved) as Todo[]');
  expect(source).not.toContain('try {');
  expect(source).not.toContain('Array.isArray(');
});

test('③ 数据审查（可运行）：读取非法 JSON 不应抛异常', () => {
  expect(() => reviewedLoad(memory('{bad json'))).not.toThrow();
});

test('③ 数据审查（可运行）：非数组 JSON 应得到空数组', () => {
  expect(reviewedLoad(memory('{"id":1}'))).toEqual([]);
});
