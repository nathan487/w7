/**
 * reorder.test.ts —— 功能点 2 单元测试
 *
 * 关键是不可变断言：调用后原数组必须原封不动（AI 首版原地 splice → 应为红）。
 * 变异验证：把实现改回原地 splice，这两条断言必须立刻变红。
 */
import { test, expect } from 'vitest';
import { parseDragId, reorderTodos, type Todo } from '../src/reorder';

function sample(): Todo[] {
  return [
    { id: 1, text: 'A', completed: false },
    { id: 2, text: 'B', completed: false },
    { id: 3, text: 'C', completed: false },
  ];
}

test('正常：把第 1 项拖到第 3 项位置', () => {
  const result = reorderTodos(sample(), 1, 3);
  expect(result.map((t) => t.id)).toEqual([2, 3, 1]);
});

test('不可变：原数组顺序与内容都不被修改（AI 首版会改 → 应为红）', () => {
  const todos = sample();
  reorderTodos(todos, 1, 3);
  expect(todos.map((t) => t.id)).toEqual([1, 2, 3]);
});

test('不可变：返回的是新数组，不是入参本身（AI 首版会返回原引用 → 应为红）', () => {
  const todos = sample();
  const result = reorderTodos(todos, 1, 3);
  expect(result).not.toBe(todos);
});

test('边界：相同 id / 不存在 id 都原样返回', () => {
  const todos = sample();
  expect(reorderTodos(todos, 2, 2).map((t) => t.id)).toEqual([1, 2, 3]);
  expect(reorderTodos(todos, 99, 1).map((t) => t.id)).toEqual([1, 2, 3]);
});

test('parseDragId：合法 id / 空串 / 小数 / 非数字', () => {
  expect(parseDragId('123')).toBe(123);
  expect(parseDragId(undefined)).toBeNull();
  expect(parseDragId('')).toBeNull();
  expect(parseDragId('1.5')).toBeNull();
  expect(parseDragId('abc')).toBeNull();
});
