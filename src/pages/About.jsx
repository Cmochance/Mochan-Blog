export default function About() {
  return (
    <section className="about-page">
      <div className="about-avatar"></div>
      <div className="about-content">
        <h1>关于此处</h1>
        <p>
          这是一个以水墨为意境的个人博客，
          如同古人执笔挥毫，在宣纸上留下思绪的痕迹。
        </p>
        <p>
          在这个数字时代，我希望用传统的美学来承载现代的思想。
          每一篇文章都是墨迹晕染后的心路历程，
          或关于技术，或关于生活，或只是一些随想。
        </p>
        <p>「山高水长，墨韵流芳」</p>
        <p style={{ marginTop: '2rem', color: 'var(--ink-wash)', fontSize: '0.9rem' }}>
          —— 以笔为友，以墨为伴
        </p>
      </div>
    </section>
  );
}
