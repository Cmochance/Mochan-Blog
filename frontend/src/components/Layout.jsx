import Nav from './Nav.jsx';
import Footer from './Footer.jsx';

export default function Layout({ children }) {
  return (
    <div className="container">
      <Nav />
      <main id="app">{children}</main>
      <Footer />
    </div>
  );
}
