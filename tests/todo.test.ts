/**
 * todo.test.ts —— 任务 2：手写单测（不依赖 AI）
 *
 * 五条用例对应课件第 10 页的表格：
 *   addTodo    正常添加 / 纯空格 / 空字符串
 *   toggleTodo 正常切换 / 不存在的 ID
 *
 * 两条纪律：
 *   ① 断言到具体值，不写 toBeDefined —— 否则实现把文本存成空串也照样绿。
 *   ② 数据在每个 test 内部新建 —— 写在文件顶层会被下一条用例读到（测试污染）。
 */

import { test, expect } from 'vitest';
import { addTodo, toggleTodo, type Todo } from '../src/todo';

test('addTodo 正常添加：长度 +1，且文本内容等于输入', () => {
  const todos: Todo[] = [];

  addTodo(todos, '学习TS');

  expect(todos.length).toBe(1);
  expect(todos[0].text).toBe('学习TS');
  expect(todos[0].completed).toBe(false);
});

test('addTodo 纯空格：拦截，长度不变', () => {
  const todos: Todo[] = [];

  addTodo(todos, '   ');          // 三个空格：看起来像有内容，trim 之后才是真的空

  expect(todos.length).toBe(0);
});

test('addTodo 空字符串：拦截，长度不变', () => {
  const todos: Todo[] = [];

  addTodo(todos, '');

  expect(todos.length).toBe(0);
});

test('toggleTodo 正常切换：目标那条翻转', () => {
  const todos: Todo[] = [
    { id: 1, text: '学习TS', completed: false },
    { id: 2, text: '写实验报告', completed: false },
  ];

  toggleTodo(todos, 1);

  expect(todos[0].completed).toBe(true);
  expect(todos[1].completed).toBe(false);     // 其他条不受影响
});

test('toggleTodo 不存在的 ID：不崩溃，长度不变', () => {
  const todos: Todo[] = [];

  toggleTodo(todos, 999);

  expect(todos.length).toBe(0);
});
