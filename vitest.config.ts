import { defineConfig } from 'vitest/config';

/**
 * 踩坑记录：本机（Windows + 编辑器沙箱）里 Vitest 默认并行跑多个测试文件时，
 * 多个 worker 会并发写同一个 vite-node ssr 缓存文件，触发
 * "EPERM: operation not permitted" 并让部分测试文件静默不执行。
 * 把文件级并行关掉即可（3 个文件依次跑，约 1 秒），不改变任何测试语义。
 */
export default defineConfig({
  test: {
    fileParallelism: false,
  },
});
