/**
 * todoState.test.ts —— 轨道 A 回归：React 迁移后业务逻辑与不可变性都没坏
 *
 * 重点不是「函数能跑」，而是「给 React 的必须是新引用，且被改的那一项也是新对象」。
 */
import { test, expect } from 'vitest';
import type { Todo } from '../src/todo';
import {
  addTodoState,
  clearCompletedState,
  removeTodoState,
  toggleTodoState,
  updateTodoState,
} from '../src/todoState';

function seed(): Todo[] {
  return [
    { id: 1, text: '任务A', completed: false },
    { id: 2, text: '任务B', completed: true },
  ];
}

test('addTodoState：返回新数组，原数组与原元素都不被就地改', () => {
  const before = seed();
  const next = addTodoState(before, '任务C');

  expect(next).not.toBe(before);
  expect(before).toHaveLength(2);
  expect(before[0]).toEqual({ id: 1, text: '任务A', completed: false });
  expect(next).toHaveLength(3);
  expect(next[2].text).toBe('任务C');
  expect(next[2].completed).toBe(false);
});

test('addTodoState：W9 的 trim 与纯空格拦截规则仍然成立', () => {
  expect(addTodoState([], '  任务A  ')[0].text).toBe('任务A');
  expect(addTodoState([], '   ')).toHaveLength(0);
  expect(addTodoState([], '')).toHaveLength(0);
});

test('toggleTodoState：新数组 + 新对象，旧 State 的 completed 不变', () => {
  const before = seed();
  const next = toggleTodoState(before, 1);

  expect(next).not.toBe(before);
  expect(next[0]).not.toBe(before[0]);
  expect(next[0].completed).toBe(true);
  expect(before[0].completed).toBe(false);
});

test('toggleTodoState：不存在的 id 不崩溃、内容不变', () => {
  const before = seed();
  const next = toggleTodoState(before, 999);

  expect(next.map((todo) => todo.completed)).toEqual([false, true]);
  expect(before[0].completed).toBe(false);
});

test('removeTodoState / clearCompletedState：都造新引用', () => {
  const before = seed();

  const removed = removeTodoState(before, 1);
  expect(removed).not.toBe(before);
  expect(removed.map((todo) => todo.text)).toEqual(['任务B']);
  expect(before).toHaveLength(2);

  const cleared = clearCompletedState(before);
  expect(cleared.map((todo) => todo.text)).toEqual(['任务A']);
  expect(before).toHaveLength(2);
});

test('updateTodoState：空输入不改动，正常输入改的是副本', () => {
  const before = seed();

  expect(updateTodoState(before, 1, '   ').map((todo) => todo.text)).toEqual(['任务A', '任务B']);
  const next = updateTodoState(before, 1, '  任务A2  ');
  expect(next[0].text).toBe('任务A2');
  expect(before[0].text).toBe('任务A');
});

test('连续更新对照：函数式 prev => 不互相覆盖，旧快照会只剩最后一个（课件 S24/S25）', () => {
  const base: Todo[] = [];

  // React 更新队列：前一次的返回值作为下一次的输入
  const queuedFirst = addTodoState(base, '任务A');
  const queuedSecond = addTodoState(queuedFirst, '任务B');
  expect(queuedSecond.map((todo) => todo.text)).toEqual(['任务A', '任务B']);

  // 反例：两次都基于「本次渲染的旧快照」，后者覆盖前者
  const badFirst = addTodoState(base, '任务A');
  const badSecond = addTodoState(base, '任务B');
  expect(badFirst).toHaveLength(1);
  expect(badSecond.map((todo) => todo.text)).toEqual(['任务B']);
});
