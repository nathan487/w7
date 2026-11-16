/**
 * search.test.ts —— 功能点 1 单元测试
 *
 * 用例覆盖：正常 / 边界（纯空格、空关键字）/ 异常（脏 JSON、结构错误）。
 * 断言到具体数组内容，不用 toBeDefined 这类弱断言（变异验证才有效）。
 */
import { test, expect } from 'vitest';
import {
  filterTodosByKeyword,
  getViewStats,
  normalizeKeyword,
  parseSearch,
  type Todo,
} from '../src/search';

function sample(): Todo[] {
  return [
    { id: 1, text: '学习 TypeScript', completed: false },
    { id: 2, text: '写实验报告', completed: true },
    { id: 3, text: '复习网络', completed: false },
  ];
}

test('normalizeKeyword：纯空格归并为空串', () => {
  expect(normalizeKeyword('   ')).toBe('');
  expect(normalizeKeyword('  TS  ')).toBe('TS');
});

test('按关键字过滤：命中且大小写不敏感', () => {
  const result = filterTodosByKeyword(sample(), 'TYPE');
  expect(result.map((t) => t.id)).toEqual([1]);
});

test('纯空格关键字：视为不过滤，返回完整视图（AI 首版会清空 → 应为红）', () => {
  const result = filterTodosByKeyword(sample(), '   ');
  expect(result.length).toBe(3);
});

test('空关键字：返回全部', () => {
  expect(filterTodosByKeyword(sample(), '').length).toBe(3);
});

test('不影响 todos 本身：过滤后原数组长度不变', () => {
  const todos = sample();
  filterTodosByKeyword(todos, '网络');
  expect(todos.length).toBe(3);
});

test('统计：视图 1 条 / 总计 3 条', () => {
  const todos = sample();
  const shown = filterTodosByKeyword(todos, '网络');
  expect(getViewStats(todos, shown)).toEqual({ shown: 1, total: 3 });
});

test('parseSearch：脏 JSON / 结构错误一律回退空串', () => {
  expect(parseSearch('not json').keyword).toBe('');
  expect(parseSearch('{"foo":1}').keyword).toBe('');
  expect(parseSearch('{"keyword":123}').keyword).toBe('');
  expect(parseSearch('{"keyword":"  TS  "}').keyword).toBe('TS');
});
