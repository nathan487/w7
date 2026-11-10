module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }, // W11：.tsx 里的 JSX 需要显式打开
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    // 三把标尺：对应 AI 生成代码的三个高频病
    complexity: ['error', 10], // 分支堆叠
    'max-depth': ['error', 3], // 箭头型代码
    '@typescript-eslint/no-explicit-any': 'error', // 用 any 混过类型
    '@typescript-eslint/no-unused-vars': 'error',
    'no-unused-vars': 'off',
  },
  // 坑：ESLint 8 对「目录参数」默认只扫 .js。
  // W11 起 *.tsx 也必须列进来，否则 npx eslint src/ 会跳过全部 React 组件（假绿）。
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  ],
  ignorePatterns: ['dist', 'node_modules', 'app.js', 'public'],
};
