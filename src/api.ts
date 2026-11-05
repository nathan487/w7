/**
 * 环境边界：地址不散落在业务代码里，只从 import.meta.env 的字面量访问取值。
 *
 * 课件 S7-S9 的两个要点：
 *  - dev 与 build 都会把 VITE_API_URL 替换成字面量，不是浏览器运行时去读服务器；
 *    所以改了 .env 必须重启 dev server，值不会热更新。
 *  - 只能用 import.meta.env.VITE_API_URL 这种字面量，不能用动态键
 *    import.meta.env[key]（静态替换无法保证，会静默拿到 undefined）。
 */

const configured: string | undefined = import.meta.env.VITE_API_URL;

export const API_BASE: string = configured ?? 'http://localhost:8080';

/**
 * dev：走 vite.config.ts 的 /api 代理，浏览器看到的是同源地址；
 * build：dist 里没有 dev server，代理失效，只能直连（后端需配 CORS 或 Nginx 反代）。
 */
export function apiUrl(path: string): string {
  return import.meta.env.DEV ? `/api${path}` : `${API_BASE}${path}`;
}
