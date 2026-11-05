import { createId, type Todo } from './todo';

export type TodoAction =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: number }
  | { type: 'remove'; id: number }
  | { type: 'clear' };

/** unknown 收窄，不用 as 硬转：外部 JS 调用方传来的值一律先验证 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTodoAction(value: unknown): value is TodoAction {
  if (!isRecord(value)) return false;
  if (value.type === 'add') return typeof value.text === 'string';
  if (value.type === 'toggle' || value.type === 'remove') return typeof value.id === 'number';
  return value.type === 'clear';
}

/** 抽成小函数，把复杂度与嵌套降下来；但 trim 校验一行都不能少 */
function addOne(todos: Todo[], text: string): void {
  const trimmed = text.trim();
  if (trimmed === '') return;                 // ← 业务规则：纯空白不能添加
  todos.push({ id: createId(), text: trimmed, completed: false });
}

function toggleOne(todos: Todo[], id: number): void {
  const target = todos.find((todo) => todo.id === id);
  if (target !== undefined) target.completed = !target.completed;
}

function removeOne(todos: Todo[], id: number): void {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index !== -1) todos.splice(index, 1);
}

export function processTodoAction(todos: Todo[], action: unknown): Todo[] {
  // 运行时兜底：类型上已穷尽，外部数据仍可能给非法值；工具管不了，得靠人写。
  if (!isTodoAction(action)) return todos;

  switch (action.type) {
    case 'add':
      addOne(todos, action.text);
      break;
    case 'toggle':
      toggleOne(todos, action.id);
      break;
    case 'remove':
      removeOne(todos, action.id);
      break;
    case 'clear':
      todos.length = 0;
      break;
    default:
      break;
  }
  return todos;
}
