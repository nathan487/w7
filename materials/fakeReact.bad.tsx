/**
 * 材料：任务 3 发给 AI 的原始「假 React」代码（第11周模板靶子，原样保留）。
 * 故意不补 import / 类型，因为它是对照靶子，不参与编译。
 *
 * 四条范式问题（对照课件 S28 审查清单）：
 *   ① DOM 管理：绕过 React 直接 innerHTML += 插节点
 *   ② 状态管理：listRef 是普通变量，却拿来承载驱动 UI 的数据
 *   ③ 不可变更新：listRef.push + setTodos(同一引用)；toggle 里就地改 t.completed
 *   ④ Props 约束：虽无 Props，但 todos 里的对象被就地改写
 */
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  let listRef = [];

  function handleAdd() {
    if (text.trim() === '') return;
    const newTodo = { id: Date.now(), text, completed: false };
    listRef = todos;
    listRef.push(newTodo);
    setTodos(listRef);
    const listEl = document.getElementById('todo-list');
    if (listEl) {
      listEl.innerHTML += `<li>${newTodo.text}</li>`;
    }
    setText('');
  }

  function handleToggle(id) {
    todos.map(t => {
      if (t.id === id) {
        t.completed = !t.completed;
      }
    });
    setTodos(todos);
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
