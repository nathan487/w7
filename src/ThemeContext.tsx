/**
 * ThemeContext.tsx —— W12 任务 1：跨层级主题共享
 *
 * 三步（课件 S32）：createContext → Provider 提供 → useContext 消费。
 * 关键取舍：
 *  ① value 用 useMemo 固定引用 —— 否则每次渲染都是新对象，全部消费者重渲染（课件 S34）。
 *  ② 主题拆成独立 Context，不跟 todos 塞同一个 value —— 按更新频率拆（课件 S35/S36）。
 *  ③ useTheme 自定义 Hook 统一做 null 检查：组件不在 Provider 里会明确报错，
 *     而不是拿到默认值后静默出错（默认值只在找不到 Provider 时生效，别当初始状态用）。
 *  ④ 主题本身也持久化：惰性初始化 + 单 Effect 写入，和 todos 用同一套机制。
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadTheme, saveTheme, type Theme } from './persistence';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** 消费者统一走这个 Hook：不在 Provider 内立即抛错，便于定位漏包 Provider 的组件 */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) throw new Error('useTheme 必须在 ThemeProvider 内部使用');
  return value;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 惰性初始化：读 localStorage 只发生一次，不在 Effect 里读
  const [theme, setTheme] = useState<Theme>(() => loadTheme(localStorage));

  // 单 Effect 写入，依赖 theme
  useEffect(() => {
    saveTheme(localStorage, theme);
  }, [theme]);

  // value 引用稳定：只有 theme 变化时才换对象，避免无意义的重渲染
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
