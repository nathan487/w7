/**
 * search.ts —— 功能点 1：关键字搜索与实时统计（纯逻辑层）
 *
 * 不碰 DOM、不碰 localStorage，只描述「数据怎么被过滤、怎么统计」，
 * 因此能被 Vitest 直接 import 做单元测试。
 *
 * 三条红线：不用 any、不用非空断言 !、不用 as 硬转。
 */
import type { Todo } from './todo';

/** 搜索条件：keyword 已规范化（trim 过）；空串表示「不过滤」 */
export interface SearchState {
  keyword: string;
}

/** 实时统计：当前视图条数 / 总条数 */
export interface ViewStats {
  shown: number;
  total: number;
}

/** 脏数据入口：localStorage 反序列化出来的是 unknown，逐字段收窄 */
function isSearchState(value: unknown): value is SearchState {
  if (typeof value !== 'object' || value === null) return false;
  if (!('keyword' in value)) return false;
  return typeof value.keyword === 'string';
}

/** 关键字规范化：纯空格归并为空串，避免「看起来搜了其实等于没搜」 */
export function normalizeKeyword(raw: string): string {
  return raw.trim();
}

/** 读搜索条件：坏 JSON / 结构不对 / 非字符串，一律回退空串 */
export function parseSearch(raw: string | null): SearchState {
  if (raw === null) return { keyword: '' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { keyword: '' };
  }

  if (isSearchState(parsed)) return { keyword: normalizeKeyword(parsed.keyword) };
  return { keyword: '' };
}

/**
 * 修复版：先 normalizeKeyword（trim 把纯空格归并为空串），再小写化。
 * 边界防御不省：纯空格等价于「没搜」，返回完整视图而不是把列表清空。
 */
export function filterTodosByKeyword(todos: Todo[], keyword: string): Todo[] {
  const needle = normalizeKeyword(keyword).toLocaleLowerCase();
  if (needle === '') return todos.slice();
  return todos.filter((todo) => todo.text.toLocaleLowerCase().includes(needle));
}

/** 统计只数长度，不读 DOM：shown 来自过滤后的视图，total 来自完整 todos */
export function getViewStats(todos: Todo[], shown: Todo[]): ViewStats {
  return { shown: shown.length, total: todos.length };
}
