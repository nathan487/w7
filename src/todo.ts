/**
 * todo.ts —— 纯逻辑层
 *
 * 这一层不碰 DOM、不碰 localStorage，只负责「数据怎么变」，
 * 所以可以被 Vitest 直接 import 进来做单元测试。
 * DOM 与浏览器存储的部分放在 main.ts。
 *
 * 三条红线：不用 any、不用非空断言 !、不用 as 硬转。
 */

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export type Filter = 'all' | 'active' | 'done';

let lastId = 0;

/** id 单调递增：同一毫秒内连续添加也不会撞号 */
export function createId(): number {
  lastId = Math.max(Date.now(), lastId + 1);
  return lastId;
}

/**
 * 脏数据入口 ①：dataset.id 永远是 string（还可能是 undefined）
 * '123abc' → NaN、'1.5' → 非整数、'' → 0，这三种坏值必须挡住。
 */
export function parseId(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

/** 逐条校验：JSON 解析出来的东西不受控，必须一个字段一个字段确认 */
export function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false;
  if (!('id' in value) || !('text' in value) || !('completed' in value)) return false;

  return (
    typeof value.id === 'number' &&
    typeof value.text === 'string' &&
    typeof value.completed === 'boolean'
  );
}

/** 脏数据入口 ②：localStorage 读出来的是 string | null，解析后不受控 */
export function parseTodos(raw: string | null): Todo[] {
  if (raw === null) return [];

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return []; // 存进去的是坏 JSON：当作没有数据
  }

  if (!Array.isArray(parsed)) return [];

  const rows: unknown[] = parsed;
  return rows.filter(isTodo); // 过滤掉结构不对的脏记录，而不是整份丢掉
}

export function parseFilter(raw: string | undefined): Filter {
  if (raw === 'active' || raw === 'done') return raw;
  return 'all';
}

export function addTodo(todos: Todo[], text: string): void {
  if (typeof text !== 'string') return; // 外部脏数据：null / undefined 不该崩
  const trimmed = text.trim();
  if (trimmed === '') return; // 空串与纯空格都不入库

  todos.push({ id: createId(), text: trimmed, completed: false });
}

export function removeTodo(todos: Todo[], id: number): void {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index !== -1) todos.splice(index, 1);
}

export function toggleTodo(todos: Todo[], id: number): void {
  const target = todos.find((todo) => todo.id === id);
  if (target !== undefined) target.completed = !target.completed;
}

export function updateTodo(todos: Todo[], id: number, text: string): void {
  const trimmed = text.trim();
  if (trimmed === '') return;

  const target = todos.find((todo) => todo.id === id);
  if (target !== undefined) target.text = trimmed;
}

export function clearCompleted(todos: Todo[]): void {
  for (let i = todos.length - 1; i >= 0; i -= 1) {
    if (todos[i].completed) todos.splice(i, 1); // 倒序删，下标不会前移漏删
  }
}

export function getShownTodos(todos: Todo[], filter: Filter): Todo[] {
  return todos.filter((todo) => {
    if (filter === 'done') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });
}

export function countCompleted(todos: Todo[]): number {
  return todos.reduce((count, todo) => count + (todo.completed ? 1 : 0), 0);
}
