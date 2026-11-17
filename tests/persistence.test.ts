/**
 * persistence.test.ts —— W12 任务 2 / 3 的可运行证据
 *
 * 用可注入的 storage 桩把「持久化」从 React 里剥出来单测：
 *  - 惰性初始化：首次就拿到 localStorage 的旧数据，不被空数组覆盖（课件 S26/S29）
 *  - 读取防护：非法 JSON / 非数组 / 结构脏记录都退化成安全值（课件 S25）
 *  - 写入：saveTodos 只写、依赖由调用方 Effect 声明（课件 S27）
 *
 * storage 桩用 Map 模拟 localStorage 的 get/set，Vitest 跑在 Node 里不需要浏览器。
 */
import { describe, expect, test } from 'vitest';
import {
  createInitialTodos,
  loadTodos,
  loadTheme,
  saveTodos,
  saveTheme,
  TODOS_KEY,
  THEME_KEY,
  type StorageLike,
} from '../src/persistence';
import type { Todo } from '../src/todo';

function memoryStorage(seed: Record<string, string> = {}): StorageLike & { dump(): string } {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    dump: () => JSON.stringify(Object.fromEntries(map)),
  };
}

const SEED_TODOS: Todo[] = [
  { id: 1, text: '测试任务', completed: false },
  { id: 2, text: '另一条', completed: true },
];

describe('惰性初始化读取', () => {
  test('首次初始化就读到已有数据，不会被后续写入 Effect 用空数组覆盖', () => {
    // 教学场景：localStorage 里先备好两条数据（对应模板「动手验证」步骤）
    const store = memoryStorage({ [TODOS_KEY]: JSON.stringify(SEED_TODOS) });

    const initial = createInitialTodos(store)();

    expect(initial).toEqual(SEED_TODOS);
  });

  test('没有数据时返回空数组，不抛错', () => {
    expect(createInitialTodos(memoryStorage())()).toEqual([]);
  });
});

describe('读取防护（try-catch + Array.isArray + 逐条校验）', () => {
  test('非法 JSON 不抛异常，返回空数组', () => {
    const store = memoryStorage({ [TODOS_KEY]: '{bad json' });
    expect(() => loadTodos(store)).not.toThrow();
    expect(loadTodos(store)).toEqual([]);
  });

  test('合法 JSON 但不是数组，返回空数组', () => {
    const store = memoryStorage({ [TODOS_KEY]: '{"id":1,"text":"x"}' });
    expect(loadTodos(store)).toEqual([]);
  });

  test('数组里混了脏记录，只保留字段合法的那几条', () => {
    const store = memoryStorage({
      [TODOS_KEY]: JSON.stringify([SEED_TODOS[0], { id: 'x', text: 1 }, null]),
    });
    expect(loadTodos(store)).toEqual([SEED_TODOS[0]]);
  });
});

describe('写入 Effect 的正确行为', () => {
  test('saveTodos 把当前数组写回，读回一致', () => {
    const store = memoryStorage();
    saveTodos(store, SEED_TODOS);
    expect(loadTodos(store)).toEqual(SEED_TODOS);
  });

  test('写入后再次惰性初始化，拿到的仍是同一份（刷新数据还在）', () => {
    const store = memoryStorage();
    saveTodos(store, SEED_TODOS);
    expect(createInitialTodos(store)()).toEqual(SEED_TODOS);
  });
});

describe('主题持久化（与任务 1 共用一套机制）', () => {
  test('默认 light，只认字面量 dark', () => {
    expect(loadTheme(memoryStorage())).toBe('light');
    expect(loadTheme(memoryStorage({ [THEME_KEY]: 'dark' }))).toBe('dark');
    expect(loadTheme(memoryStorage({ [THEME_KEY]: 'weird' }))).toBe('light');
  });

  test('saveTheme 后读回一致', () => {
    const store = memoryStorage();
    saveTheme(store, 'dark');
    expect(loadTheme(store)).toBe('dark');
  });
});
