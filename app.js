const todoInput = document.querySelector('#todo-input');
const addButton = document.querySelector('#add-btn');
const todoList = document.querySelector('#todo-list');
const todoStatus = document.querySelector('#todo-status');

if (todoInput && addButton && todoList && todoStatus) {
  const addTodo = () => {
    const text = todoInput.value.trim();

    if (text === '') {
      todoStatus.textContent = '请输入待办事项后再添加。';
      todoInput.focus();
      return;
    }

    const item = document.createElement('li');
    item.textContent = text;
    todoList.appendChild(item);

    todoInput.value = '';
    todoStatus.textContent = `已添加：${text}`;
    todoInput.focus();
  };

  addButton.addEventListener('click', addTodo);
}
