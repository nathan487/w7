/**
 * TodoList —— 只负责「渲染列表」。
 * todos 是 Props，只读；点击时调用父组件传下来的回调，不把事件对象传上去（课件 S12）。
 */
import type { Todo } from '../todo';
import { TodoItem } from './TodoItem';

export interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export function TodoList({ todos, onToggle, onDelete, onEdit }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="todo-app__empty">当前筛选下没有待办事项。</p>;
  }

  return (
    <ul className="todo-list" aria-label="待办事项列表">
      {todos.map((todo) => (
        // key 给的是身份，不是顺序：用稳定的 todo.id，不用数组下标（课件 S17）
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}
