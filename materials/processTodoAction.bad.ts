/**
 * 材料 A（课件 S22）——「抛靶子」用的原始烂代码，只作审查对照，不参与构建。
 * interface Todo { id: number; text: string; completed: boolean; }
 * 它不在 src/、也不在 tsconfig 的 include 里，所以不会污染 V3.0 的构建与自检。
 */

export function processTodoAction(todos: any[], action: string, payload: any): any[] {
  if (action === 'add') {
    if (payload && payload.text) {
      if (payload.text.trim() !== '') {
        if (!payload.id) {
          const snapshot = todos.slice(); // 赋值后从未使用
          const newTodo = {
            id: Date.now(),
            text: payload.text,
            completed: false,
          };
          todos.push(newTodo);
          return todos;
        } else {
          return todos;
        }
      } else {
        return todos;
      }
    } else {
      return todos;
    }
  } else if (action === 'delete') {
    if (payload && payload.id) {
      for (let i = 0; i < todos.length; i++) {
        if (todos[i].id === payload.id) {
          todos.splice(i, 1);
          return todos;
        }
      }
      return todos;
    } else {
      return todos;
    }
  } else if (action === 'toggle') {
    if (payload && payload.id) {
      for (let i = 0; i < todos.length; i++) {
        if (todos[i].id === payload.id) {
          todos[i].completed = !todos[i].completed;
          return todos;
        }
      }
      return todos;
    } else {
      return todos;
    }
  } else {
    return todos;
  }
}
