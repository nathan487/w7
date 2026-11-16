/**
 * 审查靶子：功能点 2 第一轮 AI 原始输出（只给功能要求，无工程化约束）。
 * 保留在 materials/ 仅在报告中做 diff 对照，不参与构建与测试。
 */
import type { Todo } from '../src/todo';

// AI 首版：直接在入参上 splice，「省一次数组拷贝」
// 缺陷：原地修改 todos；React setTodos(prev => ...) 拿到同一引用，界面不重渲染
export function reorderTodosAiFirst(todos: Todo[], fromId: number, toId: number): Todo[] {
  const from = todos.findIndex((todo) => todo.id === fromId);
  const to = todos.findIndex((todo) => todo.id === toId);
  if (from === -1 || to === -1 || from === to) return todos;
  const [moved] = todos.splice(from, 1);
  if (moved === undefined) return todos;
  todos.splice(to, 0, moved);
  return todos;
}
