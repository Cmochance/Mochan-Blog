export default function Footer({ onLoginClick }) {
  return (
    <footer className="footer">
      <div 
        className="footer-seal" 
        onClick={onLoginClick}
        style={{ cursor: 'pointer' }}
        title="管理员登录"
      >
        印
      </div>
      <p className="footer-text">墨韵流芳 2026</p>
      <p className="footer-quote">「水墨丹青，意在笔先」</p>
    </footer>
  );
}
