import type { Todo } from './todo';

export type TodoAction =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: number }
  | { type: 'remove'; id: number }
  | { type: 'clear' };

export function processTodoAction(todos: Todo[], action: unknown): Todo[] {
  const payload = action as TodoAction; // 用 as 把外部值硬转，运行时仍可能来非法值

  if (payload.type === 'add') {
    if (payload.text != null) {
      // ✗ 原第 19 行 if (payload.text.trim() !== '') { 被删掉了
      todos.push({ id: todos.length + 1, text: payload.text, completed: false });
    }
  } else if (payload.type === 'toggle') {
    const target = todos.find((t) => t.id === payload.id);
    if (target) target.completed = !target.completed;
  } else if (payload.type === 'remove') {
    const index = todos.findIndex((t) => t.id === payload.id);
    if (index !== -1) todos.splice(index, 1);
  } else if (payload.type === 'clear') {
    todos.length = 0;
  }
  return todos;
}
