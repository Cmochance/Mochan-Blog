import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Nav() {
  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">
        <img src={logo} alt="几时休" className="nav-logo-img" />
        <span className="logo-char">墨</span>
        <span className="logo-text">韵流芳</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end className={linkClass}>
          首页
        </NavLink>
        <NavLink to="/archive" className={linkClass}>
          归档
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          关于
        </NavLink>
      </div>
    </nav>
  );
}
