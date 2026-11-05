/**
 * todo.review.test.ts —— 任务 3 的「修补方案」
 *
 * 这是审查完 AI 生成的测试之后，手写修正 + 补齐遗漏维度的版本。
 * 每一条上方都标了对应的测试维度，方便对照 9 维度查漏。
 *
 * 相对 AI 原稿改了三处：
 *   ① 弱断言 toBeDefined() → 断言到具体文本
 *   ② 「拒绝空字符串」的期望值写反（toBe(1)）→ 改回 toBe(0)
 *   ③ 补齐 AI 漏掉的维度：空值 null、类型、格式（超长文本）、重复、状态
 */

import { test, expect } from 'vitest';
import { addTodo, toggleTodo, type Todo } from '../src/todo';

// 维度2（格式）：正常文本 —— 换掉原来的弱断言
test('维度2（格式）：正常添加，断言到具体文本而不是 toBeDefined', () => {
  const todos: Todo[] = [];

  addTodo(todos, '学习TS');

  expect(todos.length).toBe(1);
  expect(todos[0].text).toBe('学习TS');      // 原稿写 toBeDefined()：实现把文本存成空串也照样绿
  expect(todos[0].completed).toBe(false);
});

// 维度2（格式）：纯空格
test('维度2（格式）：纯空格被拦截', () => {
  const todos: Todo[] = [];

  addTodo(todos, '   ');

  expect(todos.length).toBe(0);
});

// 维度2（格式）：空字符串 —— 纠正被写反的期望值
test('维度2（格式）：空字符串被拦截（期望值是 0，不是 1）', () => {
  const todos: Todo[] = [];

  addTodo(todos, '');

  expect(todos.length).toBe(0);              // 原稿写 toBe(1)：把「没拦住」当成了预期结果
});

// 维度1（空值）：null —— AI 完全漏掉
test('维度1（空值）：null 应被拦截且不崩溃', () => {
  const todos: Todo[] = [];

  // 仅在此处模拟「外部传进来的脏数据」；业务代码 todo.ts 里没有任何 any / as / !
  addTodo(todos, null as unknown as string);

  expect(todos.length).toBe(0);
});

// 维度1（空值）：undefined
test('维度1（空值）：undefined 应被拦截且不崩溃', () => {
  const todos: Todo[] = [];

  addTodo(todos, undefined as unknown as string);

  expect(todos.length).toBe(0);
});

// 维度3（类型）：传进来的不是字符串
test('维度3（类型）：数字应被拦截', () => {
  const todos: Todo[] = [];

  addTodo(todos, 123 as unknown as string);

  expect(todos.length).toBe(0);
});

// 维度2（格式拓展）：超长文本 —— 业务不限制长度，应当完整入库
test('维度2（格式拓展）：超长文本按业务约定不拦截，且内容完整', () => {
  const todos: Todo[] = [];
  const longText = '长'.repeat(5000);

  addTodo(todos, longText);

  expect(todos.length).toBe(1);
  expect(todos[0].text.length).toBe(5000);   // 不能被截断
});

// 维度6（重复）：连续添加相同文本 —— 业务允许重复
test('维度6（重复）：相同文本允许重复添加', () => {
  const todos: Todo[] = [];

  addTodo(todos, '买牛奶');
  addTodo(todos, '买牛奶');

  expect(todos.length).toBe(2);
  expect(todos[0].text).toBe(todos[1].text);
  expect(todos[0].id).not.toBe(todos[1].id);  // 两条 id 不能撞号
});

// 维度5（状态）：连续切换两次回到原状态
test('维度5（状态）：连续 toggle 两次回到未完成', () => {
  const todos: Todo[] = [{ id: 1, text: '学习TS', completed: false }];

  toggleTodo(todos, 1);
  expect(todos[0].completed).toBe(true);

  toggleTodo(todos, 1);
  expect(todos[0].completed).toBe(false);
});

// 维度4（越界）：不存在的 ID
test('维度4（越界）：不存在的 ID 不崩溃、不改数据', () => {
  const todos: Todo[] = [{ id: 1, text: '学习TS', completed: false }];

  toggleTodo(todos, 999);

  expect(todos.length).toBe(1);
  expect(todos[0].completed).toBe(false);
});
