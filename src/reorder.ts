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
 * AI 首版：为了「少复制一次数组」直接在入参上 splice。
 * 缺陷：原地修改 todos —— React 里 setTodos(prev => reorderTodos(prev, ...))
 * 拿到的还是同一个引用，Object.is 判定未变，界面不会重渲染。
 */
export function reorderTodos(todos: Todo[], fromId: number, toId: number): Todo[] {
  const from = todos.findIndex((todo) => todo.id === fromId);
  const to = todos.findIndex((todo) => todo.id === toId);
  if (from === -1 || to === -1 || from === to) return todos;

  const [moved] = todos.splice(from, 1);
  if (moved === undefined) return todos;
  todos.splice(to, 0, moved);
  return todos;
}
