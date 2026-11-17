/**
 * ThemeToggle —— 主题切换按钮（Context 消费者之一）
 *
 * 它不接任何 theme 相关的 Props，直接 useTheme() 读最近的 Provider。
 * 这正是 Context 的用武之地：跨层级拿值，中间层不用写「路过」的属性（课件 S31）。
 */
import { useTheme } from '../ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="切换主题">
      {theme === 'light' ? '切换到深色' : '切换到浅色'}
    </button>
  );
}
