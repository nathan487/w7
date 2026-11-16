/**
 * TodoList —— 只负责「渲染列表 + 事件委托处理拖拽」。
 *
 * todos 是 Props，只读；拖拽事件委托挂在 ul 上（不在每行绑监听器）：
 * 拖起时记录 id，放下时用 e.target.closest('li') 找到目标行，
 * 两处都走 parseDragId 做空值/非法值防御，非法就当没发生。
 */
import { useRef, type DragEvent } from 'react';
import { parseDragId } from '../reorder';
import type { Todo } from '../todo';
import { TodoItem } from './TodoItem';

export interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onReorder: (fromId: number, toId: number) => void;
}

export function TodoList({ todos, onToggle, onDelete, onEdit, onReorder }: TodoListProps) {
  const draggingId = useRef<number | null>(null);

  /** 事件委托：在 ul 上抓住所有子行的 dragstart/dragover/drop */
  function handleDragStart(event: DragEvent<HTMLUListElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const row = target.closest('li[data-id]');
    draggingId.current =
      row === null ? null : parseDragId(row.getAttribute('data-id') ?? undefined);
  }

  function handleDragOver(event: DragEvent<HTMLUListElement>) {
    if (draggingId.current !== null) event.preventDefault(); // 允许放下
  }

  function handleDrop(event: DragEvent<HTMLUListElement>) {
    event.preventDefault();
    const target = event.target;
    if (!(target instanceof Element)) return;

    const row = target.closest('li[data-id]');
    if (row === null) return;

    const toId = parseDragId(row.getAttribute('data-id') ?? undefined);
    const fromId = draggingId.current;
    draggingId.current = null;
    if (fromId === null || toId === null || fromId === toId) return;

    onReorder(fromId, toId);
  }

  if (todos.length === 0) {
    return <p className="todo-app__empty">当前筛选下没有待办事项。</p>;
  }

  return (
    <ul
      className="todo-list"
      aria-label="待办事项列表（可拖动排序）"
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
