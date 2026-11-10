/**
 * TodoItem —— 一行任务，只做「展示 + 把点击翻译成回调」。
 *
 * Props 约束：todo 只读。这里没有 `todo.completed = ...`，也没有
 * `const current = todo; current.completed = true` 这种「const 不等于冻结对象」的坑（课件 S13）。
 */
import type { Todo } from '../todo';

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  return (
    <li className={todo.completed ? 'todo-item done' : 'todo-item'}>
      <span className="todo-item__text">{todo.text}</span>
      <span className="todo-item__actions">
        {/* onClick={fn} 传函数本身；写 onClick={fn()} 会在渲染时就调用（课件 S18） */}
        <button
          type="button"
          className="todo-item__toggle"
          onClick={() => onToggle(todo.id)}
          aria-label={`切换完成状态：${todo.text}`}
        >
          完成
        </button>
        <button
          type="button"
          className="todo-item__edit"
          onClick={() => onEdit(todo.id)}
          aria-label={`编辑：${todo.text}`}
        >
          编辑
        </button>
        <button
          type="button"
          className="todo-item__delete"
          onClick={() => onDelete(todo.id)}
          aria-label={`删除：${todo.text}`}
        >
          删除
        </button>
      </span>
    </li>
  );
}
