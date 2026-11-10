/**
 * TodoForm —— 只负责「收输入」，输入值放在自己的 State 里。
 * 它不知道 todos 存在，也不改父组件的数据，只通过 onAdd(text) 向上通知。
 */
import { useState, type FormEvent } from 'react';

export interface TodoFormProps {
  onAdd: (text: string) => void;
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const [text, setText] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (trimmed === '') return; // 业务规则：空串与纯空格都不入库（不发无意义的更新）
    onAdd(trimmed);
    setText(''); // 受控输入：清空靠 State，不是 input.value = ''
  }

  return (
    <form className="todo-app__controls" onSubmit={handleSubmit} aria-label="添加待办事项">
      {/* JSX 三大要求：htmlFor 代替 for；标签必须闭合；{} 里只放表达式 */}
      <label htmlFor="todo-input">新增待办：</label>
      <div className="todo-app__input-row">
        <input
          id="todo-input"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="例如：完成 React 迁移"
        />
        <button type="submit">添加</button>
      </div>
    </form>
  );
}
