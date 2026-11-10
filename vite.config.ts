import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * W11：JSX 交给 @vitejs/plugin-react（内部仍是 esbuild 转译 + 自动 jsx-runtime），
 * 同时带来 Fast Refresh。tsconfig 里的 "jsx": "react-jsx" 决定类型检查按新转换走，
 * 所以组件里不必再写 import React from 'react'。
 *
 * 网络边界（W10 沿用）：浏览器只请求同源的 /api，由 dev server 转发到后端。
 * build 之后 dist 是静态文件、没有 Node 进程，这段代理就失效了。
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
});
