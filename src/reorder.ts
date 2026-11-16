/**
 * reorder.ts —— 功能点 2：拖拽排序（纯逻辑层）
 *
 * 职责：把「谁拖到谁」翻译成一个新顺序数组，并识别/校验拖拽目标。
 * 不碰 DOM。三条红线：不用 any、不用非空断言 !、不用 as 硬转。
 */
import type { Todo } from './todo';

/** 一次拖拽的语义：把 fromId 那一项移到 toId 的位置 */
export interface DragMove {
  fromId: number;
  toId: number;
}

/**
 * 拖拽目标的 dataset.id 永远是字符串：Number 转换 + 安全整数校验。
 * '' → 0 会被误判成合法 id，所以额外要求 trim 后非空。
 */
export function parseDragId(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === '') return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

/**
 * 修复版：先在副本上操作，绝不原地修改入参。
 * React 里 setTodos(prev => reorderTodos(prev, ...)) 拿到新引用 → Object.is 判定变化 → 重渲染。
 * 即使 from/to 非法也返回一个副本，保证「永远不复用入参引用」这条不变量。
 */
export function reorderTodos(todos: Todo[], fromId: number, toId: number): Todo[] {
  const from = todos.findIndex((todo) => todo.id === fromId);
  const to = todos.findIndex((todo) => todo.id === toId);
  const next = todos.slice();
  if (from === -1 || to === -1 || from === to) return next;

  const [moved] = next.splice(from, 1);
  if (moved === undefined) return next;
  next.splice(to, 0, moved);
  return next;
}
