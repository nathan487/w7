/**
 * TodoApp —— 唯一持有 State 的容器组件（状态归属：恰好够用）
 *
 * UI = f(Props, State)：本组件没有一句 DOM 操作，只描述「这个状态下界面该长什么样」。
 * 数据向下：todos / filter 交给子组件；事件向上：子组件调用 onAdd / onToggle 等回调。
 */
import { useEffect, useState } from 'react';
import { createInitialTodos, saveTodos } from '../persistence';
import { useTheme } from '../ThemeContext';
import { reorderTodos } from '../reorder';
import { filterTodosByKeyword, getViewStats, parseSearch, type SearchState } from '../search';
import { countCompleted, getShownTodos, type Filter, type Todo } from '../todo';
import { addTodoState, removeTodoState, toggleTodoState, updateTodoState } from '../todoState';
import { ThemeToggle } from './ThemeToggle';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';
import { TodoSearch } from './TodoSearch';

const SEARCH_KEY = 'todo-v2-search';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'done', label: '已完成' },
];

export default function TodoApp() {
  const { theme } = useTheme(); // 消费者①：容器也要按当前主题给根节点换样式

  // W12：惰性初始化收敛到 persistence.createInitialTodos，内部 parseTodos 逐条校验脏数据。
  // 传的是函数本身（不是调用结果），React 只在首次挂载调用一次（课件 S25）。
  const [todos, setTodos] = useState<Todo[]>(createInitialTodos(localStorage));
  const [filter, setFilter] = useState<Filter>('all');
  // 功能点 1：关键字独立 state，不写进 Todo，搜索不污染 todos 本身
  const [search, setSearch] = useState<SearchState>(() =>
    parseSearch(localStorage.getItem(SEARCH_KEY)),
  );

  // 副作用归副作用：State 变化后同步持久化。依赖数组写全（课件 S26/S27）。
  // 只有一个写入 Effect；读取已提前到惰性初始化，不存在双 Effect 覆盖窗口。
  useEffect(() => {
    saveTodos(localStorage, todos);
  }, [todos]);

  // 搜索条件持久化：刷新后关键字仍在（功能点 1 要求）
  useEffect(() => {
    localStorage.setItem(SEARCH_KEY, JSON.stringify(search));
  }, [search]);

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

  // 功能点 2：拖拽重排走不可变纯函数，函数式更新保证拿到上一步结果
  function handleReorder(fromId: number, toId: number) {
    setTodos((prev) => reorderTodos(prev, fromId, toId));
  }

  // 先按状态筛选，再按关键字过滤；关键字只在视图层生效，todos 原样不动
  const filteredTodos = getShownTodos(todos, filter);
  const shownTodos = filterTodosByKeyword(filteredTodos, search.keyword);
  const stats = getViewStats(todos, shownTodos);

  return (
    <main className={`todo-app theme-${theme}`} data-theme={theme}>
      <header className="todo-app__header">
        <div className="todo-app__header-top">
          <div>
            <p className="todo-app__eyebrow">TODO V4.0 · REACT + CONTEXT</p>
            <h1>我的待办事项</h1>
          </div>
          <ThemeToggle />
        </div>
        <p>主题由 Context 跨层级下发；数据由 State 驱动，刷新后仍在。</p>
      </header>

      <TodoForm onAdd={handleAdd} />

      <TodoSearch value={search.keyword} onChange={(keyword) => setSearch({ keyword })} />

      <p id="todo-status" aria-live="polite">
        当前视图 {stats.shown} 条 / 总计 {stats.total} 条；已完成 {countCompleted(todos)} 项。
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
          onReorder={handleReorder}
        />
      </section>
    </main>
  );
}
