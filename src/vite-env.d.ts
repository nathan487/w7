/// <reference types="vite/client" />

// 给 import.meta.env 补上自定义变量的类型（缺了这个文件会报「属性不存在」）。
// 注意：这里只补类型，值由 Vite 在 dev 响应 / build 时替换成字面量，
// 浏览器运行时不会去服务器读 .env。
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
