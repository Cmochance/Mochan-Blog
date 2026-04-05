export default {
  slug: "art-of-simplicity",
  title: "简约之美：代码中的留白艺术",
  date: "2026-04-03",
  tags: ["技术", "设计", "思考"],
  excerpt:
    "好的代码如同好的水墨画，不在于使用了多少笔墨，而在于每一笔都恰到好处...",
  contentMarkdown: `
# 简约之美：代码中的留白艺术

在水墨画中，留白不是空白，而是画面的一部分。它给予观者想象的空间，让画面呼吸。

代码亦然。

## 代码的呼吸

一段好的代码，应该像一幅好的水墨画：

- **疏密有致**：不堆砌，不冗余
- **主次分明**：核心逻辑清晰可见
- **留有余地**：易于扩展和维护

~~~javascript
// 繁复之笔 ❌
function processUserData(data) {
  if (data !== null && data !== undefined) {
    if (data.name !== null && data.name !== undefined) {
      if (data.name.length > 0) {
        return data.name.trim();
      }
    }
  }
  return '';
}

// 简约之美 ✓
function processUserData(data) {
  return data?.name?.trim() || '';
}
~~~

## 少即是多

古人作画，讲究"计白当黑"。

- 删除不必要的注释
- 移除重复的逻辑
- 简化复杂的嵌套
- 使用有意义的命名

## 留白的智慧

> 「大音希声，大象无形」—— 老子

最高明的设计，往往是你感受不到设计的存在。

代码如此，人生亦如此。

不必填满每一刻，留一些空白给思考，给成长，给意想不到的可能。

---

*写于寒冬深夜，窗外雪落无声*
`,
};
