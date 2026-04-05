export default {
  slug: 'new-post-slug',
  title: '新文章标题',
  date: '2026-04-05',
  tags: ['分类一', '分类二'],
  excerpt: '可选摘要。不写也可以，系统会自动从正文截取。',
  contentMarkdown: `
# 新文章标题

这里开始写正文。

## 小节标题

- 列表项一
- 列表项二

~~~js
console.log('hello, world');
~~~

> 引用内容
`
};
