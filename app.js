const KEY = 'todo-v2-items';
const list = document.querySelector('#todo-list');
const input = document.querySelector('#todo-input');
const addBtn = document.querySelector('#add-btn');
const status = document.querySelector('#todo-status');
const filterButtons = document.querySelectorAll('.filter-btn');

let todos = load();
let filter = 'all';
let lastId = 0;

// 同一毫秒内连续添加时 Date.now() 会重复，用「取较大值 +1」保证 id 单调递增且唯一
function createId() {
  lastId = Math.max(Date.now(), lastId + 1);
  return lastId;
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(todos));
}

function load() {
  const raw = localStorage.getItem(KEY);

  if (raw === null) return [];

  try {
    const savedTodos = JSON.parse(raw);
    return Array.isArray(savedTodos) ? savedTodos : [];
  } catch {
    return [];
  }
}

function addTodo(text) {
  todos = [...todos, { id: createId(), text, completed: false }];
  save();
  render();
}

function removeTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  save();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) => (
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  ));
  save();
  render();
}

function updateTodo(id, text) {
  todos = todos.map((todo) => (
    todo.id === id ? { ...todo, text } : todo
  ));
  save();
  render();
}

function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  save();
  render();
}

function setFilter(nextFilter) {
  filter = nextFilter;
  render();
}

function getShownTodos() {
  return todos.filter((todo) => {
    if (filter === 'done') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });
}

function render() {
  list.replaceChildren();

  getShownTodos().forEach((todo) => {
    const item = document.createElement('li');
    const text = document.createElement('span');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    item.className = 'todo-item';
    item.dataset.id = todo.id;             // ① id 写进 DOM，点击时靠它反查是哪一条
    text.className = 'todo-item__text';
    text.textContent = todo.text;
    editButton.className = 'todo-item__edit';
    editButton.type = 'button';
    editButton.textContent = '编辑';
    editButton.dataset.action = 'edit';      // ③ 编辑操作
    editButton.setAttribute('aria-label', `编辑：${todo.text}`);

    deleteButton.className = 'todo-item__delete';
    deleteButton.type = 'button';
    deleteButton.textContent = '删除';
    deleteButton.dataset.action = 'delete';   // ② 标记操作类型
    deleteButton.setAttribute('aria-label', `删除：${todo.text}`);

    if (todo.completed) item.classList.add('done');

    item.append(text, editButton, deleteButton);
    list.appendChild(item);
  });

  filterButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.filter === filter);
  });

  const completedCount = todos.reduce(
    (count, todo) => count + (todo.completed ? 1 : 0),
    0,
  );
  status.textContent = `共 ${todos.length} 项，已完成 ${completedCount} 项。`;
}

if (list && input && addBtn && status && filterButtons.length > 0) {
  addBtn.addEventListener('click', () => {
    const text = input.value.trim();

    if (text === '') {
      status.textContent = '请输入待办事项后再添加。';
      input.focus();
      return;
    }

    addTodo(text);
    input.value = '';
    input.focus();
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });

  // 事件委托：监听器只绑一次，绑在不被重画的父容器 ul 上，靠 e.target 定位被点的那一条
  list.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;   // 防御 1：target 不是元素
    const item = event.target.closest('li');
    if (!item || !list.contains(item)) return;        // 防御 2：closest 可能是 null
    const id = Number(item.dataset.id);               // dataset 取出来是字符串，转回数字才能和数据里的 id 对上
    if (!id) return;                                  // 防御 3：id 为空/非法

    const editBtn = event.target.closest('[data-action="edit"]');
    const deleteBtn = event.target.closest('[data-action="delete"]');

    if (deleteBtn && item.contains(deleteBtn)) {
      removeTodo(id);
    } else if (editBtn && item.contains(editBtn)) {
      const current = todos.find((todo) => todo.id === id);
      const next = window.prompt('修改任务', current ? current.text : '');

      // 边界：点取消（null）或 trim() 后为空都不改数据
      if (next !== null && next.trim() !== '') updateTodo(id, next.trim());
    } else {
      toggleTodo(id);   // 删除、编辑、切换三者互斥
    }
  });

  render();
}
