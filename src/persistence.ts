/**
 * persistence.ts —— localStorage 的唯一入口（W12 任务 2 / 任务 3）
 *
 * 设计要点：
 *  - storage 可注入：Vitest 跑在 Node 里没有 localStorage，用内存桩即可直接测。
 *  - createInitialTodos(store) 返回「惰性初始化函数」交给 useState：
 *    首次渲染就读一次，读取不放在 Effect 里 —— 这是避开双 Effect 覆盖的关键（课件 S26）。
 *  - loadTodos 的 try-catch / Array.isArray / 逐条字段校验都委托给 todo.ts 的 parseTodos。
 *  - saveTodos 只做一件事：写。调用方 Effect 必须把 todos 写进依赖数组。
 */

import { parseTodos, type Todo } from './todo';

export const TODOS_KEY = 'todo-v2-items';
export const THEME_KEY = 'todo-v2-theme';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** 惰性初始化：把读取包成函数，useState 只在首次挂载调用它一次 */
export function createInitialTodos(store: StorageLike): () => Todo[] {
  return () => parseTodos(store.getItem(TODOS_KEY));
}

/** 安全读取：非法 JSON / 非数组 / 结构不对的脏记录都挡在 parseTodos 里 */
export function loadTodos(store: StorageLike): Todo[] {
  return parseTodos(store.getItem(TODOS_KEY));
}

/** 单 Effect 写入：依赖 todos，todos 变才写 */
export function saveTodos(store: StorageLike, todos: Todo[]): void {
  store.setItem(TODOS_KEY, JSON.stringify(todos));
}

export type Theme = 'light' | 'dark';

/** 主题也走惰性初始化；只认 'dark'，其余一律当 light */
export function loadTheme(store: StorageLike): Theme {
  return store.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function saveTheme(store: StorageLike, theme: Theme): void {
  store.setItem(THEME_KEY, theme);
}
