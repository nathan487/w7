/**
 * 审查靶子：功能点 1 第一轮 AI 原始输出（只给功能要求，无工程化约束）。
 * 保留在 materials/ 仅在报告中做 diff 对照，不参与构建与测试。
 */
import type { Todo } from '../src/todo';

// AI 首版：直接拿 keyword 小写化，省掉了 trim/归一化
// 缺陷：keyword='   '（纯空格）时 needle 非空，includes 全部落空 → 视图被清空
export function filterTodosByKeywordAiFirst(todos: Todo[], keyword: string): Todo[] {
  const needle = keyword.toLocaleLowerCase();
  if (needle === '') return todos.slice();
  return todos.filter((todo) => todo.text.toLocaleLowerCase().includes(needle));
}
