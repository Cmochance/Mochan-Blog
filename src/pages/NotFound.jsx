import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section style={{ textAlign: 'center', padding: '4rem 0' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '4rem',
          color: 'var(--ink-wash)',
          marginBottom: '1rem'
        }}
      >
        四〇四
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--ink-light)',
          marginBottom: '2rem'
        }}
      >
        此处空无一物，如未着墨的宣纸
      </p>
      <Link to="/" className="back-btn">
        ← 返回首页
      </Link>
    </section>
  );
}
