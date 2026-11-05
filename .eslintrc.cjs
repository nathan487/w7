module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    // 三把标尺：对应 AI 生成代码的三个高频病
    complexity: ['error', 10],                          // 分支堆叠
    'max-depth': ['error', 3],                          // 箭头型代码
    '@typescript-eslint/no-explicit-any': 'error',       // 用 any 混过类型
    // 材料 A 里的死变量 snapshot 靠这条抓出来
    '@typescript-eslint/no-unused-vars': 'error',
    'no-unused-vars': 'off',                            // TS 版规则接管，避免对类型误报
  },
  // 坑：ESLint 8 对「目录参数」默认只扫 .js。
  // 在 overrides 里声明 *.ts 后，npx eslint src/ 才会把 TypeScript 文件纳入遍历，
  // 否则会报 "No files matching the pattern src/"（一个什么都没检查的假绿）。
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
    },
  ],
  ignorePatterns: ['dist', 'node_modules', 'app.js', 'public'],
};
