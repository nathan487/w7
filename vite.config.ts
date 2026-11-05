import { defineConfig } from 'vite';

/**
 * 网络边界：浏览器只请求同源的 /api，由 dev server 转发到后端。
 * 代理不是「取消跨域」，而是让浏览器看到的地址变成同源；
 * build 之后 dist 是静态文件、没有 Node 进程，这段代理就失效了，
 * 生产环境要靠后端 CORS 或 Nginx 反向代理。
 */
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        // 按目标服务器的要求配置（虚拟主机/多域名场景），它不是 CORS 开关：
        // 删掉它、只要代理仍生效，跨域报错一样不会出现。
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
});
