import { useState } from 'react';
import Nav from './Nav.jsx';
import Footer from './Footer.jsx';
import LoginModal from './LoginModal.jsx';

export default function Layout({ children }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="container">
      <Nav />
      <main id="app">{children}</main>
      <Footer onLoginClick={() => setIsLoginModalOpen(true)} />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
}
