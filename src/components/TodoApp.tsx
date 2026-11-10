/**
 * TodoApp —— 唯一持有 State 的容器组件（状态归属：恰好够用）
 *
 * UI = f(Props, State)：本组件没有一句 DOM 操作，只描述「这个状态下界面该长什么样」。
 * 数据向下：todos / filter 交给子组件；事件向上：子组件调用 onAdd / onToggle 等回调。
 */
import { useEffect, useState } from 'react';
import { countCompleted, getShownTodos, parseTodos, type Filter, type Todo } from '../todo';
import { addTodoState, removeTodoState, toggleTodoState, updateTodoState } from '../todoState';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';

const STORAGE_KEY = 'todo-v2-items';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'done', label: '已完成' },
];

export default function TodoApp() {
  // 初值只在首次渲染用；localStorage 里的脏数据仍由 W9 的 parseTodos 逐条校验
  const [todos, setTodos] = useState<Todo[]>(() => parseTodos(localStorage.getItem(STORAGE_KEY)));
  const [filter, setFilter] = useState<Filter>('all');

  // 副作用归副作用：State 变化后同步持久化。依赖数组写全 [todos]（课件 S26）。
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // dev 模式下让控制台能读到本次 State，供「状态一致性」双轨验证比对。
  // 生产构建里 import.meta.env.DEV 为 false，这段会被 tree-shake 掉。
  useEffect(() => {
    if (import.meta.env.DEV) console.log('[todos] ' + JSON.stringify(todos));
  }, [todos]);

  /** 一律函数式更新：prev 是更新队列里的上一步结果，不是本次渲染的旧快照 */
  function handleAdd(text: string) {
    setTodos((prev) => addTodoState(prev, text));
  }

  function handleToggle(id: number) {
    setTodos((prev) => toggleTodoState(prev, id));
  }

  function handleDelete(id: number) {
    setTodos((prev) => removeTodoState(prev, id));
  }

  function handleEdit(id: number) {
    const current = todos.find((todo) => todo.id === id);
    const next = window.prompt('修改任务', current !== undefined ? current.text : '');
    if (next === null) return; // 点取消：不改 State
    setTodos((prev) => updateTodoState(prev, id, next));
  }

  const shownTodos = getShownTodos(todos, filter);

  return (
    <main className="todo-app">
      <header className="todo-app__header">
        <p className="todo-app__eyebrow">TODO V4.0 · REACT</p>
        <h1>我的待办事项</h1>
        <p>UI = f(Props, State)：数据变了，界面自己跟着变，全程零 DOM 操作。</p>
      </header>

      <TodoForm onAdd={handleAdd} />

      <p id="todo-status" aria-live="polite">
        共 {todos.length} 项，已完成 {countCompleted(todos)} 项。
      </p>

      <section className="todo-app__tasks" aria-labelledby="task-list-title">
        <div className="todo-app__list-header">
          <h2 id="task-list-title">任务列表</h2>
          <div className="todo-app__filters" aria-label="筛选任务">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={filter === item.value ? 'filter-btn is-active' : 'filter-btn'}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <TodoList
          todos={shownTodos}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </section>
    </main>
  );
}
