/**
 * main.ts —— DOM 与浏览器存储层
 *
 * 只负责「把数据画出来」和「把用户的点击翻译成对 todo.ts 的调用」，
 * 数据的变化规则一律交给 todo.ts，这样那部分才能被单元测试覆盖。
 */

import './style.css';
import { API_BASE, apiUrl } from './api';

import {
  addTodo,
  clearCompleted,
  countCompleted,
  getShownTodos,
  type Filter,
  type Todo,
  parseFilter,
  parseId,
  parseTodos,
  removeTodo,
  toggleTodo,
  updateTodo,
} from './todo';

const KEY = 'todo-v2-items';

const list = document.querySelector<HTMLUListElement>('#todo-list');
const input = document.querySelector<HTMLInputElement>('#todo-input');
const addBtn = document.querySelector<HTMLButtonElement>('#add-btn');
const status = document.querySelector<HTMLParagraphElement>('#todo-status');
const filterButtons = document.querySelectorAll<HTMLButtonElement>('.filter-btn');

let todos: Todo[] = parseTodos(localStorage.getItem(KEY));
let filter: Filter = 'all';

function save(): void {
  localStorage.setItem(KEY, JSON.stringify(todos));
}

function render(): void {
  if (list === null || status === null) return;

  list.replaceChildren();

  getShownTodos(todos, filter).forEach((todo) => {
    const item = document.createElement('li');
    const text = document.createElement('span');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    item.className = 'todo-item';
    item.dataset.id = String(todo.id); // id 写进 DOM，点击时靠它反查
    text.className = 'todo-item__text';
    text.textContent = todo.text;

    editButton.className = 'todo-item__edit';
    editButton.type = 'button';
    editButton.textContent = '编辑';
    editButton.dataset.action = 'edit';
    editButton.setAttribute('aria-label', `编辑：${todo.text}`);

    deleteButton.className = 'todo-item__delete';
    deleteButton.type = 'button';
    deleteButton.textContent = '删除';
    deleteButton.dataset.action = 'delete';
    deleteButton.setAttribute('aria-label', `删除：${todo.text}`);

    if (todo.completed) item.classList.add('done');

    item.append(text, editButton, deleteButton);
    list.appendChild(item);
  });

  filterButtons.forEach((button) => {
    button.classList.toggle('is-active', parseFilter(button.dataset.filter) === filter);
  });

  status.textContent = `共 ${todos.length} 项，已完成 ${countCompleted(todos)} 项。`;
}

type ListAction = 'delete' | 'edit' | 'toggle';

/** 从点击目标反查「要做什么」，抽成函数后 handleListClick 的复杂度降到阈值内 */
function detectAction(target: Element, item: Element): ListAction {
  const deleteBtn = target.closest('[data-action="delete"]');
  if (deleteBtn !== null && item.contains(deleteBtn)) return 'delete';

  const editBtn = target.closest('[data-action="edit"]');
  if (editBtn !== null && item.contains(editBtn)) return 'edit';

  return 'toggle';
}

/** 返回 false 表示用户点了取消：不保存、也不重画 */
function applyEdit(id: number): boolean {
  const current = todos.find((todo) => todo.id === id);
  const next = window.prompt('修改任务', current !== undefined ? current.text : '');

  if (next === null) return false;
  console.log('[edit]', id, next);
  updateTodo(todos, id, next);
  return true;
}

/** 事件委托：监听器只绑一次，绑在不被重画的父容器 ul 上 */
function handleListClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return; // 防御 ①：target 不是元素

  const item = target.closest('li');
  if (item === null || list === null || !list.contains(item)) return; // 防御 ②：closest 可能为 null

  const id = parseId(item.dataset.id); // 防御 ③：Number() + isSafeInteger
  if (id === null) return;

  const action = detectAction(target, item);
  if (action === 'delete') {
    console.log('[delete]', id);
    removeTodo(todos, id);
  } else if (action === 'edit') {
    if (!applyEdit(id)) return;
  } else {
    console.log('[toggle]', id);
    toggleTodo(todos, id);
  }

  save();
  render();
}

if (
  list !== null &&
  input !== null &&
  addBtn !== null &&
  status !== null &&
  filterButtons.length > 0
) {
  addBtn.addEventListener('click', () => {
    const text = input.value.trim();

    if (text === '') {
      status.textContent = '请输入待办事项后再添加。';
      input.focus();
      return;
    }

    addTodo(todos, text); // 改数据
    save(); // 保存
    render(); // 重渲染
    console.log('[add]', text);

    input.value = '';
    input.focus();
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filter = parseFilter(button.dataset.filter); // 视图状态，不写 localStorage
      render();
    });
  });

  list.addEventListener('click', handleListClick);

  // 清掉所有已完成项：控制台里可直接调用
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.altKey && event.key === 'c') {
      clearCompleted(todos);
      save();
      render();
    }
  });

  // 环境边界验收：地址来自 .env，业务代码里没有硬编码的 http://localhost:8080
  console.log('[config] API base =', API_BASE, '| dev 请求', apiUrl('/todos'));

  render();
}
