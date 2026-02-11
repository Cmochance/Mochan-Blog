import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import InkCanvas from './components/InkCanvas.jsx';
import Home from './pages/Home.jsx';
import Archive from './pages/Archive.jsx';
import About from './pages/About.jsx';
import Post from './pages/Post.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <InkCanvas />
      <div className="paper-texture" />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/about" element={<About />} />
          <Route path="/post/:slug" element={<Post />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  );
}
