import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, UserPlus, Search, Info, Settings, Languages, Sun, Moon, Droplet, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/register', icon: UserPlus, label: t('register') },
    { path: '/search', icon: Search, label: t('search') },
    { path: '/admin', icon: Shield, label: 'Admin' },
    { path: '/about', icon: Info, label: t('about') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden transition-colors duration-300">
      {/* Header - Themed Red */}
      <header className="bg-red-600 text-white rounded-b-[32px] shadow-lg sticky top-0 z-40 px-6 pt-4 pb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Droplet className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 leading-none mb-1">
                Balochistan
              </h1>
              <p className="text-xl font-black leading-none">
                {i18n.language === 'en' ? 'Blood Donor App' : 'بلڈ ڈونر ایپ'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-[10px] font-black tracking-widest uppercase text-white border border-white/20"
            >
              {i18n.language === 'en' ? 'اردو' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-900 border-t dark:border-slate-800 px-8 py-4 flex items-center justify-between z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 transform active:scale-90",
                isActive ? "text-red-600" : "text-slate-400 dark:text-slate-600"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="nav-dot"
                  className="w-1 h-1 bg-red-600 rounded-full absolute -bottom-1" 
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
