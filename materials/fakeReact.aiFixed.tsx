/**
 * 材料：AI 第一轮「局部修复版」（审查对象）。
 *
 * AI 修好了被点名的两条：
 *   - 不再就地 push 后把同一引用交给 setTodos → 改成 setTodos(prev => [...prev, newTodo])
 *   - toggle 不再就地改 t.completed → 改成 map + { ...t } 新对象
 *
 * 但按课件 S27「局部正确 ≠ 架构正确」，它留下了没被点名的两条：
 *   ① document.getElementById + innerHTML += 的手动 DOM 残留（最严重）
 *      → 同一次添加会让页面出现两行：React 渲染一行 + 手插一行；
 *        再触发一次无关 State 更新，React 重渲染后手插的那行可能被覆盖/错位。
 *   ② newTodo 用的是原始 text，没有 trim → 输入「  任务A  」会把前后空格存进 State，
 *      破坏 W9 就定下的业务规则。
 *
 * 结论：这份代码不能用。最终版见 src/components/TodoApp.tsx + src/todoState.ts。
 */
function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');

  function handleAdd() {
    if (text.trim() === '') return;
    const newTodo = { id: Date.now(), text, completed: false };
    setTodos(prev => [...prev, newTodo]);

    const listEl = document.getElementById('todo-list');
    if (listEl) {
      listEl.innerHTML += `<li>${newTodo.text}</li>`;
    }
    setText('');
  }

  function handleToggle(id) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleAdd}>添加</button>
      <ul id="todo-list">
        {todos.map(todo => (
          <li key={todo.id} onClick={() => handleToggle(todo.id)}>
            {todo.text} {todo.completed ? '✔' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
