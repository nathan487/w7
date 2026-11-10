/**
 * todoState.ts —— React 与 W9 纯逻辑层之间的「不可变适配层」
 *
 * 为什么需要这一层（本周最关键的一个坑）：
 *   W9 课件给的契约是 addTodo(todos, text): void —— 就地 push / splice 修改原数组。
 *   React 判断「State 变没变」用的是 Object.is(旧值, 新值)，比的是引用（课件 S22）。
 *   如果直接写 setTodos(addTodo(todos, text))，返回值是 undefined，
 *   或写成 addTodo(todos, text); setTodos(todos)，数组还是原来那个引用 → 页面一行都不动。
 *
 * 解法：先复制出新数组 + 新对象，再让 W9 的纯函数在副本上就地修改，最后返回新引用。
 * 这样 ① 业务逻辑仍然只有一份（老单测 25 条原样回归通过）
 *      ② React 拿到的是新引用，且被改的那一项也是新对象（课件 S23）
 *      ③ 组件用 setTodos(prev => ...) 函数式更新，连续更新不会互相覆盖（课件 S24/S25）。
 *
 * 纯函数：不碰 DOM、不碰 localStorage、不修改入参。
 */
import { addTodo, clearCompleted, removeTodo, toggleTodo, updateTodo, type Todo } from './todo';

/** 浅拷贝每一项：改某一项时必须连对象一起换，否则父组件 State 会被就地改掉 */
function cloneTodos(todos: Todo[]): Todo[] {
  return todos.map((todo) => ({ ...todo }));
}

export function addTodoState(todos: Todo[], text: string): Todo[] {
  const next = cloneTodos(todos);
  addTodo(next, text); // trim、纯空格拦截等规则仍由 W9 的纯函数负责
  return next;
}

export function removeTodoState(todos: Todo[], id: number): Todo[] {
  const next = cloneTodos(todos);
  removeTodo(next, id);
  return next;
}

export function toggleTodoState(todos: Todo[], id: number): Todo[] {
  const next = cloneTodos(todos);
  toggleTodo(next, id);
  return next;
}

export function updateTodoState(todos: Todo[], id: number, text: string): Todo[] {
  const next = cloneTodos(todos);
  updateTodo(next, id, text);
  return next;
}

export function clearCompletedState(todos: Todo[]): Todo[] {
  const next = cloneTodos(todos);
  clearCompleted(next);
  return next;
}
