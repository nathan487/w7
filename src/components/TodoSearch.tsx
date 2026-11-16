/**
 * TodoSearch —— 搜索框：自己不持有 todos，只把输入交给父组件。
 *
 * 关键字用独立 state 管理（放在 TodoApp），搜索时完全不碰 todos 本身；
 * 这里只负责把受控输入值向上传递，纯展示组件。
 */
import type { ChangeEvent } from 'react';

export interface TodoSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TodoSearch({ value, onChange }: TodoSearchProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="todo-app__search">
      <label htmlFor="todo-search">搜索关键字：</label>
      <div className="todo-app__input-row">
        <input
          id="todo-search"
          type="search"
          value={value}
          onChange={handleChange}
          placeholder="输入关键字实时过滤任务"
        />
      </div>
    </div>
  );
}
