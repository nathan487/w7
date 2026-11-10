/**
 * fakeReactAudit.test.ts —— 任务 3 的「范式残留审查」做成可重复运行的断言
 *
 * 不是靠肉眼看代码说「应该没问题」，而是把课件 S28 的四条审查清单写成测试：
 * AI 修复版哪里没修全、最终组件树是不是真的零 DOM 操作、业务规则是否还在。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect } from 'vitest';
import { addTodoState } from '../src/todoState';

const read = (relativePath: string): string =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

function componentSources(): string {
  const dir = resolve(process.cwd(), 'src/components');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.tsx'))
    .map((name) => read(`src/components/${name}`))
    .join('\n');
}

test('AI 局部修复版：引用与就地修改这两条确实修好了', () => {
  const source = read('materials/fakeReact.aiFixed.tsx');

  expect(source).not.toContain('listRef.push');
  expect(source).toContain('setTodos(prev =>');
  expect(source).toContain('{ ...t, completed: !t.completed }');
});

test('AI 局部修复版：仍然绕过 React 手改 DOM —— 没修全（关键证据）', () => {
  const source = read('materials/fakeReact.aiFixed.tsx');

  expect(source).toContain("document.getElementById('todo-list')");
  expect(source).toContain('innerHTML +=');
});

test('AI 局部修复版：newTodo 直接用原始 text，未 trim（业务规则回归风险）', () => {
  const source = read('materials/fakeReact.aiFixed.tsx');

  // if (text.trim() === '') 只拦了「全空」，没把「  任务A  」归一化成「任务A」
  expect(source).toContain('const newTodo = { id: Date.now(), text, completed: false }');
  expect(source).not.toContain('const trimmed');
});

test('最终组件树：零 DOM 查询 / 零 innerHTML / 零 appendChild', () => {
  const all = componentSources();

  expect(all).not.toMatch(/document\.(querySelector|getElementById)/);
  expect(all).not.toContain('innerHTML');
  expect(all).not.toContain('appendChild');
  expect(all).not.toContain('addEventListener');
});

test('最终组件树：State 更新走函数式，列表用稳定 id 作 key', () => {
  expect(read('src/components/TodoApp.tsx')).toContain('setTodos((prev) =>');
  expect(read('src/components/TodoList.tsx')).toContain('key={todo.id}');
});

test('最终实现：带空格输入仍被 trim、纯空格仍被拦截（业务规则仍在）', () => {
  expect(addTodoState([], '  任务A  ')[0].text).toBe('任务A');
  expect(addTodoState([], '   ')).toHaveLength(0);
});
