/**
 * 材料：任务 3 发给 AI 的原始「有问题的持久化逻辑」（第12周模板靶子，原样保留）。
 * 故意不补 import / 类型，它是对照靶子，不参与编译。
 *
 * 三处隐患（对照课件 S26/S28/S29）：
 *   ① 双 Effect：读取 Effect 用 []，写入 Effect 用 [todos] —— 首次挂载时
 *      写入 Effect 拿到的是首次渲染的空数组，会先把 localStorage 覆盖成 []。
 *   ② 读取无 try-catch：JSON.parse 遇到非法 JSON 直接抛错，组件崩。
 *   ③ 读取无 Array.isArray：解析出对象/数字也被 setTodos 塞进去，后续 .map 崩。
 *
 * AI 修复结果见 materials/persistence.aiFixed.tsx；最终正确版见 src/persistence.ts。
 */
function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
}
