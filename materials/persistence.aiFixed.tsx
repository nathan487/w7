/**
 * 材料：AI 对靶子 persistence.bad.tsx 的「第一轮修复」（审查对象）。
 *
 * 我给 AI 的约束见日志任务 3：改成安全的持久化、避免双 Effect 覆盖、处理非法 JSON、不改业务。
 *
 * AI 做完后的实况（三层审查结论：部分修改，仍要手动兜底）：
 *   ① 依赖正确性：写入 Effect 补上了 [todos] —— 这条 AI 修对了。
 *   ② 生命周期正确性：它「删掉了读取 Effect」，改成就地 useState(JSON.parse(...))。
 *      —— 双 Effect 覆盖窗口确实消失了，但把未加防护的 JSON.parse 挪进了初始化，
 *        非法 JSON 会在首次渲染直接抛错（从「Effect 里崩」变成「渲染时崩」，问题还在）。
 *   ③ 数据正确性：没有 try-catch、没有 Array.isArray —— 这条没修。
 *
 * 结论：AI 版不能直接接受。最终版见 src/persistence.ts（parseTodos 逐条校验 + 惰性初始化 + 单 Effect）。
 */
function loadTodos(): Todo[] {
  const saved = localStorage.getItem('todos');
  return saved ? (JSON.parse(saved) as Todo[]) : []; // 无 try-catch / 无 Array.isArray
}

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos); // AI 就地用函数初始化，方向对

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]); // 依赖写全，这条对

  return null;
}
