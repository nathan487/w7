/**
 * 业务行为测试 —— 「需求的化身」（课件 S31）。
 * ESLint 0 error 的代码照样可能把「纯空白不能添加」这条需求删掉，
 * 只有测试能把「少了什么」变成红字。
 *
 * 数据一律在用例内部新建，避免测试之间互相污染。
 */
import { test, expect } from 'vitest';
import { processTodoAction } from '../src/processTodoAction';
import type { Todo } from '../src/todo';

function empty(): Todo[] {
  return [];
}

test('add：正常文本入库，内容与输入一致', () => {
  const todos = empty();

  processTodoAction(todos, { type: 'add', text: '写实验报告' });

  expect(todos.length).toBe(1);
  expect(todos[0].text).toBe('写实验报告');
  expect(todos[0].completed).toBe(false);
});

test('add：纯空白不能添加（删掉 trim 校验后这条会红）', () => {
  const todos = empty();

  processTodoAction(todos, { type: 'add', text: '   ' });

  expect(todos.length).toBe(0);
});

test('add：空字符串不能添加', () => {
  const todos = empty();

  processTodoAction(todos, { type: 'add', text: '' });

  expect(todos.length).toBe(0);
});

test('add：前后空格应被去掉再入库', () => {
  const todos = empty();

  processTodoAction(todos, { type: 'add', text: '  复习 CORS  ' });

  expect(todos[0].text).toBe('复习 CORS');
});

test('add：删除后再添加，新 id 不能和现存项撞号', () => {
  const todos = empty();

  processTodoAction(todos, { type: 'add', text: '甲' });
  processTodoAction(todos, { type: 'add', text: '乙' });
  processTodoAction(todos, { type: 'remove', id: todos[0].id });
  processTodoAction(todos, { type: 'add', text: '丙' });

  const ids = todos.map((todo) => todo.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('toggle：目标翻转，其他条不受影响', () => {
  const todos: Todo[] = [
    { id: 1, text: '甲', completed: false },
    { id: 2, text: '乙', completed: false },
  ];

  processTodoAction(todos, { type: 'toggle', id: 1 });

  expect(todos[0].completed).toBe(true);
  expect(todos[1].completed).toBe(false);
});

test('toggle：不存在的 id 不崩溃、不改变数组', () => {
  const todos: Todo[] = [{ id: 1, text: '甲', completed: false }];

  processTodoAction(todos, { type: 'toggle', id: 999 });

  expect(todos.length).toBe(1);
  expect(todos[0].completed).toBe(false);
});

test('remove：删掉指定项', () => {
  const todos: Todo[] = [
    { id: 1, text: '甲', completed: false },
    { id: 2, text: '乙', completed: true },
  ];

  processTodoAction(todos, { type: 'remove', id: 1 });

  expect(todos.length).toBe(1);
  expect(todos[0].text).toBe('乙');
});

test('clear：清空数组', () => {
  const todos: Todo[] = [{ id: 1, text: '甲', completed: true }];

  processTodoAction(todos, { type: 'clear' });

  expect(todos.length).toBe(0);
});

test('非法 action：运行时兜底，不改变数组', () => {
  const todos: Todo[] = [{ id: 1, text: '甲', completed: false }];
  const illegal: unknown = { type: 'unknown' };

  processTodoAction(todos, illegal);

  expect(todos.length).toBe(1);
  expect(todos[0].text).toBe('甲');
});
