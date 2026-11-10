/**
 * 启动点：整个应用只有两行真的「启动」了 React。
 *
 * 课件 S7 的示例用非空断言直接取 root，
 * 但 W9 起本项目三条红线之一就是「不用非空断言 !」，
 * 所以这里改成显式判空 + 抛错：既让 TS 收窄类型，也不靠断言骗过编译器。
 *
 * 注意：getElementById 只出现在这一处「挂载点」，
 * 组件树里没有任何 DOM 查询 / DOM 修改 API（任务 2 的源码级自查会验证）。
 */
import { createRoot } from 'react-dom/client';
import TodoApp from './components/TodoApp';
import './style.css';

const container = document.getElementById('root');
if (container === null) throw new Error('index.html 缺少 #root 挂载点');

createRoot(container).render(<TodoApp />);
