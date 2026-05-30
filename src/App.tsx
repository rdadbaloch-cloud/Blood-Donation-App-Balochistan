import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Splash from './components/Splash';
import Layout from './components/Layout';
import Home from './pages/Home';
import Register from './pages/Register';
import Search from './pages/Search';
import About from './pages/About';
import Admin from './pages/Admin';
import './i18n';

export default function App() {
  const { i18n } = useTranslation();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Support for RTL (Urdu)
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <Splash key="splash" />
        ) : (
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="register" element={<Register />} />
              <Route path="search" element={<Search />} />
              <Route path="about" element={<About />} />
              <Route path="admin" element={<Admin />} />
            </Route>
          </Routes>
        )}
      </AnimatePresence>
    </Router>
  );
}
