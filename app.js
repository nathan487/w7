"use strict";
(() => {
  // todo.ts
  var lastId = 0;
  function createId() {
    lastId = Math.max(Date.now(), lastId + 1);
    return lastId;
  }
  function parseId(raw) {
    if (raw === void 0) return null;
    const id = Number(raw);
    return Number.isSafeInteger(id) ? id : null;
  }
  function isTodo(value) {
    if (typeof value !== "object" || value === null) return false;
    if (!("id" in value) || !("text" in value) || !("completed" in value)) return false;
    return typeof value.id === "number" && typeof value.text === "string" && typeof value.completed === "boolean";
  }
  function parseTodos(raw) {
    if (raw === null) return [];
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
    if (!Array.isArray(parsed)) return [];
    const rows = parsed;
    return rows.filter(isTodo);
  }
  function parseFilter(raw) {
    if (raw === "active" || raw === "done") return raw;
    return "all";
  }
  function addTodo(todos2, text) {
    if (typeof text !== "string") return;
    const trimmed = text.trim();
    if (trimmed === "") return;
    todos2.push({ id: createId(), text: trimmed, completed: false });
  }
  function removeTodo(todos2, id) {
    const index = todos2.findIndex((todo) => todo.id === id);
    if (index !== -1) todos2.splice(index, 1);
  }
  function toggleTodo(todos2, id) {
    const target = todos2.find((todo) => todo.id === id);
    if (target !== void 0) target.completed = !target.completed;
  }
  function updateTodo(todos2, id, text) {
    const trimmed = text.trim();
    if (trimmed === "") return;
    const target = todos2.find((todo) => todo.id === id);
    if (target !== void 0) target.text = trimmed;
  }
  function clearCompleted(todos2) {
    for (let i = todos2.length - 1; i >= 0; i -= 1) {
      if (todos2[i].completed) todos2.splice(i, 1);
    }
  }
  function getShownTodos(todos2, filter2) {
    return todos2.filter((todo) => {
      if (filter2 === "done") return todo.completed;
      if (filter2 === "active") return !todo.completed;
      return true;
    });
  }
  function countCompleted(todos2) {
    return todos2.reduce((count, todo) => count + (todo.completed ? 1 : 0), 0);
  }

  // main.ts
  var KEY = "todo-v2-items";
  var list = document.querySelector("#todo-list");
  var input = document.querySelector("#todo-input");
  var addBtn = document.querySelector("#add-btn");
  var status = document.querySelector("#todo-status");
  var filterButtons = document.querySelectorAll(".filter-btn");
  var todos = parseTodos(localStorage.getItem(KEY));
  var filter = "all";
  function save() {
    localStorage.setItem(KEY, JSON.stringify(todos));
  }
  function render() {
    if (list === null || status === null) return;
    list.replaceChildren();
    getShownTodos(todos, filter).forEach((todo) => {
      const item = document.createElement("li");
      const text = document.createElement("span");
      const editButton = document.createElement("button");
      const deleteButton = document.createElement("button");
      item.className = "todo-item";
      item.dataset.id = String(todo.id);
      text.className = "todo-item__text";
      text.textContent = todo.text;
      editButton.className = "todo-item__edit";
      editButton.type = "button";
      editButton.textContent = "\u7F16\u8F91";
      editButton.dataset.action = "edit";
      editButton.setAttribute("aria-label", `\u7F16\u8F91\uFF1A${todo.text}`);
      deleteButton.className = "todo-item__delete";
      deleteButton.type = "button";
      deleteButton.textContent = "\u5220\u9664";
      deleteButton.dataset.action = "delete";
      deleteButton.setAttribute("aria-label", `\u5220\u9664\uFF1A${todo.text}`);
      if (todo.completed) item.classList.add("done");
      item.append(text, editButton, deleteButton);
      list.appendChild(item);
    });
    filterButtons.forEach((button) => {
      button.classList.toggle("is-active", parseFilter(button.dataset.filter) === filter);
    });
    status.textContent = `\u5171 ${todos.length} \u9879\uFF0C\u5DF2\u5B8C\u6210 ${countCompleted(todos)} \u9879\u3002`;
  }
  if (list !== null && input !== null && addBtn !== null && status !== null && filterButtons.length > 0) {
    addBtn.addEventListener("click", () => {
      const text = input.value.trim();
      if (text === "") {
        status.textContent = "\u8BF7\u8F93\u5165\u5F85\u529E\u4E8B\u9879\u540E\u518D\u6DFB\u52A0\u3002";
        input.focus();
        return;
      }
      addTodo(todos, text);
      save();
      render();
      console.log("[add]", text);
      input.value = "";
      input.focus();
    });
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filter = parseFilter(button.dataset.filter);
        render();
      });
    });
    list.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const item = event.target.closest("li");
      if (item === null || !list.contains(item)) return;
      const id = parseId(item.dataset.id);
      if (id === null) return;
      const deleteBtn = event.target.closest('[data-action="delete"]');
      const editBtn = event.target.closest('[data-action="edit"]');
      if (deleteBtn !== null && item.contains(deleteBtn)) {
        console.log("[delete]", id);
        removeTodo(todos, id);
      } else if (editBtn !== null && item.contains(editBtn)) {
        const current = todos.find((todo) => todo.id === id);
        const next = window.prompt("\u4FEE\u6539\u4EFB\u52A1", current !== void 0 ? current.text : "");
        if (next === null) return;
        console.log("[edit]", id, next);
        updateTodo(todos, id, next);
      } else {
        console.log("[toggle]", id);
        toggleTodo(todos, id);
      }
      save();
      render();
    });
    document.addEventListener("keydown", (event) => {
      if (event.altKey && event.key === "c") {
        clearCompleted(todos);
        save();
        render();
      }
    });
    render();
  }
})();
